import React from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  AlertCircle 
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

const dataRevenue = [
  { name: 'T1', vn: 40, en: 24 },
  { name: 'T2', vn: 30, en: 13 },
  { name: 'T3', vn: 20, en: 98 },
  { name: 'T4', vn: 27, en: 39 },
  { name: 'T5', vn: 18, en: 48 },
  { name: 'T6', vn: 23, en: 38 },
];

const dataStudents = [
  { name: 'Đang học', value: 400 },
  { name: 'Bảo lưu', value: 30 },
  { name: 'Học thử', value: 50 },
  { name: 'Đã nghỉ', value: 20 },
];

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: any;
  trend?: string;
  color: string;
}> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
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
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng học viên" 
          value="480" 
          icon={Users} 
          trend="+12%" 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Lớp đang hoạt động" 
          value="24" 
          icon={BookOpen} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Doanh thu tháng" 
          value="1.2 Tỷ" 
          icon={DollarSign} 
          trend="+5%" 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Cần chăm sóc" 
          value="15" 
          icon={AlertCircle} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ doanh thu</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataRevenue}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vn" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Tiếng Anh Trẻ Em" />
                <Bar dataKey="en" fill="#10b981" radius={[4, 4, 0, 0]} name="IELTS" />
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
