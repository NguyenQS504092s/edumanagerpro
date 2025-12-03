import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface AuthUser extends FirebaseUser {
  role?: string;
  staffData?: any;
}

export class AuthService {
  
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch staff data
      const staffDoc = await getDoc(doc(db, 'staff', user.uid));
      if (staffDoc.exists()) {
        return {
          ...user,
          role: staffDoc.data().role,
          staffData: staffDoc.data()
        } as AuthUser;
      }
      
      return user as AuthUser;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  // Sign out
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  
  // Register new staff with email and password
  static async registerStaff(
    email: string,
    password: string,
    staffData: {
      name: string;
      code: string;
      role: string;
      department: string;
      position: string;
      phone: string;
    }
  ): Promise<string> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, {
        displayName: staffData.name
      });
      
      // Create staff document in Firestore
      await setDoc(doc(db, 'staff', user.uid), {
        uid: user.uid,
        email: email,
        ...staffData,
        status: 'Active',
        permissions: {
          canManageStudents: staffData.role === 'Quản trị viên',
          canManageClasses: staffData.role === 'Quản trị viên',
          canManageStaff: staffData.role === 'Quản trị viên',
          canManageFinance: staffData.role === 'Quản trị viên',
          canViewReports: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return user.uid;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
  
  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch staff data
        const staffDoc = await getDoc(doc(db, 'staff', user.uid));
        if (staffDoc.exists()) {
          callback({
            ...user,
            role: staffDoc.data().role,
            staffData: staffDoc.data()
          } as AuthUser);
        } else {
          callback(user as AuthUser);
        }
      } else {
        callback(null);
      }
    });
  }
  
  // Get error message in Vietnamese
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Email không tồn tại trong hệ thống';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác';
      case 'auth/email-already-in-use':
        return 'Email đã được sử dụng';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau';
      default:
        return 'Đã có lỗi xảy ra. Vui lòng thử lại';
    }
  }
}
