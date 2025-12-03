/**
 * useParents Hook
 * React hook for parent operations
 */

import { useState, useEffect } from 'react';
import { StudentStatus } from '../../types';
import * as parentService from '../services/parentService';
import { ParentData } from '../services/parentService';

interface UseParentsReturn {
  parents: ParentData[];
  loading: boolean;
  error: string | null;
  createParent: (data: Omit<ParentData, 'id'>) => Promise<string>;
  updateParent: (id: string, data: Partial<ParentData>) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  addChild: (parentId: string, child: { id: string; name: string; dob: string; class: string; status: StudentStatus }) => Promise<void>;
  removeChild: (parentId: string, childId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useParents = (searchTerm?: string): UseParentsReturn => {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentService.getParents(searchTerm);
      setParents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [searchTerm]);

  const createParent = async (data: Omit<ParentData, 'id'>): Promise<string> => {
    const id = await parentService.createParent(data);
    await fetchParents();
    return id;
  };

  const updateParent = async (id: string, data: Partial<ParentData>): Promise<void> => {
    await parentService.updateParent(id, data);
    await fetchParents();
  };

  const deleteParent = async (id: string): Promise<void> => {
    await parentService.deleteParent(id);
    await fetchParents();
  };

  const addChild = async (
    parentId: string,
    child: { id: string; name: string; dob: string; class: string; status: StudentStatus }
  ): Promise<void> => {
    await parentService.addChildToParent(parentId, child);
    await fetchParents();
  };

  const removeChild = async (parentId: string, childId: string): Promise<void> => {
    await parentService.removeChildFromParent(parentId, childId);
    await fetchParents();
  };

  return {
    parents,
    loading,
    error,
    createParent,
    updateParent,
    deleteParent,
    addChild,
    removeChild,
    refresh: fetchParents,
  };
};
