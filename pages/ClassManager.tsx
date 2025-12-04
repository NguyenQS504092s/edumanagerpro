import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash, ChevronDown, RotateCcw, X, BookOpen, Users, Clock, Calendar } from 'lucide-react';
import { ClassStatus, ClassModel } from '../types';
import { useClasses } from '../src/hooks/useClasses';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/config/firebase';

export const ClassManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [viewMode, setViewMode] = useState<'stats' | 'curriculum'>('stats');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
  const [selectedClassHistory, setSelectedClassHistory] = useState<ClassModel | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedClassForAction, setSelectedClassForAction] = useState<ClassModel | null>(null);

  const { classes, loading, createClass, updateClass, deleteClass } = useClasses({
    searchTerm: searchTerm || undefined
  });

  // State for student counts per class
  const [classStudentCounts, setClassStudentCounts] = useState<Record<string, {
    total: number;
    trial: number;
    active: number;
    debt: number;
    reserved: number;
  }>>({});

  // Normalize student status
  const normalizeStudentStatus = (status: string): string => {
    const lower = status?.toLowerCase() || '';
    if (lower === 'active' || lower.includes('đang học')) return 'Đang học';
    if (lower === 'inactive' || lower.includes('nghỉ')) return 'Nghỉ học';
    if (lower === 'reserved' || lower.includes('bảo lưu')) return 'Bảo lưu';
    if (lower === 'trial' || lower.includes('học thử')) return 'Học thử';
    if (lower === 'debt' || lower.includes('nợ')) return 'Nợ phí';
    return status;
  };

  // Fetch students and calculate counts for each class
  useEffect(() => {
    const fetchStudentCounts = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const counts: Record<string, { total: number; trial: number; active: number; debt: number; reserved: number }> = {};
        
        // Initialize counts for all classes
        classes.forEach(cls => {
          counts[cls.id] = { total: 0, trial: 0, active: 0, debt: 0, reserved: 0 };
        });
        
        // Count students per class
        students.forEach((student: any) => {
          const classId = student.classId;
          const className = student.class || student.className;
          const status = normalizeStudentStatus(student.status || '');
          
          // Find matching class by ID or name
          let matchedClassId = classId;
          if (!matchedClassId && className) {
            const matchedClass = classes.find(c => 
              c.name === className || 
              c.id === className ||
              c.name?.toLowerCase() === className?.toLowerCase()
            );
            if (matchedClass) matchedClassId = matchedClass.id;
          }
          
          if (matchedClassId && counts[matchedClassId]) {
            counts[matchedClassId].total++;
            if (status === 'Học thử') counts[matchedClassId].trial++;
            else if (status === 'Đang học') counts[matchedClassId].active++;
            else if (status === 'Nợ phí' || student.hasDebt) counts[matchedClassId].debt++;
            else if (status === 'Bảo lưu') counts[matchedClassId].reserved++;
          }
        });
        
        setClassStudentCounts(counts);
      } catch (err) {
        console.error('Error fetching student counts:', err);
      }
    };
    
    if (classes.length > 0) {
      fetchStudentCounts();
    }
  }, [classes]);

  // Get counts for a specific class
  const getClassCounts = (classId: string) => {
    return classStudentCounts[classId] || { total: 0, trial: 0, active: 0, debt: 0, reserved: 0 };
  };

  // Filter by teacher on client side
  const filteredClasses = useMemo(() => {
    if (!teacherFilter) return classes;
    return classes.filter(c => c.teacher === teacherFilter);
  }, [classes, teacherFilter]);

  // Get unique teachers for dropdown
  const teachers = useMemo(() => {
    return Array.from(new Set(classes.map(c => c.teacher).filter(Boolean)));
  }, [classes]);

  // Calculate stats from real student counts
  const pageStats = useMemo(() => {
    return {
      total: filteredClasses.reduce((sum, c) => sum + (getClassCounts(c.id).total), 0),
      trial: filteredClasses.reduce((sum, c) => sum + (getClassCounts(c.id).trial), 0),
      active: filteredClasses.reduce((sum, c) => sum + (getClassCounts(c.id).active), 0),
      owing: filteredClasses.reduce((sum, c) => sum + (getClassCounts(c.id).debt), 0),
      reserved: filteredClasses.reduce((sum, c) => sum + (getClassCounts(c.id).reserved), 0),
    };
  }, [filteredClasses, classStudentCounts]);

  // Normalize English status to Vietnamese
  const normalizeClassStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'Active': 'Đang học',
      'active': 'Đang học',
      'Studying': 'Đang học',
      'studying': 'Đang học',
      'Inactive': 'Tạm dừng',
      'inactive': 'Tạm dừng',
      'Paused': 'Tạm dừng',
      'paused': 'Tạm dừng',
      'Finished': 'Kết thúc',
      'finished': 'Kết thúc',
      'Completed': 'Kết thúc',
      'completed': 'Kết thúc',
      'Pending': 'Chờ mở',
      'pending': 'Chờ mở',
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = normalizeClassStatus(status);
    switch (normalizedStatus) {
      case ClassStatus.STUDYING:
        return 'bg-green-500 text-white';
      case ClassStatus.FINISHED:
        return 'bg-gray-800 text-white';
      case ClassStatus.PAUSED:
        return 'bg-yellow-500 text-white';
      case ClassStatus.PENDING:
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const handleCreate = async (data: Omit<ClassModel, 'id'>) => {
    try {
      await createClass(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating class:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<ClassModel>) => {
    try {
      await updateClass(id, data);
      setShowEditModal(false);
      setEditingClass(null);
    } catch (err) {
      console.error('Error updating class:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;
    try {
      await deleteClass(id);
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  const statsColumns = ['STT', 'Lớp học', 'Tổng số học viên', 'Học viên học thử', 'Học viên đang học', 'Học viên nợ phí', 'Học viên bảo lưu', 'Tên giáo viên / Lịch học', 'Trạng thái'];
  const curriculumColumns = ['STT', 'Lớp học', 'Độ tuổi', 'Tên giáo viên / Lịch học', 'Giáo trình đang học', 'Lịch test', 'Trạng thái'];
  const columns = viewMode === 'stats' ? statsColumns : curriculumColumns;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-gray-800">
      {/* Top Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          {/* Teacher Filter */}
          <div className="relative min-w-[180px]">
            <select 
              className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <input 
              type="text" 
              placeholder="Tìm kiếm lớp học..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-md hover:bg-green-600 transition-colors text-sm font-semibold"
        >
          <Plus size={18} />
          Tạo mới
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-6 px-1 text-sm">
        <span className="text-gray-500">Hiển thị:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="viewMode" 
            checked={viewMode === 'stats'}
            onChange={() => setViewMode('stats')}
            className="w-4 h-4 text-gray-900"
          />
          <span className={viewMode === 'stats' ? 'font-medium text-gray-900' : 'text-gray-600'}>Theo thống kê</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="viewMode" 
            checked={viewMode === 'curriculum'}
            onChange={() => setViewMode('curriculum')}
            className="w-4 h-4 text-gray-900"
          />
          <span className={viewMode === 'curriculum' ? 'font-medium text-gray-900' : 'text-gray-600'}>Theo giáo trình</span>
        </label>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-5 bg-gray-50 rounded-lg border border-gray-200 divide-x divide-gray-200">
        <div className="flex items-center justify-center p-3">
          <span className="text-blue-600 font-bold text-sm">Tổng số học viên: {pageStats.total}</span>
        </div>
        <div className="flex items-center justify-center p-3">
          <span className="text-yellow-600 font-bold text-sm">Học viên học thử: {pageStats.trial}</span>
        </div>
        <div className="flex items-center justify-center p-3">
          <span className="text-green-600 font-bold text-sm">Học viên đang học: {pageStats.active}</span>
        </div>
        <div className="flex items-center justify-center p-3">
          <span className="text-red-600 font-bold text-sm">Học viên nợ phí: {pageStats.owing}</span>
        </div>
        <div className="flex items-center justify-center p-3">
          <span className="text-gray-800 font-bold text-sm">Học viên bảo lưu: {pageStats.reserved}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Column Tags */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị {columns.length} cột</span>
            {columns.map(col => (
              <span key={col} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded border border-gray-200">{col}</span>
            ))}
          </div>
          <button className="flex items-center gap-1 text-teal-600 text-sm hover:text-teal-700 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded">
            <RotateCcw size={14} /> Khôi phục
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200 text-xs font-bold text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-4 w-16">STT</th>
                <th className="px-4 py-4 min-w-[150px]">Lớp học</th>
                {viewMode === 'stats' ? (
                  <>
                    <th className="px-4 py-4 text-center">Tổng số học viên</th>
                    <th className="px-4 py-4 text-center">Học viên học thử</th>
                    <th className="px-4 py-4 text-center">Học viên đang học</th>
                    <th className="px-4 py-4 text-center">Học viên nợ phí</th>
                    <th className="px-4 py-4 text-center">Học viên bảo lưu</th>
                  </>
                ) : (
                  <th className="px-4 py-4">Độ tuổi</th>
                )}
                <th className="px-4 py-4 min-w-[200px]">Tên giáo viên / Lịch học</th>
                {viewMode === 'curriculum' && (
                  <>
                    <th className="px-4 py-4 min-w-[180px]">Giáo trình đang học</th>
                    <th className="px-4 py-4 w-24 text-center">Lịch test</th>
                  </>
                )}
                <th className="px-4 py-4 w-28 text-center">Trạng thái</th>
                <th className="px-4 py-4 w-24 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-500">{index + 1}</td>
                    
                    {/* Lớp học */}
                    <td className="px-4 py-4">
                      <span className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer block">
                        {cls.name}
                      </span>
                      {viewMode === 'curriculum' && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Users size={12} />
                          <span>{getClassCounts(cls.id).total} học viên</span>
                        </div>
                      )}
                    </td>

                    {viewMode === 'stats' ? (
                      <>
                        <td className="px-4 py-4 text-center font-medium">{getClassCounts(cls.id).total}</td>
                        <td className="px-4 py-4 text-center text-purple-600">{getClassCounts(cls.id).trial}</td>
                        <td className="px-4 py-4 text-center text-green-600">{getClassCounts(cls.id).active}</td>
                        <td className="px-4 py-4 text-center text-red-600">{getClassCounts(cls.id).debt}</td>
                        <td className="px-4 py-4 text-center text-orange-600">{getClassCounts(cls.id).reserved}</td>
                      </>
                    ) : (
                      <td className="px-4 py-4 text-gray-700">
                        {cls.ageGroup ? (() => {
                          // Convert year range to age range (e.g., "2017-2018" -> "6-7 tuổi")
                          const currentYear = new Date().getFullYear();
                          const years = cls.ageGroup.split('-').map(y => parseInt(y.trim()));
                          if (years.length === 2 && !isNaN(years[0]) && !isNaN(years[1])) {
                            const age1 = currentYear - years[0];
                            const age2 = currentYear - years[1];
                            return `${Math.min(age1, age2)}-${Math.max(age1, age2)} tuổi`;
                          }
                          return cls.ageGroup;
                        })() : '-'}
                      </td>
                    )}

                    {/* GV / Lịch học */}
                    <td className="px-4 py-4">
                      {viewMode === 'stats' ? (
                        <div>
                          <p className="font-medium text-gray-900">{cls.teacher}</p>
                          {cls.assistant && <p className="text-xs text-gray-600">TG: {cls.assistant}</p>}
                          <p className="text-xs text-gray-500 mt-0.5">
                            {cls.schedule || cls.startDate} {cls.room ? `(${cls.room})` : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Users size={14} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">{cls.teacher}</p>
                              {cls.assistant && <p className="text-xs text-gray-600">TG: {cls.assistant}</p>}
                              {cls.foreignTeacher && <p className="text-xs text-purple-600">GVNN: {cls.foreignTeacher}</p>}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock size={14} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-700">{cls.schedule?.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/)?.[0] || '17:30 - 19:00'}</p>
                              <p className="text-xs text-gray-500">{cls.schedule?.replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*/, '').trim() || cls.startDate} {cls.room ? `(${cls.room})` : ''}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {viewMode === 'curriculum' && (
                      <>
                        {/* Giáo trình đang học */}
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-teal-700 font-medium">{cls.curriculum || '-'}</p>
                              {cls.progress && (
                                <>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                                    <div 
                                      className="bg-teal-500 h-1.5 rounded-full" 
                                      style={{ width: `${(parseInt(cls.progress.split('/')[0]) / parseInt(cls.progress.split('/')[1])) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">{cls.progress} Buổi</span>
                                </>
                              )}
                            </div>
                            <button 
                              onClick={() => { setSelectedClassForAction(cls); setShowProgressModal(true); }}
                              className="text-green-600 hover:bg-green-50 p-1 rounded-full border border-green-300"
                              title="Cập nhật tiến trình"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        {/* Lịch test */}
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => { setSelectedClassForAction(cls); setShowTestModal(true); }}
                            className="text-green-600 hover:bg-green-50 p-1.5 rounded-full border border-green-300 inline-flex"
                            title="Thêm lịch test"
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                      </>
                    )}

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded text-xs font-bold ${getStatusBadge(cls.status)}`}>
                        {normalizeClassStatus(cls.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditingClass(cls); setShowEditModal(true); }}
                          className="text-gray-400 hover:text-indigo-600" 
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cls.id)}
                          className="text-gray-400 hover:text-red-600" 
                          title="Xóa"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === 'stats' ? 10 : 9} className="px-6 py-12 text-center text-gray-500">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Chưa có lớp học nào</p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="mt-2 text-indigo-600 hover:underline text-sm"
                    >
                      + Tạo lớp học mới
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
          <span className="text-xs text-gray-500">
            Hiển thị 1 đến {filteredClasses.length} trong tổng số {pageStats.total} bản ghi
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-500" disabled>Trước</button>
            <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50">Sau</button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ClassFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingClass && (
        <ClassFormModal
          classData={editingClass}
          onClose={() => { setShowEditModal(false); setEditingClass(null); }}
          onSubmit={(data) => handleUpdate(editingClass.id, data)}
        />
      )}

      {/* Progress Modal */}
      {showProgressModal && selectedClassForAction && (
        <ProgressModal
          classData={selectedClassForAction}
          onClose={() => { setShowProgressModal(false); setSelectedClassForAction(null); }}
          onSubmit={async (newProgress) => {
            await updateClass(selectedClassForAction.id, { progress: newProgress });
            setShowProgressModal(false);
            setSelectedClassForAction(null);
          }}
        />
      )}

      {/* Test Schedule Modal */}
      {showTestModal && selectedClassForAction && (
        <TestScheduleModal
          classData={selectedClassForAction}
          onClose={() => { setShowTestModal(false); setSelectedClassForAction(null); }}
          onSubmit={async (testDate) => {
            // Save test schedule - could add to a testSchedules array in the class
            console.log('Test scheduled for:', testDate);
            setShowTestModal(false);
            setSelectedClassForAction(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================
// CLASS FORM MODAL
// ============================================
interface ClassFormModalProps {
  classData?: ClassModel;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ClassFormModal: React.FC<ClassFormModalProps> = ({ classData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    branch: classData?.branch || '',
    ageGroup: classData?.ageGroup || '',
    teacher: classData?.teacher || '',
    assistant: classData?.assistant || '',
    foreignTeacher: classData?.foreignTeacher || '',
    curriculum: classData?.curriculum || '',
    progress: classData?.progress || '0/24',
    schedule: classData?.schedule || '',
    scheduleStartTime: '',
    scheduleEndTime: '',
    scheduleDays: [] as string[],
    room: classData?.room || '',
    startDate: classData?.startDate || new Date().toISOString().split('T')[0],
    endDate: classData?.endDate || '',
    status: classData?.status || ClassStatus.PENDING,
    studentsCount: classData?.studentsCount || 0,
    trialStudents: classData?.trialStudents || 0,
    activeStudents: classData?.activeStudents || 0,
    debtStudents: classData?.debtStudents || 0,
    reservedStudents: classData?.reservedStudents || 0,
  });

  // Dropdown options
  const [staffList, setStaffList] = useState<{ id: string; name: string; position: string }[]>([]);
  const [roomList, setRoomList] = useState<{ id: string; name: string }[]>([]);

  // Predefined options
  const ageGroupOptions = [
    '2015-2016', '2016-2017', '2017-2018', '2018-2019', '2019-2020', 
    '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025'
  ];

  const scheduleOptions = [
    '08:00-09:30 Thứ 2, 4, 6',
    '08:00-09:30 Thứ 3, 5, 7',
    '09:30-11:00 Thứ 2, 4, 6',
    '09:30-11:00 Thứ 3, 5, 7',
    '14:00-15:30 Thứ 2, 4, 6',
    '14:00-15:30 Thứ 3, 5, 7',
    '15:00-16:30 Thứ 2, 4',
    '15:00-16:30 Thứ 3, 5',
    '15:30-17:00 Thứ 2, 4, 6',
    '15:30-17:00 Thứ 3, 5, 7',
    '17:00-18:30 Thứ 2, 4',
    '17:00-18:30 Thứ 3, 5',
    '17:30-19:00 Thứ 2, 4, 6',
    '17:30-19:00 Thứ 3, 5, 7',
    '18:30-20:00 Thứ 2, 4',
    '18:30-20:00 Thứ 3, 5',
    '19:00-20:30 Thứ 2, 4, 6',
    '19:00-20:30 Thứ 3, 5, 7',
    '08:00-09:30 Thứ 7',
    '09:30-11:00 Thứ 7',
    '14:00-15:30 Chủ nhật',
    '15:30-17:00 Chủ nhật',
  ];

  useEffect(() => {
    const fetchDropdownData = async () => {
      // Fetch staff
      const staffSnap = await getDocs(collection(db, 'staff'));
      const staff = staffSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name || '',
        position: d.data().position || '',
      }));
      setStaffList(staff);

      // Fetch rooms
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      const rooms = roomsSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().roomName || d.id,
      }));
      setRoomList(rooms);
    };
    fetchDropdownData();
  }, []);

  // Filter staff by position
  const vietnameseTeachers = staffList.filter(s => 
    s.position?.toLowerCase().includes('giáo viên việt') || 
    s.position?.toLowerCase().includes('gv việt')
  );
  const foreignTeachers = staffList.filter(s => 
    s.position?.toLowerCase().includes('nước ngoài') || 
    s.position?.toLowerCase().includes('gv ngoại') ||
    s.position?.toLowerCase().includes('foreign')
  );
  const assistants = staffList.filter(s => 
    s.position?.toLowerCase().includes('trợ giảng')
  );

  // Days options
  const daysOptions = [
    { value: '2', label: 'Thứ 2' },
    { value: '3', label: 'Thứ 3' },
    { value: '4', label: 'Thứ 4' },
    { value: '5', label: 'Thứ 5' },
    { value: '6', label: 'Thứ 6' },
    { value: '7', label: 'Thứ 7' },
    { value: 'CN', label: 'Chủ nhật' },
  ];

  // Time options
  const timeOptions = [
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Parse existing schedule when editing
  useEffect(() => {
    if (classData?.schedule) {
      // Parse schedule like "15:00-16:30 Thứ 3, 5" or "17:30-19:00 Thứ 2, 4, 6"
      const match = classData.schedule.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s*(.*)/);
      if (match) {
        const startTime = match[1];
        const endTime = match[2];
        const daysStr = match[3];
        
        // Parse days
        const days: string[] = [];
        if (daysStr.includes('Chủ nhật') || daysStr.includes('CN')) days.push('CN');
        for (let i = 2; i <= 7; i++) {
          if (daysStr.includes(`Thứ ${i}`) || daysStr.includes(`, ${i}`) || daysStr.match(new RegExp(`\\b${i}\\b`))) {
            days.push(i.toString());
          }
        }
        
        setFormData(prev => ({
          ...prev,
          scheduleStartTime: startTime,
          scheduleEndTime: endTime,
          scheduleDays: days,
        }));
      }
    }
  }, [classData]);

  // Auto-calculate student counts from Firebase
  useEffect(() => {
    const fetchStudentCounts = async () => {
      if (!classData?.id && !classData?.name) return;
      
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const allStudents = studentsSnap.docs.map(d => d.data());
        
        // Filter students by class (match by classId or className)
        const classStudents = allStudents.filter((s: any) => 
          s.classId === classData?.id || 
          s.className === classData?.name ||
          s.class === classData?.name
        );
        
        // Normalize status helper
        const normalizeStatus = (status: string): string => {
          const map: { [key: string]: string } = {
            'Active': 'Đang học', 'active': 'Đang học',
            'Trial': 'Học thử', 'trial': 'Học thử',
            'Reserved': 'Bảo lưu', 'reserved': 'Bảo lưu',
            'Debt': 'Nợ phí', 'debt': 'Nợ phí',
            'Dropped': 'Nghỉ học', 'dropped': 'Nghỉ học',
          };
          return map[status] || status;
        };
        
        // Count by status
        const counts = {
          total: classStudents.length,
          trial: classStudents.filter((s: any) => normalizeStatus(s.status) === 'Học thử').length,
          active: classStudents.filter((s: any) => normalizeStatus(s.status) === 'Đang học').length,
          debt: classStudents.filter((s: any) => normalizeStatus(s.status) === 'Nợ phí' || s.hasDebt).length,
          reserved: classStudents.filter((s: any) => normalizeStatus(s.status) === 'Bảo lưu').length,
        };
        
        setFormData(prev => ({
          ...prev,
          studentsCount: counts.total,
          trialStudents: counts.trial,
          activeStudents: counts.active,
          debtStudents: counts.debt,
          reservedStudents: counts.reserved,
        }));
      } catch (err) {
        console.error('Error fetching student counts:', err);
      }
    };
    
    if (classData) {
      fetchStudentCounts();
    }
  }, [classData]);

  // Toggle day selection
  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day].sort((a, b) => {
            if (a === 'CN') return 1;
            if (b === 'CN') return -1;
            return parseInt(a) - parseInt(b);
          }),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine schedule parts into single string
    let schedule = formData.schedule;
    if (formData.scheduleStartTime && formData.scheduleEndTime && formData.scheduleDays.length > 0) {
      const daysStr = formData.scheduleDays.map(d => d === 'CN' ? 'Chủ nhật' : `Thứ ${d}`).join(', ');
      schedule = `${formData.scheduleStartTime}-${formData.scheduleEndTime} ${daysStr}`;
    }
    
    onSubmit({ ...formData, schedule });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
          <h3 className="text-lg font-bold text-gray-900">
            {classData ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp học *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: Tiếng Anh Giao Tiếp K12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên *</label>
              <select
                required
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {vietnameseTeachers.length > 0 ? vietnameseTeachers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                )) : staffList.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trợ giảng</label>
              <select
                value={formData.assistant}
                onChange={(e) => setFormData({ ...formData, assistant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn trợ giảng --</option>
                {assistants.length > 0 ? assistants.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                )) : staffList.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GV Nước ngoài</label>
              <select
                value={formData.foreignTeacher}
                onChange={(e) => setFormData({ ...formData, foreignTeacher: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn GV nước ngoài --</option>
                {foreignTeachers.length > 0 ? foreignTeachers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                )) : staffList.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.position})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ tuổi</label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn độ tuổi --</option>
                {ageGroupOptions.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lịch học</label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Giờ bắt đầu</label>
                  <select
                    value={formData.scheduleStartTime}
                    onChange={(e) => setFormData({ ...formData, scheduleStartTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="">-- Chọn --</option>
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Giờ kết thúc</label>
                  <select
                    value={formData.scheduleEndTime}
                    onChange={(e) => setFormData({ ...formData, scheduleEndTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="">-- Chọn --</option>
                    {timeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ngày học</label>
                <div className="flex flex-wrap gap-2">
                  {daysOptions.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        formData.scheduleDays.includes(day.value)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              {formData.scheduleStartTime && formData.scheduleEndTime && formData.scheduleDays.length > 0 && (
                <p className="mt-2 text-xs text-green-600 font-medium">
                  Lịch: {formData.scheduleStartTime}-{formData.scheduleEndTime} {formData.scheduleDays.map(d => d === 'CN' ? 'Chủ nhật' : `Thứ ${d}`).join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng học</label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn phòng --</option>
                {roomList.length > 0 ? roomList.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                )) : ['P.101', 'P.102', 'P.103', 'P.201', 'P.202', 'P.203'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giáo trình</label>
              <input
                type="text"
                value={formData.curriculum}
                onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Academy Stars 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiến trình</label>
              <input
                type="text"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="12/24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {Object.values(ClassStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Chỉ hiển thị số lượng học viên khi đang sửa lớp (đã có classData) */}
            {classData && (
              <div className="col-span-2 border-t pt-4 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Số lượng học viên <span className="text-xs text-gray-400 font-normal">(tự động tính từ danh sách học viên)</span></p>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tổng</label>
                    <div className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-center font-medium">
                      {formData.studentsCount}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Học thử</label>
                    <div className="w-full px-2 py-1.5 bg-purple-50 border border-purple-200 rounded text-sm text-center font-medium text-purple-700">
                      {formData.trialStudents}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Đang học</label>
                    <div className="w-full px-2 py-1.5 bg-green-50 border border-green-200 rounded text-sm text-center font-medium text-green-700">
                      {formData.activeStudents}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nợ phí</label>
                    <div className="w-full px-2 py-1.5 bg-red-50 border border-red-200 rounded text-sm text-center font-medium text-red-700">
                      {formData.debtStudents}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bảo lưu</label>
                    <div className="w-full px-2 py-1.5 bg-orange-50 border border-orange-200 rounded text-sm text-center font-medium text-orange-700">
                      {formData.reservedStudents}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {classData ? 'Cập nhật' : 'Tạo lớp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// PROGRESS MODAL - Cập nhật tiến trình
// ============================================
interface ProgressModalProps {
  classData: ClassModel;
  onClose: () => void;
  onSubmit: (newProgress: string) => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ classData, onClose, onSubmit }) => {
  const currentProgress = classData.progress?.split('/') || ['0', '24'];
  const [completed, setCompleted] = useState(parseInt(currentProgress[0]) || 0);
  const [total, setTotal] = useState(parseInt(currentProgress[1]) || 24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(`${completed}/${total}`);
  };

  const handleAddSession = () => {
    if (completed < total) {
      setCompleted(completed + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-teal-50 to-green-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cập nhật tiến trình</h3>
            <p className="text-sm text-gray-600">{classData.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Giáo trình: <span className="font-medium text-teal-700">{classData.curriculum || '-'}</span></p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Đã học</label>
              <input
                type="number"
                min="0"
                max={total}
                value={completed}
                onChange={(e) => setCompleted(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-2xl text-gray-400 mt-6">/</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng buổi</label>
              <input
                type="number"
                min="1"
                value={total}
                onChange={(e) => setTotal(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Progress bar preview */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-teal-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${(completed / total) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">{completed}/{total} Buổi ({Math.round((completed / total) * 100)}%)</p>
          </div>

          {/* Quick add button */}
          <button
            type="button"
            onClick={handleAddSession}
            disabled={completed >= total}
            className="w-full mb-4 py-2 border-2 border-dashed border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Thêm 1 buổi học
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Lưu tiến trình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// TEST SCHEDULE MODAL - Thêm lịch test
// ============================================
interface TestScheduleModalProps {
  classData: ClassModel;
  onClose: () => void;
  onSubmit: (testDate: string, testType: string, notes: string) => void;
}

const TestScheduleModal: React.FC<TestScheduleModalProps> = ({ classData, onClose, onSubmit }) => {
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testTime, setTestTime] = useState('09:00');
  const [testType, setTestType] = useState('Giữa kỳ');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(`${testDate} ${testTime}`, testType, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Thêm lịch test</h3>
              <p className="text-sm text-gray-600">{classData.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài test</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Đầu vào">Test đầu vào</option>
              <option value="Giữa kỳ">Test giữa kỳ</option>
              <option value="Cuối kỳ">Test cuối kỳ</option>
              <option value="Đầu ra">Test đầu ra</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày test</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ test</label>
              <input
                type="time"
                value={testTime}
                onChange={(e) => setTestTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm về bài test..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Thêm lịch test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
