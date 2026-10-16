# DMS Backend — API & Nghiệp vụ

Backend Express phục vụ frontend DMS, khớp 1:1 công thức và shape dữ liệu trong
`src/lib/dorm-ops.ts` và `src/types/*.ts`.

## Chạy

```bash
npm run server        # http://localhost:3001
npm run server:dev    # tự nạp lại khi sửa code
npm run db:seed       # sinh lại db.json
npm run test:api      # kiểm thử API theo 4 vai trò (cần backend đang chạy)
API_BASE=http://localhost:3101 npm run test:api
```

Windows: `start.bat` mở backend :3101 + frontend :5173 (proxy `/api` sang backend).

## Cấu trúc

```
server/
├── index.js          ghép route, healthcheck, SSE, shutdown an toàn
├── config.js         hằng số nghiệp vụ (biểu giá, mốc giờ, SLA, 1:4:6)
├── db.js             store JSON: đọc đồng bộ, ghi atomic + debounce 120ms
├── middleware.js     CORS, security headers, rate limit, cache, SSE, actor
├── domain/           luật nghiệp vụ thuần, không phụ thuộc HTTP
│   ├── pricing.js    điện bậc thang, chia đều, pro-rata, quyết toán
│   ├── curfew.js     quét cổng, duyệt đơn, kỷ luật, điểm rèn luyện
│   ├── ticket.js     luồng phiếu, SLA, quyền theo vai trò
│   ├── booking.js    auto-approval 3 điều kiện, giữ chỗ 15 phút
│   ├── visitor.js    CCCD 12 số, rời trước 21:00
│   └── rbac.js       bảng quyền chi tiết cho 4 vai trò
└── routes/           REST khớp shape frontend
```

## Xác thực

Dữ liệu demo, không có mật khẩu. Gửi vai trò qua một trong ba cách:

- Header `X-Demo-Role: student|manager|technician|admin`
- Header `Authorization: Bearer <MSSV hoặc role>`
- Query `?role=student`

```bash
# Đăng nhập demo
curl -X POST localhost:3001/api/auth/demo -H 'Content-Type: application/json' \
  -d '{"role":"manager"}'

# Đăng nhập Google (kiểm tra domain)
curl -X POST localhost:3001/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"namvt@fpt.edu.vn","role":"manager"}'
```

Quy tắc domain email: sinh viên dùng Gmail cá nhân; cán bộ/kỹ thuật/quản lý
phải dùng `@fpt.edu.vn` hoặc `@fe.edu.vn`.

## Phân quyền

| Hành động | student | technician | manager | admin |
|---|:--:|:--:|:--:|:--:|
| Giữ giường / đặt giường | ✓ | — | — | ✓ |
| Duyệt đặt giường | — | — | ✓ | ✓ |
| Ghi chỉ số / phát hành hóa đơn | — | — | ✓ | ✓ |
| Thanh toán hóa đơn của mình | ✓ | — | — | ✓ |
| Tạo phiếu báo hỏng | ✓ | ✓ | ✓ | ✓ |
| Phân công thợ | — | — | ✓ | ✓ |
| Báo hoàn thành phiếu | — | ✓ | ✓ | ✓ |
| Đánh giá nghiệm thu | ✓ | — | — | ✓ |
| Quét cổng / điểm danh | — | ✓ | ✓ | ✓ |
| Duyệt đơn về muộn | — | — | ✓ | ✓ |
| Lập biên bản kỷ luật | — | — | ✓ | ✓ |
| Đăng ký khách thăm | ✓ | — | — | ✓ |
| Check-in/out khách tại cổng | — | ✓ | ✓ | ✓ |
| Đăng bảng tin | — | — | ✓ | ✓ |
| Đăng/gỡ bài chợ của mình | ✓ | — | — | ✓ |
| Kiểm duyệt chợ | — | — | ✓ | ✓ |
| Dashboard & báo cáo | — | — | ✓ | ✓ |
| Cấu hình hệ thống | — | — | — | ✓ |

Chi tiết đầy đủ ở `server/domain/rbac.js`.

## Nhóm endpoint

| Tiền tố | Chức năng |
|---|---|
| `/api/auth` | đăng nhập, hồ sơ, làm mới phiên |
| `/api/dorm` | kiểm kê giường, giữ chỗ, đặt giường, auto-approval, hợp đồng, đổi/trả phòng |
| `/api/billing` | tính hóa đơn, ghi chỉ số, phát hành, thanh toán, khiếu nại, đối soát |
| `/api/tickets` | phiếu báo hỏng, luồng trạng thái, phân công, nghiệm thu, đánh giá |
| `/api/curfew` | đơn về muộn, quét cổng, điểm danh, kỷ luật, điểm rèn luyện |
| `/api/visitors` | đăng ký khách, check-in/out, quá giờ |
| `/api/community` | bảng tin, chợ đồ cũ, thất lạc, thông báo |
| `/api/dashboard` | tổng quan, báo cáo tạm trú/công nợ, xuất file, cấu hình, mô phỏng |

Ngoài ra có tiện ích đọc nhanh: `/api/users`, `/api/buildings`, `/api/rooms`,
`/api/rooms/summary`, `/api/config`, `/api/health`, `/api/events` (SSE).

## Công thức tính tiền

Điện bậc thang (VNĐ/kWh): 50 đầu × 1.800 · 50 tiếp × 2.200 · 100 tiếp × 2.600 · phần còn lại × 3.100.
Nước 18.000đ/m³. Wifi 120.000đ + vệ sinh 60.000đ là phí chung của phòng.

```
Tiền cá nhân = (Tiền điện + Tiền nước + Wifi + Vệ sinh) / N + Tiền phòng
```

Ví dụ phòng A205, 6 sinh viên, 170 kWh và 14 m³:

```
Điện 170 kWh  = 382.000đ
Nước 14 m³    = 252.000đ
Phí chung     = 180.000đ
Tổng          = 814.000đ  →  814.000 / 6 = 135.667đ/người
+ Tiền phòng  = 950.000đ
= 1.085.667đ mỗi sinh viên
```

Kiểm chứng tự động bằng `npm run test:api`.

## Quy tắc nghiệp vụ đã cài

- **Auto-approval**: giới tính khớp tòa, không nợ kỳ trước, không bị đình chỉ, cọc PAID 100%.
- **Giữ chỗ**: 15 phút, hết hạn tự nhả giường về `AVAILABLE`.
- **Giới nghiêm**: cổng 23:00–05:30; quét muộn có đơn `APPROVED` thì hợp lệ, không có đơn thì tự lập biên bản và trừ 10 điểm.
- **Đơn về muộn**: phải nộp trước 21:00; đơn qua đêm bắt buộc phụ huynh xác nhận.
- **Điểm rèn luyện**: gốc 100, trừ >20 cảnh cáo, trừ >30 đình chỉ kỳ sau.
- **Khách thăm**: CCCD đúng 12 chữ số, ở trong ngày, rời trước 21:00, không qua đêm.
- **Phiếu báo hỏng**: `PENDING → IN_PROGRESS → RESOLVED → CLOSED`; SLA 2h khẩn cấp, 24h thường.
- **Công tơ**: chỉ số mới không được nhỏ hơn cũ; cảnh báo khi tiêu thụ vượt 200% tháng trước.
- **Quyết toán trả phòng**: cọc − (hư hỏng + nợ chưa đóng), khấu trừ không vượt cọc.
- **Pro-rata**: chia tiền theo số ngày ở khi vào/ra giữa tháng, bù sai số làm tròn vào người ở nhiều ngày nhất.

## Ghi chú

`db.json` là dữ liệu demo; ghi atomic qua file tạm rồi rename nên không hỏng khi
tắt đột ngột. Muốn chuyển sang PostgreSQL/Supabase thì thay `server/db.js`, phần
`domain/` giữ nguyên vì thuần nghiệp vụ.
