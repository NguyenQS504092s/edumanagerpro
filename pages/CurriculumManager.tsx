/**
 * Curriculum Manager Page
 * Quản lý giáo trình/chương trình học
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, Clock, Users, DollarSign } from 'lucide-react';
import * as curriculumService from '../src/services/curriculumService';
import { Curriculum, CurriculumLevel, CurriculumStatus } from '../src/services/curriculumService';
import { formatCurrency } from '../src/utils/currencyUtils';

const LEVEL_COLORS: Record<CurriculumLevel, string> = {
  'Beginner': 'bg-green-100 text-green-700',
  'Elementary': 'bg-blue-100 text-blue-700',
  'Intermediate': 'bg-orange-100 text-orange-700',
  'Advanced': 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS: Record<CurriculumStatus, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-600',
  'Draft': 'bg-yellow-100 text-yellow-700',
};

export const CurriculumManager: React.FC = () => {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await curriculumService.getCurriculums();
      setCurriculums(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa giáo trình này?')) return;
    try {
      await curriculumService.deleteCurriculum(id);
      await fetchCurriculums();
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  // Filter
  const filteredCurriculums = curriculums.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCurriculums = curriculums.filter(c => c.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Quản lý giáo trình</h2>
              <p className="text-sm text-gray-500">Thiết lập chương trình học</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              {activeCurriculums.length} đang hoạt động
            </span>
            <button
              onClick={() => { setEditingCurriculum(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              <Plus size={16} /> Thêm giáo trình
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã giáo trình..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Curriculum Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Đang tải...
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-red-500">
          Lỗi: {error}
        </div>
      ) : filteredCurriculums.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <BookOpen size={48} className="mx-auto mb-2 opacity-20" />
          Chưa có giáo trình nào
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCurriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{curriculum.name}</h3>
                    <span className="text-xs font-mono text-gray-500">{curriculum.code}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingCurriculum(curriculum); setShowModal(true); }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => curriculum.id && handleDelete(curriculum.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {curriculum.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{curriculum.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[curriculum.level]}`}>
                    {curriculum.level}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[curriculum.status]}`}>
                    {curriculum.status === 'Active' ? 'Hoạt động' : curriculum.status === 'Inactive' ? 'Tạm dừng' : 'Nháp'}
                  </span>
                  {curriculum.ageRange && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      <Users size={10} className="inline mr-1" />
                      {curriculum.ageRange}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{curriculum.duration}</div>
                    <div className="text-xs text-gray-500">tháng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{curriculum.totalSessions}</div>
                    <div className="text-xs text-gray-500">buổi</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{curriculum.sessionDuration}</div>
                    <div className="text-xs text-gray-500">phút/buổi</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Học phí:</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(curriculum.tuitionFee)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CurriculumModal
          curriculum={editingCurriculum}
          onClose={() => { setShowModal(false); setEditingCurriculum(null); }}
          onSubmit={async (data) => {
            if (editingCurriculum?.id) {
              await curriculumService.updateCurriculum(editingCurriculum.id, data);
            } else {
              await curriculumService.createCurriculum(data as Omit<Curriculum, 'id'>);
            }
            await fetchCurriculums();
            setShowModal(false);
            setEditingCurriculum(null);
          }}
        />
      )}
    </div>
  );
};

// Curriculum Modal
interface CurriculumModalProps {
  curriculum?: Curriculum | null;
  onClose: () => void;
  onSubmit: (data: Partial<Curriculum>) => Promise<void>;
}

const CurriculumModal: React.FC<CurriculumModalProps> = ({ curriculum, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: curriculum?.name || '',
    code: curriculum?.code || '',
    description: curriculum?.description || '',
    level: curriculum?.level || 'Beginner' as CurriculumLevel,
    ageRange: curriculum?.ageRange || '',
    duration: curriculum?.duration || 3,
    totalSessions: curriculum?.totalSessions || 24,
    sessionDuration: curriculum?.sessionDuration || 90,
    tuitionFee: curriculum?.tuitionFee || 0,
    status: curriculum?.status || 'Active' as CurriculumStatus,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-800">
            {curriculum ? 'Sửa giáo trình' : 'Thêm giáo trình'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên giáo trình <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Tiếng Anh Mầm Non"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: KINDY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ tuổi</label>
              <input
                type="text"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: 4-6 tuổi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as CurriculumLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Elementary">Elementary</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CurriculumStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Tạm dừng</option>
                <option value="Draft">Nháp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (tháng)</label>
              <input
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số buổi</label>
              <input
                type="number"
                min={1}
                value={formData.totalSessions}
                onChange={(e) => setFormData({ ...formData, totalSessions: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phút/buổi</label>
              <input
                type="number"
                min={30}
                step={15}
                value={formData.sessionDuration}
                onChange={(e) => setFormData({ ...formData, sessionDuration: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học phí (VND)</label>
              <input
                type="number"
                min={0}
                step={100000}
                value={formData.tuitionFee}
                onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
