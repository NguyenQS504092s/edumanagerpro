
export enum ClassStatus {
  STUDYING = 'Đang học',
  FINISHED = 'Kết thúc',
  PAUSED = 'Tạm dừng',
  PENDING = 'Chờ mở'
}

export enum StudentStatus {
  ACTIVE = 'Đang học',
  RESERVED = 'Bảo lưu',
  DROPPED = 'Đã nghỉ',
  TRIAL = 'Học thử'
}

export enum AttendanceStatus {
  PRESENT = 'Có mặt',
  ABSENT = 'Vắng',
  RESERVED = 'Bảo lưu',
  TUTORED = 'Đã bồi'
}

export interface ClassSession {
  id: string;
  className: string;
  room: string;
  teacher: string;
  time: string;
  dayOfWeek: string;
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  dob: string; // ISO date
  gender: 'Nam' | 'Nữ';
  phone: string;
  parentId?: string; // Reference to parents collection
  parentName?: string; // Denormalized for display (auto-synced)
  parentPhone?: string; // Denormalized for display (auto-synced)
  status: StudentStatus;
  careHistory: CareLog[];
  class?: string; // Current class name
}

export interface CareLog {
  id: string;
  date: string;
  type: 'Bồi bài' | 'Phản hồi' | 'Tư vấn';
  content: string;
  staff: string;
}

export interface ClassModel {
  id: string;
  name: string;
  status: ClassStatus;
  curriculum: string;
  ageGroup: string;
  progress: string; // e.g., "12/24 Buổi"
  teacher: string;
  assistant: string;
  foreignTeacher?: string;
  studentsCount: number;
  startDate: string;
  endDate: string;
}

export interface Staff {
  id: string;
  name: string;
  code: string;
  role: 'Giáo viên' | 'Trợ giảng' | 'Nhân viên' | 'Quản lý' | 'Quản trị viên';
  department: string;
  position: string;
  phone: string;
  email?: string;
  status: 'Active' | 'Inactive';
  dob?: string;
  startDate?: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Đã áp dụng' | 'Chưa áp dụng';
}

export interface TutoringSession {
  id: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  teacher: string;
  content: string;
  status: 'Đã hẹn' | 'Hoàn thành' | 'Hủy';
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  date: string;
  sessionNumber?: number;
  totalStudents: number;
  present: number;
  absent: number;
  reserved: number;
  tutored: number;
  status: 'Đã điểm danh' | 'Chưa điểm danh';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentAttendance {
  id?: string;
  attendanceId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
  note?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Sách' | 'Đồng phục' | 'Học liệu' | 'Khác';
  stock: number;
  status: 'Kích hoạt' | 'Tạm khoá';
}

export interface Room {
  id: string;
  name: string;
  type: 'Văn phòng' | 'Phòng học' | 'Phòng chức năng';
  capacity?: number;
  status: 'Hoạt động' | 'Bảo trì';
}

export interface EnrollmentRecord {
  id: string;
  studentName: string;
  sessions: number;
  type: 'Hợp đồng mới' | 'Hợp đồng tái phí' | 'Ghi danh thủ công';
  contractCode?: string;
  originalAmount: number;
  finalAmount: number;
  createdDate: string;
  createdBy: string;
  note?: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  relationship?: 'Bố' | 'Mẹ' | 'Ông/Bà' | 'Khác';
  createdAt?: string;
  updatedAt?: string;
  // children will be queried from students collection by parentId
}

export interface FeedbackRecord {
  id: string;
  date: string;
  type: 'Call' | 'Form';
  studentName: string;
  className: string;
  teacher: string;
  curriculumScore?: number;
  careScore?: number;
  facilitiesScore?: number;
  averageScore?: number;
  caller?: string; // For Call type
  content?: string; // For Call type
  status: 'Cần gọi' | 'Đã gọi' | 'Hoàn thành';
}

export interface SalaryRule {
  id: string;
  staffName: string;
  dob: string;
  position: 'Giáo Viên Việt' | 'Giáo Viên Nước Ngoài' | 'Trợ Giảng';
  class: string;
  salaryMethod: 'Theo ca' | 'Theo giờ' | 'Nhận xét' | 'Dạy chính';
  baseRate: number;
  workMethod: 'Cố định' | 'Theo sĩ số';
  avgStudents: number;
  ratePerSession: number;
  effectiveDate: string;
}

export interface SalaryRangeConfig {
  id: string;
  type: 'Teaching' | 'AssistantFeedback';
  rangeLabel: string;
  method?: string;
  amount: number;
}

export interface WorkSession {
  id: string;
  staffName: string;
  position: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  className: string;
  type: 'Dạy chính' | 'Nhận xét' | 'Trợ giảng';
  status: 'Đã xác nhận' | 'Chờ xác nhận';
}

export interface SalarySummary {
  id: string;
  staffName: string;
  dob: string;
  position: 'Giáo Viên Việt' | 'Giáo Viên Nước Ngoài' | 'Trợ Giảng';
  estimatedSalary: number;
  expectedSalary: number;
  kpiBonus?: number;
}

export interface SalaryDetailItem {
  id: string;
  date: string;
  time: string;
  className: string;
  studentCount?: number;
  salary: number;
  mainSalary?: number; // For Assistant
  feedbackSalary?: number; // For Assistant
  type?: string; // e.g., 'Bồi bài', 'Dạy chính'
}

export interface StaffSalaryRecord {
  id: string;
  staffName: string;
  position: string;
  baseSalary: number;
  workDays: number;
  commission: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
}

export interface StaffAttendanceLog {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Đúng giờ' | 'Đi muộn' | 'Về sớm' | 'Nghỉ phép';
  note?: string;
}

export type MenuItem = {
  id: string;
  label: string;
  icon: any;
  path?: string;
  subItems?: MenuItem[];
};

// ==========================================
// CONTRACT TYPES
// ==========================================

export enum ContractType {
  STUDENT = 'Học viên',
  PRODUCT = 'Học liệu'
}

export enum ContractStatus {
  DRAFT = 'Nháp',
  PAID = 'Đã thanh toán',
  DEBT = 'Nợ phí',
  CANCELLED = 'Đã hủy'
}

export enum PaymentMethod {
  FULL = 'Toàn bộ',
  INSTALLMENT = 'Trả góp',
  TRANSFER = 'Chuyển khoản',
  CASH = 'Tiền mặt'
}

export interface Course {
  id: string;
  code: string;
  name: string;
  totalSessions: number;
  pricePerSession: number;
  totalPrice: number;
  curriculum?: string;
  level?: string;
  ageGroup?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ContractItem {
  type: 'course' | 'product';
  id: string;
  name: string;
  classId?: string;
  className?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discount: number; // 0-1 (0.2 = 20%)
  finalPrice: number;
  debtSessions?: number;
  startDate?: string;
  endDate?: string;
}

export interface Contract {
  id: string;
  code: string;
  type: ContractType;
  
  // Student Info
  studentId?: string;
  studentName?: string;
  studentDOB?: string;
  parentName?: string;
  parentPhone?: string;
  
  // Items
  items: ContractItem[];
  
  // Financial
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  totalAmountInWords: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  paidAmount: number;
  remainingAmount: number;
  
  // Dates
  contractDate: string;
  paymentDate?: string;
  
  // Status
  status: ContractStatus;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContractPayment {
  id: string;
  contractId: string;
  contractCode: string;
  amount: number;
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ';
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}
