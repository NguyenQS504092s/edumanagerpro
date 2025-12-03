import React, { useState, useMemo } from 'react';
import { Printer, ChevronLeft, ChevronRight, Calendar, Filter, User, MapPin } from 'lucide-react';
import { MOCK_SCHEDULE } from '../mockData';

export const Schedule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState('Tuần 42 (16/10 - 22/10)');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const shifts = ['17:30 - 19:00', '19:15 - 20:45'];

  // Extract unique options for filters
  const teachers = useMemo(() => Array.from(new Set(MOCK_SCHEDULE.map(s => s.teacher))), []);
  const rooms = useMemo(() => Array.from(new Set(MOCK_SCHEDULE.map(s => s.room))), []);

  // Filter logic
  const filteredSchedule = useMemo(() => {
    return MOCK_SCHEDULE.filter(session => {
      const matchTeacher = selectedTeacher ? session.teacher === selectedTeacher : true;
      const matchRoom = selectedRoom ? session.room === selectedRoom : true;
      return matchTeacher && matchRoom;
    });
  }, [selectedTeacher, selectedRoom]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print">
        
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
             <Calendar className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Thời khóa biểu</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <button className="hover:text-indigo-600 transition-colors"><ChevronLeft size={16} /></button>
                <span className="font-medium text-gray-700">{currentWeek}</span>
                <button className="hover:text-indigo-600 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Filters */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                <User size={16} className="text-gray-400" />
                <select 
                    className="bg-transparent border-none text-sm focus:outline-none text-gray-600 min-w-[120px] cursor-pointer"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                    <option value="">Tất cả giáo viên</option>
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                <MapPin size={16} className="text-gray-400" />
                <select 
                    className="bg-transparent border-none text-sm focus:outline-none text-gray-600 min-w-[100px] cursor-pointer"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                >
                    <option value="">Tất cả phòng</option>
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="h-8 w-px bg-gray-300 mx-1 hidden md:block"></div>

            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium shadow-sm"
            >
                <Printer size={16} />
                <span className="hidden sm:inline">In TKB</span>
            </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-r border-gray-100 bg-gray-50/80 text-xs font-bold uppercase text-gray-500 w-28 sticky left-0 z-10 backdrop-blur-sm">
                  Ca học
                </th>
                {days.map((day, index) => (
                  <th key={day} className={`p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase text-gray-500 min-w-[160px] ${index === 0 ? 'border-l' : ''}`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, shiftIndex) => (
                <tr key={shift}>
                  <td className="p-4 border-b border-r border-gray-100 text-xs font-bold text-gray-700 bg-gray-50/30 sticky left-0 z-10 backdrop-blur-sm">
                    {shift}
                  </td>
                  {days.map(day => {
                    const session = filteredSchedule.find(s => s.dayOfWeek === day && s.time === shift);
                    
                    return (
                      <td key={`${day}-${shift}`} className="p-2 border-b border-gray-100 h-36 align-top hover:bg-gray-50/50 transition-colors border-r last:border-r-0 relative group">
                        {session ? (
                          <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-3 h-full flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group-hover:scale-[1.02]">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-indigo-50">
                                    {session.room}
                                </span>
                              </div>
                              <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-1">{session.className}</p>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-indigo-100/50 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                                    {session.teacher.charAt(0)}
                                </div>
                                <p className="text-xs text-gray-600 truncate">{session.teacher}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full rounded-lg border-2 border-dashed border-transparent hover:border-gray-200 flex items-center justify-center group/add transition-all">
                             <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-300 group-hover/add:bg-indigo-600 group-hover/add:text-white flex items-center justify-center transition-all opacity-0 group-hover/add:opacity-100 no-print">
                                +
                             </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 mt-8">
        <p>Hệ thống quản lý đào tạo EduManager Pro</p>
        <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </div>
  );
};
