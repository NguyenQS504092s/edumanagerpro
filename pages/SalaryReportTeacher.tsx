/**
 * Salary Report Teacher Page
 * Báo cáo lương GV/TG với Firebase integration
 */

import React, { useState } from 'react';
import { Info, DollarSign, Users } from 'lucide-react';
import { useSalaryReport } from '../src/hooks/useSalaryReport';
import { formatCurrency } from '../src/utils/currencyUtils';

export const SalaryReportTeacher: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedStaffIdx, setSelectedStaffIdx] = useState(0);

  const { summaries, loading, error, totalSalary } = useSalaryReport(selectedMonth, selectedYear);

  const selectedStaff = summaries[selectedStaffIdx];
  const salaryDetails = selectedStaff?.workDetails || [];
  const totalDetailSalary = salaryDetails.reduce((sum, item) => sum + item.salary, 0);

  // Generate month options
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push({
      value: `${d.getMonth() + 1}-${d.getFullYear()}`,
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
    });
  }

  const handleMonthChange = (value: string) => {
    const [m, y] = value.split('-').map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
    setSelectedStaffIdx(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 bg-cyan-300 px-3 py-1 rounded-sm shadow-sm">
            Báo cáo lương GV/TG
          </h2>
          <div className="flex gap-3 text-sm">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Users size={14} />
              {summaries.length} nhân sự
            </span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <DollarSign size={14} />
              Tổng: {formatCurrency(totalSalary)}
            </span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mr-2">Xem theo tháng</label>
          <select 
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={`${selectedMonth}-${selectedYear}`}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT: Summary Table */}
        <div className="w-full xl:w-5/12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800 border-collapse">
              <thead className="bg-white border-b-2 border-gray-900 font-bold text-xs uppercase">
                <tr>
                  <th className="px-3 py-3 border-r border-gray-300 w-10 text-center">No</th>
                  <th className="px-3 py-3 border-r border-gray-300">Tên nhân sự</th>
                  <th className="px-3 py-3 border-r border-gray-300 text-center">Vị trí</th>
                  <th className="px-3 py-3 border-r border-gray-300 text-center">Số ca</th>
                  <th className="px-3 py-3 border-r border-gray-300 text-right">Lương tạm tính</th>
                  <th className="px-3 py-3 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        Đang tải...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-red-500">Lỗi: {error}</td>
                  </tr>
                ) : summaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      <DollarSign size={48} className="mx-auto mb-2 opacity-20" />
                      Chưa có dữ liệu công đã xác nhận trong tháng này
                    </td>
                  </tr>
                ) : summaries.map((staff, idx) => (
                  <tr 
                    key={staff.staffId} 
                    className={`hover:bg-green-50 cursor-pointer transition-colors ${selectedStaffIdx === idx ? 'bg-green-100' : ''}`}
                    onClick={() => setSelectedStaffIdx(idx)}
                  >
                    <td className="px-3 py-3 border-r border-gray-200 text-center">{idx + 1}</td>
                    <td className="px-3 py-3 border-r border-gray-200">
                      <div className="font-bold">{staff.staffName}</div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        staff.position === 'Giáo viên Việt' ? 'bg-blue-100 text-blue-700' :
                        staff.position === 'Giáo viên Nước ngoài' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {staff.position}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-center font-medium">
                      {staff.confirmedSessions}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-200 text-right font-bold text-indigo-600">
                      {formatCurrency(staff.estimatedSalary)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button className="text-gray-500 hover:text-green-600">
                        <Info size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Detail View */}
        <div className="w-full xl:w-7/12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {selectedStaff ? (
            <>
              <div className="bg-green-400 px-4 py-2 flex justify-between items-center text-black font-bold text-sm">
                <span>Chi tiết tính công</span>
                <div className="flex gap-6">
                  <span>Tháng: {selectedMonth}/{selectedYear}</span>
                  <span>Nhân viên: {selectedStaff.staffName}</span>
                </div>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-orange-100 text-gray-900 font-bold text-xs uppercase">
                      <th className="border border-gray-400 px-2 py-2 w-16">Ngày</th>
                      <th className="border border-gray-400 px-2 py-2">Giờ</th>
                      <th className="border border-gray-400 px-2 py-2">Lớp</th>
                      <th className="border border-gray-400 px-2 py-2">Kiểu công</th>
                      <th className="border border-gray-400 px-2 py-2">Lương</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryDetails.length > 0 ? salaryDetails.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2">{item.date}</td>
                        <td className="border border-gray-300 px-2 py-2">{item.time}</td>
                        <td className="border border-gray-300 px-2 py-2">{item.className}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.type === 'Dạy chính' ? 'bg-blue-100 text-blue-700' :
                            item.type === 'Trợ giảng' ? 'bg-purple-100 text-purple-700' :
                            item.type === 'Nhận xét' ? 'bg-orange-100 text-orange-700' :
                            item.type === 'Bồi bài' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-2 py-2 font-bold">
                          {formatCurrency(item.salary)}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-gray-500 italic">Không có dữ liệu chi tiết</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="text-right px-4 py-2">
                        <span className="bg-green-500 text-white px-2 py-1 font-bold text-xs uppercase">Tổng lương</span>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 font-bold text-gray-900 bg-gray-50">
                        {formatCurrency(totalDetailSalary)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 p-10">
              <div className="text-center">
                <DollarSign size={48} className="mx-auto mb-2 opacity-20" />
                {loading ? 'Đang tải...' : 'Chọn một nhân viên để xem chi tiết'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
