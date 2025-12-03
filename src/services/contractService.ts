/**
 * Contract Service
 * Handle contract CRUD operations with Firestore
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
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contract, ContractStatus, ContractType } from '../../types';

const CONTRACTS_COLLECTION = 'contracts';

/**
 * Generate contract code (Brisky01-999)
 */
export const generateContractCode = async (): Promise<string> => {
  const contractsRef = collection(db, CONTRACTS_COLLECTION);
  const q = query(contractsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return 'Brisky001';
  }
  
  const lastContract = snapshot.docs[0].data() as Contract;
  const lastNumber = parseInt(lastContract.code.replace('Brisky', '')) || 0;
  const nextNumber = lastNumber + 1;
  
  if (nextNumber > 999) {
    throw new Error('Đã đạt giới hạn mã hợp đồng (999)');
  }
  
  return `Brisky${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Create new contract
 */
export const createContract = async (contractData: Partial<Contract>): Promise<string> => {
  try {
    const code = await generateContractCode();
    
    const contract: Omit<Contract, 'id'> = {
      code,
      type: contractData.type || ContractType.STUDENT,
      studentId: contractData.studentId,
      studentName: contractData.studentName,
      studentDOB: contractData.studentDOB,
      parentName: contractData.parentName,
      parentPhone: contractData.parentPhone,
      items: contractData.items || [],
      subtotal: contractData.subtotal || 0,
      totalDiscount: contractData.totalDiscount || 0,
      totalAmount: contractData.totalAmount || 0,
      totalAmountInWords: contractData.totalAmountInWords || '',
      paymentMethod: contractData.paymentMethod!,
      paidAmount: contractData.paidAmount || 0,
      remainingAmount: contractData.remainingAmount || 0,
      contractDate: contractData.contractDate || new Date().toISOString(),
      paymentDate: contractData.paymentDate,
      status: contractData.status || ContractStatus.DRAFT,
      notes: contractData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: contractData.createdBy!,
    };
    
    const docRef = await addDoc(collection(db, CONTRACTS_COLLECTION), contract);
    return docRef.id;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw new Error('Không thể tạo hợp đồng');
  }
};

/**
 * Get contract by ID
 */
export const getContract = async (id: string): Promise<Contract | null> => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Contract;
  } catch (error) {
    console.error('Error getting contract:', error);
    throw new Error('Không thể tải hợp đồng');
  }
};

/**
 * Get all contracts with filters
 */
export const getContracts = async (filters?: {
  studentId?: string;
  status?: ContractStatus;
  type?: ContractType;
}): Promise<Contract[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (filters?.studentId) {
      constraints.push(where('studentId', '==', filters.studentId));
    }
    
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    const q = query(collection(db, CONTRACTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Contract));
  } catch (error) {
    console.error('Error getting contracts:', error);
    throw new Error('Không thể tải danh sách hợp đồng');
  }
};

/**
 * Update contract
 */
export const updateContract = async (id: string, data: Partial<Contract>): Promise<void> => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    throw new Error('Không thể cập nhật hợp đồng');
  }
};

/**
 * Delete contract
 */
export const deleteContract = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw new Error('Không thể xóa hợp đồng');
  }
};

/**
 * Update contract status
 */
export const updateContractStatus = async (
  id: string,
  status: ContractStatus
): Promise<void> => {
  try {
    const docRef = doc(db, CONTRACTS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating contract status:', error);
    throw new Error('Không thể cập nhật trạng thái hợp đồng');
  }
};

/**
 * Record payment for contract
 */
export const recordPayment = async (
  id: string,
  amount: number,
  paymentDate?: string
): Promise<void> => {
  try {
    const contract = await getContract(id);
    if (!contract) {
      throw new Error('Hợp đồng không tồn tại');
    }
    
    const newPaidAmount = contract.paidAmount + amount;
    const newRemainingAmount = contract.totalAmount - newPaidAmount;
    
    const docRef = doc(db, CONTRACTS_COLLECTION, id);
    await updateDoc(docRef, {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      paymentDate: paymentDate || new Date().toISOString(),
      status: newRemainingAmount === 0 ? ContractStatus.PAID : ContractStatus.DEBT,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    throw new Error('Không thể ghi nhận thanh toán');
  }
};
