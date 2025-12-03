import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash, Users, BookOpen, Calendar, Clock, MapPin, ChevronDown, RotateCcw, History, X } from 'lucide-react';
import { MOCK_CLASSES, MOCK_SCHEDULE } from '../mockData';
import { ClassStatus, ClassModel } from '../types';

export const ClassManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [viewMode, setViewMode] = useState<'stats' | 'curriculum'>('stats');
  const [selectedClassHistory, setSelectedClassHistory] = useState<ClassModel | null>(null);

  // Derive unique teachers for the filter dropdown
  const teachers = useMemo(() => {
    return Array.from(new Set(MOCK_CLASSES.map(c => c.teacher)));
  }, []);

  // Filter Logic
  const filteredClasses = useMemo(() => {
    return MOCK_CLASSES.filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeacher = teacherFilter === '' || cls.teacher === teacherFilter;
      return matchesSearch && matchesTeacher;
    });
  }, [searchTerm, teacherFilter]);

  // Mock Statistics Calculation for Page Ribbon
  const pageStats = {
    total: 88,
    trial: 0,
    active: 56,
    owing: 3,
    reserved: 29
  };

  // Helper to generate consistent mock stats for individual class rows
  // In a real app, these would come from the API
  const getClassRowStats = (cls: ClassModel) => {
    const seed = cls.id.charCodeAt(cls.id.length - 1); // Simple deterministic random
    const trial = cls.status === ClassStatus.STUDYING ? (seed % 2) : 0;
    const owing = cls.status === ClassStatus.STUDYING ? (seed % 2) : 0;
    const reserved = (seed % 3);
    const active = cls.studentsCount - trial - reserved; 
    
    return { 
      trial, 
      owing, 
      reserved, 
      active: active > 0 ? active : 0,
      total: cls.studentsCount
    };
  };

  const getStatusBadge = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.STUDYING:
        return 'bg-green-600 text-white border-transparent';
      case ClassStatus.FINISHED:
        return 'bg-gray-900 text-white border-transparent';
      case ClassStatus.PAUSED:
        return 'bg-yellow-500 text-white border-transparent';
      case ClassStatus.PENDING:
        return 'bg-blue-500 text-white border-transparent';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Helper to find schedule for a class (Mock logic)
  const getClassSchedule = (className: string) => {
    const session = MOCK_SCHEDULE.find(s => s.className === className);
    return session || { dayOfWeek: 'Thứ 2, 4', time: '18:00 - 19:30', room: 'Phòng 101' };
  };

  // Define columns based on view mode
  const columns = viewMode === 'stats' 
    ? ['STT', 'Lớp học', 'Tổng số học viên', 'Học viên học thử', 'Học viên đang học', 'Học viên nợ phí', 'Học viên bảo lưu', 'Tên giáo viên / Lịch học', 'Trạng thái']
    : ['STT', 'Lớp học', 'Độ tuổi', 'Tên giáo viên / Lịch học', 'Giáo trình đang học', 'Lịch test', 'Trạng thái'];

  return (
    <div className="space-y-4 font-sans text-gray-800">
      
      {/* 1. Top Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        
        {/* Left: Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Teacher Filter */}
          <div className="relative min-w-[200px]">
            <select 
              className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-600"
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
            >
              <option value="">Tìm theo GV</option>
              {teachers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Class Search */}
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Tìm kiếm lớp học..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Right: Create Button */}
        <button className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-md hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm w-full lg:w-auto justify-center">
          <Plus size={18} />
          Tạo mới
        </button>
      </div>

      {/* 2. View Mode Toggle */}
      <div className="flex items-center gap-6 px-2 text-sm select-none">
        <span className="text-gray-500">Hiển thị:</span>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${viewMode === 'stats' ? 'border-gray-900' : 'border-gray-400 group-hover:border-gray-600'}`}>
             {viewMode === 'stats' && <div className="w-2 h-2 rounded-full bg-gray-900"></div>}
          </div>
          <input 
            type="radio" 
            name="viewMode" 
            className="hidden"
            checked={viewMode === 'stats'}
            onChange={() => setViewMode('stats')}
          />
          <span className={viewMode === 'stats' ? 'font-medium text-gray-900' : 'text-gray-600'}>Theo thống kê</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${viewMode === 'curriculum' ? 'border-gray-900' : 'border-gray-400 group-hover:border-gray-600'}`}>
             {viewMode === 'curriculum' && <div className="w-2 h-2 rounded-full bg-gray-900"></div>}
          </div>
          <input 
            type="radio" 
            name="viewMode" 
            className="hidden"
            checked={viewMode === 'curriculum'}
            onChange={() => setViewMode('curriculum')}
          />
          <span className={viewMode === 'curriculum' ? 'font-medium text-gray-900' : 'text-gray-600'}>Theo giáo trình</span>
        </label>
      </div>

      {/* 3. Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 bg-gray-100 rounded-lg p-3 text-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center p-2">
            <span className="text-blue-700 font-bold">Tổng số học viên: {pageStats.total}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center p-2 border-l border-gray-200">
            <span className="text-yellow-600 font-bold">Học viên học thử: {pageStats.trial}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center p-2 border-l border-gray-200">
            <span className="text-green-600 font-bold">Học viên đang học: {pageStats.active}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center p-2 border-l border-gray-200">
            <span className="text-red-600 font-bold">Học viên nợ phí: {pageStats.owing}</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center p-2 border-l border-gray-200">
            <span className="text-gray-700 font-bold">Học viên bảo lưu: {pageStats.reserved}</span>
        </div>
      </div>

      {/* 4. Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Hiển thị {columns.length} cột</span>
                <div className="flex flex-wrap gap-1">
                     {columns.map(col => (
                         <span key={col} className="px-2 py-1 bg-gray-100 text-[10px] text-gray-500 rounded border border-gray-200 whitespace-nowrap">{col}</span>
                     ))}
                </div>
            </div>
            <button className="flex items-center gap-1 text-teal-500 text-sm hover:text-teal-600 border border-teal-200 bg-teal-50 px-3 py-1 rounded transition-colors whitespace-nowrap">
                <RotateCcw size={14} /> Khôi phục
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-white border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-4 w-16">STT</th>
                
                {viewMode === 'stats' ? (
                  <>
                    <th className="px-6 py-4 min-w-[150px]">Lớp học</th>
                    <th className="px-6 py-4 text-center">Tổng số học viên</th>
                    <th className="px-6 py-4 text-center">Học viên học thử</th>
                    <th className="px-6 py-4 text-center">Học viên đang học</th>
                    <th className="px-6 py-4 text-center">Học viên nợ phí</th>
                    <th className="px-6 py-4 text-center">Học viên bảo lưu</th>
                    <th className="px-6 py-4 min-w-[250px]">Tên giáo viên / Lịch học</th>
                    <th className="px-6 py-4 w-32 text-center">Trạng thái</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 min-w-[150px]">Lớp học</th>
                    <th className="px-6 py-4 w-32">Độ tuổi</th>
                    <th className="px-6 py-4 min-w-[300px]">Tên giáo viên / Lịch học</th>
                    <th className="px-6 py-4 min-w-[200px]">Giáo trình đang học</th>
                    <th className="px-6 py-4 w-24 text-center">Lịch test</th>
                    <th className="px-6 py-4 w-32 text-center">Trạng thái</th>
                  </>
                )}
                
                <th className="px-6 py-4 w-24 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls, index) => {
                  const schedule = getClassSchedule(cls.name);
                  const rowStats = getClassRowStats(cls);

                  return (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5 align-top font-medium text-gray-500">{index + 1}</td>
                      
                      {viewMode === 'stats' ? (
                        <>
                          <td className="px-6 py-5 align-top">
                            <a href="#" className="font-bold text-sky-600 hover:text-sky-800 hover:underline text-[15px] mb-1 block">
                                {cls.name}
                            </a>
                          </td>
                          <td className="px-6 py-5 align-top text-center text-gray-700">{rowStats.total}</td>
                          <td className="px-6 py-5 align-top text-center text-gray-700">{rowStats.trial}</td>
                          <td className="px-6 py-5 align-top text-center text-gray-700">{rowStats.active}</td>
                          <td className="px-6 py-5 align-top text-center text-gray-700">{rowStats.owing}</td>
                          <td className="px-6 py-5 align-top text-center text-gray-700">{rowStats.reserved}</td>
                          <td className="px-6 py-5 align-top">
                             <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-800">{cls.teacher}</p>
                                <p className="text-xs text-gray-500">{schedule.time} {schedule.dayOfWeek} ({schedule.room})</p>
                             </div>
                          </td>
                          <td className="px-6 py-5 align-top text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(cls.status)}`}>
                              {cls.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        // CURRICULUM VIEW COLUMNS
                        <>
                          <td className="px-6 py-5 align-top">
                            <a href="#" className="font-bold text-sky-600 hover:text-sky-800 hover:underline text-[15px] mb-1 block">
                                {cls.name}
                            </a>
                            <div className="flex items-center text-xs text-gray-500 gap-2">
                                <Users size={12} /> {cls.studentsCount} học viên
                            </div>
                          </td>
                          
                          <td className="px-6 py-5 align-top">
                            <span className="text-sm font-medium text-gray-700">{cls.ageGroup}</span>
                          </td>
                          
                          <td className="px-6 py-5 align-top">
                             <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Users size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{cls.teacher}</p>
                                        {cls.assistant && <p className="text-xs text-gray-500">TG: {cls.assistant}</p>}
                                        {cls.foreignTeacher && <p className="text-xs text-purple-600">GVNN: {cls.foreignTeacher}</p>}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">{schedule.time}</p>
                                        <p className="text-xs text-gray-500">{schedule.dayOfWeek} ({schedule.room})</p>
                                    </div>
                                </div>
                             </div>
                          </td>
                          
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <p className="font-medium text-indigo-700 text-sm mb-1">{cls.curriculum}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                                        <div 
                                            className="bg-indigo-500 h-1.5 rounded-full" 
                                            style={{ width: `${(parseInt(cls.progress.split('/')[0]) / parseInt(cls.progress.split('/')[1])) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{cls.progress}</span>
                                </div>
                                <button className="text-green-600 hover:bg-green-50 p-1 rounded-full border border-green-200">
                                    <Plus size={14} />
                                </button>
                            </div>
                          </td>

                          <td className="px-6 py-5 align-top text-center">
                            <button className="text-green-600 hover:bg-green-50 p-1.5 rounded-full border border-green-200 inline-flex">
                                <Plus size={16} />
                            </button>
                          </td>
                          
                          <td className="px-6 py-5 align-top text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(cls.status)}`}>
                              {cls.status}
                            </span>
                          </td>
                        </>
                      )}
                      
                      <td className="px-6 py-5 align-top text-right">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="text-gray-400 hover:text-purple-600 transition-colors" 
                            title="Lịch sử"
                            onClick={() => setSelectedClassHistory(cls)}
                          >
                            <History size={18} />
                          </button>
                          <button className="text-gray-400 hover:text-indigo-600 transition-colors" title="Chỉnh sửa">
                            <Edit size={18} />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors" title="Xóa">
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={viewMode === 'stats' ? 9 : 8} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-2 opacity-20"/>
                        <p>Không tìm thấy lớp học nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <span className="text-xs text-gray-500">
                Hiển thị 1 đến {filteredClasses.length} trong tổng số {pageStats.total} bản ghi
            </span>
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium disabled:opacity-50 text-gray-600 hover:bg-gray-50" disabled>Trước</button>
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium hover:bg-gray-50 text-gray-600">Sau</button>
            </div>
        </div>
      </div>

      {/* History Modal */}
      {selectedClassHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lịch sử lớp học</h3>
                  <p className="text-sm text-gray-600">{selectedClassHistory.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClassHistory(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Class Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Giáo trình</p>
                    <p className="font-semibold text-gray-900">{selectedClassHistory.curriculum}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Độ tuổi</p>
                    <p className="font-semibold text-gray-900">{selectedClassHistory.ageGroup}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Ngày bắt đầu</p>
                    <p className="font-semibold text-gray-900">{selectedClassHistory.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Ngày kết thúc</p>
                    <p className="font-semibold text-gray-900">{selectedClassHistory.endDate}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Dòng thời gian</h4>
                
                <div className="relative border-l-2 border-purple-200 ml-4 pl-6 space-y-6">
                  {/* Event 1: Class Created */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white"></div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Tạo lớp</span>
                        <span className="text-xs text-gray-500">{selectedClassHistory.startDate}</span>
                      </div>
                      <p className="text-sm text-gray-800">
                        Lớp học <span className="font-bold">{selectedClassHistory.name}</span> được tạo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Giáo viên: {selectedClassHistory.teacher} | Sĩ số: {selectedClassHistory.studentsCount} học viên
                      </p>
                    </div>
                  </div>

                  {/* Event 2: Teacher Changed (Example) */}
                  {selectedClassHistory.assistant && (
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Thêm trợ giảng</span>
                          <span className="text-xs text-gray-500">{selectedClassHistory.startDate}</span>
                        </div>
                        <p className="text-sm text-gray-800">
                          Trợ giảng <span className="font-bold">{selectedClassHistory.assistant}</span> được thêm vào lớp
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Event 3: Foreign Teacher (Example) */}
                  {selectedClassHistory.foreignTeacher && (
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white"></div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">GV Nước ngoài</span>
                          <span className="text-xs text-gray-500">{selectedClassHistory.startDate}</span>
                        </div>
                        <p className="text-sm text-gray-800">
                          Giáo viên nước ngoài <span className="font-bold">{selectedClassHistory.foreignTeacher}</span> tham gia giảng dạy
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Event 4: Current Progress */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Tiến độ hiện tại</span>
                        <span className="text-xs text-gray-500">Hôm nay</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">
                        Lớp đã học được <span className="font-bold">{selectedClassHistory.progress}</span>
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(parseInt(selectedClassHistory.progress.split('/')[0]) / parseInt(selectedClassHistory.progress.split('/')[1])) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Event 5: Status */}
                  {selectedClassHistory.status === ClassStatus.FINISHED && (
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-gray-700 ring-4 ring-white"></div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">Kết thúc</span>
                          <span className="text-xs text-gray-500">{selectedClassHistory.endDate}</span>
                        </div>
                        <p className="text-sm text-gray-800">
                          Lớp học đã hoàn thành chương trình
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedClassHistory.status === ClassStatus.PAUSED && (
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-yellow-500 ring-4 ring-white"></div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Tạm dừng</span>
                          <span className="text-xs text-gray-500">Hôm nay</span>
                        </div>
                        <p className="text-sm text-gray-800">
                          Lớp học tạm thời dừng hoạt động
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedClassHistory(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};