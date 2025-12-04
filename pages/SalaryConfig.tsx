/**
 * Salary Config Page
 * Cấu hình lương GV/TG với Firebase integration
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, DollarSign, Settings } from 'lucide-react';
import { useSalaryConfig } from '../src/hooks/useSalaryConfig';
import { 
  SalaryRule, 
  SalaryRangeConfig, 
  SalaryMethod, 
  WorkMethod,
  RangeType 
} from '../src/services/salaryConfigService';
import { formatCurrency } from '../src/utils/currencyUtils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/config/firebase';

export const SalaryConfig: React.FC = () => {
  const { 
    salaryRules, 
    teachingRanges, 
    feedbackRanges, 
    loading, 
    error,
    createRule,
    updateRule,
    deleteRule,
    createRange,
    updateRange,
    deleteRange,
  } = useSalaryConfig();

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [editingRule, setEditingRule] = useState<SalaryRule | null>(null);
  const [editingRange, setEditingRange] = useState<SalaryRangeConfig | null>(null);
  const [rangeType, setRangeType] = useState<RangeType>('Teaching');

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Xóa cấu hình lương này?')) return;
    try {
      await deleteRule(id);
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  const handleDeleteRange = async (id: string) => {
    if (!confirm('Xóa mức lương này?')) return;
    try {
      await deleteRange(id);
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-green-600" size={24} />
            Cấu hình lương GV/TG
          </h2>
          <p className="text-sm text-gray-500">1 ca = 90 phút | 1 giờ = 60 phút</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowRuleModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus size={16} /> Thêm cấu hình
        </button>
      </div>

      {/* Main Table - Salary Rules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead>
              <tr className="bg-orange-100/50 border-b border-gray-200 text-gray-800 font-bold">
                <th className="px-4 py-3 border-r border-gray-200 text-center w-12">No</th>
                <th className="px-4 py-3 border-r border-gray-200">Tên nhân sự</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">Vị trí</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">Lớp phụ trách</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">Cách tính lương</th>
                <th className="px-4 py-3 border-r border-gray-200 text-right">Mức tối thiểu</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center">Cách tính công</th>
                <th className="px-4 py-3 border-r border-gray-200 text-right">Tiền công/ca</th>
                <th className="px-4 py-3 border-r border-gray-200">Ngày hiệu lực</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-red-500">Lỗi: {error}</td>
                </tr>
              ) : salaryRules.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    <DollarSign size={48} className="mx-auto mb-2 opacity-20" />
                    Chưa có cấu hình lương nào
                  </td>
                </tr>
              ) : salaryRules.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-100 text-center">{idx + 1}</td>
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="font-medium text-gray-900">{rule.staffName}</div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.position === 'Giáo Viên Việt' ? 'bg-blue-100 text-blue-700' :
                      rule.position === 'Giáo Viên Nước Ngoài' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rule.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.className || '-'}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center">{rule.salaryMethod}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-right">{formatCurrency(rule.baseRate)}</td>
                  <td className="px-4 py-3 border-r border-gray-100 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      rule.workMethod === 'Cố định' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {rule.workMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100 text-right font-bold text-indigo-600">
                    {formatCurrency(rule.ratePerSession)}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-100">{rule.effectiveDate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditingRule(rule); setShowRuleModal(true); }}
                        className="text-gray-400 hover:text-indigo-600 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => rule.id && handleDeleteRule(rule.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation & Range Configs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Logic Explanation */}
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Settings size={18} />
            Logic tính công
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-4">
              <span className="font-bold w-24 text-gray-800">Cố định</span>
              <span>Nhân theo mức tối thiểu/cố định</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-24 text-gray-800">Theo sĩ số</span>
              <span>Lấy theo sĩ số trung bình học sinh đi học thực tế</span>
            </div>
          </div>
        </div>

        {/* Right: Range Tables */}
        <div className="space-y-4">
          {/* Teaching Ranges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-orange-100/50 px-4 py-2 font-bold text-gray-800 border-b border-gray-200 flex items-center justify-between">
              <span>Mức lương theo sĩ số (GV)</span>
              <button
                onClick={() => { setRangeType('Teaching'); setEditingRange(null); setShowRangeModal(true); }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <Plus size={18} />
              </button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Sĩ số</th>
                  <th className="px-4 py-2">Cách tính</th>
                  <th className="px-4 py-2">Số tiền</th>
                  <th className="px-4 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachingRanges.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-400">Chưa có</td>
                  </tr>
                ) : teachingRanges.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{r.rangeLabel}</td>
                    <td className="px-4 py-2">{r.method || '-'}</td>
                    <td className="px-4 py-2 font-medium">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => r.id && handleDeleteRange(r.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assistant Feedback Ranges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-orange-100/50 px-4 py-2 font-bold text-gray-800 border-b border-gray-200 flex items-center justify-between">
              <span>Mức lương nhận xét (TG)</span>
              <button
                onClick={() => { setRangeType('AssistantFeedback'); setEditingRange(null); setShowRangeModal(true); }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <Plus size={18} />
              </button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Sĩ số</th>
                  <th className="px-4 py-2">Số tiền</th>
                  <th className="px-4 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbackRanges.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-gray-400">Chưa có</td>
                  </tr>
                ) : feedbackRanges.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">{r.rangeLabel}</td>
                    <td className="px-4 py-2 font-medium">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => r.id && handleDeleteRange(r.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Salary Rule Modal */}
      {showRuleModal && (
        <SalaryRuleModal
          rule={editingRule}
          onClose={() => { setShowRuleModal(false); setEditingRule(null); }}
          onSubmit={async (data) => {
            if (editingRule?.id) {
              await updateRule(editingRule.id, data);
            } else {
              await createRule(data as Omit<SalaryRule, 'id'>);
            }
            setShowRuleModal(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Salary Range Modal */}
      {showRangeModal && (
        <SalaryRangeModal
          range={editingRange}
          type={rangeType}
          onClose={() => { setShowRangeModal(false); setEditingRange(null); }}
          onSubmit={async (data) => {
            if (editingRange?.id) {
              await updateRange(editingRange.id, data);
            } else {
              await createRange({ ...data, type: rangeType } as Omit<SalaryRangeConfig, 'id'>);
            }
            setShowRangeModal(false);
            setEditingRange(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================
// SALARY RULE MODAL
// ============================================
interface StaffOption {
  id: string;
  name: string;
  position: string;
}

interface SalaryRuleModalProps {
  rule?: SalaryRule | null;
  onClose: () => void;
  onSubmit: (data: Partial<SalaryRule>) => Promise<void>;
}

interface ClassOption {
  id: string;
  name: string;
}

const SalaryRuleModal: React.FC<SalaryRuleModalProps> = ({ rule, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    staffId: rule?.staffId || '',
    staffName: rule?.staffName || '',
    position: rule?.position || 'Giáo Viên Việt',
    className: rule?.className || '',
    salaryMethod: rule?.salaryMethod || 'Theo ca' as SalaryMethod,
    baseRate: rule?.baseRate || 200000,
    workMethod: rule?.workMethod || 'Cố định' as WorkMethod,
    ratePerSession: rule?.ratePerSession || 200000,
    effectiveDate: rule?.effectiveDate || new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffClasses, setStaffClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Normalize position for display
  const normalizePosition = (pos: string): string => {
    const lower = pos?.toLowerCase() || '';
    if (lower.includes('quản lý') || lower === 'admin') return 'Quản lý';
    if (lower.includes('nước ngoài') || lower.includes('ngoại') || lower === 'foreign') return 'Giáo Viên Nước Ngoài';
    if (lower.includes('việt') || lower === 'gv việt') return 'Giáo Viên Việt';
    if (lower.includes('trợ') || lower === 'tg') return 'Trợ Giảng';
    if (lower.includes('kế toán')) return 'Kế toán';
    if (lower.includes('lễ tân')) return 'Lễ tân';
    if (lower.includes('nhân viên')) return 'Nhân viên';
    return pos;
  };

  // Fetch staff list from Firebase
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'staff'));
        const staffData: StaffOption[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const normalizedPos = normalizePosition(data.position || '');
          // Only include teaching staff for salary config
          if (['Giáo Viên Việt', 'Giáo Viên Nước Ngoài', 'Trợ Giảng'].includes(normalizedPos)) {
            staffData.push({
              id: doc.id,
              name: data.name || '',
              position: normalizedPos,
            });
          }
        });
        // Sort by name
        staffData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setStaffList(staffData);
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  // Fetch classes for selected staff
  useEffect(() => {
    const fetchStaffClasses = async () => {
      if (!formData.staffId && !formData.staffName) {
        setStaffClasses([]);
        return;
      }
      
      setLoadingClasses(true);
      try {
        const snapshot = await getDocs(collection(db, 'classes'));
        const classData: ClassOption[] = [];
        const staffName = formData.staffName.toLowerCase().trim();
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const isTeacher = data.teacherId === formData.staffId || 
                           (data.teacher && data.teacher.toLowerCase().includes(staffName));
          const isAssistant = data.assistant && data.assistant.toLowerCase().includes(staffName);
          const isForeignTeacher = data.foreignTeacher && data.foreignTeacher.toLowerCase().includes(staffName);
          
          if (isTeacher || isAssistant || isForeignTeacher) {
            classData.push({
              id: doc.id,
              name: data.name || '',
            });
          }
        });
        
        // Sort by name
        classData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setStaffClasses(classData);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    
    fetchStaffClasses();
  }, [formData.staffId, formData.staffName]);

  const handleStaffSelect = (staffId: string) => {
    const selected = staffList.find(s => s.id === staffId);
    if (selected) {
      setFormData({
        ...formData,
        staffId: selected.id,
        staffName: selected.name,
        position: selected.position,
        className: '', // Reset class when staff changes
      });
    } else {
      setFormData({
        ...formData,
        staffId: '',
        staffName: '',
        position: 'Giáo Viên Việt',
        className: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {rule ? 'Sửa cấu hình lương' : 'Thêm cấu hình lương'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhân sự <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.staffId}
                onChange={(e) => handleStaffSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={loadingStaff}
              >
                <option value="">{loadingStaff ? 'Đang tải...' : '-- Chọn nhân sự --'}</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
              <input
                type="text"
                readOnly
                value={formData.position}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lớp phụ trách</label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={!formData.staffId || loadingClasses}
              >
                <option value="">
                  {!formData.staffId ? '-- Chọn nhân sự trước --' : 
                   loadingClasses ? 'Đang tải...' : 
                   staffClasses.length === 0 ? 'Không có lớp phụ trách' : '-- Chọn lớp --'}
                </option>
                {staffClasses.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cách tính lương</label>
              <select
                value={formData.salaryMethod}
                onChange={(e) => setFormData({ ...formData, salaryMethod: e.target.value as SalaryMethod })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Theo ca">Theo ca (90 phút)</option>
                <option value="Theo giờ">Theo giờ (60 phút)</option>
                <option value="Nhận xét">Nhận xét</option>
                <option value="Cố định">Cố định</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cách tính công</label>
              <select
                value={formData.workMethod}
                onChange={(e) => setFormData({ ...formData, workMethod: e.target.value as WorkMethod })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cố định">Cố định</option>
                <option value="Theo sĩ số">Theo sĩ số</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức tối thiểu (đ)</label>
              <input
                type="number"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiền công/ca (đ)</label>
              <input
                type="number"
                value={formData.ratePerSession}
                onChange={(e) => setFormData({ ...formData, ratePerSession: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hiệu lực</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : rule ? 'Lưu thay đổi' : 'Thêm cấu hình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// SALARY RANGE MODAL
// ============================================
interface SalaryRangeModalProps {
  range?: SalaryRangeConfig | null;
  type: RangeType;
  onClose: () => void;
  onSubmit: (data: Partial<SalaryRangeConfig>) => Promise<void>;
}

const SalaryRangeModal: React.FC<SalaryRangeModalProps> = ({ range, type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    rangeLabel: range?.rangeLabel || '',
    method: range?.method || 'Cố định',
    amount: range?.amount || 0,
  });
  const [amountDisplay, setAmountDisplay] = useState(
    range?.amount ? range.amount.toLocaleString('vi-VN') : ''
  );
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    const amount = parseInt(numericValue) || 0;
    setFormData({ ...formData, amount });
    // Format with commas for display
    setAmountDisplay(amount > 0 ? amount.toLocaleString('vi-VN') : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {range ? 'Sửa mức lương' : 'Thêm mức lương'} ({type === 'Teaching' ? 'GV' : 'TG'})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khoảng sĩ số <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.rangeLabel}
              onChange={(e) => setFormData({ ...formData, rangeLabel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: <5, 5-9, 10-20, >20"
            />
          </div>

          {type === 'Teaching' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cách tính</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cố định">Cố định</option>
                <option value="Sĩ số">Sĩ số</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền (đ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={amountDisplay}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="1.000.000"
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
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
