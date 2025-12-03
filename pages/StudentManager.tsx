
import React, { useState, useMemo } from 'react';
import { Search, Filter, Gift, History, User, Phone, MoreHorizontal, Calendar, ArrowRight, Cake, Plus, Edit, Trash2 } from 'lucide-react';
import { Student, StudentStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../src/hooks/useStudents';

interface StudentManagerProps {
  initialStatusFilter?: StudentStatus;
  title?: string;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ 
  initialStatusFilter, 
  title = "Danh sách học viên" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterStatus, setFilterStatus] = useState<StudentStatus | 'ALL'>(initialStatusFilter || 'ALL');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  // Fetch students from Firebase
  const { students, loading, error, createStudent, updateStudent, deleteStudent } = useStudents({
    status: filterStatus === 'ALL' ? undefined : filterStatus,
    searchTerm: searchTerm || undefined
  });

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      let matchesBirthday = true;
      if (birthdayMonth) {
        const studentMonth = new Date(student.dob).getMonth() + 1;
        matchesBirthday = studentMonth === parseInt(birthdayMonth);
      }
      
      return matchesBirthday;
    });
  }, [students, birthdayMonth]);

  const getStatusColor = (status: StudentStatus) => {
    switch(status) {
      case StudentStatus.ACTIVE: return 'text-green-600 bg-green-50 ring-green-500/10';
      case StudentStatus.RESERVED: return 'text-yellow-600 bg-yellow-50 ring-yellow-500/10';
      case StudentStatus.DROPPED: return 'text-red-600 bg-red-50 ring-red-500/10';
      case StudentStatus.TRIAL: return 'text-purple-600 bg-purple-50 ring-purple-500/10';
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  // Helper to format ISO date to DD/MM/YYYY
  const formatDob = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleCreateStudent = async (data: Partial<Student>) => {
    try {
      await createStudent(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating student:', err);
      alert('Không thể tạo học viên. Vui lòng thử lại.');
    }
  };

  const handleUpdateStudent = async (id: string, data: Partial<Student>) => {
    try {
      await updateStudent(id, data);
      setShowEditModal(false);
      setEditingStudent(null);
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Không thể cập nhật học viên. Vui lòng thử lại.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này?')) return;
    
    try {
      await deleteStudent(id);
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Không thể xóa học viên. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 hidden lg:block">{title}</h2>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên, mã, SĐT..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="pl-2 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StudentStatus | 'ALL')}
            disabled={!!initialStatusFilter}
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.values(StudentStatus).map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <select
            className="pl-2 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
            value={birthdayMonth}
            onChange={(e) => setBirthdayMonth(e.target.value)}
          >
            <option value="">Tháng sinh</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Tạo mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 bg-gray-50 w-12">No.</th>
                    <th className="px-4 py-3 bg-gray-50">Học viên</th>
                    <th className="px-4 py-3 bg-gray-50">Phụ huynh</th>
                    <th className="px-4 py-3 bg-gray-50">Lớp học</th>
                    <th className="px-4 py-3 bg-gray-50">Trạng thái</th>
                    <th className="px-4 py-3 bg-gray-50"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-red-500">
                      Lỗi: {error}
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                    <tr 
                    key={student.id} 
                    className={`hover:bg-indigo-50 cursor-pointer transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                    >
                    <td className="px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3">
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800 text-[15px]">{student.fullName}</span>
                           <span className="text-sm font-bold text-red-500 font-handwriting">{formatDob(student.dob)}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                        <p className="font-bold text-green-700">{student.parentName}</p>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Phone size={10} /> {student.phone}
                        </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                       <p>{student.class || '---'}</p>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${
                            student.status === StudentStatus.ACTIVE ? 'bg-blue-500' : 
                            student.status === StudentStatus.RESERVED ? 'bg-orange-500' :
                            student.status === StudentStatus.DROPPED ? 'bg-red-500' : 'bg-gray-400'
                        }`}>
                            {student.status}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               setEditingStudent(student);
                               setShowEditModal(true);
                             }}
                             className="text-gray-400 hover:text-indigo-600 p-1"
                             title="Chỉnh sửa"
                          >
                             <Edit size={16} />
                          </button>
                          <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               handleDeleteStudent(student.id);
                             }}
                             className="text-gray-400 hover:text-red-600 p-1"
                             title="Xóa"
                          >
                             <Trash2 size={16} />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); navigate(`/customers/student-detail/${student.id}`); }}
                             className="text-gray-400 hover:text-indigo-600 p-1"
                             title="Chi tiết"
                          >
                             <ArrowRight size={18} />
                          </button>
                        </div>
                    </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                            Không tìm thấy học viên nào.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail & Care History Panel */}
        <div className="lg:col-span-1 h-[calc(100vh-220px)]">
          {selectedStudent ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-teal-50/30">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Thông tin học viên</h3>
                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18} /></button>
                 </div>
                 
                 <div className="mb-4">
                    <h4 className="text-xl font-bold text-teal-700 mb-1">{selectedStudent.fullName}</h4>
                    <p className="text-sm text-gray-500">{selectedStudent.code} | {selectedStudent.class}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-white rounded border border-gray-100">
                        <p className="text-xs text-gray-400">Ngày sinh</p>
                        <p className="font-medium text-gray-800">{formatDob(selectedStudent.dob)}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-gray-100">
                        <p className="text-xs text-gray-400">Trạng thái</p>
                        <p className="font-medium text-blue-600">{selectedStudent.status}</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                 {/* Accordion Style Items */}
                 <div className="border-b border-gray-100">
                     <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <span className="font-semibold text-gray-700">Lịch sử ghi danh/bảo lưu</span>
                        <ArrowRight size={16} className="text-gray-400" />
                     </button>
                 </div>
                 <div className="border-b border-gray-100">
                     <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <span className="font-semibold text-gray-700">Thống kê tài chính</span>
                        <ArrowRight size={16} className="text-gray-400" />
                     </button>
                 </div>
                 
                 <div className="p-4">
                     <h4 className="font-bold text-red-500 font-handwriting text-lg mb-3">Lịch sử chăm sóc</h4>
                     
                     <div className="space-y-4 pl-4 border-l-2 border-gray-100 ml-2">
                        {selectedStudent.careHistory.length > 0 ? selectedStudent.careHistory.map(log => (
                           <div key={log.id} className="relative mb-6">
                              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-white"></div>
                              <p className="text-xs text-gray-500 font-medium mb-1">{log.date} - <span className="text-teal-600">{log.type}</span></p>
                              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                {log.content}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1 text-right">Người tạo: {log.staff}</p>
                           </div>
                        )) : (
                            <p className="text-sm text-gray-400 italic">Chưa có lịch sử chăm sóc</p>
                        )}
                        
                        {/* Static Example for 'Lịch sử gọi điện' as requested */}
                        <div className="relative mb-6">
                              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white"></div>
                              <p className="text-xs text-gray-500 font-medium mb-1">24/03 - <span className="text-orange-600">Gọi điện xin feedback</span></p>
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <table className="w-full text-xs text-left">
                                      <thead className="bg-gray-50 text-gray-500">
                                          <tr>
                                              <th className="p-2">Ngày gọi</th>
                                              <th className="p-2">Nội dung</th>
                                              <th className="p-2 text-right">Điểm</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td className="p-2 border-t border-gray-100">24/03</td>
                                              <td className="p-2 border-t border-gray-100">Con học rất hài lòng</td>
                                              <td className="p-2 border-t border-gray-100 text-right font-bold">90/100</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                        </div>
                     </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-400 p-6 text-center">
              <div>
                <User size={48} className="mx-auto mb-2 opacity-20" />
                <p>Chọn một học viên để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <CreateStudentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateStudent}
        />
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSubmit={(data) => handleUpdateStudent(editingStudent.id, data)}
        />
      )}
    </div>
  );
};

// ============================================
// CREATE STUDENT MODAL
// ============================================
interface CreateStudentModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => void;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    phone: '',
    parentName: '',
    parentPhone: '',
    status: StudentStatus.ACTIVE,
    currentClassName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Tạo học viên mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT học viên
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.values(StudentStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <h4 className="font-semibold text-gray-800 mb-2 mt-2">Thông tin phụ huynh</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ông/Bà Nguyễn Văn B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0987654321"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học hiện tại
              </label>
              <input
                type="text"
                value={formData.currentClassName}
                onChange={(e) => setFormData({ ...formData, currentClassName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Kindy 1A"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tạo học viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// EDIT STUDENT MODAL
// ============================================
interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: student.fullName,
    dob: new Date(student.dob).toISOString().split('T')[0],
    gender: student.gender,
    phone: student.phone,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    status: student.status,
    currentClassName: student.currentClassName || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa học viên</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT học viên
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.values(StudentStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <h4 className="font-semibold text-gray-800 mb-2 mt-2">Thông tin phụ huynh</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học hiện tại
              </label>
              <input
                type="text"
                value={formData.currentClassName}
                onChange={(e) => setFormData({ ...formData, currentClassName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
