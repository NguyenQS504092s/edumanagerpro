import React from 'react';
import { BookOpen, Plus, UserCheck, Calendar, Clock } from 'lucide-react';
import { MOCK_TUTORING } from '../mockData';

export const TutoringManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Lịch bồi bài
            </h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý các buổi học kèm, bồi dưỡng kiến thức</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          <Plus size={18} />
          Đặt hẹn lịch bồi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_TUTORING.map((session) => (
            <div key={session.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${session.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {session.status}
                    </span>
                    <button className="text-gray-400 hover:text-indigo-600">
                        <UserCheck size={18}/>
                    </button>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{session.studentName}</h3>
                <p className="text-sm text-indigo-600 mb-4">{session.className}</p>
                
                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400"/>
                        <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400"/>
                        <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-gray-400"/>
                        <span>GV: {session.teacher}</span>
                    </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-2 rounded text-xs text-gray-500 italic">
                    "{session.content}"
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};