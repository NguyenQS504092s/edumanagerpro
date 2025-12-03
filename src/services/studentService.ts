import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  QueryConstraint,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, StudentStatus, CareLog } from '../types';

const COLLECTION_NAME = 'students';

export class StudentService {
  
  // Get all students with optional filters
  static async getStudents(filters?: {
    status?: StudentStatus;
    classId?: string;
    searchTerm?: string;
  }): Promise<Student[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters?.classId) {
        constraints.push(where('currentClassId', '==', filters.classId));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      
      let students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dob: doc.data().dob?.toDate().toISOString() || '',
        careHistory: doc.data().careHistory?.map((log: any) => ({
          ...log,
          date: log.date?.toDate().toISOString() || log.date
        })) || []
      })) as Student[];
      
      // Client-side search if searchTerm provided
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        students = students.filter(s => 
          s.fullName.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term) ||
          s.phone.includes(term)
        );
      }
      
      return students;
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }
  
  // Get single student by ID
  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          dob: docSnap.data().dob?.toDate().toISOString() || '',
          careHistory: docSnap.data().careHistory?.map((log: any) => ({
            ...log,
            date: log.date?.toDate().toISOString() || log.date
          })) || []
        } as Student;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting student:', error);
      throw error;
    }
  }
  
  // Create new student
  static async createStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...studentData,
        dob: Timestamp.fromDate(new Date(studentData.dob)),
        careHistory: studentData.careHistory?.map(log => ({
          ...log,
          date: Timestamp.fromDate(new Date(log.date))
        })) || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }
  
  // Update student
  static async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Convert date strings to Timestamps
      if (updates.dob) {
        updateData.dob = Timestamp.fromDate(new Date(updates.dob));
      }
      
      if (updates.careHistory) {
        updateData.careHistory = updates.careHistory.map(log => ({
          ...log,
          date: Timestamp.fromDate(new Date(log.date))
        }));
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }
  
  // Delete student
  static async deleteStudent(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
  
  // Add care log to student
  static async addCareLog(studentId: string, careLog: Omit<CareLog, 'id'>): Promise<void> {
    try {
      const student = await this.getStudentById(studentId);
      if (!student) throw new Error('Student not found');
      
      const newLog: CareLog = {
        ...careLog,
        id: `LOG_${Date.now()}`
      };
      
      const updatedHistory = [...(student.careHistory || []), newLog];
      await this.updateStudent(studentId, { careHistory: updatedHistory });
    } catch (error) {
      console.error('Error adding care log:', error);
      throw error;
    }
  }
  
  // Get students by birthday month
  static async getStudentsByBirthdayMonth(month: number): Promise<Student[]> {
    try {
      const allStudents = await this.getStudents();
      return allStudents.filter(student => {
        const studentMonth = new Date(student.dob).getMonth() + 1;
        return studentMonth === month;
      });
    } catch (error) {
      console.error('Error getting students by birthday month:', error);
      throw error;
    }
  }
  
  // Bulk update student status (for class changes)
  static async bulkUpdateStudentStatus(
    studentIds: string[], 
    status: StudentStatus,
    classId?: string,
    className?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      for (const studentId of studentIds) {
        const docRef = doc(db, COLLECTION_NAME, studentId);
        batch.update(docRef, {
          status,
          currentClassId: classId || null,
          currentClassName: className || null,
          updatedAt: Timestamp.now()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk updating students:', error);
      throw error;
    }
  }
}
