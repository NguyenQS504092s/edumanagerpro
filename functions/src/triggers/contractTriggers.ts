/**
 * Contract Triggers
 * 
 * Handles:
 * - Add sessions to student when renewal/migration contract is paid
 * - Update student status when new contract is created
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const REGION = 'asia-southeast1';

interface ContractData {
  id?: string;
  type: 'Học viên' | 'Học liệu';
  category?: 'Hợp đồng mới' | 'Hợp đồng tái phí' | 'Hợp đồng liên kết';
  studentId?: string;
  studentName?: string;
  items: {
    type: 'course' | 'product';
    id: string;
    name: string;
    quantity: number;
    finalPrice: number;
  }[];
  status: 'Nháp' | 'Đã thanh toán' | 'Nợ phí' | 'Đã hủy';
  totalAmount: number;
  createdBy: string;
}

/**
 * Trigger: When a contract status changes to PAID
 * Actions:
 * - For renewal/migration contracts: Add sessions to student
 * - For new contracts: Ensure student has sessions
 */
export const onContractUpdate = functions
  .region(REGION)
  .firestore
  .document('contracts/{contractId}')
  .onUpdate(async (change, context) => {
    const contractId = context.params.contractId;
    const before = change.before.data() as ContractData;
    const after = change.after.data() as ContractData;

    console.log(`[onContractUpdate] Contract updated: ${contractId}`);
    console.log(`[onContractUpdate] Status: ${before.status} → ${after.status}`);

    // Only process if status changed to PAID
    if (before.status === after.status || after.status !== 'Đã thanh toán') {
      console.log('[onContractUpdate] Status not changed to PAID, skipping');
      return null;
    }

    // Only process student contracts
    if (after.type !== 'Học viên' || !after.studentId) {
      console.log('[onContractUpdate] Not a student contract, skipping');
      return null;
    }

    // Calculate total sessions from course items
    const totalSessions = after.items
      .filter(item => item.type === 'course')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    if (totalSessions === 0) {
      console.log('[onContractUpdate] No course items, skipping');
      return null;
    }

    console.log(`[onContractUpdate] Total sessions: ${totalSessions}`);
    console.log(`[onContractUpdate] Contract category: ${after.category}`);

    // Get student data
    const studentRef = db.collection('students').doc(after.studentId);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      console.log('[onContractUpdate] Student not found');
      return null;
    }

    const studentData = studentSnap.data();
    const currentSessions = studentData?.registeredSessions || 0;

    // Handle based on contract category
    let newSessions = currentSessions;
    
    if (after.category === 'Hợp đồng tái phí' || after.category === 'Hợp đồng liên kết') {
      // Add sessions to existing
      newSessions = currentSessions + totalSessions;
      console.log(`[onContractUpdate] Adding ${totalSessions} sessions. New total: ${newSessions}`);
    } else {
      // New contract - set sessions if not already set
      if (currentSessions === 0) {
        newSessions = totalSessions;
        console.log(`[onContractUpdate] Setting initial sessions: ${newSessions}`);
      } else {
        // Student already has sessions, add more
        newSessions = currentSessions + totalSessions;
        console.log(`[onContractUpdate] Student has ${currentSessions} sessions, adding ${totalSessions}. New: ${newSessions}`);
      }
    }

    // Update student
    const updateData: any = {
      registeredSessions: newSessions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // If new contract and student was in TRIAL status, update to ACTIVE
    if (after.category === 'Hợp đồng mới' && studentData?.status === 'Học thử') {
      updateData.status = 'Đang học';
      console.log('[onContractUpdate] Updating student status from Học thử to Đang học');
    }

    await studentRef.update(updateData);
    console.log(`[onContractUpdate] Updated student ${after.studentId} with ${newSessions} sessions`);

    return null;
  });

/**
 * Trigger: When a contract is created (for immediate PAID status)
 */
export const onContractCreate = functions
  .region(REGION)
  .firestore
  .document('contracts/{contractId}')
  .onCreate(async (snap, context) => {
    const contractId = context.params.contractId;
    const contract = snap.data() as ContractData;

    console.log(`[onContractCreate] Contract created: ${contractId}`);

    // Only process if already PAID
    if (contract.status !== 'Đã thanh toán') {
      console.log('[onContractCreate] Not PAID status, skipping');
      return null;
    }

    // Process same as update
    if (contract.type !== 'Học viên' || !contract.studentId) {
      return null;
    }

    const totalSessions = contract.items
      .filter(item => item.type === 'course')
      .reduce((sum, item) => sum + (item.quantity || 0), 0);

    if (totalSessions === 0) {
      return null;
    }

    const studentRef = db.collection('students').doc(contract.studentId);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      return null;
    }

    const studentData = studentSnap.data();
    const currentSessions = studentData?.registeredSessions || 0;
    
    let newSessions = currentSessions;
    if (contract.category === 'Hợp đồng tái phí' || contract.category === 'Hợp đồng liên kết') {
      newSessions = currentSessions + totalSessions;
    } else {
      newSessions = currentSessions === 0 ? totalSessions : currentSessions + totalSessions;
    }

    const updateData: any = {
      registeredSessions: newSessions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (contract.category === 'Hợp đồng mới' && studentData?.status === 'Học thử') {
      updateData.status = 'Đang học';
    }

    await studentRef.update(updateData);
    console.log(`[onContractCreate] Updated student ${contract.studentId} with ${newSessions} sessions`);

    return null;
  });
