/**
 * Attendance Page
 * Điểm danh với 4 trạng thái: Có mặt, Vắng, Bảo lưu, Đã bồi
 * Logic: Vắng → Auto tạo record bồi bài
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, AlertCircle, Clock, BookOpen, Users } from 'lucide-react';
import { AttendanceStatus, AttendanceRecord } from '../types';
import { useClasses } from '../src/hooks/useClasses';
import { useStudents } from '../src/hooks/useStudents';
import { useAttendance } from '../src/hooks/useAttendance';
import { useAuth } from '../src/hooks/useAuth';

interface StudentAttendanceState {
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  note: string;
}

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { classes, loading: classLoading } = useClasses();
  const { students: allStudents, loading: studentLoading } = useStudents();
  const { checkExisting, loadStudentAttendance, studentAttendance, saveAttendance } = useAttendance();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceState[]>([]);
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get students for selected class
  const classStudents = allStudents.filter(s => s.class === classes.find(c => c.id === selectedClassId)?.name);

  // Initialize attendance data when class/date changes
  useEffect(() => {
    if (!selectedClassId || classStudents.length === 0) {
      setAttendanceData([]);
      return;
    }

    const initData = async () => {
      // Check if attendance exists
      const existing = await checkExisting(selectedClassId, attendanceDate);
      setExistingRecord(existing);

      if (existing) {
        // Load existing attendance
        await loadStudentAttendance(existing.id);
      } else {
        // Initialize empty attendance
        setAttendanceData(
          classStudents.map(s => ({
            studentId: s.id,
            studentName: s.fullName,
            studentCode: s.code,
            status: AttendanceStatus.PRESENT,
            note: '',
          }))
        );
      }
    };

    initData();
  }, [selectedClassId, attendanceDate, classStudents.length]);

  // Sync with loaded student attendance
  useEffect(() => {
    if (studentAttendance.length > 0 && existingRecord) {
      setAttendanceData(
        classStudents.map(s => {
          const existing = studentAttendance.find(sa => sa.studentId === s.id);
          return {
            studentId: s.id,
            studentName: s.fullName,
            studentCode: s.code,
            status: existing?.status || AttendanceStatus.PRESENT,
            note: existing?.note || '',
          };
        })
      );
    }
  }, [studentAttendance, existingRecord]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, note } : s))
    );
  };

  const handleBulkStatus = (status: AttendanceStatus) => {
    setAttendanceData(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    if (!selectedClassId || attendanceData.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn lớp và học sinh' });
      return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    try {
      setSaving(true);
      setMessage(null);

      const absentCount = attendanceData.filter(s => s.status === AttendanceStatus.ABSENT).length;

      await saveAttendance(
        {
          classId: selectedClassId,
          className: selectedClass.name,
          date: attendanceDate,
          totalStudents: attendanceData.length,
          present: attendanceData.filter(s => s.status === AttendanceStatus.PRESENT).length,
          absent: absentCount,
          reserved: attendanceData.filter(s => s.status === AttendanceStatus.RESERVED).length,
          tutored: attendanceData.filter(s => s.status === AttendanceStatus.TUTORED).length,
          status: 'Đã điểm danh',
          createdBy: user?.uid,
        },
        attendanceData
      );

      setMessage({
        type: 'success',
        text: absentCount > 0
          ? `Lưu thành công! Đã tạo ${absentCount} lịch bồi bài cho học sinh vắng.`
          : 'Lưu điểm danh thành công!',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể lưu điểm danh. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status: AttendanceStatus, current: AttendanceStatus) => {
    const isActive = status === current;
    const styles: Record<AttendanceStatus, string> = {
      [AttendanceStatus.PRESENT]: isActive
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-white text-green-600 border-green-300 hover:bg-green-50',
      [AttendanceStatus.ABSENT]: isActive
        ? 'bg-red-600 text-white border-red-600'
        : 'bg-white text-red-600 border-red-300 hover:bg-red-50',
      [AttendanceStatus.RESERVED]: isActive
        ? 'bg-orange-500 text-white border-orange-500'
        : 'bg-white text-orange-500 border-orange-300 hover:bg-orange-50',
      [AttendanceStatus.TUTORED]: isActive
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50',
    };
    return styles[status];
  };

  // Stats
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(s => s.status === AttendanceStatus.PRESENT).length,
    absent: attendanceData.filter(s => s.status === AttendanceStatus.ABSENT).length,
    reserved: attendanceData.filter(s => s.status === AttendanceStatus.RESERVED).length,
    tutored: attendanceData.filter(s => s.status === AttendanceStatus.TUTORED).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={24} />
            Điểm danh lớp học
          </h2>
          <p className="text-sm text-gray-500">4 trạng thái: Có mặt, Vắng, Bảo lưu, Đã bồi</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={classLoading}
          >
            <option value="">-- Chọn lớp --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Existing Record Notice */}
      {existingRecord && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2 text-yellow-800">
          <Clock size={20} />
          <span>
            Đã có điểm danh cho lớp này vào ngày {new Date(existingRecord.date).toLocaleDateString('vi-VN')}.
            Thay đổi sẽ cập nhật bản ghi hiện tại.
          </span>
        </div>
      )}

      {!selectedClassId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p>Vui lòng chọn lớp để bắt đầu điểm danh</p>
        </div>
      ) : studentLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải danh sách học sinh...</p>
        </div>
      ) : classStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>Không có học sinh trong lớp này</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Stats Header */}
          <div className="grid grid-cols-5 border-b border-gray-100 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold">Tổng số</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-4 text-center bg-green-50">
              <p className="text-xs text-green-600 uppercase font-bold">Có mặt</p>
              <p className="text-xl font-bold text-green-700">{stats.present}</p>
            </div>
            <div className="p-4 text-center bg-red-50">
              <p className="text-xs text-red-600 uppercase font-bold">Vắng</p>
              <p className="text-xl font-bold text-red-700">{stats.absent}</p>
            </div>
            <div className="p-4 text-center bg-orange-50">
              <p className="text-xs text-orange-600 uppercase font-bold">Bảo lưu</p>
              <p className="text-xl font-bold text-orange-700">{stats.reserved}</p>
            </div>
            <div className="p-4 text-center bg-blue-50">
              <p className="text-xs text-blue-600 uppercase font-bold">Đã bồi</p>
              <p className="text-xl font-bold text-blue-700">{stats.tutored}</p>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Điểm danh nhanh:</span>
            <button
              onClick={() => handleBulkStatus(AttendanceStatus.PRESENT)}
              className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200"
            >
              Tất cả có mặt
            </button>
            <button
              onClick={() => handleBulkStatus(AttendanceStatus.ABSENT)}
              className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200"
            >
              Tất cả vắng
            </button>
          </div>

          {/* Table */}
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
              {attendanceData.map((student, index) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{student.studentName}</p>
                      <p className="text-xs text-gray-500">{student.studentCode}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleStatusChange(student.studentId, AttendanceStatus.PRESENT)}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusStyle(AttendanceStatus.PRESENT, student.status)}`}
                      >
                        Có mặt
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.studentId, AttendanceStatus.ABSENT)}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusStyle(AttendanceStatus.ABSENT, student.status)}`}
                        title="Vắng sẽ tự động tạo lịch bồi bài"
                      >
                        Vắng
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.studentId, AttendanceStatus.RESERVED)}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusStyle(AttendanceStatus.RESERVED, student.status)}`}
                      >
                        Bảo lưu
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.studentId, AttendanceStatus.TUTORED)}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${getStatusStyle(AttendanceStatus.TUTORED, student.status)}`}
                      >
                        Đã bồi
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      value={student.note}
                      onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-indigo-500 outline-none bg-transparent py-1 text-gray-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center sticky bottom-0">
            <div className="text-sm text-gray-500">
              {stats.absent > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <BookOpen size={16} />
                  {stats.absent} học sinh vắng sẽ được tạo lịch bồi bài tự động
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAttendanceData(
                  classStudents.map(s => ({
                    studentId: s.id,
                    studentName: s.fullName,
                    studentCode: s.code,
                    status: AttendanceStatus.PRESENT,
                    note: '',
                  }))
                )}
                className="px-6 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || attendanceData.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Lưu điểm danh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
