
import React from 'react';
import { MOCK_SALARY_RULES, MOCK_SALARY_RANGES } from '../mockData';

export const SalaryConfig: React.FC = () => {
  const teachingRanges = MOCK_SALARY_RANGES.filter(r => r.type === 'Teaching');
  const feedbackRanges = MOCK_SALARY_RANGES.filter(r => r.type === 'AssistantFeedback');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-gray-800 bg-green-500 text-white px-3 py-1 rounded">Cấu hình lương GV/TG</h2>
        <div className="flex gap-4 text-sm text-gray-600 font-medium">
           <span>1 ca = 90 phút</span>
           <span>1 giờ = 60 phút</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
               <thead>
                  <tr className="bg-orange-100/50 border-b border-gray-200 text-gray-800 font-bold">
                     <th className="px-4 py-3 border-r border-gray-200 text-center w-12">No</th>
                     <th className="px-4 py-3 border-r border-gray-200">Tên nhân sự</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-center">Vị trí</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-center">Lớp phụ trách</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-center">Cách tính lương</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-right">Mức tối thiểu</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-center">Cách tính công</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-center">Sĩ số trung bình của lớp</th>
                     <th className="px-4 py-3 border-r border-gray-200 text-right">Tiền công/ 1 ca,giờ</th>
                     <th className="px-4 py-3">Ngày hiệu lực</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {MOCK_SALARY_RULES.map((rule, idx) => (
                     <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 border-r border-gray-100">
                           <div className="font-medium text-gray-900">{rule.staffName}</div>
                           <div className="text-xs text-gray-500">{rule.dob}</div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.position}</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.class}</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.salaryMethod}</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-right">{rule.baseRate.toLocaleString()} đ</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.workMethod}</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.avgStudents}</td>
                        <td className="px-4 py-3 border-r border-gray-100 text-right font-bold text-indigo-600">{rule.ratePerSession.toLocaleString()} đ</td>
                        <td className="px-4 py-3">{rule.effectiveDate}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Explanation & Global Configs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Left Column: Explanations */}
         <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h3 className="font-bold text-gray-800 mb-3 bg-orange-200/50 inline-block px-2 py-1 rounded">Logic phần cách tính công</h3>
            <div className="space-y-2 text-sm text-gray-700">
               <div className="flex gap-4">
                  <span className="font-bold w-24">Cố định</span>
                  <span>Sẽ nhân theo mức tối thiểu/ cố định</span>
               </div>
               <div className="flex gap-4">
                  <span className="font-bold w-24">Theo sĩ số</span>
                  <span>Lấy theo sĩ số trung bình học sinh đi học thực tế</span>
               </div>
            </div>
         </div>

         {/* Right Column: Rate Tables */}
         <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-orange-100/50 px-4 py-2 font-bold text-gray-800 border-b border-gray-200">
                  Mục thiết lập tiền công 1 ca/ 1 giờ
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                     <tr>
                        <th className="px-4 py-2">Sĩ số</th>
                        <th className="px-4 py-2">Cách tính</th>
                        <th className="px-4 py-2">Số tiền</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {teachingRanges.map((r) => (
                        <tr key={r.id}>
                           <td className="px-4 py-2">{r.rangeLabel}</td>
                           <td className="px-4 py-2">{r.method}</td>
                           <td className="px-4 py-2 font-medium">{r.amount.toLocaleString()} đ</td>
                        </tr>
                     ))}
                     <tr>
                         <td className="px-4 py-2 text-gray-500">Ngày hiệu lực</td>
                         <td colSpan={2} className="px-4 py-2 text-gray-500 italic">Ghi ngày</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-orange-100/50 px-4 py-2 font-bold text-gray-800 border-b border-gray-200">
                  Mục thiết lập tiền công lương nhận xét của trợ giảng
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                     <tr>
                        <th className="px-4 py-2">Sĩ số</th>
                        <th className="px-4 py-2">Số tiền</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {feedbackRanges.map((r) => (
                        <tr key={r.id}>
                           <td className="px-4 py-2">{r.rangeLabel}</td>
                           <td className="px-4 py-2 font-medium">{r.amount.toLocaleString()} đ</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
