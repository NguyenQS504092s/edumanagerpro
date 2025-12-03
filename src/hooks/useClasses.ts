import { useState, useEffect } from 'react';
import { ClassModel, ClassStatus } from '../types';
import { ClassService } from '../services/classService';

export const useClasses = (filters?: {
  status?: ClassStatus;
  teacherId?: string;
  searchTerm?: string;
}) => {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ClassService.getClasses(filters);
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách lớp học');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [filters?.status, filters?.teacherId, filters?.searchTerm]);

  const refreshClasses = () => {
    fetchClasses();
  };

  const createClass = async (classData: Omit<ClassModel, 'id'>) => {
    try {
      const id = await ClassService.createClass(classData);
      await refreshClasses();
      return id;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo lớp học');
      throw err;
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassModel>) => {
    try {
      await ClassService.updateClass(id, updates);
      await refreshClasses();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật lớp học');
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await ClassService.deleteClass(id);
      await refreshClasses();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa lớp học');
      throw err;
    }
  };

  return {
    classes,
    loading,
    error,
    refreshClasses,
    createClass,
    updateClass,
    deleteClass
  };
};

export const useClass = (id: string) => {
  const [classData, setClassData] = useState<ClassModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ClassService.getClassById(id);
        setClassData(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin lớp học');
        console.error('Error fetching class:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClass();
    }
  }, [id]);

  return { classData, loading, error };
};
