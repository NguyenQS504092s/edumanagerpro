/**
 * Work Session Service
 * Handle work confirmation/session CRUD
 */

import {
  collection,
  doc,
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

const WORK_SESSIONS_COLLECTION = 'workSessions';

export type WorkStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Từ chối';
export type WorkType = 'Dạy chính' | 'Trợ giảng' | 'Nhận xét' | 'Dạy thay' | 'Bồi bài';

export interface WorkSession {
  id?: string;
  staffId?: string;
  staffName: string;
  position: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  classId?: string;
  className?: string;
  type: WorkType;
  status: WorkStatus;
  studentCount?: number;
  salary?: number;
  note?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createWorkSession = async (data: Omit<WorkSession, 'id'>): Promise<string> => {
  try {
    const sessionData = {
      ...data,
      status: data.status || 'Chờ xác nhận',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, WORK_SESSIONS_COLLECTION), sessionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating work session:', error);
    throw new Error('Không thể tạo công');
  }
};

export const getWorkSessions = async (filters?: {
  staffId?: string;
  status?: WorkStatus;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<WorkSession[]> => {
  try {
    let q = query(collection(db, WORK_SESSIONS_COLLECTION), orderBy('date', 'desc'));
    
    if (filters?.staffId) {
      q = query(collection(db, WORK_SESSIONS_COLLECTION), where('staffId', '==', filters.staffId));
    }
    
    if (filters?.status) {
      q = query(collection(db, WORK_SESSIONS_COLLECTION), where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    let sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as WorkSession));
    
    // Client-side date filter
    if (filters?.date) {
      sessions = sessions.filter(s => s.date === filters.date);
    }
    if (filters?.startDate) {
      sessions = sessions.filter(s => s.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      sessions = sessions.filter(s => s.date <= filters.endDate!);
    }
    
    return sessions;
  } catch (error) {
    console.error('Error getting work sessions:', error);
    throw new Error('Không thể tải danh sách công');
  }
};

export const updateWorkSession = async (id: string, data: Partial<WorkSession>): Promise<void> => {
  try {
    const docRef = doc(db, WORK_SESSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating work session:', error);
    throw new Error('Không thể cập nhật công');
  }
};

export const confirmWorkSession = async (id: string, confirmedBy?: string): Promise<void> => {
  try {
    await updateWorkSession(id, {
      status: 'Đã xác nhận',
      confirmedAt: new Date().toISOString(),
      confirmedBy,
    });
  } catch (error) {
    console.error('Error confirming work session:', error);
    throw new Error('Không thể xác nhận công');
  }
};

export const confirmAllWorkSessions = async (ids: string[], confirmedBy?: string): Promise<void> => {
  if (!ids || ids.length === 0) {
    throw new Error('Không có công nào để xác nhận');
  }
  
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    
    console.log('Confirming sessions:', ids);
    
    ids.forEach(id => {
      const docRef = doc(db, WORK_SESSIONS_COLLECTION, id);
      batch.update(docRef, {
        status: 'Đã xác nhận',
        confirmedAt: now,
        confirmedBy: confirmedBy || 'system',
        updatedAt: now,
      });
    });
    
    await batch.commit();
    console.log('Batch commit successful');
  } catch (error: any) {
    console.error('Error confirming all work sessions:', error);
    console.error('Error details:', error?.code, error?.message);
    throw new Error(`Không thể xác nhận hàng loạt: ${error?.message || 'Unknown error'}`);
  }
};

export const deleteWorkSession = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, WORK_SESSIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting work session:', error);
    throw new Error('Không thể xóa công');
  }
};
