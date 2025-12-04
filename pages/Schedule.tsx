import React, { useState, useMemo } from 'react';
import { Printer, ChevronLeft, ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { useClasses } from '../src/hooks/useClasses';
import { ClassModel } from '../types';

// Color palette for teachers
const TEACHER_COLORS: Record<string, string> = {
  'default': 'bg-gray-100',
  'Maria': 'bg-yellow-200',
  'Habib': 'bg-pink-200',
  'Thu Hà': 'bg-green-200',
  'Thuý Nga': 'bg-cyan-200',
  'Diệu Linh': 'bg-purple-200',
  'Minh Huyền': 'bg-orange-200',
  'Ngọc Ánh': 'bg-lime-200',
  'Uyên Trang': 'bg-rose-200',
  'Thu Trang': 'bg-teal-200',
  'Thuý': 'bg-amber-200',
  'Tiên': 'bg-emerald-200',
  'Linh': 'bg-sky-200',
  'Mai': 'bg-indigo-200',
  'Điệp': 'bg-fuchsia-200',
};

const getTeacherColor = (teacher: string): string => {
  return TEACHER_COLORS[teacher] || TEACHER_COLORS['default'];
};

export const Schedule: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('Cơ sở 1');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const { classes } = useClasses({});

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const branches = ['Cơ sở 1', 'Cơ sở 2', 'Cơ sở 3'];

  // Format week display
  const weekDisplay = useMemo(() => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 4);
    return `${currentWeekStart.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`;
  }, [currentWeekStart]);

  // Navigate weeks
  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Parse days from schedule string (e.g., "18:00-19:00 Thứ 2, 4" -> [2, 4])
  const parseDaysFromSchedule = (schedule: string): number[] => {
    if (!schedule) return [];
    
    // Find the day part after time (e.g., "Thứ 2, 4" or "Thứ 2, 5")
    const dayMatch = schedule.match(/Th[ứử]\s*(\d)(?:\s*,\s*(\d))?/i);
    if (!dayMatch) return [];
    
    const days: number[] = [];
    if (dayMatch[1]) days.push(parseInt(dayMatch[1]));
    if (dayMatch[2]) days.push(parseInt(dayMatch[2]));
    
    return days;
  };

  // Map day name to number
  const dayNameToNumber: Record<string, number> = {
    'Thứ 2': 2,
    'Thứ 3': 3,
    'Thứ 4': 4,
    'Thứ 5': 5,
    'Thứ 6': 6,
  };

  // Group classes by day
  const scheduleByDay = useMemo(() => {
    const result: Record<string, ClassModel[]> = {};
    days.forEach(day => {
      const dayNumber = dayNameToNumber[day];
      result[day] = classes.filter(cls => {
        const scheduleDays = parseDaysFromSchedule(cls.schedule || '');
        return scheduleDays.includes(dayNumber);
      });
    });
    return result;
  }, [classes]);

  const handlePrint = () => {
    window.print();
  };

  // Parse class info for display
  const parseClassDisplay = (cls: ClassModel) => {
    const schedule = cls.schedule || '';
    const timeMatch = schedule.match(/(\d{1,2}[h:]\d{2}\s*-\s*\d{1,2}[h:]\d{2})/);
    const time = timeMatch ? timeMatch[0] : '17:30 - 19:00';
    
    return {
      time,
      year: cls.ageGroup || '',
      className: cls.name,
      teacher: cls.teacher,
      room: cls.room || '',
      foreignTeacher: cls.foreignTeacher,
      assistant: cls.assistant,
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 no-print">
        <div className="flex items-center gap-4">
          {/* Branch Selector */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="appearance-none bg-indigo-600 text-white px-4 py-2 pr-10 rounded-lg font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={18} />
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[180px] text-center">
              {weekDisplay}
            </span>
            <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm font-medium"
        >
          <Printer size={16} />
          In TKB
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Branch Title */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center py-3 text-xl font-bold">
          {selectedBranch} (Ô 40 - LK4)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {days.map((day, index) => (
                  <th 
                    key={day} 
                    className="p-3 border border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 min-w-[200px]"
                    style={{ width: '20%' }}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map(day => {
                  const dayClasses = scheduleByDay[day] || [];
                  
                  return (
                    <td key={day} className="border border-gray-300 p-1 align-top" style={{ verticalAlign: 'top' }}>
                      <div className="space-y-1 min-h-[500px]">
                        {dayClasses.length > 0 ? (
                          dayClasses.map((cls) => {
                            const info = parseClassDisplay(cls);
                            const bgColor = getTeacherColor(info.teacher);
                            
                            return (
                              <div 
                                key={cls.id}
                                className={`${bgColor} p-2 rounded text-xs border border-gray-300 cursor-pointer hover:shadow-md transition-shadow`}
                              >
                                <p className="font-bold text-gray-800">
                                  {info.time} {info.year && `(${info.year})`} {info.className} ({info.room})
                                  {info.teacher && ` - ${info.teacher}`}
                                </p>
                                {info.foreignTeacher && (
                                  <p className="text-gray-700">
                                    GVNN: {info.foreignTeacher}
                                  </p>
                                )}
                                {info.assistant && (
                                  <p className="text-gray-700">
                                    TG: {info.assistant}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                            Chưa có lịch
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 no-print">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Chú thích màu giáo viên:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TEACHER_COLORS).filter(([k]) => k !== 'default').map(([teacher, color]) => (
            <div key={teacher} className={`${color} px-3 py-1 rounded text-xs font-medium text-gray-700 border border-gray-200`}>
              {teacher}
            </div>
          ))}
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
