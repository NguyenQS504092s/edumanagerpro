/**
 * Customer Database Page
 * Kho dữ liệu khách hàng tiềm năng (Leads)
 */

import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, Calendar, Tag, X, Trash2, UserCheck, Filter } from 'lucide-react';
import { useLeads } from '../src/hooks/useLeads';
import { Lead, LeadStatus, LeadSource } from '../src/services/leadService';

const STATUS_COLORS: Record<LeadStatus, string> = {
  'Mới': 'bg-blue-100 text-blue-700',
  'Đang liên hệ': 'bg-yellow-100 text-yellow-700',
  'Quan tâm': 'bg-purple-100 text-purple-700',
  'Hẹn test': 'bg-orange-100 text-orange-700',
  'Đã test': 'bg-cyan-100 text-cyan-700',
  'Đăng ký': 'bg-green-100 text-green-700',
  'Từ chối': 'bg-red-100 text-red-700',
};

const SOURCE_OPTIONS: LeadSource[] = ['Facebook', 'Zalo', 'Website', 'Giới thiệu', 'Walk-in', 'Khác'];
const STATUS_OPTIONS: LeadStatus[] = ['Mới', 'Đang liên hệ', 'Quan tâm', 'Hẹn test', 'Đã test', 'Đăng ký', 'Từ chối'];

export const CustomerDatabase: React.FC = () => {
  const { leads, stats, loading, error, createLead, updateStatus, deleteLead } = useLeads();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa khách hàng này?')) return;
    try {
      await deleteLead(id);
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateStatus(id, status);
    } catch (err) {
      alert('Không thể cập nhật');
    }
  };

  // Filter leads
  let filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm) ||
    (l.childName && l.childName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (statusFilter) {
    filteredLeads = filteredLeads.filter(l => l.status === statusFilter);
  }
  if (sourceFilter) {
    filteredLeads = filteredLeads.filter(l => l.source === sourceFilter);
  }

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? ((stats['Đăng ký'] / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Users className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Kho dữ liệu khách hàng</h2>
              <p className="text-sm text-gray-500">Quản lý khách hàng tiềm năng</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus size={16} /> Thêm khách hàng
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-2 rounded-lg text-center transition-all ${
                statusFilter === status ? 'ring-2 ring-indigo-500' : ''
              } ${STATUS_COLORS[status]}`}
            >
              <div className="text-xl font-bold">{stats[status]}</div>
              <div className="text-xs">{status}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, tên con..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả nguồn</option>
            {SOURCE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(statusFilter || sourceFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setSourceFilter(''); }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
            >
              <X size={14} /> Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">{totalLeads}</span>
          <span className="ml-2 text-indigo-100">khách hàng</span>
        </div>
        <div className="text-right">
          <span className="text-sm text-indigo-100">Tỷ lệ chuyển đổi:</span>
          <span className="ml-2 text-2xl font-bold">{conversionRate}%</span>
        </div>
      </div>

      {/* Lead List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-3">Phụ huynh</th>
                <th className="px-4 py-3">Con</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3">Người phụ trách</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3">Ghi chú</th>
                <th className="px-4 py-3 text-center w-20">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-red-500">Lỗi: {error}</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users size={48} className="mx-auto mb-2 opacity-20" />
                    Chưa có khách hàng nào
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Phone size={12} /> {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={12} /> {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.childName ? (
                      <div>
                        <div className="font-medium">{lead.childName}</div>
                        {lead.childAge && <div className="text-xs text-gray-500">{lead.childAge} tuổi</div>}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      <Tag size={12} />
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignedToName || <span className="text-gray-400">Chưa phân công</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={lead.status}
                      onChange={(e) => lead.id && handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[lead.status]}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">
                    {lead.note || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => lead.id && handleDelete(lead.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <LeadModal
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            await createLead(data);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// Lead Modal
interface LeadModalProps {
  lead?: Lead;
  onClose: () => void;
  onSubmit: (data: Omit<Lead, 'id'>) => Promise<void>;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    childName: lead?.childName || '',
    childAge: lead?.childAge || '',
    source: lead?.source || 'Facebook' as LeadSource,
    status: lead?.status || 'Mới' as LeadStatus,
    note: lead?.note || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Vui lòng điền tên và số điện thoại');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        childAge: formData.childAge ? parseInt(formData.childAge.toString()) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {lead ? 'Sửa khách hàng' : 'Thêm khách hàng'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên phụ huynh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên con</label>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Bé An"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi con</label>
              <input
                type="number"
                min={1}
                max={18}
                value={formData.childAge}
                onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {SOURCE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
