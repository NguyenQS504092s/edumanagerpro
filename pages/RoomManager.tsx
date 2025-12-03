
import React, { useState } from 'react';
import { Home, Plus, Edit } from 'lucide-react';
import { MOCK_ROOMS } from '../mockData';
import { Modal } from '../components/Modal';
import { Room } from '../types';

export const RoomManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Phòng học</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Thêm phòng học
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4 w-16">STT</th>
              <th className="px-6 py-4">Tên phòng học</th>
              <th className="px-6 py-4">Loại phòng học</th>
              <th className="px-6 py-4">Ghi chú</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room, index) => (
              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                <td className="px-6 py-4">{room.type}</td>
                <td className="px-6 py-4 text-gray-400 italic"></td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-green-700 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <div className="text-xs text-gray-500">Hiển thị 1 đến {rooms.length} của {rooms.length} bản ghi</div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm phòng học"
        width="600px"
      >
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cơ sở</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500" disabled>
                          <option>Brisky Tây Mỗ</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                          <option>Hoạt động</option>
                          <option>Bảo trì</option>
                      </select>
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng học</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng học</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                          <option>Văn phòng</option>
                          <option>Đào tạo</option>
                      </select>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">HUỶ BỎ</button>
                 <button className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">XÁC NHẬN</button>
             </div>
          </div>
      </Modal>
    </div>
  );
};
