# 🚀 Quick Setup Guide - EduManager Pro

## TL;DR - Setup Nhanh 5 Phút

### Bước 1: Tạo Firebase Project (2 phút)

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới: `edumanager-pro-6180f` (hoặc tên khác)
3. Location: `asia-southeast1`

### Bước 2: Enable Authentication (1 phút)

```
Console → Authentication → Get Started
→ Email/Password → Enable → Save
→ Users → Add User:
   Email: admin@edumanager.com
   Password: admin123
→ Lưu lại UID của user này
```

### Bước 3: Enable Firestore (1 phút)

```
Console → Firestore Database → Create Database
→ Production mode
→ Location: asia-southeast1
→ Enable
```

### Bước 4: Tạo Admin Document (1 phút)

```
Firestore → Start Collection
Collection ID: staff
Document ID: [PASTE UID từ bước 2]
```

**Add fields:** (Click "Add field" nhiều lần)

| Field | Type | Value |
|-------|------|-------|
| uid | string | [UID của admin user] |
| email | string | admin@edumanager.com |
| name | string | Admin System |
| code | string | AD001 |
| role | string | Quản trị viên |
| department | string | Quản lý |
| position | string | Quản trị viên |
| phone | string | 0123456789 |
| status | string | Active |
| permissions | map | (tạo map bên dưới) |
| createdAt | timestamp | [Current timestamp] |
| updatedAt | timestamp | [Current timestamp] |

**permissions map:**

| Field | Type | Value |
|-------|------|-------|
| canManageStudents | boolean | true |
| canManageClasses | boolean | true |
| canManageStaff | boolean | true |
| canManageFinance | boolean | true |
| canViewReports | boolean | true |

Click **Save**.

### Bước 5: Lấy Firebase Config (30 giây)

```
Console → Project Settings (⚙️)
→ Your apps → Web icon (</>)
→ Nickname: edumanager-web
→ Register app
→ Copy firebaseConfig
```

### Bước 6: Tạo .env.local

Tạo file `.env.local` trong root:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

Paste config từ bước 5.

### Bước 7: Deploy Rules & Indexes (30 giây)

**Cập nhật Project ID trong `.firebaserc`:**

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

**Deploy:**

```bash
firebase deploy
```

Hoặc từng phần:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Bước 8: Test! (10 giây)

```bash
npm run dev
```

Mở `http://localhost:5173/login`

Login với:
- Email: `admin@edumanager.com`
- Password: `admin123`

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Admin user created
- [ ] Firestore enabled
- [ ] Staff document created for admin
- [ ] Firebase config copied
- [ ] `.env.local` created
- [ ] `.firebaserc` updated with correct project ID
- [ ] Rules & Indexes deployed
- [ ] App running và login thành công

---

## 🆘 Common Issues

### "Missing or insufficient permissions"
→ Chưa tạo staff document hoặc UID không khớp

### "The query requires an index"
→ Chạy: `firebase deploy --only firestore:indexes`

### "Firebase config not found"
→ Kiểm tra `.env.local` có đúng format không

### Login failed
→ Kiểm tra email/password và staff document đã tạo chưa

---

## 🎉 Done!

Giờ bạn có thể:
- ✅ Tạo học viên mới
- ✅ Tạo lớp học
- ✅ Quản lý nhân viên
- ✅ Data realtime sync với Firebase

**Next steps:**
1. Import mock data (optional)
2. Tạo thêm users
3. Bắt đầu sử dụng!
