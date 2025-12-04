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
import { useSalaryReport } from '../src/hooks/useSalaryReport';

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
  fullName: string;
  phone?: string;
  email?: string;
  className?: string;
  currentClassName?: string;
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
  
  // State cho bảng thống kê
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [statsCategory, setStatsCategory] = useState('Lương nhân viên');
  const [statsSortOrder, setStatsSortOrder] = useState('asc'); // asc = thấp đến cao
  const [statsLimit, setStatsLimit] = useState(5);
  
  // Fetch salary report data
  const { summaries: salaryReportData } = useSalaryReport(statsMonth, statsYear);
  
  // State cho bảng sinh nhật
  const [birthdayFilter, setBirthdayFilter] = useState<'month' | 'week' | 'today'>('month');
  
  // State cho bảng vật phẩm kho
  const [stockFilter, setStockFilter] = useState<'low' | 'all'>('low');
  
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
      
      // Students by status - fetch real data (dùng giá trị Vietnamese từ enum)
      const statusCounts = {
        'Nợ phí': students.filter(s => s.hasDebt || s.status === 'Nợ phí').length,
        'Học thử': students.filter(s => s.status === 'Học thử').length,
        'Bảo lưu': students.filter(s => s.status === 'Bảo lưu').length,
        'Nghỉ học': students.filter(s => s.status === 'Nghỉ học').length,
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
      
      // Fetch staff for birthday and salary - real data from Firebase
      const staffSnap = await getDocs(collection(db, 'staff'));
      const staffList = staffSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Also get staff from staffSalaries if staff collection is empty
      let allStaff = staffList;
      if (staffList.length === 0) {
        const staffSalariesSnap = await getDocs(collection(db, 'staffSalaries'));
        const uniqueStaff = new Map();
        staffSalariesSnap.docs.forEach(d => {
          const data = d.data();
          if (!uniqueStaff.has(data.staffId)) {
            uniqueStaff.set(data.staffId, {
              id: data.staffId,
              name: data.staffName,
              position: data.position,
              birthDate: data.birthDate || data.dob,
            });
          }
        });
        allStaff = Array.from(uniqueStaff.values());
      }
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      // Get all birthdays in current month (for filter to work)
      // Check multiple possible field names
      const upcomingBirthdays = allStaff
        .filter((s: any) => {
          const bdayStr = s['sinh nhật'] || s['ngày sinh'] || s.birthDate || s.dob || s.dateOfBirth;
          if (!bdayStr) return false;
          const bday = bdayStr.toDate ? bdayStr.toDate() : new Date(bdayStr);
          if (isNaN(bday.getTime())) return false;
          // Include all birthdays in current month
          return bday.getMonth() === thisMonth;
        })
        .map((s: any) => {
          const bdayStr = s['sinh nhật'] || s['ngày sinh'] || s.birthDate || s.dob || s.dateOfBirth;
          const bday = bdayStr.toDate ? bdayStr.toDate() : new Date(bdayStr);
          return {
            name: s.name || s.staffName,
            position: s.position || 'Nhân viên',
            date: `${String(bday.getDate()).padStart(2, '0')}/${String(bday.getMonth() + 1).padStart(2, '0')}/${bday.getFullYear()}`,
            dayOfMonth: bday.getDate(),
          };
        })
        .sort((a: any, b: any) => a.dayOfMonth - b.dayOfMonth);
      
      console.log('Staff list:', allStaff.length, 'Birthdays this month:', upcomingBirthdays.length);
      
      // Class stats from real data
      const classStats = classes.slice(0, 5).map((c: any) => ({
        name: c.name,
        count: c.currentStudents || 0,
      }));
      
      // Fetch work sessions for real salary calculation
      const workSessionsSnap = await getDocs(collection(db, 'workSessions'));
      const workSessions = workSessionsSnap.docs.map(d => d.data());
      const confirmedSessions = workSessions.filter((ws: any) => ws.status === 'Đã xác nhận');
      
      // Calculate salary by position from confirmed work sessions
      const salaryByPosition: { [key: string]: number } = {
        'Giáo viên Việt': 0,
        'Giáo viên Nước ngoài': 0,
        'Trợ giảng': 0,
      };
      
      // Salary rates per session
      const salaryRates: { [key: string]: number } = {
        'Giáo viên Việt': 200000,
        'Giáo viên Nước ngoài': 400000,
        'Trợ giảng': 100000,
      };
      
      confirmedSessions.forEach((ws: any) => {
        const pos = ws.position || 'Trợ giảng';
        const rate = salaryRates[pos] || 100000;
        if (pos.includes('Việt') || pos === 'Giáo viên') {
          salaryByPosition['Giáo viên Việt'] += rate;
        } else if (pos.includes('Nước ngoài') || pos.includes('NN')) {
          salaryByPosition['Giáo viên Nước ngoài'] += rate;
        } else {
          salaryByPosition['Trợ giảng'] += rate;
        }
      });
      
      const tongLuong = Object.values(salaryByPosition).reduce((a, b) => a + b, 0);
      
      const salaryForecast = [
        { position: 'Lương giáo viên Việt', amount: salaryByPosition['Giáo viên Việt'] },
        { position: 'Lương giáo viên NN', amount: salaryByPosition['Giáo viên Nước ngoài'] },
        { position: 'Lương trợ giảng', amount: salaryByPosition['Trợ giảng'] },
        { position: 'Tổng', amount: tongLuong },
      ];
      const salaryPercent = totalRevenue > 0 ? Math.round((tongLuong / totalRevenue) * 100 * 100) / 100 : 0;
      
      // Chỉ số sức khỏe doanh nghiệp - tính từ dữ liệu thực
      const activeStudents = students.filter((s: any) => s.status === 'Đang học').length;
      const debtStudents = students.filter((s: any) => s.hasDebt || s.status === 'Nợ phí').length;
      const droppedStudents = statusCounts['Nghỉ học'];
      
      const tiLeTaiTuc = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
      const tiLeNoPhi = totalStudents > 0 ? Math.round((debtStudents / totalStudents) * 100) : 0;
      const tiLeNghiHoc = totalStudents > 0 ? Math.round((droppedStudents / totalStudents) * 100) : 0;
      const diemHaiLong = 84; // TODO: Calculate from feedback collection
      const tiSuatLoiNhuan = totalRevenue > 0 ? Math.round(((totalRevenue - tongLuong) / totalRevenue) * 100) : 0;
      
      // Đánh giá: <10% Tốt, <20% Khá, <30% Trung Bình, <50% Yếu, >=50% Rất yếu
      const getStatusInverse = (value: number) => {
        if (value < 10) return 'Tốt';
        if (value < 20) return 'Khá';
        if (value < 30) return 'Trung Bình';
        if (value < 50) return 'Yếu';
        return 'Rất yếu';
      };
      
      // Đánh giá thuận: >80% Tốt, >60% Khá, >40% TB, >20% Yếu
      const getStatusNormal = (value: number) => {
        if (value >= 80) return 'Tốt';
        if (value >= 60) return 'Khá';
        if (value >= 40) return 'Trung Bình';
        if (value >= 20) return 'Yếu';
        return 'Rất yếu';
      };
      
      const businessHealth = [
        { metric: 'Tỉ lệ tái tục', value: tiLeTaiTuc, status: getStatusNormal(tiLeTaiTuc) },
        { metric: 'Tỉ lệ nợ phí', value: tiLeNoPhi, status: getStatusInverse(tiLeNoPhi) },
        { metric: 'Tỉ lệ nghỉ học', value: tiLeNghiHoc, status: getStatusInverse(tiLeNghiHoc) },
        { metric: 'Điểm số hài lòng', value: diemHaiLong, status: getStatusNormal(diemHaiLong) },
        { metric: 'Tỉ suất lợi nhuận', value: tiSuatLoiNhuan, status: getStatusNormal(tiSuatLoiNhuan) },
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
        return allStudents.filter(s => s.hasDebt || s.status === 'Nợ phí');
      case 'Học thử':
        return allStudents.filter(s => s.status === 'Học thử');
      case 'Bảo lưu':
        return allStudents.filter(s => s.status === 'Bảo lưu');
      case 'Nghỉ học':
        return allStudents.filter(s => s.status === 'Nghỉ học');
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
        </div>

        {/* Right Column - Pie Charts */}
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
                    data={revenuePieData.length > 0 ? revenuePieData : [{ name: 'Chưa có', value: 1, color: '#e5e7eb' }]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={revenuePieData.length > 0 ? ({ percent }) => `${(percent * 100).toFixed(0)}%` : undefined}
                  >
                    {(revenuePieData.length > 0 ? revenuePieData : [{ color: '#e5e7eb' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
        </div>
      </div>

      {/* Bottom Section - 2 columns */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Dự báo lương */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="flex justify-between items-center mb-2 bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs">Dự báo lương</h3>
              <span className="text-xs text-white">{currentMonth}</span>
            </div>
            <table className="w-full text-xs mt-2">
              <tbody>
                {stats.salaryForecast.map((item, idx) => (
                  <tr key={idx} className={idx === stats.salaryForecast.length - 1 ? 'font-bold border-t border-gray-300' : 'border-b border-gray-100'}>
                    <td className="py-1.5">{item.position}</td>
                    <td className="py-1.5 text-right text-blue-600">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-300">
                  <td className="py-1.5 font-medium">Chiếm tỉ lệ</td>
                  <td className="py-1.5 text-right text-blue-600 font-medium">{stats.salaryPercent}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chỉ số sức khỏe doanh nghiệp */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs text-center">CHỈ SỐ SỨC KHỎE DOANH NGHIỆP</h3>
              <p className="text-white text-xs text-center">{currentMonth}</p>
            </div>
            <table className="w-full text-xs mt-2">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="text-left py-1">Hạng mục</th>
                  <th className="text-center py-1">Số liệu</th>
                  <th className="text-right py-1">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {stats.businessHealth.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-1.5">{item.metric}</td>
                    <td className="py-1.5 text-center">{item.value}%</td>
                    <td className={`py-1.5 text-right font-medium ${
                      item.status === 'Tốt' ? 'text-green-600' : 
                      item.status === 'Khá' ? 'text-blue-500' :
                      item.status === 'Trung Bình' ? 'text-orange-500' : 
                      item.status === 'Yếu' ? 'text-red-500' : 'text-red-700'
                    }`}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vật phẩm còn lại trong kho */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs text-center">VẬT PHẨM CÒN LẠI TRONG KHO</h3>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2 mb-2 p-2 bg-green-50 rounded">
              <span className="text-gray-500">Hiển thị</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-green-600 font-medium bg-transparent border-none cursor-pointer focus:outline-none"
              >
                <option value="low">Sắp hết hàng</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1.5 px-2 border-b">Tên sản phẩm</th>
                  <th className="text-right py-1.5 px-2 border-b">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-1.5 px-2">{item.name}</td>
                      <td className={`py-1.5 px-2 text-right font-bold ${item.quantity < 5 ? 'text-red-600' : 'text-blue-600'}`}>
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-400">
                      Chưa có dữ liệu sản phẩm trong kho
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

{/* Right Column */}
        <div className="space-y-4">
          {/* THỐNG KÊ */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs text-center">THỐNG KÊ</h3>
            </div>
            
            {/* Filter row - interactive */}
            <div className="grid grid-cols-2 gap-2 text-xs mt-2 mb-3 p-2 bg-green-50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Xem theo tháng</span>
                <select 
                  value={`${statsMonth}-${statsYear}`}
                  onChange={(e) => {
                    const [m, y] = e.target.value.split('-').map(Number);
                    setStatsMonth(m);
                    setStatsYear(y);
                  }}
                  className="text-green-600 font-medium bg-transparent border-none text-right cursor-pointer focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const val = `${d.getMonth() + 1}-${d.getFullYear()}`;
                    const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </select>
              </div>
              <div></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Hạng mục thống kê</span>
                <select 
                  value={statsCategory}
                  onChange={(e) => setStatsCategory(e.target.value)}
                  className="text-green-600 font-medium bg-transparent border-none text-right cursor-pointer focus:outline-none"
                >
                  <option value="Lương nhân viên">Lương nhân viên</option>
                  <option value="Số lượng học sinh">Số lượng học sinh</option>
                  <option value="Doanh thu">Doanh thu</option>
                </select>
              </div>
              <div></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Kiểu xem</span>
                <select 
                  value={statsSortOrder}
                  onChange={(e) => setStatsSortOrder(e.target.value)}
                  className="text-green-600 font-medium bg-transparent border-none text-right cursor-pointer focus:outline-none"
                >
                  <option value="asc">Từ thấp tới cao</option>
                  <option value="desc">Từ cao tới thấp</option>
                </select>
              </div>
              <div></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Hiển thị</span>
                <select 
                  value={statsLimit}
                  onChange={(e) => setStatsLimit(Number(e.target.value))}
                  className="text-green-600 font-medium bg-transparent border-none text-right cursor-pointer focus:outline-none"
                >
                  <option value={5}>TOP 5</option>
                  <option value={10}>TOP 10</option>
                  <option value={20}>TOP 20</option>
                </select>
              </div>
            </div>

            {/* Stats table - từ báo cáo lương */}
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1.5 px-2 border-b">Tên nhân viên</th>
                  <th className="text-right py-1.5 px-2 border-b">Lương tạm tính</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sortedData = [...salaryReportData]
                    .sort((a, b) => statsSortOrder === 'asc' 
                      ? a.estimatedSalary - b.estimatedSalary 
                      : b.estimatedSalary - a.estimatedSalary)
                    .slice(0, statsLimit);
                  
                  return sortedData.length > 0 ? (
                    sortedData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-1.5 px-2">{item.staffName}</td>
                        <td className="py-1.5 px-2 text-right font-medium text-blue-600">{formatCurrency(item.estimatedSalary)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-2 text-center text-gray-400">Chưa có dữ liệu lương</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* DIỄN GIẢI HẠNG MỤC */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs text-center">DIỄN GIẢI HẠNG MỤC</h3>
            </div>
            <table className="w-full text-xs mt-2">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-1">Hạng mục</th>
                  <th className="text-left py-1">Diễn giải</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5">Tỉ lệ đi học</td>
                  <td className="py-1.5 text-gray-600 italic">Tỉ lệ chuyên cần của toàn trung tâm</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5">Tỉ lệ bồi bài</td>
                  <td className="py-1.5 text-gray-600 italic">Tỉ lệ nghỉ được bồi</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5">Số lượng học sinh</td>
                  <td className="py-1.5 text-gray-600 italic">Số học sinh đang học + nợ phí đang học</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5">Doanh thu thực tế</td>
                  <td className="py-1.5 text-gray-600 italic">Doanh thu thực tế hiện tại</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5">Lợi nhuận thực tế</td>
                  <td className="py-1.5 text-gray-600 italic">Doanh thu - chi phí GV + trợ giảng</td>
                </tr>
                <tr>
                  <td className="py-1.5">Lương nhân viên</td>
                  <td className="py-1.5 text-gray-600 italic">Xếp hạng lương nhận được của NV</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SINH NHẬT CỦA NHÂN SỰ */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-green-500">
            <div className="bg-green-500 -m-3 mb-2 p-2 rounded-t-lg">
              <h3 className="font-bold text-white text-xs text-center">SINH NHẬT CỦA NHÂN SỰ</h3>
            </div>
            <div className="flex items-center gap-2 text-xs mt-2 mb-2 p-2 bg-green-50 rounded">
              <span className="text-gray-500">Hiển thị theo</span>
              <select
                value={birthdayFilter}
                onChange={(e) => setBirthdayFilter(e.target.value as any)}
                className="text-green-600 font-medium bg-transparent border-none cursor-pointer focus:outline-none"
              >
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1.5 px-2 border-b">Tên nhân sự</th>
                  <th className="text-center py-1.5 px-2 border-b">Vị trí</th>
                  <th className="text-right py-1.5 px-2 border-b">Ngày SN</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const now = new Date();
                  const today = now.getDate();
                  const thisMonth = now.getMonth();
                  const thisYear = now.getFullYear();
                  
                  // Filter birthdays based on selection
                  const filteredBirthdays = stats.upcomingBirthdays.filter(item => {
                    const [day, month] = item.date.split('/').map(Number);
                    
                    if (birthdayFilter === 'today') {
                      return day === today && month === thisMonth + 1;
                    } else if (birthdayFilter === 'week') {
                      const bdayThisYear = new Date(thisYear, month - 1, day);
                      const diffDays = Math.ceil((bdayThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return diffDays >= 0 && diffDays <= 7;
                    } else {
                      return month === thisMonth + 1;
                    }
                  });
                  
                  return filteredBirthdays.length > 0 ? (
                    filteredBirthdays.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-1.5 px-2">{item.name}</td>
                        <td className="py-1.5 px-2 text-center">{item.position}</td>
                        <td className="py-1.5 px-2 text-right">{item.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-2 text-center text-gray-400">
                        Không có sinh nhật {birthdayFilter === 'today' ? 'hôm nay' : birthdayFilter === 'week' ? 'tuần này' : 'tháng này'}
                      </td>
                    </tr>
                  );
                })()}
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
                          <td className="p-2 font-medium">{student.fullName}</td>
                          <td className="p-2">{student.className || student.currentClassName || '-'}</td>
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
