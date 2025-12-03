/**
 * useParents Hook (Refactored)
 * - Parents với children query từ students collection
 */

import { useState, useEffect } from 'react';
import { Parent } from '../../types';
import * as parentService from '../services/parentService';
import { ParentWithChildren } from '../services/parentService';

interface UseParentsReturn {
  parents: ParentWithChildren[];
  loading: boolean;
  error: string | null;
  createParent: (data: Omit<Parent, 'id'>) => Promise<string>;
  updateParent: (id: string, data: Partial<Parent>) => Promise<void>;
  deleteParent: (id: string) => Promise<void>;
  findByPhone: (phone: string) => Promise<Parent | null>;
  refresh: () => Promise<void>;
}

export const useParents = (searchTerm?: string): UseParentsReturn => {
  const [parents, setParents] = useState<ParentWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentService.getParentsWithChildren(searchTerm);
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

  const createParent = async (data: Omit<Parent, 'id'>): Promise<string> => {
    const id = await parentService.createParent(data);
    await fetchParents();
    return id;
  };

  const updateParent = async (id: string, data: Partial<Parent>): Promise<void> => {
    await parentService.updateParent(id, data);
    await fetchParents();
  };

  const deleteParent = async (id: string): Promise<void> => {
    await parentService.deleteParent(id);
    await fetchParents();
  };

  const findByPhone = async (phone: string): Promise<Parent | null> => {
    return parentService.findParentByPhone(phone);
  };

  return {
    parents,
    loading,
    error,
    createParent,
    updateParent,
    deleteParent,
    findByPhone,
    refresh: fetchParents,
  };
};
