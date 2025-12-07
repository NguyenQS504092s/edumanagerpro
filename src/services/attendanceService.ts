/**
 * Attendance Service
 * Handle attendance CRUD operations with Firestore
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
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AttendanceRecord, StudentAttendance, AttendanceStatus, StudentStatus } from '../../types';

const ATTENDANCE_COLLECTION = 'attendance';
const STUDENT_ATTENDANCE_COLLECTION = 'studentAttendance';
const TUTORING_COLLECTION = 'tutoring';

/**
 * Create attendance record for a class session
 */
export const createAttendanceRecord = async (
  data: Omit<AttendanceRecord, 'id'>
): Promise<string> => {
  try {
    const recordData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), recordData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw new Error('Không thể tạo bản ghi điểm danh');
  }
};

/**
 * Get attendance record by ID
 */
export const getAttendanceRecord = async (id: string): Promise<AttendanceRecord | null> => {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as AttendanceRecord;
  } catch (error) {
    console.error('Error getting attendance record:', error);
    throw new Error('Không thể tải bản ghi điểm danh');
  }
};

/**
 * Get attendance records with optional filters
 */
export const getAttendanceRecords = async (filters?: {
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceRecord[]> => {
  try {
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
    
    if (filters?.classId) {
      constraints.unshift(where('classId', '==', filters.classId));
    }
    
    if (filters?.date) {
      constraints.unshift(where('date', '==', filters.date));
    }
    
    const q = query(collection(db, ATTENDANCE_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    
    let records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AttendanceRecord));
    
    // Client-side date range filter
    if (filters?.startDate) {
      records = records.filter(r => r.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      records = records.filter(r => r.date <= filters.endDate!);
    }
    
    return records;
  } catch (error) {
    console.error('Error getting attendance records:', error);
    throw new Error('Không thể tải danh sách điểm danh');
  }
};

/**
 * Check if attendance already exists for class + date
 */
export const checkExistingAttendance = async (
  classId: string,
  date: string
): Promise<AttendanceRecord | null> => {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AttendanceRecord;
  } catch (error) {
    console.error('Error checking existing attendance:', error);
    throw new Error('Lỗi kiểm tra điểm danh');
  }
};

/**
 * Save student attendance details
 */
export const saveStudentAttendance = async (
  attendanceId: string,
  students: Omit<StudentAttendance, 'id' | 'attendanceId'>[],
  classId?: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete existing records for this attendance
    const existingQuery = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('attendanceId', '==', attendanceId)
    );
    const existingDocs = await getDocs(existingQuery);
    existingDocs.docs.forEach(doc => batch.delete(doc.ref));
    
    // Add new records
    students.forEach(student => {
      const docRef = doc(collection(db, STUDENT_ATTENDANCE_COLLECTION));
      batch.set(docRef, {
        ...student,
        attendanceId,
        classId: classId || null,
        createdAt: new Date().toISOString(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error saving student attendance:', error);
    throw new Error('Không thể lưu điểm danh học sinh');
  }
};

/**
 * Get student attendance for a record
 */
export const getStudentAttendance = async (
  attendanceId: string
): Promise<StudentAttendance[]> => {
  try {
    const q = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('attendanceId', '==', attendanceId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StudentAttendance));
  } catch (error) {
    console.error('Error getting student attendance:', error);
    throw new Error('Không thể tải điểm danh chi tiết');
  }
};

/**
 * Update attendance record summary
 */
export const updateAttendanceRecord = async (
  id: string,
  data: Partial<AttendanceRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw new Error('Không thể cập nhật bản ghi điểm danh');
  }
};

/**
 * Delete attendance record and related student records
 */
export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete main record
    batch.delete(doc(db, ATTENDANCE_COLLECTION, id));
    
    // Delete related student attendance
    const studentQuery = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('attendanceId', '==', id)
    );
    const studentDocs = await getDocs(studentQuery);
    studentDocs.docs.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    throw new Error('Không thể xóa bản ghi điểm danh');
  }
};

/**
 * Create tutoring record for absent student (auto-create khi vắng)
 */
export const createTutoringFromAbsent = async (data: {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  absentDate: string;
  type: 'Nghỉ học' | 'Học yếu';
}): Promise<string> => {
  try {
    const tutoringData = {
      ...data,
      status: 'Chưa bồi',
      scheduledDate: null,
      tutor: null,
      note: `Vắng buổi học ngày ${new Date(data.absentDate).toLocaleDateString('vi-VN')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, TUTORING_COLLECTION), tutoringData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tutoring record:', error);
    throw new Error('Không thể tạo lịch bồi bài');
  }
};

/**
 * Count student's attended sessions for a specific class
 */
export const countStudentAttendedSessions = async (
  studentId: string,
  classId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, STUDENT_ATTENDANCE_COLLECTION),
      where('studentId', '==', studentId),
      where('classId', '==', classId),
      where('status', '==', AttendanceStatus.PRESENT)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting attended sessions:', error);
    return 0;
  }
};

/**
 * Check and update student debt status
 * If attendedSessions > registeredSessions => status = "Nợ phí"
 */
export const checkAndUpdateStudentDebtStatus = async (
  studentId: string,
  classId: string
): Promise<void> => {
  try {
    // Get student data
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);
    
    if (!studentSnap.exists()) return;
    
    const studentData = studentSnap.data();
    const registeredSessions = studentData.registeredSessions || 0;
    const currentStatus = studentData.status;
    
    // Skip if student is not "Đang học" or already "Nợ phí"
    if (currentStatus !== StudentStatus.ACTIVE) return;
    
    // Count attended sessions
    const attendedSessions = await countStudentAttendedSessions(studentId, classId);
    
    // Update attendedSessions field
    await updateDoc(studentRef, { attendedSessions });
    
    // Check if student has exceeded registered sessions
    if (registeredSessions > 0 && attendedSessions > registeredSessions) {
      // Update status to "Nợ phí"
      await updateDoc(studentRef, { 
        status: StudentStatus.DEBT,
        debtStartDate: new Date().toISOString(),
        debtSessions: attendedSessions - registeredSessions
      });
      console.log(`[checkDebtStatus] Student ${studentId} status changed to "Nợ phí" (attended: ${attendedSessions}, registered: ${registeredSessions})`);
    }
  } catch (error) {
    console.error('Error checking student debt status:', error);
  }
};

/**
 * Full attendance save with auto tutoring creation
 */
export const saveFullAttendance = async (
  attendanceData: Omit<AttendanceRecord, 'id'>,
  students: Array<{
    studentId: string;
    studentName: string;
    studentCode: string;
    status: AttendanceStatus;
    note?: string;
  }>
): Promise<string> => {
  try {
    // Calculate summary
    const present = students.filter(s => s.status === AttendanceStatus.PRESENT).length;
    const absent = students.filter(s => s.status === AttendanceStatus.ABSENT).length;
    const reserved = students.filter(s => s.status === AttendanceStatus.RESERVED).length;
    const tutored = students.filter(s => s.status === AttendanceStatus.TUTORED).length;
    
    // Check existing
    const existing = await checkExistingAttendance(attendanceData.classId, attendanceData.date);
    
    let attendanceId: string;
    
    if (existing) {
      // Update existing
      await updateAttendanceRecord(existing.id, {
        ...attendanceData,
        present,
        absent,
        reserved,
        tutored,
        status: 'Đã điểm danh',
      });
      attendanceId = existing.id;
    } else {
      // Create new
      attendanceId = await createAttendanceRecord({
        ...attendanceData,
        present,
        absent,
        reserved,
        tutored,
        status: 'Đã điểm danh',
      });
    }
    
    // Save student attendance with classId for debt tracking
    await saveStudentAttendance(attendanceId, students, attendanceData.classId);
    
    // Auto create tutoring for absent students
    const absentStudents = students.filter(s => s.status === AttendanceStatus.ABSENT);
    for (const student of absentStudents) {
      await createTutoringFromAbsent({
        studentId: student.studentId,
        studentName: student.studentName,
        classId: attendanceData.classId,
        className: attendanceData.className,
        absentDate: attendanceData.date,
        type: 'Nghỉ học',
      });
    }
    
    // Check and update debt status for present students
    const presentStudents = students.filter(s => s.status === AttendanceStatus.PRESENT);
    for (const student of presentStudents) {
      await checkAndUpdateStudentDebtStatus(student.studentId, attendanceData.classId);
    }
    
    return attendanceId;
  } catch (error) {
    console.error('Error saving full attendance:', error);
    throw new Error('Không thể lưu điểm danh');
  }
};
