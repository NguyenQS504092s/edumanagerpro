/**
 * Tutoring Manager Page
 * 2 tabs: Nghỉ học / Học yếu
 * Đặt lịch bồi + Trạng thái: Chưa bồi → Đã hẹn → Đã bồi
 */

import React, { useState } from 'react';
import { BookOpen, Plus, UserCheck, Calendar, Clock, X, Check, Trash2, Edit } from 'lucide-react';
import { useTutoring } from '../src/hooks/useTutoring';
import { TutoringData, TutoringType, TutoringStatus } from '../src/services/tutoringService';
import { useStudents } from '../src/hooks/useStudents';
import { useClasses } from '../src/hooks/useClasses';

export const TutoringManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TutoringType>('Nghỉ học');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTutoring, setSelectedTutoring] = useState<TutoringData | null>(null);

  const { tutoringList, loading, error, createTutoring, scheduleTutoring, completeTutoring, cancelTutoring, deleteTutoring } = useTutoring({ type: activeTab });
  const { students } = useStudents();
  const { classes } = useClasses();

  const getStatusBadge = (status: TutoringStatus) => {
    const styles: Record<TutoringStatus, string> = {
      'Chưa bồi': 'bg-red-100 text-red-700',
      'Đã hẹn': 'bg-blue-100 text-blue-700',
      'Đã bồi': 'bg-green-100 text-green-700',
      'Hủy': 'bg-gray-100 text-gray-700',
    };
    return styles[status];
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Xác nhận đã hoàn thành bồi bài?')) return;
    try {
      await completeTutoring(id);
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Xác nhận hủy lịch bồi bài này?')) return;
    try {
      await cancelTutoring(id, 'Hủy bởi người dùng');
    } catch (err) {
      alert('Không thể hủy lịch');
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

  // Stats
  const stats = {
    pending: tutoringList.filter(t => t.status === 'Chưa bồi').length,
    scheduled: tutoringList.filter(t => t.status === 'Đã hẹn').length,
    completed: tutoringList.filter(t => t.status === 'Đã bồi').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Lịch bồi bài
          </h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý bồi dưỡng cho học sinh vắng và học yếu</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Tạo lịch bồi
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('Nghỉ học')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'Nghỉ học'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              Nghỉ học
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                {tutoringList.filter(t => t.type === 'Nghỉ học').length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('Học yếu')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'Học yếu'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <BookOpen size={18} />
              Học yếu
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                {tutoringList.filter(t => t.type === 'Học yếu').length}
              </span>
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-gray-100 divide-x divide-gray-100">
          <div className="p-4 text-center">
            <p className="text-xs text-red-600 uppercase font-bold">Chưa bồi</p>
            <p className="text-xl font-bold text-red-700">{stats.pending}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-blue-600 uppercase font-bold">Đã hẹn</p>
            <p className="text-xl font-bold text-blue-700">{stats.scheduled}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-green-600 uppercase font-bold">Đã bồi</p>
            <p className="text-xl font-bold text-green-700">{stats.completed}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Lỗi: {error}
            </div>
          ) : tutoringList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>Không có lịch bồi bài nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutoringList.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadge(session.status)}`}>
                      {session.status}
                    </span>
                    <div className="flex gap-1">
                      {session.status === 'Chưa bồi' && (
                        <button
                          onClick={() => {
                            setSelectedTutoring(session);
                            setShowScheduleModal(true);
                          }}
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="Đặt lịch"
                        >
                          <Calendar size={16} />
                        </button>
                      )}
                      {session.status === 'Đã hẹn' && (
                        <button
                          onClick={() => session.id && handleComplete(session.id)}
                          className="text-gray-400 hover:text-green-600 p-1"
                          title="Hoàn thành"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {session.status !== 'Đã bồi' && session.status !== 'Hủy' && (
                        <button
                          onClick={() => session.id && handleCancel(session.id)}
                          className="text-gray-400 hover:text-orange-600 p-1"
                          title="Hủy"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => session.id && handleDelete(session.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1">{session.studentName}</h3>
                  <p className="text-sm text-indigo-600 mb-4">{session.className}</p>

                  <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {session.absentDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Vắng: {new Date(session.absentDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    {session.scheduledDate && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" />
                        <span>
                          Lịch bồi: {new Date(session.scheduledDate).toLocaleDateString('vi-VN')}
                          {session.scheduledTime && ` - ${session.scheduledTime}`}
                        </span>
                      </div>
                    )}
                    {session.tutorName && (
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-gray-400" />
                        <span>GV: {session.tutorName}</span>
                      </div>
                    )}
                  </div>

                  {session.note && (
                    <div className="mt-4 bg-gray-50 p-2 rounded text-xs text-gray-500 italic">
                      "{session.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

// Create Tutoring Modal
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
        status: 'Chưa bồi',
        note: formData.note,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Tạo lịch bồi bài</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại bồi bài <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.type === 'Nghỉ học'}
                  onChange={() => setFormData({ ...formData, type: 'Nghỉ học' })}
                  className="text-indigo-600"
                />
                <span>Nghỉ học</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.type === 'Học yếu'}
                  onChange={() => setFormData({ ...formData, type: 'Học yếu' })}
                  className="text-indigo-600"
                />
                <span>Học yếu</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Lý do cần bồi bài..."
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
              {loading ? 'Đang tạo...' : 'Tạo lịch bồi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Schedule Modal
interface ScheduleModalProps {
  tutoring: TutoringData;
  onClose: () => void;
  onSubmit: (date: string, time: string, tutorId: string, tutorName: string) => Promise<void>;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ tutoring, onClose, onSubmit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
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
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Đặt lịch bồi bài</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
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
              Người bồi <span className="text-red-500">*</span>
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
