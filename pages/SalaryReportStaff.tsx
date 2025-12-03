
import React, { useState } from 'react';
import { Info, Calendar, DollarSign, Clock } from 'lucide-react';
import { MOCK_STAFF_SALARIES, MOCK_STAFF_ATTENDANCE } from '../mockData';

export const SalaryReportStaff: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('04/2024');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(MOCK_STAFF_SALARIES[0].id);
  const [activeTab, setActiveTab] = useState<'attendance' | 'commission'>('attendance');

  const selectedStaff = MOCK_STAFF_SALARIES.find(s => s.id === selectedStaffId);
  const attendanceLogs = selectedStaff ? MOCK_STAFF_ATTENDANCE[selectedStaff.id] : [];

  return (
    <div className="space-y-6">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-bold text-gray-900 bg-cyan-300 px-4 py-1.5 shadow-sm border border-gray-200">
                Báo cáo lương Nhân viên
             </h2>
          </div>
          <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Xem theo tháng</label>
              <select 
                 className="border border-gray-300 rounded px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(e.target.value)}
              >
                 <option value="04/2024">Tháng 4/2024</option>
                 <option value="05/2024">Tháng 5/2024</option>
              </select>
          </div>
       </div>

       <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT: Master List */}
          <div className="w-full xl:w-5/12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-800 border-collapse">
                    <thead className="bg-white text-gray-900 font-bold text-xs uppercase border-b-2 border-gray-300">
                        <tr>
                            <th className="px-3 py-3 border border-gray-300">Tên nhân sự</th>
                            <th className="px-3 py-3 border border-gray-300 text-center">Vị trí</th>
                            <th className="px-3 py-3 border border-gray-300 text-right">Lương cứng</th>
                            <th className="px-3 py-3 border border-gray-300 text-center">Công</th>
                            <th className="px-3 py-3 border border-gray-300 text-right">Thực nhận</th>
                            <th className="px-3 py-3 border border-gray-300 text-center w-10">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {MOCK_STAFF_SALARIES.map((staff) => (
                           <tr 
                              key={staff.id} 
                              className={`hover:bg-green-50 cursor-pointer transition-colors ${selectedStaffId === staff.id ? 'bg-green-100' : ''}`}
                              onClick={() => setSelectedStaffId(staff.id)}
                           >
                              <td className="px-3 py-3 border border-gray-200">
                                 <div className="font-bold">{staff.staffName}</div>
                              </td>
                              <td className="px-3 py-3 border border-gray-200 text-center text-xs">{staff.position}</td>
                              <td className="px-3 py-3 border border-gray-200 text-right">{staff.baseSalary.toLocaleString()}</td>
                              <td className="px-3 py-3 border border-gray-200 text-center">{staff.workDays}</td>
                              <td className="px-3 py-3 border border-gray-200 text-right font-bold text-green-700">{staff.totalSalary.toLocaleString()}</td>
                              <td className="px-3 py-3 border border-gray-200 text-center">
                                  <Info size={16} className="text-gray-400 hover:text-green-600 inline-block" />
                              </td>
                           </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
          </div>

          {/* RIGHT: Detail View */}
          <div className="w-full xl:w-7/12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {selectedStaff ? (
                  <>
                    <div className="bg-green-500 px-4 py-2 flex justify-between items-center text-white border-b border-green-600">
                        <div>
                            <h3 className="font-bold text-sm uppercase">Chi tiết lương & KPI</h3>
                        </div>
                        <div className="text-right text-xs">
                             <span>Nhân viên: </span>
                             <span className="font-bold">{selectedStaff.staffName}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <button 
                            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'attendance' ? 'border-green-500 text-green-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('attendance')}
                        >
                            <Clock size={14} /> Bảng chấm công
                        </button>
                        <button 
                            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'commission' ? 'border-green-500 text-green-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('commission')}
                        >
                            <DollarSign size={14} /> Hoa hồng / KPI
                        </button>
                    </div>
                    
                    <div className="p-4 flex-1">
                        {activeTab === 'attendance' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-center border-collapse border border-gray-300">
                                    <thead className="bg-orange-50 text-gray-800 font-bold text-xs uppercase">
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-2">Ngày</th>
                                            <th className="border border-gray-300 px-2 py-2">Giờ vào</th>
                                            <th className="border border-gray-300 px-2 py-2">Giờ ra</th>
                                            <th className="border border-gray-300 px-2 py-2">Trạng thái</th>
                                            <th className="border border-gray-300 px-2 py-2">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceLogs && attendanceLogs.length > 0 ? attendanceLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-2 py-2">{log.date}</td>
                                                <td className="border border-gray-300 px-2 py-2 text-green-700">{log.checkIn}</td>
                                                <td className="border border-gray-300 px-2 py-2 text-red-700">{log.checkOut}</td>
                                                <td className="border border-gray-300 px-2 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        log.status === 'Đúng giờ' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        log.status === 'Đi muộn' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-300 px-2 py-2 text-gray-500 text-xs italic">{log.note || ''}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-gray-400 italic">Chưa có dữ liệu chấm công</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'commission' && (
                            <div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-3 rounded border border-gray-300">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Lương cứng</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedStaff.baseSalary.toLocaleString()} đ</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-300">
                                        <p className="text-xs text-green-700 uppercase font-bold">Tổng hoa hồng</p>
                                        <p className="text-lg font-bold text-green-700">{selectedStaff.commission.toLocaleString()} đ</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-300 rounded overflow-hidden">
                                     <table className="w-full text-sm text-left">
                                         <thead className="bg-orange-50 text-xs uppercase font-bold text-gray-700 border-b border-gray-300">
                                             <tr>
                                                 <th className="px-4 py-2 border-r border-gray-300">Mô tả</th>
                                                 <th className="px-4 py-2 text-right">Giá trị</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-200">
                                             <tr>
                                                 <td className="px-4 py-2 border-r border-gray-200">Hoa hồng doanh số tháng 4</td>
                                                 <td className="px-4 py-2 text-right font-medium">{selectedStaff.commission.toLocaleString()} đ</td>
                                             </tr>
                                             <tr>
                                                 <td className="px-4 py-2 border-r border-gray-200">Phụ cấp ăn trưa</td>
                                                 <td className="px-4 py-2 text-right font-medium">{selectedStaff.allowance.toLocaleString()} đ</td>
                                             </tr>
                                             {selectedStaff.deduction > 0 && (
                                                <tr>
                                                    <td className="px-4 py-2 border-r border-gray-200 text-red-600">Phạt đi muộn</td>
                                                    <td className="px-4 py-2 text-right font-medium text-red-600">-{selectedStaff.deduction.toLocaleString()} đ</td>
                                                </tr>
                                             )}
                                             <tr className="bg-gray-50 font-bold">
                                                 <td className="px-4 py-2 border-r border-gray-300 text-gray-900">Tổng thực nhận</td>
                                                 <td className="px-4 py-2 text-right text-green-700">{selectedStaff.totalSalary.toLocaleString()} đ</td>
                                             </tr>
                                         </tbody>
                                     </table>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 p-10 flex-col gap-2">
                      <Info size={48} className="opacity-20" />
                      <p>Chọn một nhân viên để xem chi tiết lương</p>
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};
