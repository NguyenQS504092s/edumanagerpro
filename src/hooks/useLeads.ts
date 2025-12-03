/**
 * useLeads Hook
 */

import { useState, useEffect } from 'react';
import * as leadService from '../services/leadService';
import { Lead, LeadStatus, LeadSource } from '../services/leadService';

interface UseLeadsProps {
  status?: LeadStatus;
  source?: LeadSource;
}

interface UseLeadsReturn {
  leads: Lead[];
  stats: Record<LeadStatus, number>;
  loading: boolean;
  error: string | null;
  createLead: (data: Omit<Lead, 'id'>) => Promise<string>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  updateStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  assignLeads: (ids: string[], assignedTo: string, name: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useLeads = (props?: UseLeadsProps): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Record<LeadStatus, number>>({
    'Mới': 0, 'Đang liên hệ': 0, 'Quan tâm': 0, 'Hẹn test': 0, 'Đã test': 0, 'Đăng ký': 0, 'Từ chối': 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, statsData] = await Promise.all([
        leadService.getLeads({ status: props?.status, source: props?.source }),
        leadService.getLeadStats(),
      ]);
      setLeads(data);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [props?.status, props?.source]);

  const createLead = async (data: Omit<Lead, 'id'>): Promise<string> => {
    const id = await leadService.createLead(data);
    await fetchLeads();
    return id;
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<void> => {
    await leadService.updateLead(id, data);
    await fetchLeads();
  };

  const updateStatus = async (id: string, status: LeadStatus): Promise<void> => {
    await leadService.updateLeadStatus(id, status);
    await fetchLeads();
  };

  const deleteLead = async (id: string): Promise<void> => {
    await leadService.deleteLead(id);
    await fetchLeads();
  };

  const assignLeads = async (ids: string[], assignedTo: string, name: string): Promise<void> => {
    await leadService.assignLeads(ids, assignedTo, name);
    await fetchLeads();
  };

  return {
    leads,
    stats,
    loading,
    error,
    createLead,
    updateLead,
    updateStatus,
    deleteLead,
    assignLeads,
    refresh: fetchLeads,
  };
};
