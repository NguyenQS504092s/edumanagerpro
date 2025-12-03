/**
 * Training Report Page
 * Báo cáo đào tạo - thống kê từ attendance, tutoring, classes
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Calendar, TrendingUp, Clock, Award } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { formatCurrency } from '../src/utils/currencyUtils';

interface TrainingSummary {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  attendanceRate: number;
  tutoringCount: number;
  completedTutoring: number;
}

interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
  sessionCount: number;
  attendanceRate: number;
  status: string;
}

export const TrainingReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TrainingSummary>({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalSessions: 0,
    attendanceRate: 0,
    tutoringCount: 0,
    completedTutoring: 0,
  });
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all collections
      const [classesSnap, studentsSnap, attendanceSnap, tutoringSnap] = await Promise.all([
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'tutoring')),
      ]);

      const classes = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const attendance = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const tutoring = tutoringSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Calculate summary
      const activeClasses = classes.filter((c: any) => c.status === 'Active' || c.status === 'Đang học').length;
      const activeStudents = students.filter((s: any) => s.status === 'Active' || s.status === 'Đang học').length;
      
      // Attendance rate calculation
      let totalPresent = 0;
      let totalRecords = 0;
      attendance.forEach((a: any) => {
        if (a.records) {
          const records = Array.isArray(a.records) ? a.records : Object.values(a.records);
          records.forEach((r: any) => {
            totalRecords++;
            if (r.status === 'Present' || r.status === 'Có mặt') {
              totalPresent++;
            }
          });
        }
      });
      const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

      // Tutoring stats
      const completedTutoring = tutoring.filter((t: any) => t.status === 'Đã bồi' || t.status === 'Completed').length;

      setSummary({
        totalClasses: classes.length,
        activeClasses,
        totalStudents: students.length,
        activeStudents,
        totalSessions: attendance.length,
        attendanceRate,
        tutoringCount: tutoring.length,
        completedTutoring,
      });

      // Class summaries
      const classData: ClassSummary[] = classes.slice(0, 10).map((c: any) => {
        const classAttendance = attendance.filter((a: any) => a.classId === c.id);
        let present = 0;
        let total = 0;
        classAttendance.forEach((a: any) => {
          if (a.records) {
            const records = Array.isArray(a.records) ? a.records : Object.values(a.records);
            records.forEach((r: any) => {
              total++;
              if (r.status === 'Present' || r.status === 'Có mặt') present++;
            });
          }
        });
        
        return {
          id: c.id,
          name: c.name || 'N/A',
          studentCount: c.currentStudents || 0,
          sessionCount: classAttendance.length,
          attendanceRate: total > 0 ? (present / total) * 100 : 0,
          status: c.status || 'N/A',
        };
      });

      setClassSummaries(classData);
    } catch (err) {
      console.error('Error fetching training data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Lỗi: {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <BarChart3 className="text-indigo-600" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Báo cáo đào tạo</h2>
          <p className="text-sm text-gray-500">Tổng hợp số liệu từ lớp học, điểm danh, bồi bài</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<BookOpen size={20} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Lớp học"
          value={`${summary.activeClasses}/${summary.totalClasses}`}
          subtext="Đang hoạt động"
        />
        <SummaryCard
          icon={<Users size={20} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Học viên"
          value={`${summary.activeStudents}/${summary.totalStudents}`}
          subtext="Đang học"
        />
        <SummaryCard
          icon={<Calendar size={20} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Buổi học"
          value={summary.totalSessions.toString()}
          subtext="Đã điểm danh"
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Tỷ lệ đi học"
          value={`${summary.attendanceRate.toFixed(1)}%`}
          subtext="Trung bình"
        />
      </div>

      {/* Tutoring Stats */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-xl text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Thống kê bồi bài
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-3xl font-bold">{summary.tutoringCount}</div>
            <div className="text-cyan-100 text-sm">Tổng yêu cầu bồi</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{summary.completedTutoring}</div>
            <div className="text-cyan-100 text-sm">Đã hoàn thành</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {summary.tutoringCount > 0 
                ? `${((summary.completedTutoring / summary.tutoringCount) * 100).toFixed(0)}%`
                : '0%'}
            </div>
            <div className="text-cyan-100 text-sm">Tỷ lệ hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Class Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Award size={18} />
            Chi tiết theo lớp (Top 10)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Lớp</th>
                <th className="px-4 py-3 text-center">Học viên</th>
                <th className="px-4 py-3 text-center">Số buổi</th>
                <th className="px-4 py-3 text-center">Tỷ lệ đi học</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Chưa có dữ liệu lớp học
                  </td>
                </tr>
              ) : classSummaries.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-4 py-3 text-center">{cls.studentCount}</td>
                  <td className="px-4 py-3 text-center">{cls.sessionCount}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cls.attendanceRate >= 80 ? 'bg-green-500' :
                            cls.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, cls.attendanceRate)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{cls.attendanceRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      cls.status === 'Active' || cls.status === 'Đang học'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cls.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Summary Card
interface SummaryCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subtext: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, iconBg, iconColor, label, value, subtext }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div className="flex items-center gap-3">
      <div className={`${iconBg} p-2 rounded-lg ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{subtext}</p>
      </div>
    </div>
  </div>
);
