
import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Plus, Calendar, User } from 'lucide-react';
import { MOCK_WORK_SESSIONS } from '../mockData';
import { WorkSession } from '../types';

export const WorkConfirmation: React.FC = () => {
  const [sessions, setSessions] = useState<WorkSession[]>(MOCK_WORK_SESSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manual Form States
  const [manualForm, setManualForm] = useState({
    staffName: '',
    position: 'Giáo viên',
    date: '',
    timeStart: '',
    timeEnd: '',
    type: 'Dạy chính'
  });

  const toggleStatus = (id: string) => {
    setSessions(sessions.map(s => 
       s.id === id 
        ? { ...s, status: s.status === 'Đã xác nhận' ? 'Chờ xác nhận' : 'Đã xác nhận' } 
        : s
    ));
  };

  const confirmAll = () => {
      setSessions(sessions.map(s => ({ ...s, status: 'Đã xác nhận' })));
  };

  const handleManualAdd = () => {
      // In a real app, this would add to the list
      alert("Đã thêm công thành công!");
      setManualForm({
        staffName: '',
        position: 'Giáo viên',
        date: '',
        timeStart: '',
        timeEnd: '',
        type: 'Dạy chính'
      });
  };

  const filteredSessions = sessions.filter(s => 
    s.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div className="mb-4">
             <h2 className="text-lg font-bold text-white bg-green-500 px-4 py-1.5 inline-block rounded-sm shadow-sm">
                 Xác nhận công giáo viên & trợ giảng
             </h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Hiển thị thời gian</label>
                 <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                     <option>Hôm nay</option>
                     <option>Tuần này</option>
                     <option>Tháng này</option>
                 </select>
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Trạng thái</label>
                 <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                     <option>Chờ xác nhận</option>
                     <option>Đã xác nhận</option>
                     <option>Tất cả</option>
                 </select>
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Vị trí</label>
                 <select className="w-full border border-gray-300 rounded px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                     <option>Giáo viên Việt</option>
                     <option>Giáo viên Nước ngoài</option>
                     <option>Trợ giảng</option>
                 </select>
             </div>
             <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Tên nhân sự</label>
                 <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Lựa chọn tên..." 
                        className="w-full border border-gray-300 rounded px-2 py-2 pl-8 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                     <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                 </div>
             </div>
         </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* LEFT: Main Table */}
          <div className="flex-1 w-full xl:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs italic text-gray-500 flex justify-between items-center">
                 <span>Hệ thống sẽ tự động hiển thị dựa theo thời khóa biểu và lịch nghỉ</span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 border-collapse">
                    <thead className="bg-green-500 text-white text-xs uppercase font-bold">
                        <tr>
                            <th className="px-4 py-3 border-r border-green-400 w-12 text-center">STT</th>
                            <th className="px-4 py-3 border-r border-green-400">Tên nhân viên</th>
                            <th className="px-4 py-3 border-r border-green-400">Thời gian</th>
                            <th className="px-4 py-3 border-r border-green-400 text-center">Lớp</th>
                            <th className="px-4 py-3 border-r border-green-400 text-center">Kiểu tính công</th>
                            <th className="px-4 py-3 text-center w-40">
                                <button 
                                    onClick={confirmAll}
                                    className="bg-white text-green-600 px-2 py-0.5 rounded shadow-sm text-[10px] hover:bg-gray-100 uppercase font-bold w-full"
                                >
                                    Xác nhận hàng loạt
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSessions.map((session, idx) => (
                            <tr key={session.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 border-r border-gray-100 text-center">{idx + 1}</td>
                                <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">{session.staffName}</td>
                                <td className="px-4 py-3 border-r border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <span>{session.date} {session.timeStart} - {session.timeEnd}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 border-r border-gray-100 text-center">{session.className}</td>
                                <td className="px-4 py-3 border-r border-gray-100 text-center">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{session.type}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={() => toggleStatus(session.id)}
                                        className={`px-3 py-1 rounded text-xs font-bold border transition-all w-full
                                            ${session.status === 'Đã xác nhận' 
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                                : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
                                            }
                                        `}
                                    >
                                        {session.status}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <div className="p-4 bg-yellow-50 text-xs text-yellow-800 italic border-t border-yellow-100 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                 Sau khi xác nhận, số công sẽ tự động chuyển sang báo cáo lương.
             </div>
          </div>

          {/* RIGHT: Manual Add Form */}
          <div className="w-full xl:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-green-500 px-4 py-3">
                  <h3 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                      <Plus size={16} className="bg-white text-green-500 rounded-full p-0.5" />
                      Giao diện thêm công thủ công
                  </h3>
              </div>
              
              <div className="p-5 space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Tên nhân viên</label>
                      <div className="relative">
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            placeholder="Nhập tên nhân viên..."
                            value={manualForm.staffName}
                            onChange={e => setManualForm({...manualForm, staffName: e.target.value})}
                        />
                        <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Vị trí</label>
                      <select 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                        value={manualForm.position}
                        onChange={e => setManualForm({...manualForm, position: e.target.value})}
                      >
                          <option>Giáo viên</option>
                          <option>Trợ giảng</option>
                          <option>Nhân viên</option>
                      </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Ngày</label>
                          <input 
                            type="date" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            value={manualForm.date}
                            onChange={e => setManualForm({...manualForm, date: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Giờ bắt đầu</label>
                          <input 
                            type="time" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            value={manualForm.timeStart}
                            onChange={e => setManualForm({...manualForm, timeStart: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Kiểu tính công</label>
                      <select 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                        value={manualForm.type}
                        onChange={e => setManualForm({...manualForm, type: e.target.value})}
                      >
                          <option>Dạy chính</option>
                          <option>Trợ giảng</option>
                          <option>Nhận xét</option>
                          <option>Dạy thay</option>
                      </select>
                  </div>

                  <div className="pt-2">
                      <button 
                        onClick={handleManualAdd}
                        className="w-full bg-green-500 text-white font-bold py-2.5 rounded hover:bg-green-600 transition-colors shadow-sm flex justify-center items-center gap-2"
                      >
                          <CheckCircle size={18} />
                          Xác nhận thêm
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
