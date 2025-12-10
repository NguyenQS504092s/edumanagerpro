/**
 * Monthly Report Service
 * Handle monthly comments and report generation
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  MonthlyComment, 
  MonthlyReportStats, 
  StudentAttendance,
  AttendanceStatus,
  Student,
  ClassModel
} from '../../types';

const MONTHLY_COMMENTS_COLLECTION = 'monthlyComments';
const STUDENT_ATTENDANCE_COLLECTION = 'studentAttendance';

// ==================== MONTHLY COMMENTS ====================

/**
 * Create or update monthly comment
 */
export const saveMonthlyComment = async (
  data: Omit<MonthlyComment, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    // Check if comment already exists for this student/class/month/year
    const existing = await getMonthlyComment(
      data.studentId, 
      data.classId, 
      data.month, 
      data.year
    );
    
    if (existing) {
      // Update existing
      await updateDoc(doc(db, MONTHLY_COMMENTS_COLLECTION, existing.id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return existing.id;
    } else {
      // Create new
      const docRef = await addDoc(collection(db, MONTHLY_COMMENTS_COLLECTION), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving monthly comment:', error);
    throw new Error('Không thể lưu nhận xét tháng');
  }
};

/**
 * Get monthly comment for a student in a class
 */
export const getMonthlyComment = async (
  studentId: string,
  classId: string,
  month: number,
  year: number
): Promise<MonthlyComment | null> => {
  try {
    const q = query(
      collection(db, MONTHLY_COMMENTS_COLLECTION),
      where('studentId', '==', studentId),
      where('classId', '==', classId),
      where('month', '==', month),
      where('year', '==', year)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as MonthlyComment;
  } catch (error) {
    console.error('Error getting monthly comment:', error);
    return null;
  }
};

/**
 * Get all monthly comments for a student in a month
 */
export const getStudentMonthlyComments = async (
  studentId: string,
  month: number,
  year: number
): Promise<MonthlyComment[]> => {
  try {
    const q = query(
      collection(db, MONTHLY_COMMENTS_COLLECTION),
      where('studentId', '==', studentId),
      where('month', '==', month),
      where('year', '==', year)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MonthlyComment));
  } catch (error) {
    console.error('Error getting student monthly comments:', error);
    return [];
  }
};

/**
 * Delete monthly comment
 */
export const deleteMonthlyComment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MONTHLY_COMMENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting monthly comment:', error);
    throw new Error('Không thể xóa nhận xét');
  }
};

// ==================== REPORT DATA ====================

/**
 * Get student attendance records for a specific month and class
 */
export const getStudentMonthlyAttendance = async (
  studentId: string,
  classId: string,
  month: number,
  year: number
): Promise<StudentAttendance[]> => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const q = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('studentId', '==', studentId),
      where('classId', '==', classId)
    );
    const snapshot = await getDocs(q);
    
    // Filter by date range client-side (check both date and createdAt fields)
    const records = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as StudentAttendance))
      .filter(record => {
        let recordDate = record.date;
        if (!recordDate && record.createdAt) {
          recordDate = record.createdAt.substring(0, 10);
        }
        if (!recordDate) return false;
        return recordDate >= startDate && recordDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = a.date || (a.createdAt?.substring(0, 10) || '');
        const dateB = b.date || (b.createdAt?.substring(0, 10) || '');
        return dateA.localeCompare(dateB);
      });
    
    return records;
  } catch (error) {
    console.error('Error getting student monthly attendance:', error);
    return [];
  }
};

/**
 * Get all student attendance records for a month (all classes)
 */
export const getStudentAllClassesMonthlyAttendance = async (
  studentId: string,
  month: number,
  year: number
): Promise<StudentAttendance[]> => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const q = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    
    // Filter by date range client-side (check both date and createdAt fields)
    const records = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as StudentAttendance))
      .filter(record => {
        // Try date field first, then createdAt
        let recordDate = record.date;
        if (!recordDate && record.createdAt) {
          // Extract date from createdAt (format: 2025-12-09T10:30:00.000Z)
          recordDate = record.createdAt.substring(0, 10);
        }
        if (!recordDate) return false;
        return recordDate >= startDate && recordDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = a.date || (a.createdAt?.substring(0, 10) || '');
        const dateB = b.date || (b.createdAt?.substring(0, 10) || '');
        return dateA.localeCompare(dateB);
      });
    
    return records;
  } catch (error) {
    console.error('Error getting student all classes attendance:', error);
    return [];
  }
};

/**
 * Calculate monthly stats for a student in a class
 */
export const calculateMonthlyStats = (
  attendanceRecords: StudentAttendance[]
): MonthlyReportStats => {
  const totalSessions = attendanceRecords.length;
  const attendedSessions = attendanceRecords.filter(
    r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.TUTORED
  ).length;
  const absentSessions = attendanceRecords.filter(
    r => r.status === AttendanceStatus.ABSENT
  ).length;
  
  const attendanceRate = totalSessions > 0 
    ? Math.round((attendedSessions / totalSessions) * 100) 
    : 0;
  
  // Calculate average score
  const scoresRecords = attendanceRecords.filter(r => r.score !== undefined && r.score !== null);
  const averageScore = scoresRecords.length > 0
    ? Math.round((scoresRecords.reduce((sum, r) => sum + (r.score || 0), 0) / scoresRecords.length) * 10) / 10
    : null;
  
  // Sum bonus points
  const totalBonusPoints = attendanceRecords.reduce((sum, r) => sum + (r.bonusPoints || 0), 0);
  
  return {
    totalSessions,
    attendedSessions,
    absentSessions,
    attendanceRate,
    averageScore,
    totalBonusPoints
  };
};

/**
 * Generate full monthly report data for a student
 */
export interface MonthlyReportData {
  student: Student;
  month: number;
  year: number;
  generatedAt: string;
  
  // Overall stats (across all classes)
  overallStats: MonthlyReportStats;
  
  // Per-class data
  classReports: Array<{
    classId: string;
    className: string;
    stats: MonthlyReportStats;
    attendance: StudentAttendance[];
    comment: MonthlyComment | null;
  }>;
  
  // All attendance records for history table
  allAttendance: StudentAttendance[];
}

export const generateMonthlyReport = async (
  student: Student,
  classes: ClassModel[],
  month: number,
  year: number
): Promise<MonthlyReportData> => {
  // Get all attendance records for this student in the month
  const allAttendance = await getStudentAllClassesMonthlyAttendance(student.id, month, year);
  
  // Calculate overall stats
  const overallStats = calculateMonthlyStats(allAttendance);
  
  // Get unique class IDs from attendance records (more reliable than student.classIds)
  const attendedClassIds = [...new Set(allAttendance.map(a => a.classId).filter(Boolean))];
  
  // Also include student's registered classes
  const studentClassIds = student.classIds || (student.classId ? [student.classId] : []);
  const allClassIds = [...new Set([...attendedClassIds, ...studentClassIds])];
  
  // Get class info for attended classes
  const studentClasses = classes.filter(c => allClassIds.includes(c.id));
  
  // Get per-class data
  const classReports = await Promise.all(
    studentClasses.map(async (cls) => {
      const classAttendance = allAttendance.filter(a => a.classId === cls.id);
      const stats = calculateMonthlyStats(classAttendance);
      const comment = await getMonthlyComment(student.id, cls.id, month, year);
      
      return {
        classId: cls.id,
        className: cls.name,
        stats,
        attendance: classAttendance,
        comment
      };
    })
  );
  
  // Also add classes that have attendance but not in the classes list
  for (const classId of attendedClassIds) {
    if (!studentClasses.find(c => c.id === classId)) {
      const classAttendance = allAttendance.filter(a => a.classId === classId);
      if (classAttendance.length > 0) {
        const stats = calculateMonthlyStats(classAttendance);
        const comment = await getMonthlyComment(student.id, classId, month, year);
        const className = classAttendance[0]?.className || 'Lớp không xác định';
        
        classReports.push({
          classId,
          className,
          stats,
          attendance: classAttendance,
          comment
        });
      }
    }
  }
  
  return {
    student,
    month,
    year,
    generatedAt: new Date().toISOString(),
    overallStats,
    classReports,
    allAttendance
  };
};

// ==================== AI COMMENT GENERATION ====================

/**
 * Generate AI comment based on attendance data
 * This is a template - can be enhanced with actual AI service
 */
export const generateAIComment = (
  studentName: string,
  className: string,
  stats: MonthlyReportStats,
  attendance: StudentAttendance[]
): string => {
  const firstName = studentName.split(' ').pop() || studentName;
  
  let comment = `Chào ${studentName}!\n\n`;
  
  // Attendance analysis
  if (stats.attendanceRate === 100) {
    comment += `Cô/thầy rất vui khi thấy con luôn có mặt đầy đủ trong cả ${stats.totalSessions} buổi học gần đây, đạt tỉ lệ chuyên cần 100%. Đây là một tinh thần học tập rất đáng khen, cho thấy sự nghiêm túc và trách nhiệm của con. `;
  } else if (stats.attendanceRate >= 80) {
    comment += `Con đã tham gia ${stats.attendedSessions}/${stats.totalSessions} buổi học trong tháng, đạt tỉ lệ chuyên cần ${stats.attendanceRate}%. Cô/thầy khuyến khích con cố gắng duy trì và cải thiện để không bỏ lỡ kiến thức quan trọng. `;
  } else {
    comment += `Trong tháng này, con chỉ tham gia ${stats.attendedSessions}/${stats.totalSessions} buổi học (${stats.attendanceRate}%). Cô/thầy mong con sắp xếp thời gian để tham gia đầy đủ hơn trong tháng tới. `;
  }
  
  // Bonus points
  if (stats.totalBonusPoints > 0) {
    comment += `Đặc biệt, con còn tích lũy được ${stats.totalBonusPoints} điểm thưởng, thể hiện sự chủ động và tích cực tham gia vào các hoạt động khác ngoài việc học trên lớp.\n\n`;
  } else {
    comment += '\n\n';
  }
  
  // Score analysis
  if (stats.averageScore !== null) {
    if (stats.averageScore >= 8) {
      comment += `Về kết quả học tập, điểm trung bình ${stats.averageScore}/10 cho thấy con đang nắm bắt kiến thức rất tốt. Hãy tiếp tục phát huy nhé!\n\n`;
    } else if (stats.averageScore >= 6) {
      comment += `Tuy nhiên, về kết quả học tập, điểm trung bình ${stats.averageScore}/10 cho thấy con đang gặp một số khó khăn trong việc nắm bắt kiến thức. Đây là điểm con cần đặc biệt chú ý và cải thiện.\n\n`;
    } else {
      comment += `Về kết quả học tập, điểm trung bình ${stats.averageScore}/10 cho thấy con cần được hỗ trợ thêm. Cô/thầy khuyên con hãy mạnh dạn hơn trong việc đặt câu hỏi khi chưa hiểu bài.\n\n`;
    }
  }
  
  // Encouragement
  comment += `Cô/thầy tin rằng với sự chuyên cần và tinh thần cầu tiến, con sẽ sớm đạt được những tiến bộ vượt bậc!`;
  
  return comment;
};

/**
 * Update student attendance with grade info
 */
export const updateStudentAttendanceGrade = async (
  attendanceId: string,
  gradeData: {
    homeworkCompletion?: number;
    testName?: string;
    score?: number;
    bonusPoints?: number;
    note?: string;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, STUDENT_ATTENDANCE_COLLECTION, attendanceId);
    await updateDoc(docRef, {
      ...gradeData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating attendance grade:', error);
    throw new Error('Không thể cập nhật điểm số');
  }
};

/**
 * Batch update grades for multiple attendance records
 */
export const batchUpdateAttendanceGrades = async (
  updates: Array<{
    id: string;
    homeworkCompletion?: number;
    testName?: string;
    score?: number;
    bonusPoints?: number;
    note?: string;
  }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(update => {
      const { id, ...data } = update;
      const docRef = doc(db, STUDENT_ATTENDANCE_COLLECTION, id);
      batch.update(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating grades:', error);
    throw new Error('Không thể cập nhật điểm số');
  }
};
