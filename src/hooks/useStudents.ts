import { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../types';
import { StudentService } from '../services/studentService';

export const useStudents = (filters?: {
  status?: StudentStatus;
  classId?: string;
  searchTerm?: string;
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StudentService.getStudents(filters);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách học viên');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters?.status, filters?.classId, filters?.searchTerm]);

  const refreshStudents = () => {
    fetchStudents();
  };

  const createStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const id = await StudentService.createStudent(studentData);
      await refreshStudents();
      return id;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo học viên');
      throw err;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await StudentService.updateStudent(id, updates);
      await refreshStudents();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật học viên');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await StudentService.deleteStudent(id);
      await refreshStudents();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa học viên');
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    refreshStudents,
    createStudent,
    updateStudent,
    deleteStudent
  };
};

export const useStudent = (id: string) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await StudentService.getStudentById(id);
        setStudent(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin học viên');
        console.error('Error fetching student:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  return { student, loading, error };
};
