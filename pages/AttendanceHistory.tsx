import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, BarChart2, Plus, X, Eye, FileDown } from 'lucide-react';
import { useClasses } from '../src/hooks/useClasses';
import { useAttendance } from '../src/hooks/useAttendance';
import { AttendanceRecord } from '../types';
import * as XLSX from 'xlsx';

export const AttendanceHistory: React.FC = () => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const { classes } = useClasses({});
  const { attendanceRecords, loading, studentAttendance, loadStudentAttendance } = useAttendance({});

  const exportDetailToExcel = () => {
    if (!selectedRecord) return;
    
    const data = [
      { STT: 1, 'Học viên': 'Nguyễn Gia Bảo', 'Trạng thái': 'Có mặt', 'Ghi chú': '' },
      { STT: 2, 'Học viên': 'Trần Minh Anh', 'Trạng thái': 'Có mặt', 'Ghi chú': '' },
      { STT: 3, 'Học viên': 'Lê Hoàng Nam', 'Trạng thái': 'Vắng', 'Ghi chú': 'Nghỉ ốm' },
      { STT: 4, 'Học viên': 'Phạm Thị D', 'Trạng thái': 'Có mặt', 'Ghi chú': '' },
      { STT: 5, 'Học viên': 'Đỗ Nguyệt An', 'Trạng thái': 'Bảo lưu', 'Ghi chú': 'Bảo lưu từ 01/10' },
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');
    XLSX.writeFile(wb, `DiemDanh_${selectedRecord.className}_${selectedRecord.date.replace(/\//g, '-')}.xlsx`);
  };

  // Calculate stats from Firebase data
  const totalPresent = attendanceRecords.reduce((sum, r) => sum + r.present, 0);
  const totalStudents = attendanceRecords.reduce((sum, r) => sum + r.totalStudents, 0);
  const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
  const todayAbsent = attendanceRecords
    .filter(r => r.date === new Date().toLocaleDateString('vi-VN'))
    .reduce((sum, r) => sum + r.absent, 0);
  const checkedClasses = attendanceRecords.filter(r => r.status === 'Đã điểm danh').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Header with Action Button */}
       <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div>
           <h2 className="text-lg font-bold text-gray-800">Lịch sử điểm danh</h2>
           <p className="text-sm text-gray-500">Quản lý điểm danh các lớp học</p>
         </div>
         <button
           onClick={() => setShowAttendanceModal(true)}
           className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
         >
           <Plus size={18} />
           Điểm danh
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Tỷ lệ đi học</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <XCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Vắng mặt hôm nay</p>
                    <p className="text-2xl font-bold text-gray-900">{todayAbsent}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <BarChart2 size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Lớp đã điểm danh</p>
                    <p className="text-2xl font-bold text-gray-900">{checkedClasses}/{classes.length}</p>
                </div>
            </div>
       </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Lịch sử điểm danh gần đây</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4">Lớp học</th>
              <th className="px-6 py-4">Ngày</th>
              <th className="px-6 py-4">Sĩ số</th>
              <th className="px-6 py-4">Hiện diện</th>
              <th className="px-6 py-4">Vắng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendanceRecords.length > 0 ? attendanceRecords.map((record) => {
              // Handle various field name formats from Firebase
              const className = record.className || (record as any).class || (record as any).classname || '-';
              const totalStudents = record.totalStudents || (record as any).total || 0;
              const present = record.present || (record as any).presentCount || 0;
              const absent = record.absent || (record as any).absentCount || 0;
              const status = record.status || (record as any).attendanceStatus || 'Chưa điểm danh';
              
              return (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{className}</td>
                <td className="px-6 py-4">{record.date || '-'}</td>
                <td className="px-6 py-4">{totalStudents}</td>
                <td className="px-6 py-4 text-green-600 font-medium">{present}</td>
                <td className="px-6 py-4 text-red-600 font-medium">{absent}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                    ${status === 'Đã điểm danh' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {status === 'Chưa điểm danh' ? (
                      <button 
                        onClick={() => { setSelectedClass(className); setShowAttendanceModal(true); }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-xs border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                      >
                          Điểm danh ngay
                      </button>
                  ) : (
                      <button 
                        onClick={() => { setSelectedRecord(record); setShowDetailModal(true); }}
                        className="text-gray-500 hover:text-indigo-600 font-medium text-xs flex items-center gap-1"
                      >
                          <Eye size={14} />
                          Xem chi tiết
                      </button>
                  )}
                </td>
              </tr>
            );
            }) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  Chưa có dữ liệu điểm danh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Điểm danh lớp học</h3>
                {selectedClass && <p className="text-sm text-indigo-600">{selectedClass}</p>}
              </div>
              <button onClick={() => { setShowAttendanceModal(false); setSelectedClass(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5">
              {!selectedClass ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp học</label>
                  <select
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Lớp: <span className="font-bold text-gray-900">{selectedClass}</span></p>
                    <p className="text-sm text-gray-600">Ngày: <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span></p>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Học viên</th>
                          <th className="px-4 py-2 text-center">Có mặt</th>
                          <th className="px-4 py-2 text-center">Vắng</th>
                          <th className="px-4 py-2 text-center">Bảo lưu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-3">Nguyễn Gia Bảo</td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st1" defaultChecked className="text-green-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st1" className="text-red-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st1" className="text-yellow-600" /></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Trần Minh Anh</td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st2" defaultChecked className="text-green-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st2" className="text-red-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st2" className="text-yellow-600" /></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Lê Hoàng Nam</td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st3" defaultChecked className="text-green-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st3" className="text-red-600" /></td>
                          <td className="px-4 py-3 text-center"><input type="radio" name="st3" className="text-yellow-600" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => { setShowAttendanceModal(false); setSelectedClass(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => { alert('Đã lưu điểm danh!'); setShowAttendanceModal(false); setSelectedClass(null); }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Lưu điểm danh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết điểm danh</h3>
                <p className="text-sm text-teal-600">{selectedRecord.className} - {selectedRecord.date}</p>
              </div>
              <button onClick={() => { setShowDetailModal(false); setSelectedRecord(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="p-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{selectedRecord.totalStudents}</p>
                  <p className="text-xs text-blue-600">Sĩ số</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{selectedRecord.present}</p>
                  <p className="text-xs text-green-600">Có mặt</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{selectedRecord.absent}</p>
                  <p className="text-xs text-red-600">Vắng</p>
                </div>
              </div>

              {/* Student List */}
              <h4 className="font-semibold text-gray-700 mb-3">Danh sách học viên</h4>
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">STT</th>
                      <th className="px-4 py-2 text-left">Học viên</th>
                      <th className="px-4 py-2 text-center">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 text-gray-500">1</td>
                      <td className="px-4 py-3 font-medium">Nguyễn Gia Bảo</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Có mặt</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-500">2</td>
                      <td className="px-4 py-3 font-medium">Trần Minh Anh</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Có mặt</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-500">3</td>
                      <td className="px-4 py-3 font-medium">Lê Hoàng Nam</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Vắng</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 italic">Nghỉ ốm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-500">4</td>
                      <td className="px-4 py-3 font-medium">Phạm Thị D</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Có mặt</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-500">5</td>
                      <td className="px-4 py-3 font-medium">Đỗ Nguyệt An</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Bảo lưu</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 italic">Bảo lưu từ 01/10</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedRecord(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={exportDetailToExcel}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FileDown size={16} />
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};