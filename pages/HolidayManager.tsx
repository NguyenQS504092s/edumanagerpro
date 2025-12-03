import React, { useState } from 'react';
import { Calendar, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { MOCK_HOLIDAYS } from '../mockData';

export const HolidayManager: React.FC = () => {
  const [holidays, setHolidays] = useState(MOCK_HOLIDAYS);

  const toggleStatus = (id: string) => {
    setHolidays(holidays.map(h => 
      h.id === id ? { ...h, status: h.status === 'Đã áp dụng' ? 'Chưa áp dụng' : 'Đã áp dụng' } : h
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          Lịch nghỉ
        </h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
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
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{holiday.name}</td>
                <td className="px-6 py-4">{holiday.startDate}</td>
                <td className="px-6 py-4">{holiday.endDate}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(holiday.id)}
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
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};