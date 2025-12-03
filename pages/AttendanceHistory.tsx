import React from 'react';
import { ClipboardList, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { MOCK_ATTENDANCE_HISTORY } from '../mockData';

export const AttendanceHistory: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Tỷ lệ đi học</p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <XCircle size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Vắng mặt hôm nay</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <BarChart2 size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Lớp đã điểm danh</p>
                    <p className="text-2xl font-bold text-gray-900">24/25</p>
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
            {MOCK_ATTENDANCE_HISTORY.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{record.className}</td>
                <td className="px-6 py-4">{record.date}</td>
                <td className="px-6 py-4">{record.totalStudents}</td>
                <td className="px-6 py-4 text-green-600 font-medium">{record.present}</td>
                <td className="px-6 py-4 text-red-600 font-medium">{record.absent}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                    ${record.status === 'Đã điểm danh' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {record.status === 'Chưa điểm danh' ? (
                      <button className="text-indigo-600 hover:text-indigo-700 font-medium text-xs border border-indigo-200 bg-indigo-50 px-3 py-1 rounded">
                          Điểm danh ngay
                      </button>
                  ) : (
                      <button className="text-gray-500 hover:text-indigo-600 font-medium text-xs">
                          Xem chi tiết
                      </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};