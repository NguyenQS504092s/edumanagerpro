
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase, 
  UserCog, 
  DollarSign, 
  BarChart3, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { MenuItem } from '../types';

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Trang chủ', 
    icon: LayoutDashboard, 
    path: '/' 
  },
  {
    id: 'training',
    label: 'Đào Tạo',
    icon: BookOpen,
    subItems: [
      { id: 'classes', label: 'Lớp học', path: '/training/classes', icon: ChevronRight },
      { id: 'schedule', label: 'Thời khóa biểu', path: '/training/schedule', icon: ChevronRight },
      { id: 'holidays', label: 'Lịch nghỉ', path: '/training/holidays', icon: ChevronRight },
      { id: 'attendance', label: 'Điểm danh', path: '/training/attendance', icon: ChevronRight },
      { id: 'tutoring', label: 'Lịch bồi', path: '/training/tutoring', icon: ChevronRight },
      { id: 'attendance-history', label: 'Lịch sử điểm danh', path: '/training/attendance-history', icon: ChevronRight },
      { id: 'enrollment-history', label: 'Lịch sử ghi danh', path: '/training/enrollment', icon: ChevronRight },
    ]
  },
  {
    id: 'customers',
    label: 'Khách Hàng',
    icon: Users,
    subItems: [
      { id: 'students', label: 'Danh sách học viên', path: '/customers/students', icon: ChevronRight },
      { id: 'parents', label: 'Danh sách phụ huynh', path: '/customers/parents', icon: ChevronRight },
      { id: 'dropped', label: 'DS Học viên đã nghỉ', path: '/customers/dropped', icon: ChevronRight },
      { id: 'reserved', label: 'DS Học viên bảo lưu', path: '/customers/reserved', icon: ChevronRight },
      { id: 'feedback', label: 'Phản hồi khách hàng', path: '/customers/feedback', icon: ChevronRight },
      { id: 'trial', label: 'DS Học viên học thử', path: '/customers/trial', icon: ChevronRight },
    ]
  },
  {
    id: 'business',
    label: 'Kinh Doanh',
    icon: Briefcase,
    subItems: [
      { id: 'leads', label: 'Kho dữ liệu KH', path: '/business/leads', icon: ChevronRight },
      { id: 'campaigns', label: 'Chiến dịch', path: '/business/campaigns', icon: ChevronRight },
    ]
  },
  {
    id: 'hr',
    label: 'Nhân sự',
    icon: UserCog,
    subItems: [
      { id: 'staff', label: 'DS Nhân viên', path: '/hr/staff', icon: ChevronRight },
      { id: 'salary', label: 'Cấu hình lương', path: '/hr/salary', icon: ChevronRight },
      { id: 'work-confirm', label: 'Xác nhận công', path: '/hr/work-confirmation', icon: ChevronRight },
      { id: 'report-teacher', label: 'Báo cáo lương GV/TG', path: '/hr/salary-teacher', icon: ChevronRight },
      { id: 'report-staff', label: 'Báo cáo lương NV', path: '/hr/salary-staff', icon: ChevronRight },
    ]
  },
  {
    id: 'finance',
    label: 'Tài chính',
    icon: DollarSign,
    subItems: [
        { id: 'contracts', label: 'Danh sách hợp đồng', path: '/finance/contracts', icon: ChevronRight },
        { id: 'contracts-create', label: 'Tạo hợp đồng', path: '/finance/contracts/create', icon: ChevronRight },
        { id: 'invoices', label: 'Hóa đơn bán sách', path: '/finance/invoices', icon: ChevronRight },
        { id: 'debt', label: 'Quản lý công nợ', path: '/finance/debt', icon: ChevronRight },
        { id: 'revenue', label: 'Báo cáo doanh thu', path: '/finance/revenue', icon: ChevronRight },
    ]
  },
  {
    id: 'reports',
    label: 'Báo Cáo',
    icon: BarChart3,
    subItems: [
        { id: 'report-training', label: 'Báo cáo đào tạo', path: '/reports/training', icon: ChevronRight },
        { id: 'report-finance', label: 'Báo cáo tài chính', path: '/reports/finance', icon: ChevronRight },
    ]
  },
  {
    id: 'settings',
    label: 'Cấu hình',
    icon: Settings,
    subItems: [
        { id: 'settings-staff', label: 'Quản lý nhân viên', path: '/settings/staff', icon: ChevronRight },
        { id: 'settings-products', label: 'Quản lý gói mua', path: '/settings/products', icon: ChevronRight },
        { id: 'settings-inventory', label: 'Quản lý kho', path: '/settings/inventory', icon: ChevronRight },
        { id: 'settings-rooms', label: 'Quản lý phòng học', path: '/settings/rooms', icon: ChevronRight },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['training', 'customers', 'settings']);
  const location = useLocation();

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleMobileSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md shadow-lg"
        onClick={toggleMobileSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6">
            <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span className="p-1 bg-indigo-600 rounded text-white"><BookOpen size={18} /></span>
              EduManager
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.subItems ? (
                  // Parent Menu Item
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${expandedMenus.includes(item.id) 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-700 hover:bg-gray-100'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      {expandedMenus.includes(item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    
                    {/* Sub Menu */}
                    {expandedMenus.includes(item.id) && (
                      <div className="mt-1 ml-4 pl-3 border-l-2 border-indigo-100 space-y-1">
                        {item.subItems.map((sub) => (
                          <NavLink
                            key={sub.id}
                            to={sub.path || '#'}
                            className={({ isActive }) => `
                              flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                              ${isActive 
                                ? 'text-indigo-600 font-semibold bg-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                            `}
                          >
                            <span>{sub.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Single Menu Item
                  <NavLink
                    to={item.path || '#'}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Snippet */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Quản lý trung tâm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
