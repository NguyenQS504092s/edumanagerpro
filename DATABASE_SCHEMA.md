# EduManager Pro - Relational Database Schema

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    CENTERS      │     │   CURRICULUMS   │     │  SALARY_RULES   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │     │ position        │
│ code            │     │ level           │     │ workMethod      │
│ address         │     │ duration        │     │ baseSalary      │
│ phone           │     │ sessions        │     │ bonusPerStudent │
│ isMain          │     │ tuition         │     │ status          │
└─────────────────┘     │ status          │     └─────────────────┘
                        └─────────────────┘
                               │
                               │ curriculumId
                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     STAFF       │────▶│    CLASSES      │◀────│   STUDENTS      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │     │ name            │
│ position        │     │ level           │     │ phone           │
│ phone           │     │ schedule        │     │ status          │
│ email           │     │ teacherId (FK)  │     │ hasDebt         │
│ birthDate       │     │ assistantId(FK) │     │ classId (FK)    │
│ status          │     │ curriculumId(FK)│     │ parentId (FK)   │
└─────────────────┘     │ maxStudents     │     │ birthDate       │
        │               │ status          │     │ createdAt       │
        │               └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  WORK_SESSIONS  │     │   ATTENDANCE    │     │    PARENTS      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ staffId (FK)    │     │ classId (FK)    │     │ name            │
│ classId (FK)    │     │ studentId (FK)  │     │ phone           │
│ date            │     │ date            │     │ email           │
│ month           │     │ month           │     │ address         │
│ workType        │     │ status          │     └─────────────────┘
│ status          │     └─────────────────┘
│ salary          │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CONTRACTS     │     │   TUTORING      │     │   FEEDBACK      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ code            │     │ studentId (FK)  │     │ studentId (FK)  │
│ studentId (FK)  │     │ classId (FK)    │     │ parentId (FK)   │
│ classId (FK)    │     │ type            │     │ type            │
│ startDate       │     │ status          │     │ status          │
│ endDate         │     │ scheduledDate   │     │ score           │
│ tuition         │     │ reason          │     │ notes           │
│ discount        │     │ createdAt       │     │ createdAt       │
│ finalTotal      │     └─────────────────┘     └─────────────────┘
│ status          │
│ paymentMethod   │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ FINANCIAL_TRANS │     │   INVOICES      │     │   PRODUCTS      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ date            │     │ code            │     │ name            │
│ month           │     │ studentId (FK)  │     │ category        │
│ type            │     │ items[]         │     │ price           │
│ category        │     │ total           │     │ stock           │
│ amount          │     │ status          │     │ minStock        │
│ description     │     │ paymentDate     │     └─────────────────┘
│ studentId (FK)  │     │ createdAt       │
│ contractId (FK) │     └─────────────────┘
│ invoiceId (FK)  │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     LEADS       │     │   CAMPAIGNS     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │
│ phone           │     │ status          │
│ email           │     │ startDate       │
│ source          │     │ endDate         │
│ status          │     │ budget          │
│ campaignId (FK) │     │ registered      │
│ assignedTo (FK) │     │ target          │
│ notes           │     └─────────────────┘
│ createdAt       │
└─────────────────┘
```

## Collections & Relationships

### 1. CENTERS (Trung tâm)
```typescript
interface Center {
  id: string;                    // Primary Key
  name: string;                  // Tên trung tâm
  code: string;                  // Mã trung tâm (unique)
  address: string;
  phone: string;
  email: string;
  isMain: boolean;               // Chi nhánh chính
  createdAt: string;
}
```

### 2. CURRICULUMS (Giáo trình)
```typescript
interface Curriculum {
  id: string;                    // Primary Key
  name: string;                  // Tên giáo trình
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
  duration: number;              // Số tháng
  sessions: number;              // Số buổi học
  tuition: number;               // Học phí
  status: 'Active' | 'Inactive';
  createdAt: string;
}
```

### 3. STAFF (Nhân viên/Giáo viên)
```typescript
interface Staff {
  id: string;                    // Primary Key
  name: string;
  position: 'GV Việt' | 'GV Ngoại' | 'Trợ giảng' | 'Admin';
  phone: string;
  email: string;
  birthDate: string;
  centerId?: string;             // FK → Centers
  status: 'Active' | 'Inactive';
  createdAt: string;
}
```

### 4. CLASSES (Lớp học)
```typescript
interface Class {
  id: string;                    // Primary Key
  name: string;                  // Tên lớp
  level: string;
  schedule: string;              // Lịch học
  teacherId: string;             // FK → Staff (GV chính)
  teacherName: string;           // Denormalized for display
  assistantId?: string;          // FK → Staff (Trợ giảng)
  assistantName?: string;        // Denormalized
  curriculumId: string;          // FK → Curriculums
  curriculumName: string;        // Denormalized
  maxStudents: number;
  currentStudents: number;       // Computed/updated
  status: 'Active' | 'Inactive' | 'Completed';
  createdAt: string;
}
```

### 5. PARENTS (Phụ huynh)
```typescript
interface Parent {
  id: string;                    // Primary Key
  name: string;
  phone: string;                 // Unique
  email?: string;
  address?: string;
  childrenIds: string[];         // FK[] → Students (denormalized)
  createdAt: string;
}
```

### 6. STUDENTS (Học viên)
```typescript
interface Student {
  id: string;                    // Primary Key
  name: string;
  phone?: string;
  birthDate: string;
  
  // Relationships
  parentId: string;              // FK → Parents
  parentName: string;            // Denormalized
  parentPhone: string;           // Denormalized
  
  classId: string;               // FK → Classes (current class)
  className: string;             // Denormalized
  
  // Status
  status: 'Active' | 'Học thử' | 'Bảo lưu' | 'Nghỉ học' | 'Nợ phí';
  hasDebt: boolean;
  debtAmount?: number;
  
  createdAt: string;
}
```

### 7. CONTRACTS (Hợp đồng)
```typescript
interface Contract {
  id: string;                    // Primary Key
  code: string;                  // Mã hợp đồng (unique)
  
  // Relationships
  studentId: string;             // FK → Students
  studentName: string;           // Denormalized
  classId: string;               // FK → Classes
  className: string;             // Denormalized
  
  // Details
  startDate: string;
  endDate: string;
  tuition: number;               // Học phí gốc
  discount: number;              // Giảm giá
  finalTotal: number;            // Thành tiền
  
  status: 'Đã thanh toán' | 'Nợ phí' | 'Hủy';
  paymentMethod?: 'Tiền mặt' | 'Chuyển khoản' | 'Thẻ';
  paymentDate?: string;
  
  createdAt: string;
  createdBy?: string;            // FK → Staff
}
```

### 8. ATTENDANCE (Điểm danh)
```typescript
interface Attendance {
  id: string;                    // Primary Key
  
  // Relationships
  classId: string;               // FK → Classes
  studentId: string;             // FK → Students
  studentName: string;           // Denormalized
  
  date: string;                  // YYYY-MM-DD
  month: string;                 // YYYY-MM (for queries)
  
  status: 'Có mặt' | 'Vắng' | 'Muộn' | 'Có phép';
  notes?: string;
  
  createdAt: string;
  createdBy?: string;            // FK → Staff
}
```

### 9. TUTORING (Bồi bài)
```typescript
interface Tutoring {
  id: string;                    // Primary Key
  
  // Relationships
  studentId: string;             // FK → Students
  studentName: string;           // Denormalized
  classId: string;               // FK → Classes
  
  type: 'Nghỉ học' | 'Học yếu';
  status: 'Chưa bồi' | 'Đã hẹn' | 'Đã bồi';
  scheduledDate?: string;
  reason: string;
  notes?: string;
  
  // If from attendance
  attendanceId?: string;         // FK → Attendance
  
  month: string;                 // YYYY-MM
  createdAt: string;
}
```

### 10. WORK_SESSIONS (Buổi dạy)
```typescript
interface WorkSession {
  id: string;                    // Primary Key
  
  // Relationships
  staffId: string;               // FK → Staff
  staffName: string;             // Denormalized
  classId: string;               // FK → Classes
  className: string;             // Denormalized
  
  date: string;                  // YYYY-MM-DD
  month: string;                 // YYYY-MM
  
  workType: 'Dạy chính' | 'Trợ giảng' | 'Dạy thay' | 'Bồi bài' | 'Nhận xét';
  status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Từ chối';
  
  studentCount: number;          // Sĩ số
  salary: number;                // Lương buổi này
  
  confirmedAt?: string;
  confirmedBy?: string;          // FK → Staff
}
```

### 11. SALARY_RULES (Quy tắc lương)
```typescript
interface SalaryRule {
  id: string;                    // Primary Key
  position: 'GV Việt' | 'GV Ngoại' | 'Trợ giảng';
  workMethod: 'Cố định' | 'Theo sĩ số';
  baseSalary: number;            // Lương cơ bản/buổi
  bonusPerStudent: number;       // Thưởng theo đầu học viên
  status: 'Active' | 'Inactive';
  createdAt: string;
}
```

### 12. FINANCIAL_TRANSACTIONS (Giao dịch tài chính)
```typescript
interface FinancialTransaction {
  id: string;                    // Primary Key
  
  date: string;                  // YYYY-MM-DD
  month: string;                 // YYYY-MM
  
  type: 'income' | 'expense';
  category: 'Học phí' | 'Sách vở' | 'Đồng phục' | 'Khác';
  amount: number;
  description?: string;
  
  // Optional relationships
  studentId?: string;            // FK → Students
  contractId?: string;           // FK → Contracts
  invoiceId?: string;            // FK → Invoices
  
  createdAt: string;
  createdBy?: string;            // FK → Staff
}
```

### 13. INVOICES (Hóa đơn)
```typescript
interface Invoice {
  id: string;                    // Primary Key
  code: string;                  // Mã hóa đơn (unique)
  
  // Relationships
  studentId: string;             // FK → Students
  studentName: string;           // Denormalized
  
  items: InvoiceItem[];          // Embedded array
  total: number;
  
  status: 'Chờ thanh toán' | 'Đã thanh toán' | 'Hủy';
  paymentDate?: string;
  
  createdAt: string;
  createdBy?: string;
}

interface InvoiceItem {
  productId: string;             // FK → Products
  name: string;
  quantity: number;
  price: number;
}
```

### 14. PRODUCTS (Sản phẩm)
```typescript
interface Product {
  id: string;                    // Primary Key
  name: string;
  category: 'Sách' | 'Đồng phục' | 'Phụ kiện' | 'Văn phòng phẩm';
  price: number;
  stock: number;                 // Số lượng tồn kho
  minStock: number;              // Cảnh báo khi dưới mức này
  status: 'Active' | 'Inactive';
  createdAt: string;
}
```

### 15. LEADS (Khách hàng tiềm năng)
```typescript
interface Lead {
  id: string;                    // Primary Key
  name: string;
  phone: string;
  email?: string;
  
  source: 'Facebook' | 'Zalo' | 'Website' | 'TikTok' | 'Google' | 'Giới thiệu' | 'Khác';
  status: 'Mới' | 'Đã liên hệ' | 'Quan tâm' | 'Hẹn gặp' | 'Học thử' | 'Đăng ký' | 'Từ chối';
  
  campaignId?: string;           // FK → Campaigns
  assignedTo?: string;           // FK → Staff
  
  notes?: string;
  createdAt: string;
  
  // When converted to student
  convertedAt?: string;
  studentId?: string;            // FK → Students
}
```

### 16. CAMPAIGNS (Chiến dịch marketing)
```typescript
interface Campaign {
  id: string;                    // Primary Key
  name: string;
  status: 'Đang mở' | 'Tạm dừng' | 'Kết thúc';
  
  startDate: string;
  endDate: string;
  budget: number;
  
  target: number;                // Mục tiêu đăng ký
  registered: number;            // Đã đăng ký (computed)
  
  scriptUrl?: string;            // Link script tư vấn
  
  createdAt: string;
}
```

### 17. FEEDBACK (Phản hồi)
```typescript
interface Feedback {
  id: string;                    // Primary Key
  
  // Relationships
  studentId: string;             // FK → Students
  studentName: string;           // Denormalized
  parentId: string;              // FK → Parents
  
  type: 'Call' | 'Form';
  status: 'Cần gọi' | 'Đã gọi' | 'Hoàn thành';
  
  score?: number;                // 1-5
  notes?: string;
  
  // For Call type
  callDate?: string;
  
  // For Form type
  responses?: Record<string, number>;
  
  month: string;                 // YYYY-MM
  createdAt: string;
}
```

## Indexes Required (Firestore)

```javascript
// Composite indexes for common queries

// Students by class and status
{ collection: 'students', fields: ['classId', 'status'] }

// Attendance by class and date
{ collection: 'attendance', fields: ['classId', 'date'] }
{ collection: 'attendance', fields: ['studentId', 'month'] }

// Work sessions by staff and month
{ collection: 'workSessions', fields: ['staffId', 'month', 'status'] }

// Contracts by student and status
{ collection: 'contracts', fields: ['studentId', 'status'] }

// Financial by month and category
{ collection: 'financialTransactions', fields: ['month', 'category'] }
{ collection: 'financialTransactions', fields: ['month', 'type'] }

// Leads by status and source
{ collection: 'leads', fields: ['status', 'source'] }
{ collection: 'leads', fields: ['campaignId', 'status'] }
```

## Data Integrity Rules

### On Student Create/Update:
1. Verify `parentId` exists in Parents collection
2. Verify `classId` exists in Classes collection
3. Update `Parent.childrenIds` array
4. Update `Class.currentStudents` count

### On Contract Create:
1. Verify `studentId` exists
2. Verify `classId` exists
3. Generate unique `code`
4. If status = 'Nợ phí', set `Student.hasDebt = true`

### On Attendance Save:
1. Verify `studentId` and `classId` exist
2. If status = 'Vắng', auto-create Tutoring record

### On Work Session Confirm:
1. Calculate salary based on SalaryRules
2. Update status to 'Đã xác nhận'

### On Invoice Create:
1. Verify all `productId` in items exist
2. Decrease `Product.stock` for each item
3. Create FinancialTransaction record

### On Lead Convert:
1. Create new Student record
2. Create new Parent record (if needed)
3. Update Lead with `studentId` and `convertedAt`
4. Update Campaign `registered` count
