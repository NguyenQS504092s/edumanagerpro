/**
 * Contract List Page
 * Danh sách hợp đồng với filter và actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Eye, Trash2, DollarSign, Filter } from 'lucide-react';
import { Contract, ContractStatus } from '../types';
import { useContracts } from '../src/hooks/useContracts';
import { formatCurrency } from '../src/utils/currencyUtils';

export const ContractList: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { contracts, loading, error, deleteContract, updateStatus } = useContracts(
    statusFilter ? { status: statusFilter } : undefined
  );

  const filteredContracts = contracts.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.code?.toLowerCase().includes(term) ||
      c.studentName?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    try {
      await deleteContract(id);
    } catch (err) {
      alert('Không thể xóa hợp đồng');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateStatus(id, ContractStatus.PAID);
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const styles = {
      [ContractStatus.DRAFT]: 'bg-gray-100 text-gray-700',
      [ContractStatus.PAID]: 'bg-green-100 text-green-700',
      [ContractStatus.DEBT]: 'bg-red-100 text-red-700',
      [ContractStatus.CANCELLED]: 'bg-orange-100 text-orange-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-indigo-600" size={24} />
          Danh sách hợp đồng
        </h2>
        <button
          onClick={() => navigate('/finance/contracts/create')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus size={16} /> Tạo hợp đồng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, tên học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContractStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={ContractStatus.DRAFT}>Nháp</option>
            <option value={ContractStatus.PAID}>Đã thanh toán</option>
            <option value={ContractStatus.DEBT}>Nợ phí</option>
            <option value={ContractStatus.CANCELLED}>Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Mã HĐ</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Học viên</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Tổng tiền</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Còn nợ</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    Đang tải...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-red-500">
                  Lỗi: {error}
                </td>
              </tr>
            ) : filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-indigo-600">
                    {contract.code || `HĐ-${contract.id?.slice(0, 6)}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{contract.studentName || '---'}</div>
                    <div className="text-xs text-gray-500">{contract.parentPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {contract.contractDate
                      ? new Date(contract.contractDate).toLocaleDateString('vi-VN')
                      : '---'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(contract.totalAmount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">
                    {formatCurrency(contract.remainingAmount || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(contract.status)}`}>
                      {contract.status === ContractStatus.DRAFT && 'Nháp'}
                      {contract.status === ContractStatus.PAID && 'Đã thanh toán'}
                      {contract.status === ContractStatus.DEBT && 'Nợ phí'}
                      {contract.status === ContractStatus.CANCELLED && 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/finance/contracts/${contract.id}`)}
                        className="text-gray-400 hover:text-indigo-600 p-1"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {contract.status !== ContractStatus.PAID && (
                        <button
                          onClick={() => contract.id && handleMarkPaid(contract.id)}
                          className="text-gray-400 hover:text-green-600 p-1"
                          title="Đánh dấu đã thanh toán"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => contract.id && handleDelete(contract.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-2 opacity-20" />
                  Không tìm thấy hợp đồng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {!loading && filteredContracts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Tổng số HĐ</p>
              <p className="text-xl font-bold text-gray-800">{filteredContracts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã thanh toán</p>
              <p className="text-xl font-bold text-green-600">
                {filteredContracts.filter(c => c.status === ContractStatus.PAID).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nợ phí</p>
              <p className="text-xl font-bold text-red-600">
                {filteredContracts.filter(c => c.status === ContractStatus.DEBT).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-xl font-bold text-indigo-600">
                {formatCurrency(
                  filteredContracts
                    .filter(c => c.status === ContractStatus.PAID)
                    .reduce((sum, c) => sum + (c.totalAmount || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
