
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { MOCK_STAFF } from '../mockData';
import { Staff } from '../types';
import { Modal } from '../components/Modal';

export const StaffManager: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>(MOCK_STAFF);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Danh sách nhân viên</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhân viên..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>
        </div>

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
            {filteredStaff.map((staff, index) => (
              <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{staff.name}</div>
                    <div className="text-xs text-gray-500">{staff.code}</div>
                </td>
                <td className="px-6 py-4">{staff.phone}</td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white
                        ${staff.department === 'Admin' ? 'bg-red-500' : 
                          staff.department === 'Văn phòng' ? 'bg-blue-500' : 
                          staff.department === 'Đào tạo' ? 'bg-teal-500' : 'bg-gray-500'}
                    `}>
                        {staff.department}
                    </span>
                </td>
                <td className="px-6 py-4">{staff.position}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(staff)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStaff ? `Chỉnh sửa nhân viên: ${selectedStaff.name} - ${selectedStaff.code}` : "Thêm nhân viên mới"}
        width="800px"
      >
         <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên đệm</label>
                     <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" defaultValue={selectedStaff ? selectedStaff.name.split(' ').slice(0, -1).join(' ') : ''} />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                     <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" defaultValue={selectedStaff ? selectedStaff.name.split(' ').slice(-1).join(' ') : ''} />
                 </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                 <div className="relative">
                    <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                 </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="radio" name="dept" defaultChecked={selectedStaff?.department === 'Văn phòng'} /> Văn phòng
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="radio" name="dept" defaultChecked={selectedStaff?.department === 'Đào tạo'} /> Đào tạo
                    </label>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>Quản trị viên</option>
                        <option>Giáo viên</option>
                        <option>Nhân viên</option>
                    </select>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
                     <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Link Hợp đồng</label>
                     <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="URL..." />
                 </div>
             </div>

             <div className="border-t border-gray-100 pt-4 mt-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập / Tài khoản</label>
                         <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" defaultValue="sysadmin" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                         <div className="relative">
                            <input type="password" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value="............" readOnly />
                            <EyeOff size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                         </div>
                     </div>
                 </div>
                 <div className="mt-2 bg-yellow-50 text-yellow-800 text-xs p-2 rounded flex items-center gap-2">
                     <AlertTriangle size={14} />
                     Vui lòng chọn mật khẩu bất kỳ không liên quan đến thông tin cá nhân!
                 </div>

                 <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                     <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" defaultValue={selectedStaff?.phone} />
                 </div>
             </div>

             <div className="flex justify-end gap-3 pt-4">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">HUỶ BỎ</button>
                 <button className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">XÁC NHẬN</button>
             </div>
         </div>
      </Modal>
    </div>
  );
};
