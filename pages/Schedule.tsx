import React, { useState, useMemo } from 'react';
import { Printer, ChevronLeft, ChevronRight, ChevronDown, Plus, X, MapPin } from 'lucide-react';
import { useClasses } from '../src/hooks/useClasses';
import { ClassModel } from '../types';

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
  const branches = [
    { id: 'Cơ sở 1', name: 'Cơ sở 1', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { id: 'Cơ sở 2', name: 'Cơ sở 2', color: 'bg-blue-500', textColor: 'text-blue-700' },
    { id: 'Cơ sở 3', name: 'Cơ sở 3', color: 'bg-amber-500', textColor: 'text-amber-700' },
  ];
  const selectedBranchData = branches.find(b => b.id === selectedBranch) || branches[0];

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
  // Supports: "15:00-16:30 Thứ 3, Thứ 5", "08:00-09:30 Thứ 2, 4, 6", "Chủ nhật"
  const parseDaysFromSchedule = (schedule: string): number[] => {
    if (!schedule) return [];
    
    const days: number[] = [];
    
    // Handle "Chủ nhật" or "CN"
    if (/ch[uủ]\s*nh[aậ]t|CN/i.test(schedule)) {
      days.push(7);
    }
    
    // Find all "Thứ X" patterns
    const thuMatches = schedule.matchAll(/Th[ứử]\s*(\d)/gi);
    for (const match of thuMatches) {
      const dayNum = parseInt(match[1]);
      if (dayNum >= 2 && dayNum <= 7 && !days.includes(dayNum)) {
        days.push(dayNum);
      }
    }
    
    // Also find standalone numbers after comma (e.g., "Thứ 2, 4, 6")
    const afterThu = schedule.match(/Th[ứử]\s*\d[\s,]*([,\s\d]+)/i);
    if (afterThu) {
      const extraDays = afterThu[1].match(/\d/g);
      if (extraDays) {
        for (const d of extraDays) {
          const dayNum = parseInt(d);
          if (dayNum >= 2 && dayNum <= 7 && !days.includes(dayNum)) {
            days.push(dayNum);
          }
        }
      }
    }
    
    return days.sort((a, b) => a - b);
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 rounded-xl shadow-lg no-print">
        <div className="flex items-center gap-4">
          {/* Branch Selector - Redesigned with color */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${selectedBranchData.color} ring-2 ring-white/50`}></div>
            <MapPin className="text-white/80" size={18} />
            <span className="text-white/90 text-sm font-medium">Cơ sở:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white text-gray-800 border-0 rounded-md px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>● {b.name}</option>
              ))}
            </select>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <button onClick={prevWeek} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-sm font-medium text-white min-w-[180px] text-center">
              {weekDisplay}
            </span>
            <button onClick={nextWeek} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 text-sm font-bold shadow-md transition-colors"
        >
          <Printer size={16} />
          In TKB
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Branch Title with dynamic color */}
        <div className={`${
          selectedBranch === 'Cơ sở 1' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
          selectedBranch === 'Cơ sở 2' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          'bg-gradient-to-r from-amber-500 to-amber-600'
        } text-white text-center py-3 text-xl font-bold flex items-center justify-center gap-3`}>
          <div className="w-4 h-4 rounded-full bg-white/30"></div>
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
                            
                            return (
                              <div 
                                key={cls.id}
                                className="bg-blue-50 p-2 rounded text-xs border border-blue-200 cursor-pointer hover:shadow-md hover:bg-blue-100 transition-all"
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

      {/* Print Footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 mt-8">
        <p>Hệ thống quản lý đào tạo EduManager Pro</p>
        <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </div>
  );
};
