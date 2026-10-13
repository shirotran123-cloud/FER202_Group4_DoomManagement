# Domanage Mobile Application (React Native + Expo)
## Kiến Trúc Ứng Dụng Di Động Dành Cho Sinh Viên & Bảo Vệ Trực Cổng

---

## 1. Mục Tiêu & Đối Tượng Sử Dụng (Target Audience)

1. **Sinh viên KTX:**
   - Tạo & xuất trình **Mã QR sinh trắc học động (Dynamic QR Pass)** để qua cửa xoay / cổng bảo vệ.
   - Nhận **Push Notification thông báo khẩn:** Nhắc nhở đếm ngược giờ giới nghiêm 23:00, thông báo tiền điện nước và cập nhật tiến độ sửa chữa.
   - **Chụp ảnh báo hỏng tức thời:** Dùng Camera chụp ảnh ổ điện, vòi nước hỏng và gửi kèm vị trí GPS trong khuôn viên.

2. **Bảo vệ / An ninh KTX:**
   - **Chế độ quét liên tục (High-Speed Scanner):** Quét mã QR sinh viên ra vào cổng với tốc độ < 0.5s / lượt.
   - **Chế độ Ngoại tuyến (Offline-First):** Vẫn quét và xác thực được sinh viên khi mạng Wi-Fi cổng bảo vệ chập chờn (sử dụng Local SQLite / MMKV cache và đồng bộ ngược về máy chủ khi có mạng).

---

## 2. Công Nghệ Nòng Cốt (Tech Stack)

- **Framework:** React Native (Expo SDK 51+)
- **Ngôn ngữ:** TypeScript
- **Styling:** NativeWind (Tailwind CSS cho React Native)
- **State Management:** Zustand + TanStack Query (React Query)
- **Local Storage / Offline Cache:** WatermelonDB hoặc MMKV + SQLite
- **Camera & QR:** `expo-camera` / `expo-barcode-scanner`
- **Xác thực sinh trắc:** `expo-local-authentication` (FaceID / Vân tay)
- **Push Notification:** Expo Notifications / Firebase Cloud Messaging (FCM)

---

## 3. Cấu Trúc Thư Mục Chuẩn (Project Directory Structure)

```
mobile/
├── app.json                  # Cấu hình Expo, permissions (Camera, FaceID)
├── package.json              # Dependencies di động
├── App.tsx                   # Root entry point
├── src/
│   ├── assets/               # Icons, splash images, sounds
│   ├── navigation/           # RootNavigator, StudentTabs, GuardTabs
│   ├── screens/
│   │   ├── auth/             # Login, BiometricEnrollScreen
│   │   ├── student/
│   │   │   ├── GateQrPassScreen.tsx    # Mã QR động có mã hóa HMAC thời gian thực
│   │   │   ├── QuickRepairCameraScreen.tsx # Chụp ảnh báo hỏng bằng camera
│   │   │   ├── CurfewLateRequestScreen.tsx # Nộp đơn về muộn khẩn
│   │   │   └── VietQRScanPaymentScreen.tsx # Quét QR thanh toán
│   │   └── guard/
│   │       ├── ContinuousGateScannerScreen.tsx # Quét thẻ tốc độ cao
│   │       └── IncidentReportScreen.tsx       # Lập biên bản vi phạm tại chỗ
│   ├── components/           # Nút bấm, Card, Badge, Header
│   ├── services/             # API client, WebSocket sync
│   └── hooks/                # useBiometrics, useOfflineQueue, usePushNotification
```

---

## 4. Hướng Dẫn Chạy Thử Ứng Dụng (Getting Started)

```bash
# 1. Chuyển vào thư mục mobile
cd mobile

# 2. Cài đặt dependencies
npm install

# 3. Khởi động môi trường phát triển Expo
npx expo start

# 4. Quét mã QR bằng ứng dụng Expo Go trên điện thoại iOS / Android để trải nghiệm
```
