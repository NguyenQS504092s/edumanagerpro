/**
 * Work Confirmation Page
 * Xác nhận công giáo viên & trợ giảng
 * - Tự động hiển thị công từ TKB
 * - Loại trừ ngày nghỉ
 */

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, Clock, Plus, User } from 'lucide-react';
import { useAutoWorkSessions, WorkSession } from '../src/hooks/useAutoWorkSessions';
import { usePermissions } from '../src/hooks/usePermissions';
import { useAuth } from '../src/hooks/useAuth';

export const WorkConfirmation: React.FC = () => {
  // Permissions - Teachers only see their own work
  const { isTeacher, canApprove, staffId } = usePermissions();
  const { staffData } = useAuth();
  const canApproveWork = canApprove('work_confirmation');
  // Week navigation - current week
  const [currentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Filters - default to "Tuần này" to show all sessions
  const [timeFilter, setTimeFilter] = useState('Tuần này');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    sessions,
    loading,
    error,
    confirmSession,
    unconfirmSession,
    confirmMultiple,
    addManualSession,
  } = useAutoWorkSessions(currentWeekStart);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    staffName: '',
    position: 'Giáo viên',
    date: '',
    timeStart: '',
    type: 'Dạy chính' as WorkSession['type'],
  });

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return sessions.filter(s => {
      // Teachers only see their own work
      if (isTeacher && staffData) {
        const myName = staffData.name;
        const myId = staffData.id || staffId;
        if (s.staffName !== myName && s.staffId !== myId) return false;
      }

      // Time filter
      if (timeFilter === 'Hôm nay' && s.date !== today) return false;
      
      // Status filter
      if (statusFilter && s.status !== statusFilter) return false;
      
      // Position filter
      if (positionFilter && !s.position.includes(positionFilter)) return false;
      
      // Search filter
      if (searchTerm && !s.staffName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    });
  }, [sessions, timeFilter, statusFilter, positionFilter, searchTerm, isTeacher, staffData, staffId]);

  // Confirm all pending
  const handleConfirmAll = async () => {
    const pending = filteredSessions.filter(s => s.status === 'Chờ xác nhận');
    if (pending.length === 0) {
      alert('Không có công nào cần xác nhận');
      return;
    }
    
    try {
      await confirmMultiple(pending);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Toggle confirm/unconfirm
  const handleToggleConfirm = async (session: WorkSession) => {
    try {
      if (session.status === 'Chờ xác nhận') {
        await confirmSession(session);
      } else if (session.status === 'Đã xác nhận') {
        if (confirm('Bạn có chắc muốn hủy xác nhận công này?')) {
          await unconfirmSession(session);
        }
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Add manual
  const handleManualAdd = async () => {
    if (!manualForm.staffName || !manualForm.date || !manualForm.timeStart) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await addManualSession({
        staffName: manualForm.staffName,
        position: manualForm.position === 'Giáo viên' ? 'Giáo viên Việt' : 'Trợ giảng',
        date: manualForm.date,
        timeStart: manualForm.timeStart,
        timeEnd: '',
        className: '',
        type: manualForm.type,
        status: 'Chờ xác nhận',
      });
      
      setManualForm({
        staffName: '',
        position: 'Giáo viên',
        date: '',
        timeStart: '',
        type: 'Dạy chính',
      });
      alert('Đã thêm công thành công!');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Format time display
  const formatTimeDisplay = (date: string, timeStart: string, timeEnd: string) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} ${timeStart} - ${timeEnd || '...'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-white bg-green-500 px-4 py-2 inline-block rounded mb-6">
          Xác nhận công giáo viên & trợ giảng
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hiển thị thời gian</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Hôm nay">Hôm nay</option>
              <option value="Tuần này">Tuần này</option>
              <option value="Tháng này">Tháng này</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Vị trí</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả</option>
              <option value="Giáo viên Việt">Giáo viên Việt</option>
              <option value="Giáo viên Nước ngoài">Giáo viên Nước ngoài</option>
              <option value="Trợ giảng">Trợ giảng</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tên nhân sự</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Lựa chọn tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Table */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 text-sm text-gray-500 italic border-b border-gray-100">
            Hệ thống sẽ tự động hiển thị dựa theo thời khóa biểu và lịch nghỉ
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-500 text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase w-12">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Tên nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Lớp</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Kiểu tính công</th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={handleConfirmAll}
                      className="text-xs font-bold text-white uppercase px-3 py-1.5 border border-white rounded hover:bg-green-600"
                    >
                      Xác nhận hàng loạt
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      Đang tải...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-red-500">{error}</td>
                  </tr>
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session, idx) => (
                    <tr key={session.id || `${session.staffName}-${session.date}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{session.staffName}</td>
                      <td className="px-4 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          {formatTimeDisplay(session.date, session.timeStart, session.timeEnd)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{session.className || '-'}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-medium border ${
                          session.type === 'Dạy chính' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          session.type === 'Trợ giảng' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          session.type === 'Nhận xét' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {session.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleConfirm(session)}
                          className={`px-4 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                            session.status === 'Đã xác nhận'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-white text-orange-500 border-2 border-orange-400 hover:bg-orange-50'
                          }`}
                        >
                          {session.status}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100 text-sm text-yellow-700 italic flex items-center gap-2 bg-yellow-50">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            Sau khi xác nhận, số công sẽ tự động chuyển sang báo cáo lương.
          </div>
        </div>

        {/* Right: Manual Add Form */}
        <div className="w-full xl:w-96 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-green-500 px-4 py-3 flex items-center gap-2">
            <Plus size={18} className="text-white" />
            <h3 className="text-white font-bold uppercase text-sm">Giao diện thêm công thủ công</h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhân viên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên nhân viên..."
                  value={manualForm.staffName}
                  onChange={(e) => setManualForm({ ...manualForm, staffName: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
              <select
                value={manualForm.position}
                onChange={(e) => setManualForm({ ...manualForm, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Giáo viên">Giáo viên</option>
                <option value="Trợ giảng">Trợ giảng</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={manualForm.timeStart}
                  onChange={(e) => setManualForm({ ...manualForm, timeStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu tính công</label>
              <select
                value={manualForm.type}
                onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Dạy chính">Dạy chính</option>
                <option value="Trợ giảng">Trợ giảng</option>
                <option value="Nhận xét">Nhận xét</option>
                <option value="Dạy thay">Dạy thay</option>
                <option value="Bồi bài">Bồi bài</option>
              </select>
            </div>
            
            <button
              onClick={handleManualAdd}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Xác nhận thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
