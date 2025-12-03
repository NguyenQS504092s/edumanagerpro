
import React, { useState } from 'react';
import { Search, Filter, Calendar, FileDown, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { MOCK_ENROLLMENTS } from '../mockData';
import { EnrollmentRecord } from '../types';

export const EnrollmentHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredData = MOCK_ENROLLMENTS.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.contractCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: EnrollmentRecord['type']) => {
    switch(type) {
        case 'Hợp đồng mới': return 'bg-green-100 text-green-700 border-green-200';
        case 'Hợp đồng tái phí': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Ghi danh thủ công': return 'bg-gray-100 text-gray-600 border-gray-200';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.finalAmount, 0);
  const totalSessions = filteredData.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Summary */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100">
         <div>
             <h2 className="text-xl font-bold text-gray-800">Lịch sử ghi danh</h2>
             <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ lịch sử ghi danh và hợp đồng</p>
         </div>
         <div className="flex gap-4">
             <div className="text-right px-4 border-r border-gray-100">
                 <p className="text-xs text-gray-500 uppercase font-bold">Doanh thu (View)</p>
                 <p className="text-lg font-bold text-indigo-600">{totalRevenue.toLocaleString()} đ</p>
             </div>
             <div className="text-right px-2">
                 <p className="text-xs text-gray-500 uppercase font-bold">Tổng số buổi</p>
                 <p className="text-lg font-bold text-gray-800">{totalSessions} buổi</p>
             </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
             <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm học viên, mã HĐ..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <select 
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-gray-700"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
             >
                <option value="ALL">Tất cả kiểu ghi danh</option>
                <option value="Hợp đồng mới">Hợp đồng mới</option>
                <option value="Hợp đồng tái phí">Hợp đồng tái phí</option>
                <option value="Ghi danh thủ công">Ghi danh thủ công</option>
             </select>
             <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm cursor-pointer hover:bg-white hover:border-indigo-300 transition-colors">
                <Calendar size={16} />
                <span>Tháng này</span>
             </div>
          </div>
          
          <button className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
             <FileDown size={18} /> Xuất Excel
          </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-6 py-4 w-16 text-center">No</th>
                        <th className="px-6 py-4">Tên học viên</th>
                        <th className="px-6 py-4 text-center">Số buổi</th>
                        <th className="px-6 py-4">Kiểu ghi danh</th>
                        <th className="px-6 py-4">Hợp đồng</th>
                        <th className="px-6 py-4 text-right">Số tiền</th>
                        <th className="px-6 py-4">Ngày tạo</th>
                        <th className="px-6 py-4">Nhân viên tạo</th>
                        <th className="px-6 py-4 max-w-[200px]">Ghi chú</th>
                        <th className="px-4 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length > 0 ? (
                        filteredData.map((record, index) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 text-center font-medium text-gray-400">{index + 1}</td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900">{record.studentName}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-bold ${record.sessions < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                                        {record.sessions}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block px-2.5 py-1 rounded border text-[11px] font-semibold uppercase ${getTypeBadge(record.type)}`}>
                                        {record.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {record.contractCode || '---'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-gray-900">{record.finalAmount.toLocaleString()} đ</span>
                                        {record.originalAmount !== record.finalAmount && record.finalAmount > 0 && (
                                            <span className="text-xs text-gray-400 line-through decoration-gray-400">
                                                {record.originalAmount.toLocaleString()} đ
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {record.createdDate}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                            {record.createdBy.charAt(0)}
                                        </div>
                                        <span className="text-xs">{record.createdBy}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 italic max-w-[200px] truncate" title={record.note}>
                                    {record.note || ''}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                                Không tìm thấy dữ liệu ghi danh nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
                Hiển thị {filteredData.length} bản ghi
            </span>
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium disabled:opacity-50 text-gray-600 hover:bg-gray-50" disabled>Trước</button>
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium hover:bg-gray-50 text-gray-600">Sau</button>
            </div>
        </div>
      </div>
    </div>
  );
};
