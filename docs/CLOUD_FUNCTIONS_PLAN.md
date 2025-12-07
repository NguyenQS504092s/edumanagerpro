# Firebase Cloud Functions Implementation Plan

## Mục tiêu
Implement Firebase Cloud Functions để giải quyết các vấn đề:
1. **Data Integrity** - Tự động cascade updates khi data thay đổi
2. **Auto-generation** - Tự động tạo sessions khi tạo class
3. **Data Consistency** - Đảm bảo data nhất quán giữa các collections

---

## Phase 1: Setup & Infrastructure

### 1.1 Project Setup
- [x] Tạo folder `functions/`
- [x] Tạo `package.json`
- [x] Tạo `tsconfig.json`
- [x] Tạo `src/index.ts`
- [ ] Install dependencies
- [ ] Update `firebase.json`
- [ ] Test với Firebase Emulator

### 1.2 Files Structure
```
functions/
├── src/
│   ├── index.ts                 # Main entry, exports all functions
│   ├── config/
│   │   └── constants.ts         # Shared constants
│   ├── triggers/
│   │   ├── classTriggers.ts     # Class collection triggers
│   │   ├── studentTriggers.ts   # Student collection triggers
│   │   └── sessionTriggers.ts   # Session collection triggers
│   ├── utils/
│   │   ├── scheduleParser.ts    # Parse schedule string
│   │   └── batchUtils.ts        # Batch operation helpers
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

---

## Phase 2: Class Triggers

### 2.1 onClassCreate
**Trigger:** Khi tạo class mới
**Actions:**
- [ ] Auto-generate sessions dựa trên `schedule` và `totalSessions`
- [ ] Validate required fields
- [ ] Set default values nếu thiếu

```typescript
// Pseudo code
exports.onClassCreate = functions.firestore
  .document('classes/{classId}')
  .onCreate(async (snap, context) => {
    const classData = snap.data();
    
    // Generate sessions if schedule and totalSessions exist
    if (classData.schedule && classData.totalSessions) {
      await generateSessions(context.params.classId, classData);
    }
  });
```

### 2.2 onClassUpdate
**Trigger:** Khi update class
**Actions:**
- [ ] Cascade `className` to: students, classSessions, attendance
- [ ] Cascade `teacher` to: classSessions
- [ ] Cascade `room` to: classSessions
- [ ] Regenerate sessions if `schedule` or `totalSessions` changed

```typescript
// Fields to cascade
const CASCADE_MAP = {
  'name': ['students.class', 'students.className', 'classSessions.className', 'attendance.className'],
  'teacher': ['classSessions.teacherName'],
  'room': ['classSessions.room'],
};
```

### 2.3 onClassDelete
**Trigger:** Khi xóa class
**Actions:**
- [ ] Delete all related classSessions
- [ ] Update students (clear classId, set status)
- [ ] Archive or delete attendance records

---

## Phase 3: Student Triggers

### 3.1 onStudentUpdate
**Trigger:** Khi update student
**Actions:**
- [ ] Sync student info to attendance records
- [ ] Update class student counts when status changes

### 3.2 onStudentDelete
**Trigger:** Khi xóa student
**Actions:**
- [ ] Archive attendance records
- [ ] Update class student counts

---

## Phase 4: Session Triggers

### 4.1 onSessionUpdate
**Trigger:** Khi update session (điểm danh xong)
**Actions:**
- [ ] Update class progress
- [ ] Calculate completion percentage

---

## Phase 5: Utility Functions

### 5.1 Schedule Parser
```typescript
// Input: "14:00-15:30 T2, T4, T6" 
// Output: { time: "14:00-15:30", days: [1, 3, 5] }
function parseSchedule(schedule: string): ScheduleInfo
```

### 5.2 Session Generator
```typescript
// Generate sessions based on schedule and totalSessions
async function generateSessions(
  classId: string,
  className: string,
  schedule: string,
  totalSessions: number,
  startDate: string
): Promise<number>
```

### 5.3 Batch Helper
```typescript
// Helper to handle batches > 500 operations
async function batchWrite(
  operations: BatchOperation[]
): Promise<void>
```

---

## Phase 6: Testing

### 6.1 Local Testing với Emulator
- [ ] Setup Firebase Emulator
- [ ] Test class triggers
- [ ] Test student triggers
- [ ] Test cascade updates

### 6.2 Test Cases
```
□ Create class → Sessions auto-generated
□ Update class name → All related docs updated
□ Delete class → Sessions deleted, students updated
□ Update student status → Class counts updated
□ Complete session → Progress updated
```

---

## Phase 7: Deployment

### 7.1 Deploy Steps
1. [ ] Build functions: `cd functions && npm run build`
2. [ ] Deploy functions: `firebase deploy --only functions`
3. [ ] Verify in Firebase Console
4. [ ] Test in production

### 7.2 Monitoring
- [ ] Setup Cloud Functions logs
- [ ] Setup error alerts
- [ ] Monitor execution time

---

## Data Model Reference

### Collections & Relationships
```
classes
├── id
├── name ──────────────┐
├── teacher ───────────┤
├── room ──────────────┤
├── schedule           │
├── totalSessions      │
└── ...                │
                       │
students               │
├── classId ───────────┤ (FK)
├── class ─────────────┤ (denormalized)
├── className ─────────┤ (denormalized)
└── ...                │
                       │
classSessions          │
├── classId ───────────┤ (FK)
├── className ─────────┤ (denormalized)
├── teacherName ───────┤ (denormalized)
├── room ──────────────┘ (denormalized)
└── ...

attendance
├── classId ───────────┐ (FK)
├── className ─────────┘ (denormalized)
├── studentId
└── ...
```

### Cascade Update Matrix
| Source Field | Target Collections | Target Fields |
|--------------|-------------------|---------------|
| classes.name | students | class, className |
| classes.name | classSessions | className |
| classes.name | attendance | className |
| classes.teacher | classSessions | teacherName |
| classes.room | classSessions | room |
| students.fullName | attendance | studentName |

---

## Progress Tracking

### Current Status: Phase 2 - DEPLOYED ✅
- **Started:** 2024-12-06
- **Last Updated:** 2024-12-06
- **Deployment:** SUCCESS

### Completed
- [x] Created plan document
- [x] Created functions folder structure
- [x] Created package.json
- [x] Created tsconfig.json
- [x] Created index.ts entry point
- [x] Install dependencies
- [x] Create trigger files
- [x] Upgrade to Blaze plan
- [x] Deploy to production

### Deployed Functions (9 total)
| Function | Trigger | Status |
|----------|---------|--------|
| onClassCreate | classes/{classId} onCreate | ✅ Active |
| onClassUpdate | classes/{classId} onUpdate | ✅ Active |
| onClassDelete | classes/{classId} onDelete | ✅ Active |
| onStudentCreate | students/{studentId} onCreate | ✅ Active |
| onStudentUpdate | students/{studentId} onUpdate | ✅ Active |
| onStudentDelete | students/{studentId} onDelete | ✅ Active |
| onSessionCreate | classSessions/{sessionId} onCreate | ✅ Active |
| onSessionUpdate | classSessions/{sessionId} onUpdate | ✅ Active |
| onSessionDelete | classSessions/{sessionId} onDelete | ✅ Active |

### Next Steps
- [ ] Test functions với dữ liệu thực
- [ ] Remove duplicate logic từ frontend
- [ ] Monitor logs trong Firebase Console

### Blocked
- None

### Notes
- Firebase region: asia-southeast1 (same as Firestore)
- Node.js version: 18
- Firestore batch limit: 500 operations per batch

---

## Commands Reference

```bash
# Install dependencies
cd functions && npm install

# Build
npm run build

# Start emulator
firebase emulators:start

# Deploy functions only
firebase deploy --only functions

# View logs
firebase functions:log

# Test specific function
firebase functions:shell
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold start latency | User experience | Use minimum instances |
| Infinite trigger loops | Cost, crashes | Add checks to prevent re-triggering |
| Batch size > 500 | Function fails | Split into multiple batches |
| Function timeout | Incomplete updates | Use transactions, retry logic |

---

## References
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Best Practices](https://firebase.google.com/docs/functions/tips)
