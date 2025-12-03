# 🔥 Hướng Dẫn Setup Firebase cho EduManager Pro

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Thêm dự án"**
3. Đặt tên project: `edumanager-pro` (hoặc tên bạn muốn)
4. Tắt Google Analytics nếu không cần (có thể bật sau)
5. Click **"Create project"**

## Bước 2: Setup Firebase Authentication

1. Trong Firebase Console, vào mục **"Authentication"**
2. Click **"Get started"**
3. Chọn **"Email/Password"** trong tab **"Sign-in method"**
4. **Enable** Email/Password
5. Click **"Save"**

### Tạo tài khoản admin đầu tiên:

1. Vào tab **"Users"**
2. Click **"Add user"**
3. Nhập:
   - Email: `admin@edumanager.com` (hoặc email của bạn)
   - Password: `admin123` (hoặc mật khẩu mạnh hơn)
4. Click **"Add user"**
5. **Lưu UID** của user này (cột User UID)

## Bước 3: Setup Firestore Database

1. Vào mục **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in production mode"** (sẽ config rules sau)
4. Chọn location: **`asia-southeast1`** (Singapore - gần Việt Nam nhất)
5. Click **"Enable"**

> ✅ **Đã hoàn thành đến đây? Tuyệt! Tiếp tục các bước sau:**

### Tạo Collection đầu tiên - `staff`:

1. Click **"Start collection"**
2. Collection ID: `staff`
3. Document ID: **Paste UID của admin** từ bước 2
4. Add fields:
   ```
   uid: [UID của admin user]
   email: admin@edumanager.com
   name: Admin System
   code: AD001
   role: Quản trị viên
   department: Quản lý
   position: Quản trị viên
   phone: 0123456789
   status: Active
   permissions: {
     canManageStudents: true
     canManageClasses: true
     canManageStaff: true
     canManageFinance: true
     canViewReports: true
   }
   createdAt: [Click "Use current timestamp"]
   updatedAt: [Click "Use current timestamp"]
   ```
5. Click **"Save"**

## Bước 4: Deploy Firestore Rules & Indexes

✅ **Các file đã được tạo sẵn:**
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes
- `firebase.json` - Firebase config
- `.firebaserc` - Project config

### Cách 1: Deploy bằng Firebase CLI (Khuyến nghị)

```bash
# Deploy tất cả
firebase deploy

# Hoặc deploy từng phần
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Cách 2: Copy thủ công vào Console

1. Vào tab **"Rules"** trong Firestore
2. Copy nội dung từ file `firestore.rules` và paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.role in ['Quản trị viên', 'Quản lý'];
    }
    
    function isStaff() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }
    
    match /students/{studentId} {
      allow read: if isStaff();
      allow write: if isAdmin();
    }
    
    match /classes/{classId} {
      allow read: if isStaff();
      allow write: if isAdmin();
    }
    
    match /staff/{staffId} {
      allow read: if isStaff();
      allow write: if isAdmin();
    }
    
    match /attendance/{attendanceId} {
      allow read: if isStaff();
      allow write: if isStaff();
    }
    
    match /{document=**} {
      allow read: if isStaff();
      allow write: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

## Bước 5: Lấy Firebase Config

1. Vào **Project Settings** (icon bánh răng)
2. Scroll xuống phần **"Your apps"**
3. Click icon **"Web"** (`</>`)
4. Đặt nickname: `edumanager-web`
5. **KHÔNG** check "Firebase Hosting"
6. Click **"Register app"**
7. Copy phần **`firebaseConfig`**

## Bước 6: Cấu hình Project

1. Tạo file `.env.local` trong root folder:

```bash
# Copy từ .env.example
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=edumanager-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=edumanager-pro
VITE_FIREBASE_STORAGE_BUCKET=edumanager-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

2. Paste các giá trị từ `firebaseConfig` vào `.env.local`

## Bước 7: Deploy Indexes

✅ **Indexes đã được định nghĩa sẵn trong `firestore.indexes.json`**

### Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

Hoặc đợi khi chạy app, Firebase sẽ tự động show link tạo index khi cần.

## Bước 8: Test Kết Nối

1. Start development server:
```bash
npm run dev
```

2. Truy cập: `http://localhost:5173`

3. Đăng nhập với:
   - Email: `admin@edumanager.com`
   - Password: `admin123` (hoặc password bạn đã tạo)

4. Nếu đăng nhập thành công → Firebase đã kết nối! 🎉

## Bước 9: Import Mock Data (Optional)

Để có dữ liệu test, bạn có thể:

1. Tạo một số students và classes thủ công qua Firestore Console
2. Hoặc viết script import từ `mockData.ts` (sẽ hướng dẫn sau)

## 🔒 Security Checklist

- [ ] Đã enable Authentication Email/Password
- [ ] Đã tạo tài khoản admin
- [ ] Đã tạo staff document cho admin
- [ ] Đã setup Firestore Security Rules
- [ ] Đã tạo `.env.local` và **KHÔNG** commit lên Git
- [ ] Đã thêm `.env.local` vào `.gitignore`

## 📌 Lưu Ý Quan Trọng

1. **KHÔNG BAO GIỜ** commit file `.env.local` lên Git
2. Nếu deploy production, setup Firebase config trên hosting platform
3. Backup Firestore data thường xuyên
4. Monitor Firebase Usage trong Console để tránh vượt quota free tier

## 🆘 Troubleshooting

### Lỗi: "Firebase: Error (auth/configuration-not-found)"
→ Chưa enable Email/Password trong Authentication

### Lỗi: "Missing or insufficient permissions"
→ Chưa tạo staff document cho user hoặc Security Rules chưa đúng

### Lỗi: "The query requires an index"
→ Click vào link trong error message để tạo index tự động

### Không đăng nhập được
→ Kiểm tra lại email/password và đảm bảo đã tạo staff document

## 📚 Tài Liệu Tham Khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Hoàn thành setup? Giờ bạn có thể:**
1. Tạo học viên mới
2. Tạo lớp học
3. Quản lý nhân viên
4. Tất cả data sẽ được lưu realtime vào Firebase! 🚀
