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
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ClassModel, ClassStatus } from '../../types';

const COLLECTION_NAME = 'classes';

export class ClassService {
  
  // Get all classes with optional filters
  static async getClasses(filters?: {
    status?: ClassStatus;
    teacherId?: string;
    searchTerm?: string;
  }): Promise<ClassModel[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters?.teacherId) {
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      
      let classes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate().toISOString().split('T')[0] || '',
        endDate: doc.data().endDate?.toDate().toISOString().split('T')[0] || ''
      })) as ClassModel[];
      
      // Client-side search if searchTerm provided
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        classes = classes.filter(c => 
          c.name.toLowerCase().includes(term)
        );
      }
      
      return classes;
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  }
  
  // Get single class by ID
  static async getClassById(id: string): Promise<ClassModel | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          startDate: docSnap.data().startDate?.toDate().toISOString().split('T')[0] || '',
          endDate: docSnap.data().endDate?.toDate().toISOString().split('T')[0] || ''
        } as ClassModel;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting class:', error);
      throw error;
    }
  }
  
  // Create new class
  static async createClass(classData: Omit<ClassModel, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...classData,
        startDate: Timestamp.fromDate(new Date(classData.startDate)),
        endDate: Timestamp.fromDate(new Date(classData.endDate)),
        history: [{
          id: `HIST_${Date.now()}`,
          date: Timestamp.now(),
          type: 'Tạo lớp',
          description: `Lớp học ${classData.name} được tạo`,
          staffId: '',
          staffName: 'System'
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }
  
  // Update class
  static async updateClass(id: string, updates: Partial<ClassModel>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Convert date strings to Timestamps
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }
  
  // Delete class
  static async deleteClass(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }
  
  // Add history entry to class
  static async addClassHistory(
    classId: string, 
    historyEntry: {
      type: string;
      description: string;
      staffId: string;
      staffName: string;
    }
  ): Promise<void> {
    try {
      const classData = await this.getClassById(classId);
      if (!classData) throw new Error('Class not found');
      
      const docRef = doc(db, COLLECTION_NAME, classId);
      const currentHistory = (classData as any).history || [];
      
      const newEntry = {
        id: `HIST_${Date.now()}`,
        date: Timestamp.now(),
        ...historyEntry
      };
      
      await updateDoc(docRef, {
        history: [...currentHistory, newEntry],
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding class history:', error);
      throw error;
    }
  }
  
  // Update class progress
  static async updateClassProgress(classId: string, progress: string): Promise<void> {
    try {
      await this.updateClass(classId, { progress });
      await this.addClassHistory(classId, {
        type: 'Cập nhật tiến độ',
        description: `Tiến độ cập nhật: ${progress}`,
        staffId: '',
        staffName: 'System'
      });
    } catch (error) {
      console.error('Error updating class progress:', error);
      throw error;
    }
  }
  
  // Get classes by teacher
  static async getClassesByTeacher(teacherId: string): Promise<ClassModel[]> {
    return this.getClasses({ teacherId });
  }
  
  // Get active classes
  static async getActiveClasses(): Promise<ClassModel[]> {
    return this.getClasses({ status: ClassStatus.STUDYING });
  }
}
