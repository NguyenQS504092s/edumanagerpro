
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ClassManager } from './pages/ClassManager';
import { StudentManager } from './pages/StudentManager';
import { Schedule } from './pages/Schedule';
import { HolidayManager } from './pages/HolidayManager';
import { TutoringManager } from './pages/TutoringManager';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { Attendance } from './pages/Attendance';
import { StudentDetail } from './pages/StudentDetail';
import { StaffManager } from './pages/StaffManager';
import { ProductManager } from './pages/ProductManager';
import { InventoryManager } from './pages/InventoryManager';
import { RoomManager } from './pages/RoomManager';
import { EnrollmentHistory } from './pages/EnrollmentHistory';
import { ParentManager } from './pages/ParentManager';
import { SalaryConfig } from './pages/SalaryConfig';
import { WorkConfirmation } from './pages/WorkConfirmation';
import { SalaryReportTeacher } from './pages/SalaryReportTeacher';
import { SalaryReportStaff } from './pages/SalaryReportStaff';
import { ContractCreation } from './pages/ContractCreation';
import { ContractList } from './pages/ContractList';
import { Login } from './pages/Login';
import { StudentStatus } from './types';
import { useAuth } from './src/hooks/useAuth';

// Placeholder components for routes not fully implemented
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
    <div className="text-6xl mb-4">🚧</div>
    <h3 className="text-xl font-medium text-gray-600">Trang đang phát triển</h3>
    <p className="mt-2">{title}</p>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Hệ thống quản lý trung tâm" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
          
          {/* Training Routes */}
          <Route path="/training/classes" element={<ClassManager />} />
          <Route path="/training/schedule" element={<Schedule />} />
          <Route path="/training/holidays" element={<HolidayManager />} />
          <Route path="/training/attendance" element={<Attendance />} />
          <Route path="/training/tutoring" element={<TutoringManager />} />
          <Route path="/training/attendance-history" element={<AttendanceHistory />} />
          <Route path="/training/enrollment" element={<EnrollmentHistory />} />
          
          {/* Customer Routes */}
          <Route path="/customers/students" element={<StudentManager title="Danh sách học viên" />} />
          <Route path="/customers/student-detail/:id" element={<StudentDetail />} />
          <Route path="/customers/parents" element={<ParentManager />} />
          <Route path="/customers/dropped" element={<StudentManager initialStatusFilter={StudentStatus.DROPPED} title="Danh sách học viên đã nghỉ" />} />
          <Route path="/customers/reserved" element={<StudentManager initialStatusFilter={StudentStatus.RESERVED} title="Danh sách học viên bảo lưu" />} />
          <Route path="/customers/trial" element={<StudentManager initialStatusFilter={StudentStatus.TRIAL} title="Danh sách học viên học thử" />} />
          <Route path="/customers/feedback" element={<Placeholder title="Phản hồi khách hàng" />} />
          
          {/* Business Routes */}
          <Route path="/business/leads" element={<Placeholder title="Kho dữ liệu khách hàng" />} />
          <Route path="/business/campaigns" element={<Placeholder title="Chiến dịch Sale/Marketing" />} />
          
          {/* HR Routes - Redirecting to Settings for now or can use Placeholder */}
          <Route path="/hr/staff" element={<Navigate to="/settings/staff" replace />} />
          <Route path="/hr/salary" element={<SalaryConfig />} />
          <Route path="/hr/work-confirmation" element={<WorkConfirmation />} />
          <Route path="/hr/salary-teacher" element={<SalaryReportTeacher />} />
          <Route path="/hr/salary-staff" element={<SalaryReportStaff />} />
          
          {/* Finance Routes */}
          <Route path="/finance/contracts" element={<ContractList />} />
          <Route path="/finance/contracts/create" element={<ContractCreation />} />
          <Route path="/finance/invoices" element={<Placeholder title="Hóa đơn bán sách" />} />
          
          {/* Report Routes */}
          <Route path="/reports/training" element={<Placeholder title="Báo cáo đào tạo" />} />
          <Route path="/reports/finance" element={<Placeholder title="Báo cáo tài chính (Doanh số buổi nghỉ)" />} />
          
          {/* Settings Routes */}
          <Route path="/settings/staff" element={<StaffManager />} />
          <Route path="/settings/products" element={<ProductManager />} />
          <Route path="/settings/inventory" element={<InventoryManager />} />
          <Route path="/settings/rooms" element={<RoomManager />} />
          <Route path="/settings/center" element={<Placeholder title="Thêm trung tâm" />} />
          <Route path="/settings/curriculum" element={<Placeholder title="Thêm giáo trình" />} />
          
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
