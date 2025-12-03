/**
 * Work Confirmation Page
 * Xác nhận công giáo viên & trợ giảng với Firebase integration
 */

import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Plus, User, Trash2 } from 'lucide-react';
import { useWorkSessions } from '../src/hooks/useWorkSessions';
import { WorkType, WorkStatus } from '../src/services/workSessionService';

export const WorkConfirmation: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<WorkStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    sessions, 
    loading, 
    error, 
    createSession, 
    toggleStatus, 
    confirmAll,
    deleteSession 
  } = useWorkSessions();

  // Manual Form States
  const [manualForm, setManualForm] = useState({
    staffName: '',
    position: 'Giáo viên Việt',
    date: new Date().toISOString().split('T')[0],
    timeStart: '',
    timeEnd: '',
    className: '',
    type: 'Dạy chính' as WorkType,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmAll = async () => {
    const pendingIds = filteredSessions
      .filter(s => s.status === 'Chờ xác nhận' && s.id)
      .map(s => s.id!);
    
    if (pendingIds.length === 0) {
      alert('Không có công nào cần xác nhận');
      return;
    }
    
    try {
      await confirmAll(pendingIds);
    } catch (err) {
      alert('Lỗi khi xác nhận hàng loạt');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus(id);
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa công này?')) return;
    try {
      await deleteSession(id);
    } catch (err) {
      alert('Lỗi khi xóa');
    }
  };

  const handleManualAdd = async () => {
    if (!manualForm.staffName || !manualForm.date || !manualForm.timeStart) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      await createSession({
        staffName: manualForm.staffName,
        position: manualForm.position,
        date: manualForm.date,
        timeStart: manualForm.timeStart,
        timeEnd: manualForm.timeEnd,
        className: manualForm.className,
        type: manualForm.type,
        status: 'Chờ xác nhận',
      });
      
      setManualForm({
        staffName: '',
        position: 'Giáo viên Việt',
        date: new Date().toISOString().split('T')[0],
        timeStart: '',
        timeEnd: '',
        className: '',
        type: 'Dạy chính',
      });
      alert('Đã thêm công thành công!');
    } catch (err) {
      alert('Lỗi khi thêm công');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter sessions
  let filteredSessions = sessions.filter(s => 
    s.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (statusFilter) {
    filteredSessions = filteredSessions.filter(s => s.status === statusFilter);
  }

  // Stats
  const pendingCount = sessions.filter(s => s.status === 'Chờ xác nhận').length;
  const confirmedCount = sessions.filter(s => s.status === 'Đã xác nhận').length;

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white bg-green-500 px-4 py-1.5 inline-block rounded-sm shadow-sm">
            Xác nhận công giáo viên & trợ giảng
          </h2>
          <div className="flex gap-3">
            <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
              Chờ: {pendingCount}
            </span>
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Đã xác nhận: {confirmedCount}
            </span>
          </div>
        </div>
         
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Hiển thị thời gian</label>
            <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
              <option>Hôm nay</option>
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Trạng thái</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkStatus | '')}
              className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            >
              <option value="">Tất cả</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Vị trí</label>
            <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
              <option value="">Tất cả</option>
              <option>Giáo viên Việt</option>
              <option>Giáo viên Nước ngoài</option>
              <option>Trợ giảng</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Tên nhân sự</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full border border-gray-300 rounded px-2 py-2 pl-8 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* LEFT: Main Table */}
        <div className="flex-1 w-full xl:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs italic text-gray-500 flex justify-between items-center">
            <span>Hệ thống sẽ tự động hiển thị dựa theo thời khóa biểu và lịch nghỉ</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead className="bg-green-500 text-white text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 border-r border-green-400 w-12 text-center">STT</th>
                  <th className="px-4 py-3 border-r border-green-400">Tên nhân viên</th>
                  <th className="px-4 py-3 border-r border-green-400">Thời gian</th>
                  <th className="px-4 py-3 border-r border-green-400 text-center">Lớp</th>
                  <th className="px-4 py-3 border-r border-green-400 text-center">Kiểu tính công</th>
                  <th className="px-4 py-3 text-center w-40">
                    <button 
                      onClick={handleConfirmAll}
                      className="bg-white text-green-600 px-2 py-0.5 rounded shadow-sm text-[10px] hover:bg-gray-100 uppercase font-bold w-full"
                    >
                      Xác nhận hàng loạt
                    </button>
                  </th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        Đang tải...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-red-500">Lỗi: {error}</td>
                  </tr>
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      <Clock size={48} className="mx-auto mb-2 opacity-20" />
                      Chưa có công nào
                    </td>
                  </tr>
                ) : filteredSessions.map((session, idx) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-r border-gray-100 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 border-r border-gray-100">
                      <div className="font-medium text-gray-900">{session.staffName}</div>
                      <div className="text-xs text-gray-500">{session.position}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>{session.date} {session.timeStart} - {session.timeEnd}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">{session.className || '-'}</td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        session.type === 'Dạy chính' ? 'bg-blue-100 text-blue-700' :
                        session.type === 'Trợ giảng' ? 'bg-purple-100 text-purple-700' :
                        session.type === 'Nhận xét' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {session.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => session.id && handleToggleStatus(session.id)}
                        className={`px-3 py-1 rounded text-xs font-bold border transition-all w-full
                          ${session.status === 'Đã xác nhận' 
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                            : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
                          }
                        `}
                      >
                        {session.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => session.id && handleDelete(session.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-yellow-50 text-xs text-yellow-800 italic border-t border-yellow-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
            Sau khi xác nhận, số công sẽ tự động chuyển sang báo cáo lương.
          </div>
        </div>

        {/* RIGHT: Manual Add Form */}
        <div className="w-full xl:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
          <div className="bg-green-500 px-4 py-3">
            <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
              <Plus size={16} className="bg-white text-green-500 rounded-full p-0.5" />
              Giao diện thêm công thủ công
            </h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Tên nhân viên</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="Nhập tên nhân viên..."
                  value={manualForm.staffName}
                  onChange={e => setManualForm({...manualForm, staffName: e.target.value})}
                />
                <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Vị trí</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                value={manualForm.position}
                onChange={e => setManualForm({...manualForm, position: e.target.value})}
              >
                <option>Giáo viên Việt</option>
                <option>Giáo viên Nước ngoài</option>
                <option>Trợ giảng</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Ngày</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={manualForm.date}
                  onChange={e => setManualForm({...manualForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Lớp</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="VD: Kindy 1A"
                  value={manualForm.className}
                  onChange={e => setManualForm({...manualForm, className: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Giờ bắt đầu</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={manualForm.timeStart}
                  onChange={e => setManualForm({...manualForm, timeStart: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Giờ kết thúc</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={manualForm.timeEnd}
                  onChange={e => setManualForm({...manualForm, timeEnd: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Kiểu tính công</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                value={manualForm.type}
                onChange={e => setManualForm({...manualForm, type: e.target.value as WorkType})}
              >
                <option value="Dạy chính">Dạy chính</option>
                <option value="Trợ giảng">Trợ giảng</option>
                <option value="Nhận xét">Nhận xét</option>
                <option value="Dạy thay">Dạy thay</option>
                <option value="Bồi bài">Bồi bài</option>
              </select>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleManualAdd}
                disabled={submitting}
                className="w-full bg-green-500 text-white font-bold py-2.5 rounded hover:bg-green-600 transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {submitting ? 'Đang xử lý...' : 'Xác nhận thêm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
