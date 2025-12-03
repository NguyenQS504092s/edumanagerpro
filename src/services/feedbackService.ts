/**
 * Feedback Service
 * Handle parent feedback CRUD operations
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
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FEEDBACKS_COLLECTION = 'feedbacks';

export type FeedbackType = 'Call' | 'Form';
export type FeedbackStatus = 'Cần gọi' | 'Đã gọi' | 'Hoàn thành';

export interface FeedbackRecord {
  id?: string;
  date: string;
  type: FeedbackType;
  studentId?: string;
  studentName: string;
  classId?: string;
  className: string;
  teacher?: string;
  curriculumScore?: number;
  careScore?: number;
  facilitiesScore?: number;
  averageScore?: number;
  caller?: string;
  content?: string;
  status: FeedbackStatus;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createFeedback = async (data: Omit<FeedbackRecord, 'id'>): Promise<string> => {
  try {
    // Calculate average score for Form type
    let feedbackData = { ...data };
    if (data.type === 'Form' && data.curriculumScore && data.careScore && data.facilitiesScore) {
      feedbackData.averageScore = (data.curriculumScore + data.careScore + data.facilitiesScore) / 3;
    }
    
    const docData = {
      ...feedbackData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, FEEDBACKS_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error('Không thể tạo phản hồi');
  }
};

export const getFeedbacks = async (filters?: {
  type?: FeedbackType;
  status?: FeedbackStatus;
  studentId?: string;
}): Promise<FeedbackRecord[]> => {
  try {
    let q = query(collection(db, FEEDBACKS_COLLECTION), orderBy('date', 'desc'));
    
    if (filters?.type) {
      q = query(collection(db, FEEDBACKS_COLLECTION), where('type', '==', filters.type), orderBy('date', 'desc'));
    }
    
    if (filters?.status) {
      q = query(collection(db, FEEDBACKS_COLLECTION), where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    let feedbacks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FeedbackRecord));
    
    // Client-side filtering for additional filters
    if (filters?.studentId) {
      feedbacks = feedbacks.filter(f => f.studentId === filters.studentId);
    }
    
    return feedbacks;
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    throw new Error('Không thể tải danh sách phản hồi');
  }
};

export const updateFeedback = async (id: string, data: Partial<FeedbackRecord>): Promise<void> => {
  try {
    // Recalculate average if scores changed
    let updateData = { ...data };
    if (data.curriculumScore !== undefined || data.careScore !== undefined || data.facilitiesScore !== undefined) {
      const curr = data.curriculumScore || 0;
      const care = data.careScore || 0;
      const fac = data.facilitiesScore || 0;
      if (curr && care && fac) {
        updateData.averageScore = (curr + care + fac) / 3;
      }
    }
    
    const docRef = doc(db, FEEDBACKS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Không thể cập nhật phản hồi');
  }
};

export const deleteFeedback = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, FEEDBACKS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Không thể xóa phản hồi');
  }
};

export const updateFeedbackStatus = async (id: string, status: FeedbackStatus): Promise<void> => {
  await updateFeedback(id, { status });
};
