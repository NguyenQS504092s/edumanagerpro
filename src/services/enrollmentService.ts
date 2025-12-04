/**
 * Enrollment Service
 * Firebase operations for enrollment records
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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EnrollmentRecord } from '../../types';

const COLLECTION_NAME = 'enrollments';

export const getEnrollments = async (filters?: {
  type?: string;
  month?: number;
  year?: number;
}): Promise<EnrollmentRecord[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME), orderBy('createdDate', 'desc'));
    
    const snapshot = await getDocs(q);
    let records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EnrollmentRecord[];

    // Client-side filtering for type, month, year
    if (filters?.type && filters.type !== 'ALL') {
      records = records.filter(r => r.type === filters.type);
    }
    
    if (filters?.month && filters?.year) {
      records = records.filter(r => {
        const date = new Date(r.createdDate.split('/').reverse().join('-'));
        return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
      });
    }

    return records;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

export const createEnrollment = async (data: Omit<EnrollmentRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
};

export const updateEnrollment = async (id: string, data: Partial<EnrollmentRecord>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
};

export const deleteEnrollment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
};
