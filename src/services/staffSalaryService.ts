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
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface StaffSalaryRecord {
  id?: string;
  staffId: string;
  staffName: string;
  position: string;
  month: number;
  year: number;
  baseSalary: number;
  workDays: number;
  commission: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  note?: string;
}

export interface StaffAttendanceLog {
  id?: string;
  staffId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Đúng giờ' | 'Đi muộn' | 'Về sớm' | 'Nghỉ phép' | 'Nghỉ không phép';
  note?: string;
}

const SALARY_COLLECTION = 'staffSalaries';
const ATTENDANCE_COLLECTION = 'staffAttendance';

// Get staff salaries by month/year
export const getStaffSalaries = async (month: number, year: number): Promise<StaffSalaryRecord[]> => {
  const q = query(
    collection(db, SALARY_COLLECTION),
    where('month', '==', month),
    where('year', '==', year)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffSalaryRecord));
};

// Get single staff salary
export const getStaffSalaryById = async (id: string): Promise<StaffSalaryRecord | null> => {
  const docRef = doc(db, SALARY_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as StaffSalaryRecord;
  }
  return null;
};

// Create staff salary record
export const createStaffSalary = async (data: Omit<StaffSalaryRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, SALARY_COLLECTION), data);
  return docRef.id;
};

// Update staff salary record
export const updateStaffSalary = async (id: string, data: Partial<StaffSalaryRecord>): Promise<void> => {
  const docRef = doc(db, SALARY_COLLECTION, id);
  await updateDoc(docRef, data);
};

// Delete staff salary record
export const deleteStaffSalary = async (id: string): Promise<void> => {
  const docRef = doc(db, SALARY_COLLECTION, id);
  await deleteDoc(docRef);
};

// Get attendance logs for a staff member
export const getStaffAttendance = async (staffId: string, month?: number, year?: number): Promise<StaffAttendanceLog[]> => {
  let q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('staffId', '==', staffId),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffAttendanceLog));
  
  // Filter by month/year if provided
  if (month && year) {
    logs = logs.filter(log => {
      const [d, m, y] = log.date.split('/').map(Number);
      return m === month && y === year;
    });
  }
  
  return logs;
};

// Create attendance log
export const createAttendanceLog = async (data: Omit<StaffAttendanceLog, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), data);
  return docRef.id;
};

// Update attendance log
export const updateAttendanceLog = async (id: string, data: Partial<StaffAttendanceLog>): Promise<void> => {
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await updateDoc(docRef, data);
};

// Delete attendance log
export const deleteAttendanceLog = async (id: string): Promise<void> => {
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await deleteDoc(docRef);
};
