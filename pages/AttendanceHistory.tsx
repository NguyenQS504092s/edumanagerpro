import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, BarChart2, X, Eye, FileDown, Trash2, AlertTriangle } from 'lucide-react';
import { useClasses } from '../src/hooks/useClasses';
import { useAttendance } from '../src/hooks/useAttendance';
import { usePermissions } from '../src/hooks/usePermissions';
import { useAuth } from '../src/hooks/useAuth';
import { AttendanceRecord, AttendanceStatus } from '../types';
import * as XLSX from 'xlsx';

const RECORDS_PER_PAGE = 10;

export const AttendanceHistory: React.FC = () => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [showOnlyValid, setShowOnlyValid] = useState(true); // Default: only show valid records
  const [deletingOrphans, setDeletingOrphans] = useState(false);
  
  // Permissions
  const { shouldShowOnlyOwnClasses, staffId } = usePermissions();
  const { staffData } = useAuth();
  const onlyOwnClasses = shouldShowOnlyOwnClasses('attendance_history');

  const { classes: allClasses } = useClasses({});
  const { 
    attendanceRecords: allRecords, 
    loading, 
    studentAttendance, 
    loadStudentAttendance,
    deleteAttendance,
    refresh: refreshAttendance
  } = useAttendance({});

  // Filter classes for teachers
  const classes = useMemo(() => {
    if (!onlyOwnClasses || !staffData) return allClasses;
    const myName = staffData.name;
    const myId = staffData.id || staffId;
    return allClasses.filter(cls => 
      cls.teacher === myName || 
      cls.teacherId === myId ||
      cls.assistant === myName ||
      cls.assistantId === myId
    );
  }, [allClasses, onlyOwnClasses, staffData, staffId]);

  // Count orphaned records
  const orphanedRecords = useMemo(() => {
    return allRecords.filter(r => !allClasses.some(c => c.id === r.classId));
  }, [allRecords, allClasses]);

  // Filter attendance records for teachers
  const attendanceRecords = useMemo(() => {
    let records = allRecords;
    
    // Filter out orphaned records (classId doesn't exist in classes)
    if (showOnlyValid) {
      records = records.filter(r => allClasses.some(c => c.id === r.classId));
    }
    
    // Filter by permission
    if (onlyOwnClasses && staffData) {
      const myClassIds = classes.map(c => c.id);
      const myClassNames = classes.map(c => c.name);
      records = records.filter(r => myClassIds.includes(r.classId) || myClassNames.includes(r.className));
    }
    
    // Filter by class
    if (filterClass) {
      records = records.filter(r => r.classId === filterClass || r.className === filterClass);
    }
    
    // Filter by date
    if (filterDate) {
      records = records.filter(r => r.date === filterDate);
    }
    
    // Sort by date descending
    records.sort((a, b) => {
      const dateA = a.date?.split('/').reverse().join('-') || '';
      const dateB = b.date?.split('/').reverse().join('-') || '';
      return dateB.localeCompare(dateA);
    });
    
    return records;
  }, [allRecords, allClasses, onlyOwnClasses, staffData, classes, filterClass, filterDate, showOnlyValid]);

  // Pagination
  const totalPages = Math.ceil(attendanceRecords.length / RECORDS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return attendanceRecords.slice(start, start + RECORDS_PER_PAGE);
  }, [attendanceRecords, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterClass, filterDate]);

  const exportDetailToExcel = () => {
    if (!selectedRecord || studentAttendance.length === 0) return;
    
    const data = studentAttendance.map((sa, index) => ({
      STT: index + 1,
      'Học viên': sa.studentName,
      'Mã HV': sa.studentCode,
      'Trạng thái': sa.status,
      'Ghi chú': sa.note || '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');
    XLSX.writeFile(wb, `DiemDanh_${selectedRecord.className}_${selectedRecord.date.replace(/\//g, '-')}.xlsx`);
  };

  // Load detail when viewing
  const handleViewDetail = async (record: AttendanceRecord) => {
    setSelectedRecord(record);
    await loadStudentAttendance(record.id);
    setShowDetailModal(true);
  };

  // Delete orphaned records (records with classId that doesn't exist)
  const handleDeleteOrphans = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${orphanedRecords.length} bản ghi rác?\n\nĐây là các bản ghi điểm danh có classId không tồn tại trong danh sách lớp hiện tại.`)) {
      return;
    }
    
    setDeletingOrphans(true);
    try {
      let deleted = 0;
      for (const record of orphanedRecords) {
        await deleteAttendance(record.id);
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`Deleted ${deleted}/${orphanedRecords.length} orphaned records...`);
        }
      }
      alert(`Đã xóa thành công ${deleted} bản ghi rác!`);
      await refreshAttendance();
    } catch (error) {
      console.error('Error deleting orphaned records:', error);
      alert('Có lỗi khi xóa bản ghi. Vui lòng thử lại.');
    } finally {
      setDeletingOrphans(false);
    }
  };

  // Delete ALL records (for clean start)
  const handleDeleteAll = async () => {
    if (!window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn xóa TẤT CẢ ${allRecords.length} bản ghi điểm danh?\n\nHành động này KHÔNG THỂ hoàn tác!`)) {
      return;
    }
    if (!window.confirm(`Xác nhận lần cuối: Xóa ${allRecords.length} bản ghi?`)) {
      return;
    }
    
    setDeletingOrphans(true);
    try {
      let deleted = 0;
      for (const record of allRecords) {
        await deleteAttendance(record.id);
        deleted++;
        if (deleted % 20 === 0) {
          console.log(`Deleted ${deleted}/${allRecords.length} records...`);
        }
      }
      alert(`Đã xóa thành công ${deleted} bản ghi!`);
      await refreshAttendance();
    } catch (error) {
      console.error('Error deleting all records:', error);
      alert('Có lỗi khi xóa bản ghi. Vui lòng thử lại.');
    } finally {
      setDeletingOrphans(false);
    }
  };

  // Calculate stats from Firebase data
  const totalPresent = attendanceRecords.reduce((sum, r) => sum + (r.present || 0), 0);
  const totalStudents = attendanceRecords.reduce((sum, r) => sum + (r.totalStudents || 0), 0);
  const totalAbsent = attendanceRecords.reduce((sum, r) => sum + (r.absent || 0), 0);
  const totalReserved = attendanceRecords.reduce((sum, r) => sum + (r.reserved || 0), 0);
  const totalTutored = attendanceRecords.reduce((sum, r) => sum + (r.tutored || 0), 0);
  const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
  const totalRecords = attendanceRecords.filter(r => r.status === 'Đã điểm danh').length;
  
  // Calculate percentages for status bar
  const getPercent = (value: number) => totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0;

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
           <p className="text-sm text-gray-500">Xem lịch sử điểm danh các lớp học</p>
         </div>
       </div>

       {/* Status Summary Bar - 4 attendance statuses (matching AttendanceStatus enum) */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Có mặt - Present */}
           <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
             <div className="relative w-14 h-14 flex-shrink-0">
               <svg className="w-14 h-14 transform -rotate-90">
                 <circle cx="28" cy="28" r="24" stroke="#dcfce7" strokeWidth="5" fill="none" />
                 <circle 
                   cx="28" cy="28" r="24" 
                   stroke="#22c55e" strokeWidth="5" fill="none"
                   strokeDasharray={`${getPercent(totalPresent) * 1.508} 150.8`}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-600">
                 {getPercent(totalPresent)}%
               </span>
             </div>
             <div>
               <p className="text-sm font-medium text-green-800">Có mặt</p>
               <p className="text-xl font-bold text-green-600">{totalPresent}<span className="text-sm text-green-500">/{totalStudents}</span></p>
             </div>
           </div>

           {/* Vắng mặt - Absent */}
           <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
             <div className="relative w-14 h-14 flex-shrink-0">
               <svg className="w-14 h-14 transform -rotate-90">
                 <circle cx="28" cy="28" r="24" stroke="#fee2e2" strokeWidth="5" fill="none" />
                 <circle 
                   cx="28" cy="28" r="24" 
                   stroke="#ef4444" strokeWidth="5" fill="none"
                   strokeDasharray={`${getPercent(totalAbsent) * 1.508} 150.8`}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-red-600">
                 {getPercent(totalAbsent)}%
               </span>
             </div>
             <div>
               <p className="text-sm font-medium text-red-800">Vắng mặt</p>
               <p className="text-xl font-bold text-red-600">{totalAbsent}<span className="text-sm text-red-500">/{totalStudents}</span></p>
             </div>
           </div>

           {/* Đã bồi - Tutored */}
           <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
             <div className="relative w-14 h-14 flex-shrink-0">
               <svg className="w-14 h-14 transform -rotate-90">
                 <circle cx="28" cy="28" r="24" stroke="#dbeafe" strokeWidth="5" fill="none" />
                 <circle 
                   cx="28" cy="28" r="24" 
                   stroke="#3b82f6" strokeWidth="5" fill="none"
                   strokeDasharray={`${getPercent(totalTutored) * 1.508} 150.8`}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-600">
                 {getPercent(totalTutored)}%
               </span>
             </div>
             <div>
               <p className="text-sm font-medium text-blue-800">Đã bồi</p>
               <p className="text-xl font-bold text-blue-600">{totalTutored}<span className="text-sm text-blue-500">/{totalStudents}</span></p>
             </div>
           </div>

           {/* Bảo lưu - Reserved */}
           <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
             <div className="relative w-14 h-14 flex-shrink-0">
               <svg className="w-14 h-14 transform -rotate-90">
                 <circle cx="28" cy="28" r="24" stroke="#f3e8ff" strokeWidth="5" fill="none" />
                 <circle 
                   cx="28" cy="28" r="24" 
                   stroke="#a855f7" strokeWidth="5" fill="none"
                   strokeDasharray={`${getPercent(totalReserved) * 1.508} 150.8`}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-purple-600">
                 {getPercent(totalReserved)}%
               </span>
             </div>
             <div>
               <p className="text-sm font-medium text-purple-800">Bảo lưu</p>
               <p className="text-xl font-bold text-purple-600">{totalReserved}<span className="text-sm text-purple-500">/{totalStudents}</span></p>
             </div>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <ClipboardList size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Tổng buổi điểm danh</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Tỷ lệ đi học TB</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <XCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Tổng lượt vắng</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAbsent}</p>
                </div>
            </div>
       </div>

      {/* Data Integrity Warning */}
      {orphanedRecords.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Phát hiện {orphanedRecords.length} bản ghi rác!</h4>
              <p className="text-sm text-red-600 mt-1">
                Đây là các bản ghi điểm danh có classId không tồn tại trong danh sách lớp hiện tại (có thể là data test cũ hoặc lớp đã bị xóa).
              </p>
              <div className="flex gap-3 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={showOnlyValid}
                    onChange={(e) => setShowOnlyValid(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Chỉ hiển thị bản ghi hợp lệ</span>
                </label>
                <button
                  onClick={handleDeleteOrphans}
                  disabled={deletingOrphans}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  {deletingOrphans ? 'Đang xóa...' : `Xóa ${orphanedRecords.length} bản ghi rác`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Tools */}
      {allRecords.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-800">
              <strong>Thống kê:</strong> Tổng: {allRecords.length} records | 
              Valid: {allRecords.filter(r => allClasses.some(c => c.id === r.classId)).length} | 
              Orphaned: {orphanedRecords.length} |
              Số lớp: {allClasses.length}
            </div>
            <button
              onClick={handleDeleteAll}
              disabled={deletingOrphans}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              {deletingOrphans ? 'Đang xóa...' : `Xóa tất cả ${allRecords.length} records`}
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-gray-800">Lịch sử điểm danh ({attendanceRecords.length} bản ghi)</h3>
            <div className="flex gap-3 items-center">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={filterDate ? filterDate.split('/').reverse().join('-') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    setFilterDate(`${d}/${m}/${y}`);
                  } else {
                    setFilterDate('');
                  }
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              {(filterClass || filterDate) && (
                <button
                  onClick={() => { setFilterClass(''); setFilterDate(''); }}
                  className="text-gray-500 hover:text-red-500 text-sm"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
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
            {paginatedRecords.length > 0 ? paginatedRecords.map((record) => {
              // Handle various field name formats from Firebase
              // Lookup class name from classes collection if missing
              const classFromCollection = classes.find(c => c.id === record.classId);
              const className = record.className || (record as any).class || (record as any).classname || classFromCollection?.name || '-';
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
                  <button 
                    onClick={() => handleViewDetail(record)}
                    className="text-gray-500 hover:text-indigo-600 font-medium text-xs flex items-center gap-1 ml-auto"
                  >
                    <Eye size={14} />
                    Xem chi tiết
                  </button>
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {((currentPage - 1) * RECORDS_PER_PAGE) + 1} - {Math.min(currentPage * RECORDS_PER_PAGE, attendanceRecords.length)} / {attendanceRecords.length} bản ghi
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 border rounded-lg text-sm ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

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
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                          Đang tải...
                        </td>
                      </tr>
                    ) : studentAttendance.length > 0 ? studentAttendance.map((sa, index) => {
                      const statusColor = sa.status === AttendanceStatus.PRESENT 
                        ? 'bg-green-100 text-green-700' 
                        : sa.status === AttendanceStatus.ABSENT 
                          ? 'bg-red-100 text-red-700'
                          : sa.status === AttendanceStatus.RESERVED
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700';
                      return (
                        <tr key={sa.id || index}>
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{sa.studentName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                              {sa.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 italic">{sa.note || '-'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                          <p>Không có dữ liệu chi tiết</p>
                          <p className="text-xs mt-1">(Dữ liệu có thể được tạo trước khi tích hợp hệ thống mới)</p>
                        </td>
                      </tr>
                    )}
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