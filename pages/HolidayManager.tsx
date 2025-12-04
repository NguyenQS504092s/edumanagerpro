import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/config/firebase';

interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export const HolidayManager: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Chưa áp dụng',
  });

  // Fetch holidays from Firebase
  const fetchHolidays = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'holidays'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Holiday[];
      setHolidays(data.sort((a, b) => a.startDate.localeCompare(b.startDate)));
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Toggle status
  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Đã áp dụng' ? 'Chưa áp dụng' : 'Đã áp dụng';
      await updateDoc(doc(db, 'holidays', id), { status: newStatus });
      setHolidays(holidays.map(h => 
        h.id === id ? { ...h, status: newStatus } : h
      ));
    } catch (err) {
      console.error('Error updating holiday:', err);
    }
  };

  // Create holiday
  const handleCreate = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await addDoc(collection(db, 'holidays'), {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        createdAt: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({ name: '', startDate: '', endDate: '', status: 'Chưa áp dụng' });
      fetchHolidays();
      alert('Đã thêm lịch nghỉ mới!');
    } catch (err) {
      console.error('Error creating holiday:', err);
      alert('Có lỗi xảy ra!');
    }
  };

  // Delete holiday
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'holidays', id));
      setHolidays(holidays.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting holiday:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          Lịch nghỉ
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Thêm lịch nghỉ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4">Tên kỳ nghỉ</th>
              <th className="px-6 py-4">Thời gian bắt đầu</th>
              <th className="px-6 py-4">Thời gian kết thúc</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holidays.length > 0 ? (
              holidays.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{holiday.name}</td>
                  <td className="px-6 py-4">{holiday.startDate}</td>
                  <td className="px-6 py-4">{holiday.endDate}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(holiday.id, holiday.status)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors
                        ${holiday.status === 'Đã áp dụng' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'}
                      `}
                    >
                      {holiday.status === 'Đã áp dụng' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {holiday.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(holiday.id, holiday.name)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Chưa có lịch nghỉ nào. Nhấn "Thêm lịch nghỉ" để tạo mới.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm lịch nghỉ */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Thêm lịch nghỉ mới</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỳ nghỉ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="VD: Nghỉ lễ Quốc Khánh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Chưa áp dụng">Chưa áp dụng</option>
                  <option value="Đã áp dụng">Đã áp dụng</option>
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Thêm lịch nghỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};