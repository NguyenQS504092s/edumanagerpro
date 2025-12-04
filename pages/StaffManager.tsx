import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, User, Eye, EyeOff, AlertTriangle, X, Phone } from 'lucide-react';
import { Staff } from '../types';
import { useStaff } from '../src/hooks/useStaff';

// Departments and positions based on Excel
const DEPARTMENTS = ['Điều hành', 'Đào Tạo', 'Văn phòng'];
const POSITIONS = {
  'Điều hành': ['Quản lý (Admin)'],
  'Đào Tạo': ['Giáo Viên Việt', 'Giáo Viên Nước Ngoài', 'Trợ Giảng'],
  'Văn phòng': ['Nhân viên', 'Kế toán', 'Lễ tân'],
};

// Teacher colors for schedule display
const TEACHER_COLORS = [
  { name: 'Vàng', value: '#FEF3C7' },
  { name: 'Hồng', value: '#FCE7F3' },
  { name: 'Xanh lá', value: '#D1FAE5' },
  { name: 'Xanh dương', value: '#DBEAFE' },
  { name: 'Tím', value: '#EDE9FE' },
  { name: 'Cam', value: '#FFEDD5' },
  { name: 'Xanh ngọc', value: '#CCFBF1' },
];

export const StaffManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { staff, loading, createStaff, updateStaff, deleteStaff } = useStaff();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    department: 'Đào Tạo',
    position: 'Giáo Viên Việt',
    startDate: '',
    contractLink: '',
    displayColor: '#FEF3C7',
    username: '',
    password: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.phone?.includes(searchTerm) ||
                           s.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDepartment === 'ALL' || s.department === filterDepartment;
      return matchesSearch && matchesDept;
    });
  }, [staff, searchTerm, filterDepartment]);

  // Open create modal
  const handleCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      dob: '',
      phone: '',
      department: 'Đào Tạo',
      position: 'Giáo Viên Việt',
      startDate: new Date().toISOString().split('T')[0],
      contractLink: '',
      displayColor: '#FEF3C7',
      username: '',
      password: '',
      status: 'Active',
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name || '',
      dob: staffMember.dob || '',
      phone: staffMember.phone || '',
      department: staffMember.department || 'Đào Tạo',
      position: staffMember.position || 'Giáo Viên Việt',
      startDate: staffMember.startDate || '',
      contractLink: '',
      displayColor: '#FEF3C7',
      username: '',
      password: '',
      status: staffMember.status || 'Active',
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('Vui lòng nhập họ tên và số điện thoại!');
      return;
    }

    try {
      const staffData = {
        name: formData.name,
        code: editingStaff?.code || `NV${Date.now().toString().slice(-6)}`,
        dob: formData.dob,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        role: formData.position.includes('Giáo Viên') ? 'Giáo viên' : 
              formData.position === 'Trợ Giảng' ? 'Trợ giảng' : 
              formData.position === 'Quản lý (Admin)' ? 'Quản lý' : 'Nhân viên',
        startDate: formData.startDate,
        status: formData.status,
      };

      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        alert('Đã cập nhật nhân viên!');
      } else {
        await createStaff(staffData as Omit<Staff, 'id'>);
        alert('Đã thêm nhân viên mới!');
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}"?`)) return;
    
    try {
      await deleteStaff(id);
      alert('Đã xóa nhân viên!');
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get department badge color
  const getDeptBadge = (dept?: string) => {
    switch (dept) {
      case 'Điều hành': return 'bg-red-500';
      case 'Đào Tạo': return 'bg-teal-500';
      case 'Văn phòng': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Danh sách nhân viên</h2>
          <p className="text-sm text-gray-500">Quản lý thông tin nhân viên, giáo viên, trợ giảng</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Tạo mới nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm nhân viên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="ALL">Tất cả phòng ban</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4 w-16">STT</th>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">SĐT</th>
              <th className="px-6 py-4 text-center">Phòng ban</th>
              <th className="px-6 py-4">Vị trí</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStaff.length > 0 ? filteredStaff.map((s, index) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(s.dob)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Phone size={14} /> {s.phone}
                  </a>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getDeptBadge(s.department)}`}>
                    {s.department}
                  </span>
                </td>
                <td className="px-6 py-4">{s.position}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(s)} 
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id, s.name)} 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Không có nhân viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            Hiển thị {filteredStaff.length} nhân viên
          </span>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-teal-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingStaff ? 'Chỉnh sửa nhân viên' : 'Tạo mới nhân viên'}
                </h3>
                {editingStaff && <p className="text-sm text-teal-600">{editingStaff.name} - {editingStaff.code}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              {/* DOB & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sinh nhật</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SĐT *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                <div className="flex gap-4">
                  {DEPARTMENTS.map(dept => (
                    <label key={dept} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="department"
                        checked={formData.department === dept}
                        onChange={() => setFormData({ 
                          ...formData, 
                          department: dept,
                          position: POSITIONS[dept as keyof typeof POSITIONS]?.[0] || ''
                        })}
                        className="text-indigo-600"
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {(POSITIONS[formData.department as keyof typeof POSITIONS] || []).map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Start Date & Contract Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Hợp đồng</label>
                  <input
                    type="text"
                    value={formData.contractLink}
                    onChange={(e) => setFormData({ ...formData, contractLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="URL..."
                  />
                </div>
              </div>

              {/* Display Color (only for Vietnamese teachers) */}
              {formData.position === 'Giáo Viên Việt' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Màu hiển thị (trên TKB)</label>
                  <div className="flex gap-2 flex-wrap">
                    {TEACHER_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, displayColor: color.value })}
                        className={`w-8 h-8 rounded-full border-2 ${formData.displayColor === color.value ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Login Credentials */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin đăng nhập</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 bg-yellow-50 text-yellow-800 text-xs p-2 rounded flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Vui lòng chọn mật khẩu không liên quan đến thông tin cá nhân!
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingStaff ? 'Cập nhật' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
