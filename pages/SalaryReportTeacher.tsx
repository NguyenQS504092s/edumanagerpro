
import React, { useState } from 'react';
import { Info, Edit } from 'lucide-react';
import { MOCK_SALARY_SUMMARIES, MOCK_SALARY_DETAILS } from '../mockData';
import { SalarySummary } from '../types';

export const SalaryReportTeacher: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('5/12/1994'); // Using date from screenshot as mock month identifier
  const [selectedStaffId, setSelectedStaffId] = useState<string>(MOCK_SALARY_SUMMARIES[0].id);

  const selectedStaff = MOCK_SALARY_SUMMARIES.find(s => s.id === selectedStaffId);
  const salaryDetails = selectedStaff ? MOCK_SALARY_DETAILS[selectedStaff.id] : [];

  const totalDetailSalary = salaryDetails?.reduce((sum, item) => sum + item.salary, 0) || 0;

  return (
    <div className="space-y-6">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-bold text-gray-800 bg-cyan-300 px-3 py-1 rounded-sm shadow-sm">
                Báo cáo lương GV/TG
             </h2>
          </div>
          <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Xem theo tháng</label>
              <select 
                 className="border border-gray-300 rounded px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(e.target.value)}
              >
                 <option value="5/12/1994">Tháng 4/2024</option>
                 <option value="6/12/1994">Tháng 5/2024</option>
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
                            <th className="px-3 py-3 border-r border-gray-300 text-right">Lương tạm tính</th>
                            <th className="px-3 py-3 border-r border-gray-300 text-right">Lương kỳ vọng</th>
                            <th className="px-3 py-3 border-r border-gray-300 text-right">Thưởng KPI</th>
                            <th className="px-3 py-3 text-center">Xem chi tiết tính công</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {MOCK_SALARY_SUMMARIES.map((staff, idx) => (
                           <tr 
                              key={staff.id} 
                              className={`hover:bg-green-50 cursor-pointer transition-colors ${selectedStaffId === staff.id ? 'bg-green-100' : ''}`}
                              onClick={() => setSelectedStaffId(staff.id)}
                           >
                              <td className="px-3 py-3 border-r border-gray-200 text-center">{idx + 1}</td>
                              <td className="px-3 py-3 border-r border-gray-200">
                                 <div className="font-bold">{staff.staffName}</div>
                                 <div className="text-xs text-gray-500">{staff.dob}</div>
                              </td>
                              <td className="px-3 py-3 border-r border-gray-200 text-center">{staff.position}</td>
                              <td className="px-3 py-3 border-r border-gray-200 text-right">{staff.estimatedSalary.toLocaleString()} đ</td>
                              <td className="px-3 py-3 border-r border-gray-200 text-right">{staff.expectedSalary.toLocaleString()} đ</td>
                              <td className="px-3 py-3 border-r border-gray-200 text-right">{staff.kpiBonus?.toLocaleString() || ''}</td>
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
                        <span>Chi tiết tính công cho {selectedStaff.position === 'Giáo Viên Nước Ngoài' ? 'GV NN' : selectedStaff.position === 'Trợ Giảng' ? 'Trợ Giảng' : 'GV Việt'}</span>
                        <div className="flex gap-6">
                            <span>Hiển thị: <span className="font-normal">Tháng</span></span>
                            <span>Tên nhân viên: {selectedStaff.staffName}</span>
                        </div>
                    </div>
                    
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-sm text-center border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-orange-100 text-gray-900 font-bold text-xs uppercase">
                                    <th className="border border-gray-400 px-2 py-2 w-16">Ngày</th>
                                    <th className="border border-gray-400 px-2 py-2">Giờ</th>
                                    <th className="border border-gray-400 px-2 py-2">
                                        {selectedStaff.position === 'Trợ Giảng' ? 'Lớp Trợ giảng' : 'Lớp dạy'}
                                    </th>
                                    
                                    {selectedStaff.position === 'Giáo Viên Việt' && (
                                        <th className="border border-gray-400 px-2 py-2">Sĩ số trung bình đi học</th>
                                    )}

                                    {selectedStaff.position === 'Trợ Giảng' ? (
                                        <>
                                           <th className="border border-gray-400 px-2 py-2">Dạy chính</th>
                                           <th className="border border-gray-400 px-2 py-2">Lương chính</th>
                                           <th className="border border-gray-400 px-2 py-2">Lương nhận xét</th>
                                        </>
                                    ) : (
                                        <th className="border border-gray-400 px-2 py-2">Lương</th>
                                    )}
                                    
                                    <th className="border border-gray-400 px-2 py-2 w-20">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaryDetails && salaryDetails.length > 0 ? salaryDetails.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-2 py-2">{item.date}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.time}</td>
                                        <td className="border border-gray-300 px-2 py-2">{item.className}</td>
                                        
                                        {selectedStaff.position === 'Giáo Viên Việt' && (
                                            <td className="border border-gray-300 px-2 py-2">{item.studentCount}</td>
                                        )}

                                        {selectedStaff.position === 'Trợ Giảng' ? (
                                            <>
                                                <td className="border border-gray-300 px-2 py-2">{item.className === 'Bồi bài' ? '' : 'Lớp C'}</td> {/* Mock logic based on screenshot */}
                                                <td className="border border-gray-300 px-2 py-2">{item.mainSalary?.toLocaleString()} đ</td>
                                                <td className="border border-gray-300 px-2 py-2">{item.feedbackSalary ? item.feedbackSalary.toLocaleString() + ' đ' : ''}</td>
                                            </>
                                        ) : (
                                            <td className={`border border-gray-300 px-2 py-2 font-bold ${item.type === 'Bồi bài' ? 'bg-yellow-200' : ''}`}>
                                                {item.salary.toLocaleString()} đ
                                            </td>
                                        )}

                                        <td className="border border-gray-300 px-2 py-2">
                                            <button className="text-gray-500 hover:text-indigo-600 text-xs underline">Sửa</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={10} className="py-4 text-gray-500 italic">Không có dữ liệu chi tiết</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={selectedStaff.position === 'Giáo Viên Việt' ? 4 : selectedStaff.position === 'Trợ Giảng' ? 6 : 3} className="text-right px-4 py-2">
                                        <span className="bg-green-500 text-white px-2 py-1 font-bold text-xs uppercase">Tổng lương</span>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 font-bold text-gray-900 bg-gray-50">
                                        {totalDetailSalary.toLocaleString()} đ
                                    </td>
                                    <td className="border border-gray-300"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                  </>
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 p-10">
                      Chọn một nhân viên để xem chi tiết
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};
