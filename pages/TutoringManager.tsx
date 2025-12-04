/**
 * Lịch Bồi Bài - Make-up Class Manager
 * Quản lý các buổi học kèm, bồi dưỡng kiến thức
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Clock, X, Check, Trash2, Users } from 'lucide-react';
import { useTutoring } from '../src/hooks/useTutoring';
import { TutoringData, TutoringType, TutoringStatus } from '../src/services/tutoringService';
import { useStudents } from '../src/hooks/useStudents';
import { useClasses } from '../src/hooks/useClasses';

export const TutoringManager: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTutoring, setSelectedTutoring] = useState<TutoringData | null>(null);
  const [filterStatus, setFilterStatus] = useState<TutoringStatus | ''>('');

  const { tutoringList, loading, error, createTutoring, scheduleTutoring, completeTutoring, deleteTutoring } = useTutoring({});
  const { students } = useStudents();
  const { classes } = useClasses();

  // Filter by status
  const filteredList = filterStatus 
    ? tutoringList.filter(t => t.status === filterStatus)
    : tutoringList;

  const getStatusBadge = (status: TutoringStatus) => {
    const styles: Record<TutoringStatus, { bg: string; text: string; label: string }> = {
      'Chưa bồi': { bg: 'bg-red-100', text: 'text-red-700', label: 'Chưa bồi' },
      'Đã hẹn': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã hẹn' },
      'Đã bồi': { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      'Hủy': { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Đã hủy' },
    };
    return styles[status];
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Xác nhận đã hoàn thành bồi bài?')) return;
    try {
      console.log('Completing tutoring:', id);
      await completeTutoring(id);
      alert('Đã cập nhật trạng thái thành công!');
    } catch (err: any) {
      console.error('Complete error:', err);
      alert(`Không thể cập nhật trạng thái: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa lịch bồi bài này?')) return;
    try {
      await deleteTutoring(id);
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpen className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Lịch bồi bài</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý các buổi học kèm, bồi dưỡng kiến thức</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Đặt hẹn lịch bồi
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Tất cả ({tutoringList.length})
        </button>
        <button
          onClick={() => setFilterStatus('Chưa bồi')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'Chưa bồi' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Chưa bồi ({tutoringList.filter(t => t.status === 'Chưa bồi').length})
        </button>
        <button
          onClick={() => setFilterStatus('Đã hẹn')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'Đã hẹn' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Đã hẹn ({tutoringList.filter(t => t.status === 'Đã hẹn').length})
        </button>
        <button
          onClick={() => setFilterStatus('Đã bồi')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'Đã bồi' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Hoàn thành ({tutoringList.filter(t => t.status === 'Đã bồi').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Lỗi: {error}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>Không có lịch bồi bài nào</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-indigo-600 hover:underline text-sm"
          >
            + Tạo lịch bồi bài mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((session) => {
            const badge = getStatusBadge(session.status);
            return (
              <div
                key={session.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {session.status === 'Chưa bồi' && (
                      <button
                        onClick={() => {
                          setSelectedTutoring(session);
                          setShowScheduleModal(true);
                        }}
                        className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded"
                        title="Đặt lịch"
                      >
                        <Calendar size={16} />
                      </button>
                    )}
                    {session.status === 'Đã hẹn' && (
                      <button
                        onClick={() => session.id && handleComplete(session.id)}
                        className="text-gray-400 hover:text-green-600 p-1.5 hover:bg-green-50 rounded"
                        title="Hoàn thành"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => session.id && handleDelete(session.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Users size={18} className="text-gray-300 ml-2" />
                  </div>
                </div>

                {/* Student Info */}
                <h3 className="font-bold text-gray-900 text-lg">{session.studentName}</h3>
                <p className="text-indigo-600 mb-4">{session.className}</p>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  {session.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{session.scheduledDate}</span>
                    </div>
                  )}
                  {session.scheduledTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{session.scheduledTime}</span>
                    </div>
                  )}
                  {session.tutorName && (
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span>GV: {session.tutorName}</span>
                    </div>
                  )}
                </div>

                {/* Note */}
                {session.note && (
                  <div className="mt-4 bg-yellow-50 p-3 rounded-lg text-sm text-gray-600 italic border border-yellow-100">
                    "{session.note}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTutoringModal
          students={students}
          classes={classes}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await createTutoring(data);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedTutoring && (
        <ScheduleModal
          tutoring={selectedTutoring}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedTutoring(null);
          }}
          onSubmit={async (date, time, tutorId, tutorName) => {
            if (selectedTutoring.id) {
              await scheduleTutoring(selectedTutoring.id, date, time, tutorId, tutorName);
            }
            setShowScheduleModal(false);
            setSelectedTutoring(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================
// CREATE TUTORING MODAL
// ============================================
interface CreateModalProps {
  students: Array<{ id: string; fullName: string; class?: string }>;
  classes: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: Omit<TutoringData, 'id'>) => Promise<void>;
}

const CreateTutoringModal: React.FC<CreateModalProps> = ({ students, classes, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'Nghỉ học' as TutoringType,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '15:00',
    tutorName: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const selectedClass = classes.find(c => c.name === selectedStudent?.class);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setLoading(true);
      await onSubmit({
        studentId: formData.studentId,
        studentName: selectedStudent.fullName,
        classId: selectedClass?.id || '',
        className: selectedStudent.class || '',
        type: formData.type,
        status: formData.tutorName ? 'Đã hẹn' : 'Chưa bồi',
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        tutorName: formData.tutorName,
        note: formData.note,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg font-bold text-gray-800">Đặt hẹn lịch bồi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Học sinh <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} - {s.class || 'Chưa có lớp'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bồi</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bồi</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên bồi</label>
            <input
              type="text"
              value={formData.tutorName}
              onChange={(e) => setFormData({ ...formData, tutorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Tên giáo viên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bồi</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Ôn tập Unit 3..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.studentId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Đặt hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// SCHEDULE MODAL
// ============================================
interface ScheduleModalProps {
  tutoring: TutoringData;
  onClose: () => void;
  onSubmit: (date: string, time: string, tutorId: string, tutorName: string) => Promise<void>;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ tutoring, onClose, onSubmit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(date, time, '', tutorName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold text-gray-800">Đặt lịch bồi bài</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Học sinh</p>
            <p className="font-bold text-gray-900">{tutoring.studentName}</p>
            <p className="text-sm text-indigo-600">{tutoring.className}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bồi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ bồi <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giáo viên bồi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tutorName}
              onChange={(e) => setTutorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Tên giáo viên bồi bài"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !tutorName}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
