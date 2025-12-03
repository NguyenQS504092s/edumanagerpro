import React, { useState } from 'react';
import { Calendar, Search, Save, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../mockData';
import { Modal } from '../components/Modal';

export const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentStudentForNote, setCurrentStudentForNote] = useState<string | null>(null);

  // Filter students (In a real app, this would fetch students for the specific class)
  // Here we just mock it by taking the first 10 students or all if less
  const students = MOCK_STUDENTS.slice(0, 10);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const getStatusClass = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const currentStatus = attendanceData[studentId];
    if (currentStatus === status) {
      switch(status) {
        case 'present': return 'bg-green-600 text-white border-green-600';
        case 'absent': return 'bg-red-600 text-white border-red-600';
        case 'late': return 'bg-yellow-500 text-white border-yellow-500';
      }
    }
    return 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
           <h2 className="text-lg font-bold text-gray-800">Điểm danh lớp học</h2>
           <p className="text-sm text-gray-500">Ghi nhận sự hiện diện của học viên</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <select 
             className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
             value={selectedClass}
             onChange={(e) => setSelectedClass(e.target.value)}
           >
             {MOCK_CLASSES.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
           <div className="relative">
             <input 
               type="date" 
               className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
               value={attendanceDate}
               onChange={(e) => setAttendanceDate(e.target.value)}
             />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Stats Header */}
        <div className="grid grid-cols-4 border-b border-gray-100 divide-x divide-gray-100">
           <div className="p-4 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Tổng số</p>
              <p className="text-xl font-bold text-gray-800">{students.length}</p>
           </div>
           <div className="p-4 text-center bg-green-50">
              <p className="text-xs text-green-600 uppercase font-bold">Có mặt</p>
              <p className="text-xl font-bold text-green-700">
                {Object.values(attendanceData).filter(s => s === 'present').length}
              </p>
           </div>
           <div className="p-4 text-center bg-red-50">
              <p className="text-xs text-red-600 uppercase font-bold">Vắng mặt</p>
              <p className="text-xl font-bold text-red-700">
                {Object.values(attendanceData).filter(s => s === 'absent').length}
              </p>
           </div>
           <div className="p-4 text-center bg-yellow-50">
              <p className="text-xs text-yellow-600 uppercase font-bold">Đi muộn</p>
              <p className="text-xl font-bold text-yellow-700">
                {Object.values(attendanceData).filter(s => s === 'late').length}
              </p>
           </div>
        </div>

        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4 w-16">STT</th>
              <th className="px-6 py-4">Học viên</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.code}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusClass(student.id, 'present')}`}
                      >
                        Có mặt
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusClass(student.id, 'absent')}`}
                      >
                        Vắng
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusClass(student.id, 'late')}`}
                      >
                        Muộn
                      </button>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    placeholder="Ghi chú..." 
                    className="w-full border-b border-gray-200 focus:border-indigo-500 outline-none bg-transparent py-1 text-gray-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
           <button className="px-6 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50">
              Hủy bỏ
           </button>
           <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2">
              <Save size={18} /> Lưu điểm danh
           </button>
        </div>
      </div>
    </div>
  );
};