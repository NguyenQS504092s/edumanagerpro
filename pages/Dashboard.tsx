import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  AlertCircle,
  CreditCard
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
import { MOCK_STUDENTS, MOCK_CLASSES } from '../mockData';
import { StudentStatus, ClassStatus } from '../types';

const dataRevenue = [
  { name: 'T1', revenue: 85000000 },
  { name: 'T2', revenue: 92000000 },
  { name: 'T3', revenue: 120000000 },
  { name: 'T4', revenue: 105000000 },
  { name: 'T5', revenue: 130000000 },
  { name: 'T6', revenue: 145000000 },
  { name: 'T7', revenue: 138000000 },
  { name: 'T8', revenue: 150000000 },
  { name: 'T9', revenue: 142000000 },
  { name: 'T10', revenue: 155000000 },
  { name: 'T11', revenue: 160000000 },
  { name: 'T12', revenue: 175000000 },
];

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: any;
  trend?: string;
  color: string;
  link?: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, trend, color, link, subtitle }) => {
  const content = (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
            <TrendingUp size={12} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return link ? (
    <Link to={link} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
};

export const Dashboard: React.FC = () => {
  const stats = useMemo(() => {
    const totalStudents = MOCK_STUDENTS.length;
    const activeStudents = MOCK_STUDENTS.filter(s => s.status === StudentStatus.ACTIVE).length;
    const owingStudents = Math.floor(activeStudents * 0.15);
    const activeClasses = MOCK_CLASSES.filter(c => c.status === ClassStatus.STUDYING).length;
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = dataRevenue[currentMonth]?.revenue || 0;
    const needCare = MOCK_STUDENTS.filter(s => 
      s.status === StudentStatus.RESERVED || s.status === StudentStatus.TRIAL
    ).length;

    return {
      totalStudents,
      activeStudents,
      owingStudents,
      activeClasses,
      monthlyRevenue,
      needCare
    };
  }, []);

  const dataStudents = useMemo(() => {
    const active = MOCK_STUDENTS.filter(s => s.status === StudentStatus.ACTIVE).length;
    const reserved = MOCK_STUDENTS.filter(s => s.status === StudentStatus.RESERVED).length;
    const trial = MOCK_STUDENTS.filter(s => s.status === StudentStatus.TRIAL).length;
    const dropped = MOCK_STUDENTS.filter(s => s.status === StudentStatus.DROPPED).length;

    return [
      { name: 'Đang học', value: active },
      { name: 'Bảo lưu', value: reserved },
      { name: 'Học thử', value: trial },
      { name: 'Đã nghỉ', value: dropped },
    ];
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng học viên" 
          value={stats.totalStudents.toString()}
          subtitle={`Đang học: ${stats.activeStudents} học viên`}
          icon={Users} 
          trend="+12%" 
          color="bg-indigo-600"
          link="/customers/students"
        />
        <StatCard 
          title="Học viên nợ phí" 
          value={stats.owingStudents.toString()}
          subtitle="Cần theo dõi thanh toán"
          icon={CreditCard} 
          color="bg-red-500"
          link="/customers/students"
        />
        <StatCard 
          title="Lớp đang học" 
          value={stats.activeClasses.toString()}
          subtitle={`Tổng: ${MOCK_CLASSES.length} lớp`}
          icon={BookOpen} 
          color="bg-blue-500"
          link="/training/classes"
        />
        <StatCard 
          title="Doanh thu tháng này" 
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign} 
          trend="+8%" 
          color="bg-emerald-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Doanh thu theo tháng (năm 2024)</h3>
            <span className="text-sm text-gray-500">Đơn vị: VNĐ</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataRevenue}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tình trạng học viên</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStudents}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dataStudents.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions / Today's Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Lịch học hôm nay (Thứ 2)</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Lớp học</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Giáo viên</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">Tiếng Anh Giao Tiếp K12</td>
                <td className="px-6 py-4">17:30 - 19:00</td>
                <td className="px-6 py-4">P.101</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">A</div>
                    Nguyễn Văn A
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Sắp diễn ra
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">IELTS Foundation 05</td>
                <td className="px-6 py-4">19:15 - 20:45</td>
                <td className="px-6 py-4">P.102</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">C</div>
                    Lê Thị C
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Chờ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
