/**
 * Staff Service
 * Firebase operations for staff management
 */

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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Staff } from '../../types';

const COLLECTION_NAME = 'staff';

export const getStaff = async (filters?: {
  department?: string;
  role?: string;
  status?: string;
}): Promise<Staff[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    
    const snapshot = await getDocs(q);
    let staffList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Staff[];

    // Client-side filtering
    if (filters?.department) {
      staffList = staffList.filter(s => s.department === filters.department);
    }
    if (filters?.role) {
      staffList = staffList.filter(s => s.role === filters.role);
    }
    if (filters?.status) {
      staffList = staffList.filter(s => s.status === filters.status);
    }

    return staffList;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

export const getStaffById = async (id: string): Promise<Staff | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Staff;
    }
    return null;
  } catch (error) {
    console.error('Error fetching staff by id:', error);
    throw error;
  }
};

export const createStaff = async (data: Omit<Staff, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: data.status || 'Active',
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

export const updateStaff = async (id: string, data: Partial<Staff>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

export const deleteStaff = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

// Get staff by role (for dropdowns)
export const getTeachers = async (): Promise<Staff[]> => {
  const allStaff = await getStaff();
  return allStaff.filter(s => 
    s.role === 'Giáo viên' || 
    s.position === 'Giáo Viên Việt' || 
    s.position === 'Giáo Viên Nước Ngoài'
  );
};

export const getAssistants = async (): Promise<Staff[]> => {
  const allStaff = await getStaff();
  return allStaff.filter(s => s.role === 'Trợ giảng' || s.position === 'Trợ Giảng');
};
