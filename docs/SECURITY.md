# Tiêu Chuẩn Bảo Mật Hệ Thống (DMS Security Architecture)
## OWASP Top 10 Compliance, RBAC & Data Protection

---

## 1. Cơ Chế Xác Thực & Phân Quyền (Authentication & RBAC)

### 1.1 Dual-Token Authentication Lifecycle (JWT)
- **Access Token:** Ký thuật toán `RS256` (RSA 2048-bit), thời hạn sống ngắn (**15 phút**), lưu trữ trong bộ nhớ RAM của client (Memory State), không lưu trong `localStorage` để chống tấn công XSS trộm token.
- **Refresh Token:** Thời hạn sống **7 ngày**, được lưu trong `HttpOnly`, `Secure`, `SameSite=Strict` Cookie nhằm chống triệt để đánh cắp token qua JavaScript.
- **Token Rotation & Blacklist:** Mỗi khi làm mới Access Token, Refresh Token cũ sẽ bị thu hồi và phát hành cặp token mới. Nếu phát hiện Refresh Token cũ được dùng lại, toàn bộ phiên đăng nhập của người dùng sẽ bị vô hiệu hóa ngay lập tức.

### 1.2 Ma Trận Phân Quyền (RBAC Matrix)

| Chức năng | Sinh viên (`student`) | Quản lý (`manager`) | Kỹ thuật (`technician`) | Quản trị (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| Đăng ký giữ giường & Xem phòng | ✅ | ✅ | ❌ | ✅ |
| Duyệt đơn & Hủy phòng | ❌ | ✅ | ❌ | ✅ |
| Xem hóa đơn & Thanh toán VietQR | ✅ (Chỉ phòng mình) | ✅ (Tất cả) | ❌ | ✅ (Toàn quyền) |
| Nhập chỉ số công tơ điện nước | ❌ | ✅ | ✅ | ✅ |
| Tạo phiếu báo hỏng thiết bị | ✅ | ✅ | ❌ | ✅ |
| Phân công kỹ thuật viên | ❌ | ✅ | ❌ | ✅ |
| Nghiệm thu & Nhập vật tư | ❌ | ❌ | ✅ | ✅ |
| Đánh giá sao 1-5 & Feedback | ✅ | ❌ | ❌ | ✅ |
| Quét QR thẻ vào cổng 23:00 | ❌ | ✅ | ✅ | ✅ |
| Ghi nhận lỗi vi phạm / Trừ điểm | ❌ | ✅ | ✅ | ✅ |

---

## 2. Phòng Chống Các Lỗ Hổng OWASP Top 10

### 2.1 SQL Injection & ORM Injection
- Tuyệt đối không dùng chuỗi cộng string ghép câu lệnh SQL thô (`raw query`).
- Bắt buộc sử dụng Prisma ORM / Knex với **Parameterized Queries (Prepared Statements)**.
- Mọi đầu vào từ API đều được kiểm định kiểu dữ liệu nghiêm ngặt qua schema validation (`Zod`).

### 2.2 Broken Object Level Authorization (BOLA / IDOR)
- **Rủi ro:** Sinh viên sửa `ticketId` trên URL để xem hoặc hủy đơn báo hỏng của phòng khác.
- **Giải pháp:** 
  ```typescript
  // Middleware kiểm tra quyền sở hữu đối tượng trước khi xử lý
  const ticket = await db.tickets.findUnique({ where: { id: req.params.id } });
  if (req.user.role === 'student' && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: "Access Denied: You do not own this ticket" });
  }
  ```

### 2.3 Cross-Site Scripting (XSS)
- React tự động escape ký tự đặc biệt trong JSX.
- Với các nội dung Markdown hoặc HTML động, bắt buộc lọc sạch qua thư viện `DOMPurify`.
- Cấu hình tiêu đề bảo mật HTTP (Content Security Policy):
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...'; img-src 'self' data: https://images.unsplash.com https://api.qrserver.com;
  ```

### 2.4 Rate Limiting & DoS Protection
- Sử dụng thuật toán Token Bucket (Redis-backed rate limiter) tại Nginx / API Gateway:
  - Route công khai (Tra cứu phòng): 100 requests / phút / IP.
  - Route nhạy cảm (Đăng nhập / OTP / Giữ chỗ giường): 5 requests / phút / IP để chống Brute-Force mật khẩu và spam đặt phòng.

### 2.5 Mã Hóa Dữ Liệu Nhạy Cảm (Data Encryption)
- Mật khẩu lưu trữ bắt buộc băm bằng `Argon2id` hoặc `Bcrypt` với salt rounds $\ge 12$.
- Dữ liệu lưu trữ (Data-at-Rest) trên cơ sở dữ liệu được mã hóa bằng AES-256.
- Toàn bộ kết nối mạng (Data-in-Transit) bắt buộc qua HTTPS với chứng chỉ TLS 1.3 và cấu hình HSTS (`Strict-Transport-Security`).
