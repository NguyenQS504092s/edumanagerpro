
import React, { useState } from 'react';
import { Search, Plus, Phone } from 'lucide-react';
import { MOCK_PARENTS } from '../mockData';

export const ParentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredParents = MOCK_PARENTS.filter(p => 
    p.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.fatherPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-lg font-bold text-gray-800">Danh sách phụ huynh</h2>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
         <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
               <input 
                 type="text" 
                 placeholder="Tìm kiếm theo tên PH" 
                 className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="relative flex-1">
               <input 
                 type="text" 
                 placeholder="Tìm kiếm theo SĐT Phụ huynh" 
                 className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium">
             Thêm phụ huynh
         </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-white text-gray-800 font-bold border-b-2 border-gray-200">
               <tr>
                  <th className="px-4 py-3 border-r border-gray-200 w-16 text-center">No</th>
                  <th className="px-4 py-3 border-r border-gray-200 w-1/4">Tên Phụ Huynh</th>
                  <th className="px-4 py-3 border-r border-gray-200 w-1/4">Học Sinh</th>
                  <th className="px-4 py-3 border-r border-gray-200">Trạng thái</th>
                  <th className="px-4 py-3 border-r border-gray-200">Lớp học</th>
                  <th className="px-4 py-3">Hành Động</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
               {filteredParents.map((parent, index) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                     <td className="px-4 py-3 border-r border-gray-200 text-center align-top pt-4">{index + 1}</td>
                     <td className="px-4 py-3 border-r border-gray-200 align-top pt-4">
                        <div className="font-bold text-gray-900">{parent.fatherName}</div>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                           <span className="text-xs">SĐT: {parent.fatherPhone}</span>
                        </div>
                     </td>
                     
                     {/* Children Column */}
                     <td className="px-0 py-0 border-r border-gray-200 align-top p-0">
                        {parent.children.map((child, cIndex) => (
                           <div key={child.id} className={`px-4 py-3 flex flex-col justify-center h-16 ${cIndex !== parent.children.length - 1 ? 'border-b border-gray-200' : ''}`}>
                              <div className="font-medium text-gray-900">{child.name}</div>
                           </div>
                        ))}
                     </td>

                     {/* Status Column */}
                     <td className="px-0 py-0 border-r border-gray-200 align-top p-0">
                        {parent.children.map((child, cIndex) => (
                           <div key={child.id} className={`px-4 py-3 flex items-center h-16 ${cIndex !== parent.children.length - 1 ? 'border-b border-gray-200' : ''}`}>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                 child.status === 'Đang học' ? 'bg-green-100 text-green-700' : 
                                 child.status === 'Bảo lưu' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                 {child.status}
                              </span>
                           </div>
                        ))}
                     </td>

                     {/* Class Column */}
                     <td className="px-0 py-0 border-r border-gray-200 align-top p-0">
                        {parent.children.map((child, cIndex) => (
                           <div key={child.id} className={`px-4 py-3 flex items-center h-16 ${cIndex !== parent.children.length - 1 ? 'border-b border-gray-200' : ''}`}>
                              <span className="text-gray-900">{child.class}</span>
                           </div>
                        ))}
                     </td>

                     {/* Action Column */}
                     <td className="px-4 py-3 align-top pt-4">
                        {/* Actions could go here */}
                     </td>
                  </tr>
               ))}
               {filteredParents.length === 0 && (
                  <tr>
                     <td colSpan={6} className="text-center py-8 text-gray-500">
                        Không tìm thấy phụ huynh nào.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
