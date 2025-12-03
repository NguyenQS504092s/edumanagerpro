/**
 * Dashboard Page
 * Giao diện trang chủ theo thiết kế Brisky
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Gift,
  Package,
  DollarSign,
  AlertCircle,
  X,
  Phone,
  Mail
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { formatCurrency } from '../src/utils/currencyUtils';
import { getRevenueSummary, RevenueByCategory } from '../src/services/financialReportService';
import { seedAllData, clearAllData } from '../scripts/seedAllData';

// Colors matching the design
const COLORS = {
  noPhi: '#3b82f6',      // Blue - Nợ phí
  hocThu: '#f97316',     // Orange - Học thử
  baoLuu: '#eab308',     // Yellow - Bảo lưu
  nghiHoc: '#ef4444',    // Red - Nghỉ học
  hvMoi: '#22c55e',      // Green - HV mới
  hocPhi: '#8b5cf6',     // Purple
};

const PIE_COLORS = ['#3b82f6', '#f97316', '#eab308', '#ef4444', '#22c55e'];

interface StudentData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  className?: string;
  status?: string;
  hasDebt?: boolean;
  createdAt?: string;
  parentPhone?: string;
}

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  avgPerClass: number;
  studentsByStatus: { name: string; value: number; color: string }[];
  revenueData: { month: string; expected: number; actual: number }[];
  debtStats: { noPhi: number; noHocPhi: number };
  totalRevenue: number;
  totalDebt: number;
  salaryForecast: { position: string; amount: number }[];
  salaryPercent: number;
  businessHealth: { metric: string; value: number; status: string }[];
  lowStockProducts: { name: string; quantity: number }[];
  upcomingBirthdays: { name: string; position: string; date: string }[];
  classStats: { name: string; count: number }[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClasses: 0,
    avgPerClass: 0,
    studentsByStatus: [],
    revenueData: [],
    debtStats: { noPhi: 0, noHocPhi: 0 },
    totalRevenue: 0,
    totalDebt: 0,
    salaryForecast: [],
    salaryPercent: 0,
    businessHealth: [],
    lowStockProducts: [],
    upcomingBirthdays: [],
    classStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState('Tháng hiện tại');
  
  // State cho modal danh sách học viên
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // State cho doanh số bán hàng từ báo cáo tài chính
  const [revenuePieData, setRevenuePieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [seeding, setSeeding] = useState(false);

  // Seed test data
  const handleSeedData = async () => {
    if (seeding) return;
    if (!confirm('Bạn có muốn tạo dữ liệu test TOÀN BỘ cho app không?\n\nSẽ tạo: Students, Classes, Parents, Contracts, Staff, Products, Leads, Campaigns, Attendance, Tutoring, Feedback, Invoices, Work Sessions...')) return;
    
    setSeeding(true);
    try {
      const results = await seedAllData();
      const total = Object.values(results).reduce((a, b) => a + b, 0);
      alert(`✅ Đã tạo ${total} records thành công!\n\nChi tiết:\n${Object.entries(results).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('❌ Lỗi khi tạo dữ liệu: ' + (error as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (seeding) return;
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc muốn XÓA TOÀN BỘ dữ liệu không?\n\nHành động này không thể hoàn tác!')) return;
    if (!confirm('Xác nhận lần cuối: XÓA TẤT CẢ DỮ LIỆU?')) return;
    
    setSeeding(true);
    try {
      await clearAllData();
      alert('✅ Đã xóa toàn bộ dữ liệu!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Lỗi khi xóa dữ liệu: ' + (error as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsSnap = await getDocs(collection(db, 'students'));
      const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StudentData[];
      setAllStudents(students);
      
      // Fetch classes
      const classesSnap = await getDocs(collection(db, 'classes'));
      const classes = classesSnap.docs.map(d => d.data());
      
      // Fetch contracts for revenue
      const contractsSnap = await getDocs(collection(db, 'contracts'));
      const contracts = contractsSnap.docs.map(d => d.data());
      
      // Calculate stats
      const totalStudents = students.length;
      const totalClasses = classes.length;
      const avgPerClass = totalClasses > 0 ? (totalStudents / totalClasses).toFixed(1) : 0;
      
      // Students by status - fetch real data
      const statusCounts = {
        'Nợ phí': students.filter(s => s.hasDebt || s.status === 'Debt' || s.status === 'Nợ phí').length,
        'Học thử': students.filter(s => s.status === 'Trial' || s.status === 'Học thử').length,
        'Bảo lưu': students.filter(s => s.status === 'Reserved' || s.status === 'Bảo lưu').length,
        'Nghỉ học': students.filter(s => s.status === 'Dropped' || s.status === 'Nghỉ học').length,
        'HV mới': students.filter(s => {
          if (!s.createdAt) return false;
          const created = new Date(s.createdAt);
          const now = new Date();
          return (now.getTime() - created.getTime()) < 30 * 24 * 60 * 60 * 1000;
        }).length,
      };
      
      const studentsByStatus = [
        { name: 'Nợ phí', value: statusCounts['Nợ phí'], color: COLORS.noPhi },
        { name: 'Học thử', value: statusCounts['Học thử'], color: COLORS.hocThu },
        { name: 'Bảo lưu', value: statusCounts['Bảo lưu'], color: COLORS.baoLuu },
        { name: 'Nghỉ học', value: statusCounts['Nghỉ học'], color: COLORS.nghiHoc },
        { name: 'HV mới', value: statusCounts['HV mới'], color: COLORS.hvMoi },
      ];
      
      // Revenue calculation
      const paidContracts = contracts.filter(c => c.status === 'Paid' || c.status === 'Đã thanh toán');
      const debtContracts = contracts.filter(c => c.status === 'Debt' || c.status === 'Nợ phí');
      
      const totalRevenue = paidContracts.reduce((sum, c) => sum + (c.finalTotal || c.totalAmount || 0), 0);
      const totalDebt = debtContracts.reduce((sum, c) => sum + (c.finalTotal || c.totalAmount || 0), 0);
      
      // Fetch financial report data for pie chart
      try {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const financialSummary = await getRevenueSummary(currentMonth);
        
        if (financialSummary.revenueByCategory.length > 0) {
          setRevenuePieData(financialSummary.revenueByCategory.map(item => ({
            name: item.category,
            value: item.amount,
            color: item.color,
          })));
        } else {
          // No data - show empty
          setRevenuePieData([]);
        }
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setRevenuePieData([]);
      }
      
      // Revenue comparison data from contracts
      const revenueData = totalRevenue > 0 ? [
        { month: 'Kỳ vọng', expected: totalRevenue * 1.2, actual: 0 },
        { month: 'Thực tế', expected: 0, actual: totalRevenue },
        { month: 'Chênh lệch', expected: 0, actual: totalRevenue * 0.2 },
      ] : [];
      
      // Fetch products for low stock - real data from Firebase
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(d => d.data());
      const lowStockProducts = products
        .filter((p: any) => p.stock < (p.minStock || 10))
        .map((p: any) => ({ name: p.name, quantity: p.stock }))
        .slice(0, 5);
      
      // Fetch staff for birthday - real data from Firebase
      const staffSnap = await getDocs(collection(db, 'staff'));
      const staffList = staffSnap.docs.map(d => d.data());
      const now = new Date();
      const upcomingBirthdays = staffList
        .filter((s: any) => {
          if (!s.birthDate) return false;
          const bday = new Date(s.birthDate);
          const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
          const daysUntil = Math.ceil((thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 30;
        })
        .map((s: any) => ({
          name: s.name,
          position: s.position || 'Nhân viên',
          date: new Date(s.birthDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        }))
        .slice(0, 5);
      
      // Class stats from real data
      const classStats = classes.slice(0, 5).map((c: any) => ({
        name: c.name,
        count: c.currentStudents || 0,
      }));
      
      // Salary forecast - theo vị trí: GV Việt, GV NN, Trợ giảng
      const gvVietCount = staffList.filter((s: any) => s.position === 'Giáo viên' || s.position === 'GV Việt').length;
      const gvNNCount = staffList.filter((s: any) => s.position === 'Giáo viên NN' || s.position === 'GV NN').length;
      const troGiangCount = staffList.filter((s: any) => s.position === 'Trợ giảng').length;
      
      const luongGVViet = gvVietCount * 12000000; // 12tr/GV Việt
      const luongGVNN = gvNNCount * 25000000; // 25tr/GV NN
      const luongTroGiang = troGiangCount * 4000000; // 4tr/Trợ giảng
      const tongLuong = luongGVViet + luongGVNN + luongTroGiang;
      
      const salaryForecast = [
        { position: 'Lương giáo viên Việt', amount: luongGVViet },
        { position: 'Lương giáo viên NN', amount: luongGVNN },
        { position: 'Lương trợ giảng', amount: luongTroGiang },
        { position: 'Tổng', amount: tongLuong },
      ];
      const salaryPercent = totalRevenue > 0 ? Math.round((tongLuong / totalRevenue) * 100 * 100) / 100 : 0;
      
      // Chỉ số sức khỏe doanh nghiệp
      const activeStudents = students.filter((s: any) => s.status === 'Đang học' || s.status === 'Active').length;
      const debtStudents = students.filter((s: any) => s.hasDebt).length;
      const droppedStudents = statusCounts['Nghỉ học'];
      
      const tiLeTaiTuc = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
      const tiLeNoPhi = totalStudents > 0 ? Math.round((debtStudents / totalStudents) * 100) : 0;
      const tiLeNghiHoc = totalStudents > 0 ? Math.round((droppedStudents / totalStudents) * 100) : 0;
      const diemHaiLong = 84; // TODO: Calculate from feedback
      const tiSuatLoiNhuan = totalRevenue > 0 ? Math.round(((totalRevenue - tongLuong) / totalRevenue) * 100) : 0;
      
      const getStatus = (value: number, goodThreshold: number, badThreshold: number, inverse = false) => {
        if (inverse) {
          return value <= goodThreshold ? 'Tốt' : value >= badThreshold ? 'Cần cải thiện' : 'Trung Bình';
        }
        return value >= goodThreshold ? 'Tốt' : value <= badThreshold ? 'Cần cải thiện' : 'Trung Bình';
      };
      
      const businessHealth = [
        { metric: 'Tỉ lệ tái tục', value: tiLeTaiTuc, status: getStatus(tiLeTaiTuc, 70, 40) },
        { metric: 'Tỉ lệ nợ phí', value: tiLeNoPhi, status: getStatus(tiLeNoPhi, 10, 30, true) },
        { metric: 'Tỉ lệ nghỉ học', value: tiLeNghiHoc, status: getStatus(tiLeNghiHoc, 5, 15, true) },
        { metric: 'Điểm số hài lòng', value: diemHaiLong, status: getStatus(diemHaiLong, 80, 60) },
        { metric: 'Tỉ suất lợi nhuận', value: tiSuatLoiNhuan, status: getStatus(tiSuatLoiNhuan, 40, 20) },
      ];
      
      setStats({
        totalStudents,
        totalClasses,
        avgPerClass: Number(avgPerClass),
        studentsByStatus,
        revenueData,
        debtStats: { 
          noPhi: Math.round(totalDebt * 0.6), 
          noHocPhi: Math.round(totalDebt * 0.4) 
        },
        totalRevenue,
        totalDebt,
        salaryForecast,
        salaryPercent,
        businessHealth,
        lowStockProducts,
        upcomingBirthdays,
        classStats,
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show empty data on error - no mock data
      setStats({
        totalStudents: 0,
        totalClasses: 0,
        avgPerClass: 0,
        studentsByStatus: [
          { name: 'Nợ phí', value: 0, color: COLORS.noPhi },
          { name: 'Học thử', value: 0, color: COLORS.hocThu },
          { name: 'Bảo lưu', value: 0, color: COLORS.baoLuu },
          { name: 'Nghỉ học', value: 0, color: COLORS.nghiHoc },
          { name: 'HV mới', value: 0, color: COLORS.hvMoi },
        ],
        revenueData: [],
        debtStats: { noPhi: 0, noHocPhi: 0 },
        totalRevenue: 0,
        totalDebt: 0,
        salaryForecast: [],
        salaryPercent: 0,
        businessHealth: [],
        lowStockProducts: [],
        upcomingBirthdays: [],
        classStats: [],
      });
      setRevenuePieData([]);
    } finally {
      setLoading(false);
    }
  };

  const debtPieData = [
    { name: 'Nợ phí', value: stats.debtStats.noPhi },
    { name: 'Nợ học phí', value: stats.debtStats.noHocPhi },
  ];

  // Lọc học viên theo category
  const getStudentsByCategory = (category: string): StudentData[] => {
    const now = new Date();
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    
    switch (category) {
      case 'Nợ phí':
        return allStudents.filter(s => s.hasDebt || s.status === 'Debt');
      case 'Học thử':
        return allStudents.filter(s => s.status === 'Trial' || s.status === 'Học thử');
      case 'Bảo lưu':
        return allStudents.filter(s => s.status === 'Reserved' || s.status === 'Bảo lưu');
      case 'Nghỉ học':
        return allStudents.filter(s => s.status === 'Dropped' || s.status === 'Nghỉ học');
      case 'HV mới':
        return allStudents.filter(s => {
          if (!s.createdAt) return false;
          const created = new Date(s.createdAt);
          return created.getTime() > thirtyDaysAgo;
        });
      default:
        return [];
    }
  };

  // Handle click vào cột chart
  const handleBarClick = (data: any) => {
    if (data && data.name) {
      setSelectedCategory(data.name);
      setShowStudentModal(true);
    }
  };

  const filteredStudents = selectedCategory ? getStudentsByCategory(selectedCategory) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-100 min-h-screen -m-6 p-4">
      {/* Header Stats */}
      <div className="bg-yellow-400 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white px-2 py-1 rounded">
            <img 
              src="/logo.jpg" 
              alt="Brisky Logo" 
              className="h-8 object-contain"
            />
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="bg-white px-3 py-1 rounded text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            {seeding ? '⏳ Đang xử lý...' : '🌱 Seed All Data'}
          </button>
          <button
            onClick={handleClearData}
            disabled={seeding}
            className="bg-white px-3 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            🗑️ Clear All
          </button>
        </div>
        <div className="flex gap-6">
          <div className="bg-white px-4 py-2 rounded shadow-sm">
            <div className="text-xs text-gray-500">Tổng số học viên</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalStudents}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm">
            <div className="text-xs text-gray-500">Tổng số lớp</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalClasses}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm">
            <div className="text-xs text-gray-500">Trung bình / lớp</div>
            <div className="text-xl font-bold text-gray-800">{stats.avgPerClass}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="col-span-7 space-y-4">
          {/* Student Stats Bar Chart */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700 text-sm">Thống kê học viên</h3>
              <span className="text-xs text-gray-500">{currentMonth}</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.studentsByStatus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={handleBarClick} className="cursor-pointer">
                    {stats.studentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {stats.studentsByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Click vào từng cột để hiển thị danh sách chi tiết học sinh
            </p>
          </div>

          {/* Revenue Comparison */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{currentMonth}</span>
                <span className="text-sm font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="font-bold">Doanh thu thực tế / Doanh thu kỳ vọng</span>
              </div>
            </div>
            {stats.revenueData.length > 0 ? (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={stats.revenueData.map(r => ({ name: r.month, value: r.expected || r.actual }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}tr`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 text-xs justify-center">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div> Kỳ vọng</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Thực tế</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Chênh lệch</div>
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>

          {/* Bottom Tables Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Dự báo lương */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 text-xs">Dự báo lương</h3>
                <span className="text-xs text-gray-500">{currentMonth}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {stats.salaryForecast.map((item, idx) => (
                    <tr key={idx} className={idx === stats.salaryForecast.length - 1 ? 'font-bold border-t' : ''}>
                      <td className="py-1">{item.position}</td>
                      <td className="py-1 text-right text-blue-600">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-gray-400 mt-2">Chiếm tỉ lệ: {stats.salaryPercent}%</div>
            </div>

            {/* Chỉ số sức khỏe doanh nghiệp */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 text-xs">CHỈ SỐ SỨC KHỎE DOANH NGHIỆP</h3>
                <span className="text-xs text-gray-500">{currentMonth}</span>
              </div>
              <table className="w-full text-xs">
                <thead className="text-gray-500">
                  <tr>
                    <th className="text-left py-1">Hạng mục</th>
                    <th className="text-center py-1">Số liệu</th>
                    <th className="text-right py-1">Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.businessHealth.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.metric}</td>
                      <td className="py-1 text-center">{item.value}%</td>
                      <td className={`py-1 text-right font-medium ${
                        item.status === 'Tốt' ? 'text-green-600' : 
                        item.status === 'Cần cải thiện' ? 'text-red-500' : 'text-orange-500'
                      }`}>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vật phẩm còn lại trong kho */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-bold text-gray-700 text-xs mb-2 text-center border-b pb-2">VẬT PHẨM CÒN LẠI TRONG KHO</h3>
            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-1">Hạng Mục</th>
                  <th className="text-right py-1">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-right font-bold text-blue-600">{item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-2 text-center text-gray-400">Chưa có sản phẩm</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-5 space-y-4">
          {/* Revenue Pie Chart */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700 text-sm">Doanh số bán hàng</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(revenuePieData.reduce((sum, item) => sum + item.value, 0) || stats.totalRevenue)}</div>
                <span className="text-xs text-gray-500">{currentMonth}</span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenuePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {revenuePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center">Lấy từ báo cáo tài chính</p>
          </div>

          {/* Debt Pie Chart */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700 text-sm">Doanh số nợ phí</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{formatCurrency(stats.totalDebt)}</div>
                <span className="text-xs text-blue-600 cursor-pointer">Xem theo tháng</span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#eab308" />
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics Table */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-bold text-gray-700 text-xs mb-2 text-center border-b pb-2">THỐNG KÊ</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <table className="w-full">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-1">Tổng mức</th>
                      <th className="text-right py-1">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Học viên</td><td className="text-right">Học viên</td></tr>
                    <tr><td>Khóa mới</td><td className="text-right">Tái đăng ký</td></tr>
                    <tr><td>Thanh toán</td><td className="text-right">TOP 5</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left py-1">Tên lớp mức</th>
                      <th className="text-right py-1">Sĩ số chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.classStats.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{item.name}</td>
                        <td className="py-1 text-right">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Hạng mục</span> <span className="font-bold">Diễn giải</span></div>
                <div><span className="text-gray-500">Tỉ lệ theo</span> <span>Tỉ lệ chuyển đổi của đơn hàng trưng tâm</span></div>
                <div><span className="text-gray-500">Tỉ lệ bài bài</span> <span>Số học viên đăng học/ tổng số / nghỉ/bỏ học</span></div>
              </div>
            </div>
          </div>

          {/* Sinh nhật của nhân sự */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <h3 className="font-bold text-gray-700 text-xs mb-2 text-center border-b pb-2">SINH NHẬT CỦA NHÂN SỰ</h3>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="text-gray-500">Hiển thị theo</span>
              <span className="font-medium text-green-600">Tháng</span>
            </div>
            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-1">Tên nhân sự</th>
                  <th className="text-center py-1">Vị trí</th>
                  <th className="text-right py-1">Ngày SN</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingBirthdays.length > 0 ? (
                  stats.upcomingBirthdays.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-center">{item.position}</td>
                      <td className="py-1 text-right">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-gray-400">Không có sinh nhật trong tháng</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal danh sách học viên */}
      {showStudentModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: stats.studentsByStatus.find(s => s.name === selectedCategory)?.color || '#3b82f6' }}>
              <h2 className="text-lg font-bold text-white">
                Danh sách học viên: {selectedCategory}
              </h2>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Không có học viên trong danh mục này</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 mb-3">
                    Tổng: {filteredStudents.length} học viên
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-600">
                      <tr>
                        <th className="text-left p-2">STT</th>
                        <th className="text-left p-2">Họ tên</th>
                        <th className="text-left p-2">Lớp</th>
                        <th className="text-left p-2">Liên hệ</th>
                        <th className="text-left p-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredStudents.map((student, idx) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-gray-500">{idx + 1}</td>
                          <td className="p-2 font-medium">{student.name}</td>
                          <td className="p-2">{student.className || '-'}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {student.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {student.phone}
                                </span>
                              )}
                              {student.parentPhone && !student.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {student.parentPhone} (PH)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              student.hasDebt ? 'bg-red-100 text-red-700' :
                              student.status === 'Trial' || student.status === 'Học thử' ? 'bg-orange-100 text-orange-700' :
                              student.status === 'Reserved' || student.status === 'Bảo lưu' ? 'bg-yellow-100 text-yellow-700' :
                              student.status === 'Dropped' || student.status === 'Nghỉ học' ? 'bg-gray-100 text-gray-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {student.status || (student.hasDebt ? 'Nợ phí' : 'HV mới')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowStudentModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
