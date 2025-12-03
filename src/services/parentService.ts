/**
 * Parent Service
 * Handle parent CRUD operations with Firestore
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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Parent, StudentStatus } from '../../types';

const PARENTS_COLLECTION = 'parents';

export interface ParentData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  children: Array<{
    id: string;
    name: string;
    dob: string;
    class: string;
    status: StudentStatus;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create new parent
 */
export const createParent = async (data: Omit<ParentData, 'id'>): Promise<string> => {
  try {
    const parentData = {
      ...data,
      children: data.children || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, PARENTS_COLLECTION), parentData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating parent:', error);
    throw new Error('Không thể tạo phụ huynh');
  }
};

/**
 * Get parent by ID
 */
export const getParent = async (id: string): Promise<ParentData | null> => {
  try {
    const docRef = doc(db, PARENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ParentData;
  } catch (error) {
    console.error('Error getting parent:', error);
    throw new Error('Không thể tải thông tin phụ huynh');
  }
};

/**
 * Get all parents with optional search
 */
export const getParents = async (searchTerm?: string): Promise<ParentData[]> => {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    const q = query(collection(db, PARENTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    
    let parents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ParentData));
    
    // Client-side search (Firestore doesn't support LIKE queries)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      parents = parents.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.phone.includes(term)
      );
    }
    
    return parents;
  } catch (error) {
    console.error('Error getting parents:', error);
    throw new Error('Không thể tải danh sách phụ huynh');
  }
};

/**
 * Update parent
 */
export const updateParent = async (id: string, data: Partial<ParentData>): Promise<void> => {
  try {
    const docRef = doc(db, PARENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    throw new Error('Không thể cập nhật phụ huynh');
  }
};

/**
 * Delete parent
 */
export const deleteParent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PARENTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting parent:', error);
    throw new Error('Không thể xóa phụ huynh');
  }
};

/**
 * Add child to parent
 */
export const addChildToParent = async (
  parentId: string,
  child: { id: string; name: string; dob: string; class: string; status: StudentStatus }
): Promise<void> => {
  try {
    const parent = await getParent(parentId);
    if (!parent) throw new Error('Phụ huynh không tồn tại');
    
    const children = [...(parent.children || []), child];
    await updateParent(parentId, { children });
  } catch (error) {
    console.error('Error adding child:', error);
    throw new Error('Không thể thêm học sinh');
  }
};

/**
 * Remove child from parent
 */
export const removeChildFromParent = async (parentId: string, childId: string): Promise<void> => {
  try {
    const parent = await getParent(parentId);
    if (!parent) throw new Error('Phụ huynh không tồn tại');
    
    const children = (parent.children || []).filter(c => c.id !== childId);
    await updateParent(parentId, { children });
  } catch (error) {
    console.error('Error removing child:', error);
    throw new Error('Không thể xóa học sinh');
  }
};
