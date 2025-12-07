"use strict";
/**
 * Contract Triggers
 *
 * Handles:
 * - Add sessions to student when renewal/migration contract is paid
 * - Update student status when new contract is created
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onContractCreate = exports.onContractUpdate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const REGION = 'asia-southeast1';
/**
 * Trigger: When a contract status changes to PAID
 * Actions:
 * - For renewal/migration contracts: Add sessions to student
 * - For new contracts: Ensure student has sessions
 */
exports.onContractUpdate = functions
    .region(REGION)
    .firestore
    .document('contracts/{contractId}')
    .onUpdate(async (change, context) => {
    const contractId = context.params.contractId;
    const before = change.before.data();
    const after = change.after.data();
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
    const currentSessions = (studentData === null || studentData === void 0 ? void 0 : studentData.registeredSessions) || 0;
    // Handle based on contract category
    let newSessions = currentSessions;
    if (after.category === 'Hợp đồng tái phí' || after.category === 'Hợp đồng liên kết') {
        // Add sessions to existing
        newSessions = currentSessions + totalSessions;
        console.log(`[onContractUpdate] Adding ${totalSessions} sessions. New total: ${newSessions}`);
    }
    else {
        // New contract - set sessions if not already set
        if (currentSessions === 0) {
            newSessions = totalSessions;
            console.log(`[onContractUpdate] Setting initial sessions: ${newSessions}`);
        }
        else {
            // Student already has sessions, add more
            newSessions = currentSessions + totalSessions;
            console.log(`[onContractUpdate] Student has ${currentSessions} sessions, adding ${totalSessions}. New: ${newSessions}`);
        }
    }
    // Update student
    const updateData = {
        registeredSessions: newSessions,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    // If new contract and student was in TRIAL status, update to ACTIVE
    if (after.category === 'Hợp đồng mới' && (studentData === null || studentData === void 0 ? void 0 : studentData.status) === 'Học thử') {
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
exports.onContractCreate = functions
    .region(REGION)
    .firestore
    .document('contracts/{contractId}')
    .onCreate(async (snap, context) => {
    const contractId = context.params.contractId;
    const contract = snap.data();
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
    const currentSessions = (studentData === null || studentData === void 0 ? void 0 : studentData.registeredSessions) || 0;
    let newSessions = currentSessions;
    if (contract.category === 'Hợp đồng tái phí' || contract.category === 'Hợp đồng liên kết') {
        newSessions = currentSessions + totalSessions;
    }
    else {
        newSessions = currentSessions === 0 ? totalSessions : currentSessions + totalSessions;
    }
    const updateData = {
        registeredSessions: newSessions,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (contract.category === 'Hợp đồng mới' && (studentData === null || studentData === void 0 ? void 0 : studentData.status) === 'Học thử') {
        updateData.status = 'Đang học';
    }
    await studentRef.update(updateData);
    console.log(`[onContractCreate] Updated student ${contract.studentId} with ${newSessions} sessions`);
    return null;
});
//# sourceMappingURL=contractTriggers.js.map