/**
 * useStaff Hook
 * React hook for staff operations
 */

import { useState, useEffect } from 'react';
import { Staff } from '../../types';
import * as staffService from '../services/staffService';

interface UseStaffProps {
  department?: string;
  role?: string;
  status?: string;
}

interface UseStaffReturn {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  createStaff: (data: Omit<Staff, 'id'>) => Promise<string>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useStaff = (props?: UseStaffProps): UseStaffReturn => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getStaff({
        department: props?.department,
        role: props?.role,
        status: props?.status,
      });
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [props?.department, props?.role, props?.status]);

  const createStaff = async (data: Omit<Staff, 'id'>): Promise<string> => {
    const id = await staffService.createStaff(data);
    await fetchStaff();
    return id;
  };

  const updateStaff = async (id: string, data: Partial<Staff>): Promise<void> => {
    await staffService.updateStaff(id, data);
    await fetchStaff();
  };

  const deleteStaff = async (id: string): Promise<void> => {
    await staffService.deleteStaff(id);
    await fetchStaff();
  };

  return {
    staff,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    refresh: fetchStaff,
  };
};
