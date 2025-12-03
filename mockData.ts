
import { ClassModel, ClassStatus, Student, StudentStatus, Staff, ClassSession, Holiday, TutoringSession, AttendanceRecord, Product, Room, EnrollmentRecord, Parent, FeedbackRecord, SalaryRule, SalaryRangeConfig, WorkSession, SalarySummary, SalaryDetailItem, StaffSalaryRecord, StaffAttendanceLog } from './types';

export const MOCK_CLASSES: ClassModel[] = [
  {
    id: 'C001',
    name: 'Tiếng Anh Giao Tiếp K12',
    status: ClassStatus.STUDYING,
    curriculum: 'Cambridge Movers',
    ageGroup: '8-10 tuổi',
    progress: '15/24 Buổi',
    teacher: 'Nguyễn Văn A',
    assistant: 'Trần Thị B',
    foreignTeacher: 'Mr. John Smith',
    studentsCount: 15,
    startDate: '2023-09-01',
    endDate: '2023-12-01'
  },
  {
    id: 'C002',
    name: 'IELTS Foundation 05',
    status: ClassStatus.PAUSED,
    curriculum: 'Mindset for IELTS 1',
    ageGroup: '15-18 tuổi',
    progress: '8/30 Buổi',
    teacher: 'Lê Thị C',
    assistant: 'Phạm Văn D',
    studentsCount: 10,
    startDate: '2023-10-15',
    endDate: '2024-02-15'
  },
  {
    id: 'C003',
    name: 'Tiếng Anh Mầm Non Bee 1',
    status: ClassStatus.FINISHED,
    curriculum: 'Super Safari 1',
    ageGroup: '4-6 tuổi',
    progress: '24/24 Buổi',
    teacher: 'Hoàng Thị E',
    assistant: 'Ngô Văn F',
    foreignTeacher: 'Ms. Sarah',
    studentsCount: 12,
    startDate: '2023-06-01',
    endDate: '2023-09-01'
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'S001',
    code: 'HV23001',
    fullName: 'Nguyễn Gia Bảo',
    dob: '2015-04-25', // April birthday
    gender: 'Nam',
    phone: '0901234567',
    parentName: 'Nguyễn Văn Ba',
    status: StudentStatus.ACTIVE,
    class: 'Tiếng Anh Giao Tiếp K12',
    careHistory: [
      { id: 'CH1', date: '2023-10-20', type: 'Bồi bài', content: 'Bồi bài Unit 5 do nghỉ ốm', staff: 'Trần Thị B' },
      { id: 'CH2', date: '2023-10-25', type: 'Phản hồi', content: 'Phụ huynh khen con tiến bộ', staff: 'Admin' }
    ]
  },
  {
    id: 'S002',
    code: 'HV23002',
    fullName: 'Trần Minh Anh',
    dob: '2016-05-26', 
    gender: 'Nữ',
    phone: '0909876543',
    parentName: 'Trần Thị Mẹ',
    status: StudentStatus.TRIAL,
    class: 'Tiếng Anh Mầm Non Bee 1',
    careHistory: []
  },
  {
    id: 'S003',
    code: 'HV23003',
    fullName: 'Lê Hoàng Nam',
    dob: '2014-01-15',
    gender: 'Nam',
    phone: '0912345678',
    parentName: 'Lê Văn Bố',
    status: StudentStatus.RESERVED,
    class: 'IELTS Foundation 05',
    careHistory: [
        { id: 'CH3', date: '2023-09-10', type: 'Tư vấn', content: 'Tư vấn bảo lưu do gia đình đi du lịch', staff: 'Sale Team' }
    ]
  },
  {
    id: 'S004',
    code: 'HV23004',
    fullName: 'Phạm Thị D',
    dob: '2010-03-10',
    gender: 'Nữ',
    phone: '0933333333',
    parentName: 'Phạm Văn E',
    status: StudentStatus.DROPPED,
    class: 'Tiếng Anh Giao Tiếp K12',
    careHistory: []
  },
  {
    id: 'S005',
    code: 'HV23005',
    fullName: 'Đỗ Nguyệt An - Ami',
    dob: '2020-04-16',
    gender: 'Nữ',
    phone: '0981490369',
    parentName: 'A Quyền',
    status: StudentStatus.ACTIVE,
    class: 'Kindy 4',
    careHistory: []
  },
  {
    id: 'S006',
    code: 'HV23006',
    fullName: 'Đỗ Thành Nam - Nick',
    dob: '2021-09-17',
    gender: 'Nam',
    phone: '0981490369',
    parentName: 'A Quyền',
    status: StudentStatus.RESERVED,
    class: 'Sunny 6',
    careHistory: []
  }
];

export const MOCK_SCHEDULE: ClassSession[] = [
    { id: 'SCH1', className: 'Tiếng Anh Giao Tiếp K12', room: 'P.101', teacher: 'Nguyễn Văn A', time: '17:30 - 19:00', dayOfWeek: 'Thứ 2' },
    { id: 'SCH2', className: 'IELTS Foundation 05', room: 'P.102', teacher: 'Lê Thị C', time: '19:15 - 20:45', dayOfWeek: 'Thứ 2' },
    { id: 'SCH3', className: 'Tiếng Anh Mầm Non Bee 1', room: 'P.Kid', teacher: 'Hoàng Thị E', time: '17:30 - 19:00', dayOfWeek: 'Thứ 3' },
    { id: 'SCH4', className: 'Tiếng Anh Giao Tiếp K12', room: 'P.101', teacher: 'Nguyễn Văn A', time: '17:30 - 19:00', dayOfWeek: 'Thứ 4' },
    { id: 'SCH5', className: 'IELTS Foundation 05', room: 'P.102', teacher: 'Lê Thị C', time: '19:15 - 20:45', dayOfWeek: 'Thứ 4' },
];

export const MOCK_STAFF: Staff[] = [
    { id: 'ST00', code: 'AD001', name: 'System Administrator', role: 'Quản trị viên', department: 'Admin', position: 'Quản trị viên', status: 'Active', phone: '0123456789' },
    { id: 'ST01', code: 'GV001', name: 'Nguyễn Văn A', role: 'Giáo viên', department: 'Đào tạo', position: 'Giáo viên Tiếng Anh', status: 'Active', phone: '0987654321' },
    { id: 'ST02', code: 'TG002', name: 'Trần Thị B', role: 'Trợ giảng', department: 'Đào tạo', position: 'Trợ giảng Full-time', status: 'Active', phone: '0912345678' },
    { id: 'ST03', code: 'NV003', name: 'Phạm Văn Sale', role: 'Nhân viên', department: 'Kinh doanh', position: 'Tư vấn viên', status: 'Active', phone: '0999888777' },
    { id: 'ST04', code: 'NV004', name: 'Lê Thị H', role: 'Nhân viên', department: 'Văn phòng', position: 'Lễ tân', status: 'Active', phone: '0933112233' },
];

export const MOCK_HOLIDAYS: Holiday[] = [
    { id: 'H1', name: 'Nghỉ lễ Quốc Khánh', startDate: '2023-09-02', endDate: '2023-09-04', status: 'Đã áp dụng' },
    { id: 'H2', name: 'Tết Nguyên Đán', startDate: '2024-02-08', endDate: '2024-02-14', status: 'Chưa áp dụng' },
];

export const MOCK_TUTORING: TutoringSession[] = [
    { id: 'T1', studentName: 'Nguyễn Gia Bảo', className: 'Tiếng Anh Giao Tiếp K12', date: '2023-10-22', time: '15:00', teacher: 'Trần Thị B', content: 'Ôn tập Unit 3', status: 'Đã hẹn' },
    { id: 'T2', studentName: 'Trần Minh Anh', className: 'IELTS Foundation 05', date: '2023-10-21', time: '16:30', teacher: 'Lê Thị C', content: 'Luyện Speaking', status: 'Hoàn thành' },
];

export const MOCK_ATTENDANCE_HISTORY: AttendanceRecord[] = [
    { id: 'A1', className: 'Tiếng Anh Giao Tiếp K12', date: '2023-10-16', totalStudents: 15, present: 14, absent: 1, status: 'Đã điểm danh' },
    { id: 'A2', className: 'IELTS Foundation 05', date: '2023-10-16', totalStudents: 10, present: 10, absent: 0, status: 'Đã điểm danh' },
    { id: 'A3', className: 'Tiếng Anh Mầm Non Bee 1', date: '2023-10-17', totalStudents: 12, present: 0, absent: 0, status: 'Chưa điểm danh' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'P1', name: 'Bộ Sách Academy Stars 1', price: 250000, category: 'Sách', stock: 15, status: 'Kích hoạt' },
    { id: 'P2', name: 'Bộ Sách Academy Stars 2', price: 250000, category: 'Sách', stock: 8, status: 'Kích hoạt' },
    { id: 'P3', name: 'Đồng phục áo polo (Size M)', price: 150000, category: 'Đồng phục', stock: 50, status: 'Kích hoạt' },
    { id: 'P4', name: 'Balo trung tâm', price: 200000, category: 'Khác', stock: 20, status: 'Kích hoạt' },
];

export const MOCK_ROOMS: Room[] = [
    { id: 'R1', name: 'Phòng 1 - Tầng 2', type: 'Phòng học', status: 'Hoạt động', capacity: 15 },
    { id: 'R2', name: 'Phòng 2 - Tầng 2', type: 'Phòng học', status: 'Hoạt động', capacity: 15 },
    { id: 'R3', name: 'Phòng 1 - Tầng 3', type: 'Phòng học', status: 'Hoạt động', capacity: 20 },
    { id: 'R4', name: 'Phòng Kid', type: 'Phòng chức năng', status: 'Bảo trì', capacity: 10 },
    { id: 'R5', name: 'Văn phòng tuyển sinh', type: 'Văn phòng', status: 'Hoạt động' },
];

export const MOCK_ENROLLMENTS: EnrollmentRecord[] = [
    { 
        id: 'E1', 
        studentName: 'Nguyễn Văn A', 
        sessions: 48, 
        type: 'Hợp đồng mới', 
        contractCode: 'HĐ_20231001', 
        originalAmount: 6300000, 
        finalAmount: 6300000, 
        createdDate: '24/03/2024', 
        createdBy: 'Nguyễn Văn A' 
    },
    { 
        id: 'E2', 
        studentName: 'Nguyễn Văn B', 
        sessions: 96, 
        type: 'Hợp đồng tái phí', 
        contractCode: 'HĐ_20231002', 
        originalAmount: 9600000, 
        finalAmount: 4800000, 
        createdDate: '25/03/2024', 
        createdBy: 'Trần Thị B' 
    },
];

export const MOCK_PARENTS: Parent[] = [
  {
    id: 'P1',
    fatherName: 'A Quyền',
    fatherPhone: '0981490369',
    children: [
      { id: 'S005', name: 'Đỗ Nguyệt An - Ami', dob: '16/04/2020', class: 'Kindy 4', status: StudentStatus.ACTIVE },
      { id: 'S006', name: 'Đỗ Thành Nam - Nick', dob: '17/09/2021', class: 'Sunny 6', status: StudentStatus.RESERVED },
    ]
  },
  {
    id: 'P2',
    fatherName: 'Chị Nga',
    fatherPhone: '0123456789',
    children: [
      { id: 'S001', name: 'Nguyễn Gia Bảo', dob: '20/05/2015', class: 'Tiếng Anh Giao Tiếp K12', status: StudentStatus.ACTIVE }
    ]
  }
];

export const MOCK_FEEDBACKS: FeedbackRecord[] = [
  { 
    id: 'FB1', 
    type: 'Call', 
    date: '24/03/2024', 
    studentName: 'Đỗ Nguyệt An - Ami',
    className: 'Kindy 4',
    teacher: 'Nhiệt tình, năng động (9)',
    curriculumScore: 9,
    careScore: 8,
    facilitiesScore: 7,
    averageScore: 8.25,
    caller: 'Nga Nguyễn',
    content: 'Chưa tốt lắm, thi thoảng thông báo chậm',
    status: 'Đã gọi'
  },
  {
    id: 'FB2',
    type: 'Call',
    date: '25/03/2024',
    studentName: 'Đỗ Thành Nam - Nick',
    className: 'Sunny 6',
    teacher: '---',
    status: 'Cần gọi'
  },
  {
    id: 'FB3',
    type: 'Form',
    date: '20/03/2024',
    studentName: 'Đỗ Nguyệt An - Ami',
    className: 'Kindy 4',
    teacher: 'Nhiệt tình (9)',
    curriculumScore: 9,
    careScore: 8,
    facilitiesScore: 7,
    averageScore: 8.25,
    content: 'Chưa tốt lắm, thi thoảng thông báo chậm',
    status: 'Hoàn thành'
  }
];

export const MOCK_SALARY_RULES: SalaryRule[] = [
    { id: 'SR1', staffName: 'Nguyễn Thị A', dob: '05/12/1994', position: 'Giáo Viên Việt', class: 'Lớp A', salaryMethod: 'Theo ca', baseRate: 200000, workMethod: 'Cố định', avgStudents: 7, ratePerSession: 200000, effectiveDate: '23/04/2024' },
    { id: 'SR2', staffName: 'Nguyễn Thị A', dob: '05/12/1994', position: 'Giáo Viên Việt', class: 'Lớp B', salaryMethod: 'Theo ca', baseRate: 200000, workMethod: 'Theo sĩ số', avgStudents: 11, ratePerSession: 200000, effectiveDate: '23/04/2024' },
    { id: 'SR3', staffName: 'Alex', dob: '05/12/1994', position: 'Giáo Viên Nước Ngoài', class: 'Lớp E', salaryMethod: 'Theo giờ', baseRate: 340000, workMethod: 'Cố định', avgStudents: 12, ratePerSession: 340000, effectiveDate: '23/04/2024' },
    { id: 'SR4', staffName: 'Nguyễn Thị D', dob: '05/12/1994', position: 'Trợ Giảng', class: 'Lớp F', salaryMethod: 'Nhận xét', baseRate: 25000, workMethod: 'Theo sĩ số', avgStudents: 10, ratePerSession: 30000, effectiveDate: '24/04/2024' },
];

export const MOCK_SALARY_RANGES: SalaryRangeConfig[] = [
    { id: 'R1', type: 'Teaching', rangeLabel: '<5', method: 'Cố định', amount: 200000 },
    { id: 'R2', type: 'Teaching', rangeLabel: '5-9', method: 'Sĩ số', amount: 200000 },
    { id: 'R3', type: 'Teaching', rangeLabel: '10-20', method: 'Sĩ số', amount: 200000 },
    { id: 'R4', type: 'AssistantFeedback', rangeLabel: '<10', amount: 25000 },
    { id: 'R5', type: 'AssistantFeedback', rangeLabel: '>10', amount: 30000 },
];

export const MOCK_WORK_SESSIONS: WorkSession[] = [
    { id: 'WS1', staffName: 'Giáo viên A', position: 'Giáo viên Việt', date: '01/04', timeStart: '17h30', timeEnd: '19h00', className: 'Movers 1A', type: 'Dạy chính', status: 'Đã xác nhận' },
    { id: 'WS2', staffName: 'Giáo viên A', position: 'Giáo viên Việt', date: '01/04', timeStart: '19h30', timeEnd: '21h00', className: 'Movers 2A', type: 'Dạy chính', status: 'Chờ xác nhận' },
    { id: 'WS3', staffName: 'Trợ Giảng B', position: 'Trợ giảng', date: '01/04', timeStart: '19h30', timeEnd: '21h00', className: 'Movers 2C', type: 'Trợ giảng', status: 'Đã xác nhận' },
    { id: 'WS4', staffName: 'Trợ Giảng C', position: 'Trợ giảng', date: '01/04', timeStart: '19h30', timeEnd: '21h00', className: 'Movers 2D', type: 'Nhận xét', status: 'Đã xác nhận' },
];

export const MOCK_SALARY_SUMMARIES: SalarySummary[] = [
    { id: 'S1', staffName: 'Nguyễn Thị A', dob: '05/12/1994', position: 'Giáo Viên Việt', estimatedSalary: 4500000, expectedSalary: 5500000 },
    { id: 'S2', staffName: 'Nguyễn Thị B', dob: '05/12/1994', position: 'Giáo Viên Việt', estimatedSalary: 3348276, expectedSalary: 3465364 },
    { id: 'S3', staffName: 'Alex', dob: '05/12/1994', position: 'Giáo Viên Nước Ngoài', estimatedSalary: 8500000, expectedSalary: 9500000 },
    { id: 'S4', staffName: 'Nguyễn Thị D', dob: '05/12/1994', position: 'Trợ Giảng', estimatedSalary: 3712372, expectedSalary: 4529323 },
];

export const MOCK_SALARY_DETAILS: Record<string, SalaryDetailItem[]> = {
    'S1': [
        { id: 'D1', date: '1/4', time: '17h30 - 19h00', className: 'Lớp A', studentCount: 9, salary: 250000 },
        { id: 'D2', date: '1/4', time: '19h00 - 19h30', className: 'Bồi bài', studentCount: 1, salary: 200000, type: 'Bồi bài' },
        { id: 'D3', date: '1/4', time: '19h30 - 21h00', className: 'Lớp C', studentCount: 12, salary: 220000 },
        { id: 'D4', date: '2/4', time: '18h00 - 19h30', className: 'Lớp B', studentCount: 5, salary: 220000 },
        { id: 'D5', date: '3/4', time: '18h00 - 19h30', className: 'Lớp C', studentCount: 6, salary: 220000 },
        { id: 'D6', date: '4/4', time: '18h00 - 19h30', className: 'Lớp B', studentCount: 7, salary: 220000 },
        { id: 'D7', date: '5/4', time: '18h00 - 19h30', className: 'Lớp A', studentCount: 9, salary: 250000 },
    ],
    'S3': [
        { id: 'D8', date: '1/4', time: '17h30 - 18h30', className: 'Lớp A', salary: 340000 },
        { id: 'D9', date: '1/4', time: '18h30 - 19h00', className: 'Lớp B', salary: 170000 },
        { id: 'D10', date: '1/4', time: '19h00 - 19h30', className: 'Lớp C', salary: 170000 },
        { id: 'D11', date: '2/4', time: '18h00 - 19h00', className: 'Lớp B', salary: 340000 },
        { id: 'D12', date: '3/4', time: '18h00 - 19h00', className: 'Lớp C', salary: 340000 },
        { id: 'D13', date: '4/4', time: '18h00 - 19h00', className: 'Lớp B', salary: 340000 },
        { id: 'D14', date: '5/4', time: '18h00 - 19h00', className: 'Lớp A', salary: 340000 },
    ],
    'S4': [
        { id: 'D15', date: '1/4', time: '17h30 - 18h30', className: 'Lớp A', mainSalary: 50000, salary: 50000 },
        { id: 'D16', date: '1/4', time: '18h30 - 19h00', className: 'Lớp B', mainSalary: 25000, salary: 25000 },
        { id: 'D17', date: '1/4', time: '19h00 - 20h30', className: 'Lớp C', mainSalary: 100000, feedbackSalary: 25000, salary: 125000 },
        { id: 'D18', date: '2/4', time: '18h00 - 19h00', className: 'Lớp C', mainSalary: 50000, salary: 50000 },
        { id: 'D19', date: '3/4', time: '18h00 - 19h00', className: 'Lớp C', mainSalary: 50000, salary: 50000 },
        { id: 'D20', date: '4/4', time: '18h00 - 19h00', className: 'Lớp B', mainSalary: 50000, salary: 50000 },
        { id: 'D21', date: '4/4', time: '19h00 - 19h30', className: 'Bồi bài', mainSalary: 12500, salary: 12500 },
        { id: 'D22', date: '5/4', time: '18h00 - 19h00', className: 'Lớp A', mainSalary: 50000, salary: 50000 },
    ]
};

export const MOCK_STAFF_SALARIES: StaffSalaryRecord[] = [
    { id: 'SS1', staffName: 'Phạm Văn Sale', position: 'Tư vấn viên', baseSalary: 6000000, workDays: 24, commission: 2500000, allowance: 500000, deduction: 0, totalSalary: 9000000 },
    { id: 'SS2', staffName: 'Lê Thị H', position: 'Lễ tân', baseSalary: 5500000, workDays: 26, commission: 500000, allowance: 300000, deduction: 100000, totalSalary: 6200000 },
];

export const MOCK_STAFF_ATTENDANCE: Record<string, StaffAttendanceLog[]> = {
    'SS1': [
        { id: 'A1', date: '01/04/2024', checkIn: '08:00', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A2', date: '02/04/2024', checkIn: '08:15', checkOut: '17:30', status: 'Đi muộn', note: 'Kẹt xe' },
        { id: 'A3', date: '03/04/2024', checkIn: '07:55', checkOut: '17:35', status: 'Đúng giờ' },
        { id: 'A4', date: '04/04/2024', checkIn: '08:00', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A5', date: '05/04/2024', checkIn: '08:00', checkOut: '16:30', status: 'Về sớm', note: 'Có việc gia đình' },
    ],
    'SS2': [
        { id: 'A6', date: '01/04/2024', checkIn: '07:45', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A7', date: '02/04/2024', checkIn: '07:50', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A8', date: '03/04/2024', checkIn: '07:55', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A9', date: '04/04/2024', checkIn: '08:00', checkOut: '17:30', status: 'Đúng giờ' },
        { id: 'A10', date: '05/04/2024', checkIn: '08:00', checkOut: '17:30', status: 'Đúng giờ' },
    ]
};
