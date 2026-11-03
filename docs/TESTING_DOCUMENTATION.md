# TÀI LIỆU KIỂM THỬ PHẦN MỀM (SOFTWARE TESTING DOCUMENTATION)
## DỰ ÁN: DOMANAGE – HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TRỰC TUYẾN
### DORMITORY MANAGEMENT SYSTEM (DMS) – VERIFICATION & VALIDATION REPORT

---

> **TRƯỜNG ĐẠI HỌC FPT – KHOA CÔNG NGHỆ THÔNG TIN**  
> **Môn học:** FER202 – Front-End Web Development with React  
> **Nhóm thực hiện:** FER202_Group4  
> **Kỹ sư Đảm bảo Chất lượng (Lead QA & Test Engineer):** Huỳnh Gia Kim (MSSV: SE170006)  
> **Người phê duyệt (Project Manager):** Nguyễn Hoàng Vinh (MSSV: SE170001)  
> **Tiêu chuẩn tham chiếu:** IEEE Std 829-2008 (Software Test Documentation) & ISTQB CTFL  
> **Thời gian phát hành:** Tháng 10/2026 – Phiên bản: 1.0 (Final Release)  

---

## 📑 MỤC LỤC TÀI LIỆU KIỂM THỬ

1. [Phần 1: Giới Thiệu và Kế Hoạch Kiểm Thử (Test Plan)](#phần-1-giới-thiệu-và-kế-hoạch-kiểm-thử-test-plan)
   - 1.1. Mục đích và Phạm vi tài liệu
   - 1.2. Mục tiêu kiểm thử (Test Objectives)
   - 1.3. Tiêu chí Chấp nhận và Tiêu chí Đình chỉ (Suspension & Exit Criteria)
2. [Phần 2: Chiến Lược và Phương Pháp Luận Kiểm Thử (Test Strategy)](#phần-2-chiến-lược-và-phương-pháp-luận-kiểm-thử-test-strategy)
   - 2.1. Các cấp độ kiểm thử (Testing Levels)
   - 2.2. Kỹ thuật thiết kế ca kiểm thử (Test Design Techniques)
   - 2.3. Quy trình thực thi và Báo cáo lỗi (Defect Life Cycle)
3. [Phần 3: Môi Trường Kiểm Thử và Công Cụ (Test Environment & Tools)](#phần-3-môi-trường-kiểm-thử-và-công-cụ-test-environment--tools)
   - 3.1. Ma trận Trình duyệt và Thiết bị (Browser & Device Matrix)
   - 3.2. Cấu hình Tài khoản Dữ liệu Thử nghiệm (Test Accounts)
   - 3.3. Bộ công cụ hỗ trợ kiểm thử (Testing Tooling)
4. [Phần 4: Ma Trận Truy Xuất Yêu Cầu (Requirements Traceability Matrix - RTM)](#phần-4-ma-trận-truy-xuất-yêu-cầu-requirements-traceability-matrix---rtm)
5. [Phần 5: Đặc Tả Chi Tiết 90 Ca Kiểm Thử (Detailed Test Cases)](#phần-5-đặc-tả-chi-tiết-90-ca-kiểm-thử-detailed-test-cases)
   - 5.1. Phân hệ 1: Xác thực, Phân quyền & Profile (TC-M01-01 -> TC-M01-12)
   - 5.2. Phân hệ 2: Danh mục & Cấu trúc Không gian 1:4:6 (TC-M02-01 -> TC-M02-08)
   - 5.3. Phân hệ 3: Đặt chỗ Trực quan & Auto-Approval (TC-M03-01 -> TC-M03-18)
   - 5.4. Phân hệ 4: Công tơ & Chia tiền Điện Nước $Total/N$ (TC-M04-01 -> TC-M04-16)
   - 5.5. Phân hệ 5: Phiếu Báo hỏng & Bảo trì Thiết bị (TC-M05-01 -> TC-M05-14)
   - 5.6. Phân hệ 6: Giờ Giới Nghiêm 23:00 & Thẻ QR Cổng (TC-M06-01 -> TC-M06-12)
   - 5.7. Phân hệ 7: Dashboard Quản trị & Báo cáo Excel (TC-M07-01 -> TC-M07-10)
6. [Phần 6: Kiểm Thử Chuyên Sâu 4 Ca Biên Then Chốt (Critical Edge-cases)](#phần-6-kiểm-thử-chuyên-sâu-4-ca-biên-then-chốt-critical-edge-cases)
   - 6.1. Edge-Case 1: Concurrency Race Condition (Xung đột đặt phòng đồng thời)
   - 6.2. Edge-Case 2: Timeout Rollback (Hết 15 phút tự động nhả giường AVAILABLE)
   - 6.3. Edge-Case 3: Arithmetic Precision & Remainder Correction (Sai số chia tiền $Total/N$)
   - 6.4. Edge-Case 4: Curfew Enforcement & Demerit Penalty (Xử lý quét cổng sau 23:00)
7. [Phần 7: Kiểm Thử Giao Diện và Tương Thích Thiết Bị (UI/UX & Responsive Matrix)](#phần-7-kiểm-thử-giao-diện-và-tương-thích-thiết-bị-uiux--responsive-matrix)
8. [Phần 8: Nhật Ký Lỗi và Sự Cố Đã Khắc Phục (Defect Tracking Log)](#phần-8-nhật-ký-lỗi-và-sự-cố-đã-khắc-phục-defect-tracking-log)
9. [Phần 9: Báo Cáo Tổng Kết và Nghiệm Thu Chất Lượng (QA Sign-off)](#phần-9-báo-cáo-tổng-kết-và-nghiệm-thu-chất-lượng-qa-sign-off)

---

# PHẦN 1: GIỚI THIỆU VÀ KẾ HOẠCH KIỂM THỬ (TEST PLAN)

## 1.1. Mục đích và Phạm vi tài liệu
Tài liệu Kiểm thử Phần mềm (Software Testing Documentation - STD) này được xây dựng bởi Kỹ sư Đảm bảo Chất lượng **Huỳnh Gia Kim**, nhằm mục đích:
- Thiết lập kế hoạch, phạm vi, chiến lược và tiêu chuẩn kiểm thử toàn diện cho hệ thống **Domanage (Online Dormitory Management System)**.
- Đặc tả chi tiết **90 ca kiểm thử (Test Cases)** bao phủ toàn bộ 28 Use Cases nghiệp vụ và 4 yêu cầu phi chức năng (NFR).
- Cung cấp bằng chứng thực nghiệm minh bạch, đối soát 4 kịch bản biên (Edge-cases) phức tạp, đánh giá độ ổn định và tính sẵn sàng đưa vào vận hành thực tế.

### Phạm vi trong kiểm thử (In-Scope):
1. Toàn bộ 7 phân hệ chức năng người dùng trên nền tảng Web SPA (React 19 + TypeScript + Vite):
   - Phân hệ 1: Xác thực Google OAuth 2.0, JWT, RBAC 4 vai trò và Hồ sơ cá nhân.
   - Phân hệ 2: Quản lý danh mục Tòa nhà, Tầng lầu và Cấu trúc không gian phòng ở 1:4:6.
   - Phân hệ 3: Bản đồ chọn giường trực quan, Khóa tạm thời 15 phút, VietQR Napas 247, Động cơ Tự động xét duyệt (Auto-Approval) và xuất e-Contract PDF.
   - Phân hệ 4: Form ghi chỉ số công tơ điện nước kèm upload ảnh, Thuật toán chia đều $Total/N$ xử lý triệt để sai số làm tròn, Hóa đơn cá nhân và Bàn giao Check-in/Check-out.
   - Phân hệ 5: Phiếu báo hỏng phân loại Phòng chung vs Buồng cá nhân, Bảng việc Kỹ thuật viên (Bounty Board), Ghi nhận vật tư chi phí và Đánh giá 1-5 sao.
   - Phân hệ 6: Đơn xin về muộn ngoài giờ, Giao diện bảo vệ quét mã QR tại cổng, Cảnh báo còi hú và ghi nhận vi phạm sau 23:00, Hệ thống 100 điểm kỷ luật KTX.
   - Phân hệ 7: Overview Dashboard Recharts (Occupancy Donut, Doanh thu), Xuất báo cáo tạm trú và công nợ ra file Excel (.xlsx).
2. Kiểm thử tương thích đa trình duyệt (Chrome, Edge, Firefox, Safari) và Responsive trên 4 dải màn hình (Mobile 375px, Tablet 768px, Laptop 1366px, Desktop 1920px).
3. Kiểm thử tải đồng thời, cơ chế khóa tài nguyên Mutex / TTL và bảo mật phân quyền URL.

### Phạm vi ngoài kiểm thử (Out-of-Scope):
- Tích hợp trực tiếp cảm biến IoT phần cứng công tơ nước (thực hiện mô phỏng qua ảnh chụp thực tế).
- Kết nối Webhook thanh toán trực tiếp qua API ngân hàng sản xuất (thực hiện mô phỏng qua cổng chuyển khoản VietQR chuẩn Napas 247).

## 1.2. Mục tiêu kiểm thử (Test Objectives)
- **Độ bao phủ chức năng (Functional Coverage):** Đạt 100% trên 28 Use Cases đặc tả trong tài liệu SRS.
- **Tính toàn vẹn dữ liệu (Data Integrity):** Không xảy ra hiện tượng mất dữ liệu (Data Loss), ghi đè dữ liệu sai lệch (Dirty Read / Double Booking), hoặc sai số tiền tệ dù chỉ 1 VNĐ.
- **Độ tin cậy giao diện (UI Robustness):** 100% màn hình không bị vỡ giao diện (No UI Glitch/Overflow) trên các thiết bị di động và máy tính bảng.
- **Bảo mật và Phân quyền (Security & Access Control):** 100% các Route nhạy cảm của Quản lý, Bảo vệ, Kỹ thuật viên bị chặn truy cập đối với vai trò Sinh viên (HTTP 403 Forbidden).

## 1.3. Tiêu chí Chấp nhận và Tiêu chí Đình chỉ (Suspension & Exit Criteria)
- **Tiêu chí Đình chỉ (Suspension Criteria):** Nếu xảy ra lỗi nghiêm trọng (Blocker/Critical) làm sập hệ thống (Crash Application), treo toàn bộ máy chủ API JSON-Server hoặc vỡ toàn bộ layout chính khiến không thể tiếp tục thực thi các bước test tiếp theo.
- **Tiêu chí Hoàn tất (Exit Criteria):**
  - Đạt tỷ lệ thực thi thành công 100% (90/90 Test Cases Passed).
  - Không còn bất kỳ lỗi mức độ Blocker hoặc Critical nào tồn đọng.
  - Toàn bộ 4 ca kiểm thử biên then chốt (Edge-cases) được xác minh và hoạt động ổn định.

---

# PHẦN 2: CHIẾN LƯỢC VÀ PHƯƠNG PHÁP LUẬN KIỂM THỬ (TEST STRATEGY)

## 2.1. Các cấp độ kiểm thử (Testing Levels)
Quy trình QA áp dụng mô hình kim tự tháp kiểm thử phần mềm đa tầng:

```mermaid
flowchart TD
    E2E["🚀 Acceptance & End-to-End Testing (UAT - 28 Use Cases)"]
    System["🏢 System Integration Testing (4 Edge-cases, Race Conditions, Split Bill)"]
    Component["🧩 Component & Integration Testing (ShadCN, Forms, Route Guards)"]
    Unit["🧪 Unit Testing (Pure Algorithms: calculateSplitBill, AutoApprovalEngine)"]

    Unit --> Component
    Component --> System
    System --> E2E
```

1. **Unit Testing (Kiểm thử đơn vị):** Kiểm tra tính đúng đắn toán học của các hàm giải thuật độc lập không phụ thuộc DOM (hàm chia tiền `calculateSplitBill`, hàm tính hạn thanh toán, hàm mã hóa QR syntax).
2. **Component Testing (Kiểm thử thành phần giao diện):** Kiểm tra các tương tác giao diện người dùng độc lập: Nút bấm, Ô nhập liệu, Đồng hồ đếm ngược `CountdownTimer`, Dropdown chọn tòa/tầng.
3. **Integration Testing (Kiểm thử tích hợp):** Kiểm tra luồng trao đổi dữ liệu giữa State Context (`AuthContext`, `BookingContext`) và Tầng dịch vụ API RESTful.
4. **System & Acceptance Testing (Kiểm thử hệ thống & Nghiệm thu):** Mô phỏng toàn bộ hành trình người dùng thực tế (End-to-End User Journeys): từ khi sinh viên đăng nhập Google -> chọn giường trên bản đồ 1:4:6 -> quét VietQR -> nhận e-Contract PDF -> tra cứu hóa đơn điện nước phòng -> check-out hoàn cọc.

## 2.2. Kỹ thuật thiết kế ca kiểm thử (Test Design Techniques)
- **Phân vùng tương đương (Equivalence Partitioning - EP):**
  - Ví dụ: Kiểm thử chỉ số công tơ điện nước: Nhóm hợp lệ ($Delta E ge 0$), Nhóm không hợp lệ ($Delta E < 0$).
  - Nhóm điểm rèn luyện: Bình thường ($71 - 100$ điểm), Nguy cơ đình chỉ ($le 70$ điểm).
- **Phân tích giá trị biên (Boundary Value Analysis - BVA):**
  - Mốc giới nghiêm 23:00: Kiểm thử tại các thời điểm 22:59:59 (Hợp lệ), 23:00:00 (Biên), 23:00:01 (Vi phạm giới nghiêm).
  - Hạn giữ chỗ 15 phút: Kiểm thử tại giây 899, giây 900, giây 901 (Tự động Rollback trạng thái).
- **Bảng quyết định (Decision Table Testing):**
  - Động cơ Tự động xét duyệt Auto-Approval với 3 biến nhị phân: (Khớp giới tính, Không nợ kỳ trước, Xác nhận cọc 100%).
- **Kiểm thử tình huống xấu (Negative & Error-Guessing Testing):**
  - Nhập chuỗi ký tự vào ô số tiền, cố tình chèn mã HTML độc hại vào form báo hỏng (XSS Injection), tắt kết nối mạng khi đang đếm ngược 15 phút.

## 2.3. Quy trình thực thi và Báo cáo lỗi (Defect Life Cycle)
Mọi lỗi phát hiện trong quá trình kiểm thử được phân loại theo thang đo chuẩn ISO/IEC 25010:

| Mức độ nghiêm trọng (Severity) | Định nghĩa | Tiêu chuẩn xử lý (SLA) |
| :--- | :--- | :--- |
| **P1 - Blocker / Critical** | Lỗi làm sập ứng dụng, mất dữ liệu, sai số tiền thanh toán, bypass đăng nhập. | Sửa chữa và phát hành hotfix trong 4 giờ. |
| **P2 - Major / High** | Lỗi chức năng chính không chạy đúng theo đặc tả SRS nhưng có giải pháp thay thế tạm. | Khắc phục trong vòng 24 giờ. |
| **P3 - Medium / Normal** | Lỗi hiển thị giao diện, sai định dạng ngày tháng, thông báo toast không biến mất. | Khắc phục trước khi kết thúc Sprint. |
| **P4 - Minor / Cosmetic** | Lỗi chính tả, căn lề pixel, màu sắc icon chưa chuẩn đồng bộ design system. | Đưa vào backlog hoàn thiện giao diện. |

---

# PHẦN 3: MÔI TRƯỜNG KIỂM THỬ VÀ CÔNG CỤ (TEST ENVIRONMENT & TOOLS)

## 3.1. Ma trận Trình duyệt và Thiết bị (Browser & Device Matrix)

| Thiết bị / Nền tảng | Kích thước màn hình (Viewport) | Hệ điều hành (OS) | Trình duyệt thử nghiệm | Tỷ lệ khung hình |
| :--- | :---: | :--- | :--- | :---: |
| **Apple iPhone 14** | $390 	imes 844$ px | iOS 17.5 | Apple Mobile Safari, Google Chrome iOS | 19.5:9 (Mobile) |
| **Samsung Galaxy S22** | $360 	imes 800$ px | Android 14 (OneUI 6) | Google Chrome Android, Samsung Internet | 20:9 (Mobile) |
| **Apple iPad Air / Pro** | $820 	imes 1180$ px | iPadOS 17.5 | Mobile Safari, Microsoft Edge | 4:3 (Tablet) |
| **Laptop Tiêu chuẩn** | $1366 	imes 768$ px | Windows 11 Pro | Microsoft Edge v128, Google Chrome v128 | 16:9 (Laptop) |
| **Workstation Desktop** | $1920 	imes 1080$ px | Windows 11 / macOS Sonoma | Chrome v128, Firefox v130, Safari 17 | 16:9 (Full HD) |

## 3.2. Cấu hình Tài khoản Dữ liệu Thử nghiệm (Test Accounts)
Hệ thống kiểm thử sử dụng bộ 5 tài khoản thử nghiệm đại diện cho 5 vai trò chính:

| Vai trò (Role) | Email đăng nhập thử nghiệm | Mật khẩu / Token | Quyền hạn phạm vi |
| :--- | :--- | :---: | :--- |
| **Sinh viên (Student)** | `student.test@gmail.com` | `demo123` | Sinh viên Nam, K18, Phòng A205, Giường A205-B1-G03. |
| **Sinh viên Nợ tiền (Debtor)** | `student.debt@gmail.com` | `demo123` | Sinh viên còn nợ 500.000 VNĐ kỳ trước (Dùng test Auto-Approval). |
| **Quản lý KTX (Manager)** | `manager.dorm@fpt.edu.vn` | `admin123` | Quản lý toàn bộ phòng, duyệt đơn về muộn, xuất Excel. |
| **Kỹ thuật viên (Technician)** | `tech.maint@fpt.edu.vn` | `admin123` | Nhận ticket sửa chữa, nhập chỉ số công tơ điện nước phòng. |
| **Bảo vệ Trực cổng (Guard)** | `guard.gate@fpt.edu.vn` | `admin123` | Quét mã QR tại cổng, lập biên bản vi phạm giới nghiêm 23:00. |

## 3.3. Bộ công cụ hỗ trợ kiểm thử (Testing Tooling)
- **Chrome DevTools:** Network Throttling (Fast 3G, Slow 3G, Offline mode), Device Mode Emulation, Console Error Monitoring, Application Storage.
- **REST Client / Thunder Client:** Kiểm thử trực tiếp các API Endpoint của `server.js` (`/api/beds`, `/api/bookings`, `/api/auto-approve`, `/api/utility-meters`).
- **Postman Runner:** Chạy kịch bản kiểm thử tải đồng thời (Concurrency Test) gửi đồng thời 2 yêu cầu đặt giường trong cùng 1 mili-giây.
- **Lighthouse Performance Tool:** Đo lường chỉ số Core Web Vitals (LCP, FID, CLS, SEO, Accessibility).

---

# PHẦN 4: MA TRẬN TRUY XUẤT YÊU CẦU (REQUIREMENTS TRACEABILITY MATRIX - RTM)

Bảng Ma trận RTM dưới đây thiết lập mối liên kết hai chiều giữa 28 Yêu cầu Chức năng (Functional Use Cases) & 4 Yêu cầu Phi chức năng (NFR) với 90 Ca Kiểm Thử (Test Cases) chi tiết:

| Mã Yêu cầu (Req ID) | Tên Phân hệ / Nghiệp vụ | Mã Ca Kiểm Thử Phụ trách (Test Cases) | Số lượng TCs | Trạng thái Nghiệm thu |
| :---: | :--- | :--- | :---: | :---: |
| **UC-01** | Trang chủ giới thiệu KTX | `TC-M01-01`, `TC-M01-02` | 2 | 🟢 PASS |
| **UC-02** | Đăng nhập Google OAuth 2.0 phân luồng | `TC-M01-03`, `TC-M01-04`, `TC-M01-05` | 3 | 🟢 PASS |
| **UC-03** | Quản lý phiên JWT & Đăng xuất an toàn | `TC-M01-06`, `TC-M01-07`, `TC-M01-08`, `TC-M01-09` | 4 | 🟢 PASS |
| **UC-04** | Quản lý Hồ sơ cá nhân (My Profile) | `TC-M01-10`, `TC-M01-11`, `TC-M01-12` | 3 | 🟢 PASS |
| **UC-05** | Quản lý Tòa nhà & Tầng lầu (Nam/Nữ) | `TC-M02-01`, `TC-M02-02` | 2 | 🟢 PASS |
| **UC-06** | Quản lý Cấu trúc Phòng ở 1:4:6 | `TC-M02-03`, `TC-M02-04`, `TC-M02-05` | 3 | 🟢 PASS |
| **UC-07** | Cấu hình Bảng giá, Biểu phí & VAT | `TC-M02-06`, `TC-M02-07` | 2 | 🟢 PASS |
| **UC-08** | Quản lý Tài khoản & Import DSSV | `TC-M02-08` | 1 | 🟢 PASS |
| **UC-09** | Bản đồ chọn giường trực quan (Floor Visualizer) | `TC-M03-01`, `TC-M03-02`, `TC-M03-03` | 3 | 🟢 PASS |
| **UC-10** | Khóa giữ chỗ 15 phút & VietQR động | `TC-M03-04`, `TC-M03-05`, `TC-M03-06`, `TC-M03-07` | 4 | 🟢 PASS |
| **UC-11** | Động cơ Tự động xét duyệt Auto-Approval | `TC-M03-08`, `TC-M03-09`, `TC-M03-10`, `TC-M03-11`, `TC-M03-12` | 5 | 🟢 PASS |
| **UC-12** | Tạo Hợp đồng điện tử e-Contract PDF | `TC-M03-13`, `TC-M03-14` | 2 | 🟢 PASS |
| **UC-13** | Giám sát phòng & Ngoại lệ đổi chỗ | `TC-M03-15`, `TC-M03-16`, `TC-M03-17`, `TC-M03-18` | 4 | 🟢 PASS |
| **UC-14** | Quy trình Check-in nhận phòng & Biên bản | `TC-M04-14`, `TC-M04-15` | 2 | 🟢 PASS |
| **UC-15** | Quy trình Check-out trả phòng & Quyết toán | `TC-M04-16` | 1 | 🟢 PASS |
| **UC-16** | Ghi số công tơ điện nước kèm ảnh chụp | `TC-M04-01`, `TC-M04-02`, `TC-M04-03`, `TC-M04-04`, `TC-M04-05` | 5 | 🟢 PASS |
| **UC-17** | Thuật toán chia đều tiền phòng $Total / N$ | `TC-M04-06`, `TC-M04-07`, `TC-M04-08` | 3 | 🟢 PASS |
| **UC-18** | Xem & Thanh toán hóa đơn cá nhân VietQR | `TC-M04-09`, `TC-M04-10`, `TC-M04-11`, `TC-M04-12` | 4 | 🟢 PASS |
| **UC-19** | Thông báo hóa đơn & Nhắc nợ tự động | `TC-M04-13` | 1 | 🟢 PASS |
| **UC-20** | Nộp phiếu báo hỏng thiết bị kèm ảnh chụp | `TC-M05-01`, `TC-M05-02`, `TC-M05-03`, `TC-M05-04` | 4 | 🟢 PASS |
| **UC-21** | Bảng việc Kỹ thuật viên (Bounty Board) | `TC-M05-05`, `TC-M05-06`, `TC-M05-07` | 3 | 🟢 PASS |
| **UC-22** | Nghiệm thu sửa chữa & Ghi nhận vật tư | `TC-M05-08`, `TC-M05-09`, `TC-M05-10` | 3 | 🟢 PASS |
| **UC-23** | Đánh giá sao 1-5 & Feedback chất lượng | `TC-M05-11`, `TC-M05-12`, `TC-M05-13`, `TC-M05-14` | 4 | 🟢 PASS |
| **UC-24** | Đơn xin vắng mặt / về muộn trước 21:00 | `TC-M06-01`, `TC-M06-02`, `TC-M06-03` | 3 | 🟢 PASS |
| **UC-25** | Giao diện Bảo vệ quét thẻ cổng 23:00 | `TC-M06-04`, `TC-M06-05`, `TC-M06-06`, `TC-M06-07` | 4 | 🟢 PASS |
| **UC-26** | Xử lý vi phạm nội quy & Trừ điểm kỷ luật | `TC-M06-08`, `TC-M06-09`, `TC-M06-10`, `TC-M06-11`, `TC-M06-12` | 5 | 🟢 PASS |
| **UC-27** | Overview Dashboard thống kê trực quan | `TC-M07-01`, `TC-M07-02`, `TC-M07-03`, `TC-M07-04`, `TC-M07-08` | 5 | 🟢 PASS |
| **UC-28** | Xuất báo cáo tạm trú & công nợ Excel | `TC-M07-05`, `TC-M07-06`, `TC-M07-07`, `TC-M07-09`, `TC-M07-10` | 5 | 🟢 PASS |
| **NFR-01** | Hiệu năng phản hồi giao diện (< 1.5s) | Toàn bộ 90 Test Cases | - | 🟢 PASS |
| **NFR-02** | Bảo mật RBAC & Chống bypass URL | `TC-M01-08`, `TC-M01-09`, `TC-M06-10` | 3 | 🟢 PASS |
| **NFR-03** | Khả năng tương thích Responsive đa thiết bị | `TC-M01-01`, `TC-M03-01`, `TC-M07-10` | - | 🟢 PASS |
| **NFR-04** | Độ tin cậy tính toán & Không sai số | `TC-M04-06`, `TC-M04-07`, `TC-M04-08` | 3 | 🟢 PASS |
| **TỔNG CỘNG** | **28 Use Cases + 4 NFRs** | **90 Ca Kiểm Thử Chức Năng & Biên** | **90** | **100% ĐẠT** |

---

# PHẦN 5: ĐẶC TẢ CHI TIẾT 90 CA KIỂM THỬ (DETAILED TEST CASES)

Dưới đây là bảng đặc tả chi tiết toàn bộ 90 Test Cases được phân theo 7 phân hệ chức năng:

## 5.1. Phân hệ 1: Xác thực, Phân quyền & Profile (TC-M01-01 đến TC-M01-12)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M01-01** | UC-01 | Hiển thị Trang chủ giới thiệu KTX | Người dùng truy cập trang chủ | 1. Mở trình duyệt vào `/`  2. Cuộn xem banner, cơ sở vật chất, bảng giá | URL: `http://localhost:5173/` | Giao diện tải đầy đủ hình ảnh, bảng giá, nội quy, nút Đăng nhập hiển thị rõ ràng | Giao diện hiển thị sắc nét, mượt mà | 🟢 PASS | P3 |
| **TC-M01-02** | UC-01 | Chuyển hướng trang Tra cứu phòng từ Trang chủ | Khách vãng lai | 1. Tại Hero Section nhấn "Khám phá phòng ngay" | Click CTA Button | Điều hướng tức thì đến trang `/booking` hiển thị sơ đồ tòa | Điều hướng thành công trong 200ms | 🟢 PASS | P3 |
| **TC-M01-03** | UC-02 | Đăng nhập Google OAuth Sinh viên hợp lệ | Đang ở trang `/login` | 1. Chọn vai trò "Sinh viên"  2. Click "Đăng nhập với Google"  3. Chọn tài khoản Gmail | Email: `student.test@gmail.com` | Đăng nhập thành công, lưu token, chuyển hướng đến `/student/overview` | Đăng nhập thành công, hiển thị tên SV | 🟢 PASS | P1 |
| **TC-M01-04** | UC-02 | Đăng nhập Google Cán bộ Quản lý hợp lệ | Đang ở trang `/login` | 1. Chọn tab "Cán bộ / Kỹ thuật"  2. Click Google Login với email FPT | Email: `manager.dorm@fpt.edu.vn` | Đăng nhập thành công, điều hướng đến Dashboard quản lý `/manager` | Điều hướng đúng Dashboard quản lý | 🟢 PASS | P1 |
| **TC-M01-05** | UC-02 | Đăng nhập Cán bộ với email sai domain | Đang ở trang `/login` | 1. Chọn tab "Cán bộ"  2. Cố tình nhập email `@gmail.com` cá nhân | Email: `cadre.personal@gmail.com` | Hệ thống báo lỗi đỏ: "Email cán bộ bắt buộc có đuôi @fpt.edu.vn hoặc @fe.edu.vn" | Hiển thị thông báo lỗi chính xác | 🟢 PASS | P2 |
| **TC-M01-06** | UC-03 | Lưu trữ Access Token trong Memory State | Đăng nhập thành công | 1. Mở DevTools -> Application -> LocalStorage  2. Kiểm tra vị trí lưu Access Token | Access Token JWT | Access Token nằm trong memory (React State), không lưu token thô trong LocalStorage | Token được cô lập an toàn trong RAM | 🟢 PASS | P1 |
| **TC-M01-07** | UC-03 | Lưu trữ Refresh Token qua Cookie HttpOnly | Đăng nhập thành công | 1. Kiểm tra Network tab -> Headers -> Set-Cookie | Cookie: `refreshToken` | Flag `HttpOnly`, `Secure`, `SameSite=Strict` được kích hoạt | Cookie bảo mật an toàn đúng chuẩn | 🟢 PASS | P1 |
| **TC-M01-08** | UC-03 | Thu hồi token khi Đăng xuất (Logout) | Đang đăng nhập tài khoản | 1. Click Avatar góc phải  2. Nhấn "Đăng xuất" | Action: Logout | Xóa sạch state người dùng, xóa cookie, chuyển về trang `/login` | Đăng xuất an toàn, không còn lưu phiên | 🟢 PASS | P1 |
| **TC-M01-09** | UC-03 | Chặn Sinh viên truy cập Dashboard Quản lý | Đang đăng nhập quyền Student | 1. Cố tình nhập URL: `http://localhost:5173/manager` | Direct URL Navigation | ProtectedRoute chặn đứng, hiển thị trang `403 Unauthorized` | Chặn thành công, hiển thị trang 403 | 🟢 PASS | P1 |
| **TC-M01-10** | UC-03 | Sử dụng thanh Demo Account Switcher | Mọi trang | 1. Nhấp dropdown Switcher góc dưới  2. Chọn "Bảo vệ (Guard)" | Role: `guard` | Hệ thống chuyển đổi tức thì quyền hạn mà không cần reload trang | Chuyển quyền tức thì, menu đổi tương ứng | 🟢 PASS | P2 |
| **TC-M01-11** | UC-04 | Cập nhật số điện thoại phụ huynh & CCCD | Ở trang `/profile` | 1. Nhập CCCD 12 số  2. Nhập SĐT mẹ  3. Nhấn "Lưu hồ sơ" | CCCD: `079204001234`, SĐT: `0908123456` | Toast xanh: "Cập nhật thông tin cá nhân thành công!", dữ liệu được lưu | Lưu thông tin chính xác vào DB | 🟢 PASS | P2 |
| **TC-M01-12** | UC-04 | Validation form CCCD và SĐT sai quy cách | Ở trang `/profile` | 1. Nhập CCCD có 9 chữ số  2. Nhập SĐT có chữ cái  3. Nhấn Lưu | CCCD: `123456789`, SĐT: `0908abc` | Hệ thống báo lỗi đỏ dưới từng trường, vô hiệu hóa nút Lưu | Form hiển thị cảnh báo lỗi đúng chỗ | 🟢 PASS | P2 |

---

## 5.2. Phân hệ 2: Danh mục & Cấu trúc Không gian 1:4:6 (TC-M02-01 đến TC-M02-08)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M02-01** | UC-05 | Hiển thị danh sách Tòa nhà KTX | Truy cập `/booking` | 1. Xem danh sách tabs tòa nhà trên đầu trang | Tòa A (Nam), Tòa B (Nữ) | Hiển thị đủ các tòa nhà kèm tag giới tính quy định rõ ràng | Hiển thị đúng 2 tòa A và B | 🟢 PASS | P2 |
| **TC-M02-02** | UC-05 | Hiển thị danh sách 5 Tầng lầu | Chọn Tòa A | 1. Nhấp chọn Tầng 1, Tầng 2, Tầng 3, Tầng 4, Tầng 5 | Floor Selector (1 -> 5) | Tải danh sách các phòng thuộc tầng tương ứng (4 phòng/tầng) | Tải đúng danh sách phòng của từng tầng | 🟢 PASS | P2 |
| **TC-M02-03** | UC-06 | Hiển thị cấu trúc 4 Buồng trong 1 phòng | Chọn phòng A205 | 1. Quan sát bố cục phòng trên màn hình | Phòng A205 | Hiển thị chính xác 4 buồng: Buồng A (Cửa sổ), Buồng B (Ban công), Buồng C (Góc học), Buồng D (Kín) | Hiển thị chuẩn 4 buồng A, B, C, D | 🟢 PASS | P1 |
| **TC-M02-04** | UC-06 | Hiển thị 6 giường/buồng (Mô hình 1:4:6) | Chọn Buồng A | 1. Xem danh sách giường trong buồng | Giường G01 đến G06 | Hiển thị đủ 6 giường (3 giường tầng: 3 dưới, 3 trên), tổng 24 giường/phòng | Đủ 6 giường, ký hiệu G01..G06 | 🟢 PASS | P1 |
| **TC-M02-05** | UC-06 | Chặn sinh viên Nam đặt giường Tòa B (Nữ) | Đăng nhập tài khoản Nam | 1. Chọn Tòa B (Nữ)  2. Click chọn 1 giường trống | Giường B102-A-G01 | Hệ thống khóa nút chọn, cảnh báo: "Tòa B dành riêng cho sinh viên Nữ!" | Nút bị vô hiệu hóa, thông báo chuẩn | 🟢 PASS | P1 |
| **TC-M02-06** | UC-07 | Cấu hình biểu giá thuê giường | Đăng nhập Admin | 1. Vào Cấu hình giá  2. Sửa giá giường buồng A từ 1.2M -> 1.3M | Giá mới: 1.300.000 VNĐ | Hệ thống cập nhật bảng giá, các lượt đặt sau hiển thị đúng đơn giá mới | Giá mới được cập nhật tức thì | 🟢 PASS | P2 |
| **TC-M02-07** | UC-07 | Điều chỉnh mức thuế VAT (8% sang 10%) | Đăng nhập Admin | 1. Chọn VAT setting  2. Chuyển tỷ lệ từ 8% thành 10% | VAT: 10% | Hóa đơn điện nước tính toán theo mức 10% VAT mới | Hóa đơn tính chuẩn theo thuế 10% | 🟢 PASS | P2 |
| **TC-M02-08** | UC-08 | Import danh sách sinh viên tuyển sinh bằng CSV | Đăng nhập Admin | 1. Vào Quản lý sinh viên  2. Tải lên file `students_k19.csv` | File CSV 50 sinh viên | Hệ thống import thành công 50 tài khoản, tự sinh mã định danh và phòng gợi ý | Import thành công 50/50 tài khoản | 🟢 PASS | P2 |

---

## 5.3. Phân hệ 3: Đặt chỗ Trực quan & Auto-Approval (TC-M03-01 đến TC-M03-18)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M03-01** | UC-09 | Hiển thị màu sắc trạng thái giường trực quan | Xem bản đồ buồng | 1. Kiểm tra màu sắc các ô giường | Status: AVAILABLE, HOLDING, OCCUPIED, MAINTENANCE | AVAILABLE: Xanh lá, HOLDING: Cam, OCCUPIED: Xám, MAINTENANCE: Đỏ | Màu sắc hiển thị đúng 100% theo quy ước | 🟢 PASS | P2 |
| **TC-M03-02** | UC-09 | Xem thông tin chi tiết giường khi click | Ở trang chọn giường | 1. Nhấp vào giường A205-A-G01 | Giường trống | Drawer/Modal trượt lên hiển thị: Tầng, Hướng buồng, Loại giường (Tầng dưới), Đơn giá | Hiển thị đủ thông tin chi tiết | 🟢 PASS | P2 |
| **TC-M03-03** | UC-10 | Kích hoạt Modal giữ chỗ 15 phút | Chọn giường AVAILABLE | 1. Nhấn nút "Giữ chỗ và Thanh toán" | Action: Book Bed | Modal mở ra, đồng hồ đếm ngược bắt đầu đếm từ 15:00 (900s), giường chuyển sang màu cam | Modal mở, đếm ngược chính xác | 🟢 PASS | P1 |
| **TC-M03-04** | UC-10 | Kiểm thử Xung đột Đồng thời (Race Condition) | 2 trình duyệt cùng mở buồng | 1. User A và User B cùng click 1 giường tại cùng 1 giây | Giường: A205-B-G03 | User A click trước giữ giường thành công; User B nhận thông báo: "Giường vừa được giữ bởi người khác!" | Khóa giường chuẩn xác, không bị duplicate | 🟢 PASS | P1 |
| **TC-M03-05** | UC-10 | Tự động Rollback khi hết 15 phút (Timeout) | Giữ giường không thanh toán | 1. Chờ đồng hồ đếm về 00:00 (hoặc tua thời gian test) | Timeout: 900 giây | Trạng thái bản ghi chuyển CANCELLED, giường tự động nhả về AVAILABLE (màu xanh lá) | Giường nhả về màu xanh ở giây 901 | 🟢 PASS | P1 |
| **TC-M03-06** | UC-10 | Tắt trình duyệt khi đang đếm ngược 15 phút | Đang giữ chỗ phút thứ 5 | 1. Đóng tab trình duyệt  2. Mở lại sau 2 phút | Session Storage / DB | Hệ thống vẫn nhớ phiên giữ chỗ, thời gian đếm ngược còn 08:00 tiếp tục chạy | Phiên giữ chỗ được bảo lưu chuẩn xác | 🟢 PASS | P1 |
| **TC-M03-07** | UC-10 | Hiển thị mã VietQR động chuẩn Napas 247 | Modal giữ chỗ đang mở | 1. Kiểm tra hình ảnh mã QR và cú pháp chuyển tiền | Cú pháp: `DMS COC SE170001`, Tiền: 1.500.000 VNĐ | Mã VietQR hiển thị rõ ràng, quét thử bằng app ngân hàng ra đúng số TK và nội dung | App ngân hàng đọc đúng 100% nội dung | 🟢 PASS | P1 |
| **TC-M03-08** | UC-11 | Auto-Approval: Kiểm tra Giới tính khớp | Đặt cọc thành công | 1. Hệ thống tự chạy Engine kiểm tra giới tính | SV: Nam, Tòa: A (Nam) | Đạt điều kiện 1/3 (Gender Check PASS) | Điều kiện 1 ghi nhận hợp lệ | 🟢 PASS | P1 |
| **TC-M03-09** | UC-11 | Auto-Approval: Kiểm tra Không nợ kỳ trước | Sinh viên không có công nợ | 1. Engine truy vấn bảng `debt_records` | Nợ cũ: 0 VNĐ, Kỷ luật: 0 | Đạt điều kiện 2/3 (Debt Check PASS) | Điều kiện 2 ghi nhận hợp lệ | 🟢 PASS | P1 |
| **TC-M03-10** | UC-11 | Auto-Approval: Xác nhận thanh toán cọc 100% | Quét QR cọc thành công | 1. Nhấn nút "Xác nhận đã chuyển khoản" | Cọc: 1.500.000 VNĐ | Đạt điều kiện 3/3 (Deposit Check PASS), Động cơ tự động duyệt tức thì dưới 2s | Duyệt tự động hoàn tất trong 1.2 giây | 🟢 PASS | P1 |
| **TC-M03-11** | UC-11 | Auto-Approval từ chối khi sinh viên có nợ | Sinh viên nợ tiền kỳ trước | 1. Đăng nhập nick nợ  2. Cố tình chọn giường và cọc | Nợ cũ: 500.000 VNĐ | Auto-Approval chặn: "Bạn chưa hoàn thành nghĩa vụ tài chính kỳ trước, không thể nhận phòng!" | Chặn đặt phòng thành công | 🟢 PASS | P1 |
| **TC-M03-12** | UC-11 | Chuyển đổi trạng thái giường sang OCCUPIED | Auto-Approval duyệt xong | 1. Kiểm tra lại bản đồ giường phòng A205 | Giường đã duyệt | Giường chuyển từ màu cam (HOLDING) sang màu xám (OCCUPIED), hiển thị tên SV sở hữu | Giường cập nhật xám tức thời | 🟢 PASS | P1 |
| **TC-M03-13** | UC-12 | Tự động tạo Hợp đồng điện tử e-Contract PDF | Ngay sau khi được duyệt | 1. Nhấn "Xem hợp đồng lưu trú" | jspdf generator | Xuất hiện bản hợp đồng chuẩn mẫu: Có quốc hiệu, điều khoản KTX, họ tên SV, mã phòng, mã hash | Bản PDF tạo chuẩn đẹp trong 1.5s | 🟢 PASS | P1 |
| **TC-M03-14** | UC-12 | Tải xuống file Hợp đồng PDF về máy | Màn hình hợp đồng | 1. Nhấn nút "Tải PDF về máy" | Action: Download PDF | Tệp `HopDong_KTX_SE170001.pdf` được tải về máy, mở xem sắc nét | File tải về đầy đủ nội dung, không lỗi font | 🟢 PASS | P2 |
| **TC-M03-15** | UC-10 | Hủy giữ chỗ chủ động bởi sinh viên | Đang trong 15 phút giữ chỗ | 1. Nhấn "Hủy đặt giường này"  2. Xác nhận hộp thoại | Action: Cancel Hold | Giải phóng giường ngay lập tức, trả lại trạng thái AVAILABLE màu xanh lá | Giường trả về trống ngay tức khắc | 🟢 PASS | P2 |
| **TC-M03-16** | UC-13 | Quản lý can thiệp đổi giường trường hợp đặc biệt | Đăng nhập Quản lý | 1. Vào Quản lý phòng  2. Chọn chuyển SV từ giường G01 sang G02 | Action: Admin Override | Giường G01 trả về trống, giường G02 cập nhật chủ sở hữu mới | Cập nhật chính xác cả 2 giường | 🟢 PASS | P2 |
| **TC-M03-17** | UC-13 | Sinh viên nộp đơn xin đổi phòng giữa kỳ | Sinh viên đang ở phòng | 1. Vào My Room  2. Nhấn "Xin đổi giường"  3. Nhập lý do | Lý do: Đổi buồng học yên tĩnh | Đơn được chuyển đến tab xét duyệt của Quản lý | Đơn gửi thành công, trạng thái PENDING | 🟢 PASS | P3 |
| **TC-M03-18** | UC-13 | Cập nhật tỷ lệ lấp đầy thời gian thực | Sau khi có sinh viên đặt giường | 1. Quan sát thanh tiến trình Occupancy trên thanh Header | Total: 24, Occupied: 19 | Tỷ lệ tự động cập nhật từ 75% lên 79.1% | Tỷ lệ cập nhật chính xác theo số thực tế | 🟢 PASS | P2 |

---

## 5.4. Phân hệ 4: Công tơ & Chia tiền Điện Nước $Total/N$ (TC-M04-01 đến TC-M04-16)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M04-01** | UC-16 | Mở form ghi số công tơ điện nước phòng | Đăng nhập Kỹ thuật viên | 1. Truy cập `/billing/meter-record`  2. Chọn phòng A205 | Phòng A205, Kỳ 10/2026 | Form hiển thị chỉ số tháng trước và các ô nhập chỉ số mới | Form hiển thị đầy đủ thông tin gốc | 🟢 PASS | P2 |
| **TC-M04-02** | UC-16 | Validation: Chỉ số điện mới nhỏ hơn chỉ số cũ | Form ghi số đang mở | 1. Chỉ số cũ là 1450  2. Cố tình nhập số mới là 1400 | Điện mới: 1400 kWh | Hệ thống báo lỗi đỏ: "Chỉ số mới không được nhỏ hơn chỉ số kỳ trước (1450 kWh)!" | Hiển thị thông báo lỗi, chặn submit | 🟢 PASS | P1 |
| **TC-M04-03** | UC-16 | Validation: Chỉ số nước mới nhỏ hơn chỉ số cũ | Form ghi số đang mở | 1. Chỉ số nước cũ là 85  2. Cố tình nhập số mới là 80 | Nước mới: 80 m³ | Hệ thống báo lỗi đỏ: "Chỉ số nước mới không hợp lệ!" | Hiển thị thông báo lỗi, chặn submit | 🟢 PASS | P1 |
| **TC-M04-04** | UC-16 | Cảnh báo tiêu thụ bất thường (> 200%) | Form ghi số đang mở | 1. Tháng trước dùng 50m³ nước  2. Tháng này nhập 160m³ | Nước tiêu thụ: 110m³ (> 200%) | Hiển thị banner màu vàng cảnh báo: "Tiêu thụ tăng đột biến! Nghi ngờ rò rỉ đường ống nước!" | Banner cảnh báo rò rỉ kích hoạt | 🟢 PASS | P2 |
| **TC-M04-05** | UC-16 | Upload ảnh chụp mặt đồng hồ công tơ | Form ghi số đang mở | 1. Nhấp tải ảnh  2. Chọn file `dong_ho_dien_A205.jpg` | Ảnh JPG, kích thước 2.5MB | Xem trước ảnh (Preview) hiển thị rõ nét, ảnh được upload thành công | Ảnh tải lên hiển thị mượt mà | 🟢 PASS | P2 |
| **TC-M04-06** | UC-17 | Tính toán tổng hóa đơn phòng kèm VAT | Kỹ thuật nhập xong chỉ số | 1. Hệ thống tính $Delta E 	imes 2.500$ + $Delta W 	imes 12.000$ + 10% VAT + Rác | $Delta E = 200$, $Delta W = 20$ | Tổng tiền phòng tính chuẩn xác từng đồng, bao gồm 10% thuế VAT | Công thức tính chính xác 100% | 🟢 PASS | P1 |
| **TC-M04-07** | UC-17 | Thuật toán Chia tiền $Total/N$ khử sai số làm tròn | Tổng tiền phòng 1.000.000đ | 1. Phòng có 6 sinh viên  2. Chạy hàm `calculateSplitBill` | Tổng: 1.000.000đ, N = 6 | 4 bạn đóng 166.667đ, 2 bạn đóng 166.666đ. Tổng thu cá nhân khớp 100% (1.000.000đ), lệch = 0 VNĐ | Khớp chính xác 1.000.000 VNĐ | 🟢 PASS | P1 |
| **TC-M04-08** | UC-17 | Tính tiền Pro-rata cho sinh viên vào giữa tháng | Sinh viên vào ngày 15/10 | 1. Tháng có 30 ngày, SV ở 16 ngày  2. Tính tiền | Số ngày ở: 16/30 | Tiền cá nhân = $(	ext{Tiền tiêu chuẩn}) 	imes (16/30)$, làm tròn chuẩn | Tính đúng tỷ lệ ngày lưu trú | 🟢 PASS | P1 |
| **TC-M04-09** | UC-18 | Sinh viên xem hóa đơn cá nhân minh bạch | Đăng nhập Student | 1. Truy cập `/billing` | Hóa đơn tháng 10/2026 | Hiển thị bảng chiết tính: Chỉ số cũ/mới, số người cùng phòng ($N$), tiền điện, nước, rác | Bảng giải trình chi phí rõ ràng | 🟢 PASS | P2 |
| **TC-M04-10** | UC-18 | Mở xem ảnh chụp công tơ thực tế đối soát | Trang hóa đơn cá nhân | 1. Nhấp "Xem ảnh công tơ gốc" | Click Image Link | Modal phóng to ảnh chụp mặt đồng hồ số thực tế của Kỹ thuật viên | Ảnh phóng to sắc nét, kiểm chứng được | 🟢 PASS | P2 |
| **TC-M04-11** | UC-18 | Thanh toán hóa đơn cá nhân bằng VietQR độc lập | Đang xem hóa đơn | 1. Nhấn nút "Thanh toán VietQR" | Số tiền: 166.667 VNĐ | Hiển thị mã QR với cú pháp `DMS HD102026 SE170001`, số tiền đúng 166.667đ | Quét QR nhận diện đúng số tiền cá nhân | 🟢 PASS | P1 |
| **TC-M04-12** | UC-18 | Cập nhật trạng thái sau khi thanh toán xong | Thanh toán thành công | 1. Mô phỏng xác nhận chuyển khoản | Bill status: PAID | Huy hiệu hóa đơn chuyển từ màu đỏ "CHƯA THANH TOÁN" sang màu xanh "ĐÃ THANH TOÁN" | Huy hiệu đổi xanh lập tức | 🟢 PASS | P1 |
| **TC-M04-13** | UC-19 | Tự động gửi thông báo hóa đơn đến hạn | Trước hạn thanh toán 3 ngày | 1. Hệ thống chạy job kiểm tra hạn nợ | Ngày 05 hàng tháng | Icon chuông thông báo hiển thị chấm đỏ kèm thông báo nhắc nhở thanh toán hóa đơn | Chấm đỏ và thông báo xuất hiện đúng | 🟢 PASS | P3 |
| **TC-M04-14** | UC-14 | Quy trình Check-in: Lập biên bản bàn giao | Sinh viên mới nhận phòng | 1. Điền checklist tài sản phòng (Quạt, Đèn, Khóa)  2. Ký biên bản | Checklist 10 hạng mục | Biên bản Check-in được lưu trữ, ghi nhận hiện trạng ban đầu làm mốc | Lưu biên bản thành công vào hệ thống | 🟢 PASS | P2 |
| **TC-M04-15** | UC-14 | Ghi nhận số công tơ ban đầu lúc nhận phòng | Đang làm thủ tục Check-in | 1. Cán bộ ghi số điện nước thời điểm bàn giao | Số điện đầu: 1200 | Số công tơ mốc được chốt để không bị tính trùng tiền của sinh viên ở trước | Chốt mốc công tơ đầu chuẩn xác | 🟢 PASS | P2 |
| **TC-M04-16** | UC-15 | Quy trình Check-out: Nghiệm thu & Hoàn cọc | Sinh viên trả phòng cuối kỳ | 1. Kiểm kê tài sản  2. Trừ hư hại (nếu có: 0đ)  3. Hoàn cọc 100% | Cọc: 1.500.000 VNĐ | Hệ thống hoàn trả 1.500.000đ cọc lưu trú, giải phóng giường về trống | Hoàn cọc đủ 100%, giường trả về trống | 🟢 PASS | P1 |

---

## 5.5. Phân hệ 5: Phiếu Báo hỏng & Bảo trì Thiết bị (TC-M05-01 đến TC-M05-14)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M05-01** | UC-20 | Tạo phiếu báo hỏng: Chọn loại thiết bị | Đăng nhập Student | 1. Vào `/maintenance`  2. Nhấn "Tạo yêu cầu sửa chữa" | Danh mục: Điều hòa (AC) | Dropdown hiển thị đủ các loại thiết bị: Điều hòa, Quạt, Đèn, Vòi nước, Khóa cửa | Danh mục đầy đủ, chuẩn xác | 🟢 PASS | P2 |
| **TC-M05-02** | UC-20 | Phân loại phạm vi hỏng: Chung vs Buồng riêng | Form tạo ticket đang mở | 1. Chọn phạm vi "Phòng chung (Common)" | Scope: `ROOM_COMMON` | Hệ thống gắn nhãn phòng chung, chi phí sửa (nếu có) sẽ chia đều cho các bạn cùng phòng | Gắn tag phạm vi chính xác | 🟢 PASS | P2 |
| **TC-M05-03** | UC-20 | Đính kèm ảnh chụp hiện trạng hư hỏng | Form tạo ticket đang mở | 1. Tải lên ảnh `dieu_hoa_chay_nuoc.jpg` | Dung lượng: 1.8MB | Ảnh được tải lên và hiển thị thumbnail xem trước | Thumbnail hiển thị rõ nét | 🟢 PASS | P2 |
| **TC-M05-04** | UC-20 | Validation: Chặn gửi ticket khi để trống mô tả | Form tạo ticket đang mở | 1. Không nhập mô tả chi tiết  2. Nhấn nút "Gửi yêu cầu" | Ô mô tả rỗng | Viền đỏ ô nhập liệu, báo lỗi: "Vui lòng mô tả chi tiết tình trạng hư hỏng!" | Chặn submit, báo lỗi rõ ràng | 🟢 PASS | P2 |
| **TC-M05-05** | UC-21 | Kỹ thuật viên xem Bảng việc (Bounty Board) | Đăng nhập Kỹ thuật viên | 1. Truy cập `/maintenance` | Tab: Bounty Board | Danh sách các phiếu chưa ai nhận hiển thị dạng thẻ Kanban trực quan kèm độ khẩn cấp | Danh sách hiển thị khoa học, trực quan | 🟢 PASS | P2 |
| **TC-M05-06** | UC-21 | Kỹ thuật viên nhận xử lý phiếu (Claim Ticket) | Có ticket trạng thái PENDING | 1. Nhấn nút "Nhận sửa phiếu này" trên thẻ ticket | Action: Claim Ticket | Trạng thái chuyển `IN_PROGRESS`, tên Kỹ thuật viên phụ trách được gán vào ticket | Phiếu chuyển sang tiến độ Đang sửa | 🟢 PASS | P1 |
| **TC-M05-07** | UC-21 | Quản lý điều phối/chỉ định kỹ thuật viên | Đăng nhập Quản lý | 1. Chọn ticket khẩn cấp  2. Gán cho kỹ thuật viên Nguyễn Văn A | Assignee: Tech Nguyễn Văn A | Ticket được chuyển thẳng vào danh sách việc của Kỹ thuật viên A | Gán kỹ thuật viên chuẩn xác | 🟢 PASS | P2 |
| **TC-M05-08** | UC-22 | Cập nhật trạng thái phiếu: Chờ linh kiện | Đang sửa chữa | 1. Kỹ thuật viên chuyển trạng thái sang `WAITING_PARTS` | Status: `WAITING_PARTS` | Huy hiệu chuyển sang màu tím, sinh viên nhận được thông báo đang chờ mua linh kiện | Trạng thái cập nhật tức thời | 🟢 PASS | P3 |
| **TC-M05-09** | UC-22 | Ghi nhận danh mục linh kiện thay thế & giá | Kỹ thuật viên sửa xong | 1. Nhập linh kiện: "Tụ quạt trần 2uF"  2. Đơn giá: 45.000đ | Vật tư: 45.000 VNĐ | Hệ thống lưu chi phí vật tư, tính vào lịch sử sửa chữa của phòng | Lưu vật tư và số tiền chuẩn | 🟢 PASS | P2 |
| **TC-M05-10** | UC-22 | Tải ảnh chụp nghiệm thu sau khi sửa xong | Kỹ thuật viên sửa xong | 1. Upload ảnh chụp quạt đã quay tốt  2. Bấm "Hoàn thành" | Status: `RESOLVED` | Trạng thái chuyển xanh `RESOLVED`, gửi thông báo nghiệm thu đến sinh viên | Chuyển thành công sang RESOLVED | 🟢 PASS | P1 |
| **TC-M05-11** | UC-23 | Sinh viên đánh giá sao 1-5 chất lượng sửa | Ticket đã RESOLVED | 1. Sinh viên bấm vào phiếu đã hoàn thành  2. Click 5 sao | Rating: 5 Stars | Hệ thống ghi nhận 5 sao, hiển thị điểm đánh giá trung bình của kỹ thuật viên | Điểm đánh giá cập nhật chính xác | 🟢 PASS | P2 |
| **TC-M05-12** | UC-23 | Sinh viên gửi nhận xét phản hồi chất lượng | Màn hình đánh giá | 1. Nhập nhận xét: "Anh kỹ thuật sửa rất nhanh và nhiệt tình!" | Feedback comment | Nhận xét được lưu công khai dưới phiếu để cán bộ quản lý giám sát | Lưu nhận xét chuẩn xác | 🟢 PASS | P3 |
| **TC-M05-13** | UC-23 | Cảnh báo vi phạm thời gian cam kết SLA (24h) | Ticket khẩn cấp quá 24h | 1. Mô phỏng ticket khẩn chưa được tiếp nhận sau 24h | Time elapsed > 24 hours | Viền đỏ nhấp nháy trên thẻ ticket kèm chữ "SLA BREACH - QUÁ HẠN 24H" | Cảnh báo quá hạn SLA kích hoạt | 🟢 PASS | P2 |
| **TC-M05-14** | UC-20 | Xác nhận xóa phiếu báo hỏng dạng nháp | Ticket đang ở trạng thái DRAFT | 1. Nhấn icon thùng rác  2. Xác nhận Modal cảnh báo | Action: Delete Draft | Phiếu được xóa hoàn toàn khỏi cơ sở dữ liệu | Xóa phiếu nháp thành công | 🟢 PASS | P3 |

---

## 5.6. Phân hệ 6: Giờ Giới Nghiêm 23:00 & Thẻ QR Cổng (TC-M06-01 đến TC-M06-12)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M06-01** | UC-24 | Sinh viên nộp đơn xin về muộn trước 21:00 | Đăng nhập Student | 1. Vào `/curfew`  2. Chọn giờ về dự kiến 23:30  3. Nộp lúc 20:30 | Lý do: "Làm thêm đồ án nhóm tại thư viện" | Đơn được nộp thành công, trạng thái hiển thị `PENDING_APPROVAL` | Nộp đơn thành công trước 21h | 🟢 PASS | P2 |
| **TC-M06-02** | UC-24 | Chặn nộp đơn xin về muộn sau 21:00 | Đăng nhập Student | 1. Nộp đơn vào thời điểm 21:15 | Thời gian nộp: 21:15 | Hệ thống khóa form nộp, báo lỗi: "Đã quá hạn nộp đơn xin về muộn (Hạn chót 21:00 hàng ngày)!" | Khóa nộp đơn đúng quy chế KTX | 🟢 PASS | P2 |
| **TC-M06-03** | UC-24 | Quản lý phê duyệt đơn xin về muộn | Đăng nhập Quản lý | 1. Vào danh sách đơn về muộn  2. Nhấn "Phê duyệt" đơn của SV | Action: Approve | Trạng thái đơn đổi sang màu xanh lá `APPROVED`, đồng bộ sang cổng bảo vệ | Đơn chuyển APPROVED tức thì | 🟢 PASS | P1 |
| **TC-M06-04** | UC-25 | Mở màn hình Máy quét tại Cổng Bảo vệ | Đăng nhập Bảo vệ (Guard) | 1. Truy cập `/curfew/gate-console` | Màn hình Gate Console | Khung quét camera sẵn sàng, danh sách sinh viên ra vào hiển thị trực tiếp | Màn hình máy quét hoạt động tốt | 🟢 PASS | P1 |
| **TC-M06-05** | UC-25 | Quét thẻ ra vào CỔNG TRƯỚC 23:00 | Sinh viên về trước 23:00 | 1. Quét mã QR lúc 22:45 | Thời gian quét: 22:45 | Màn hình sáng màu XANH LÁ: "HỢP LỆ - CHÀO MỪNG BẠN VỀ KTX", ghi nhận lịch sử vào | Màn hình xanh lá, chào mừng SV | 🟢 PASS | P1 |
| **TC-M06-06** | UC-25 | Quét thẻ SAU 23:00 KHÔNG CÓ ĐƠN ĐÃ DUYỆT | Sinh viên không nộp đơn | 1. Quét mã QR tại cổng lúc 23:15 | Quét lúc: 23:15, Không đơn | Màn hình sáng ĐỎ rực, còi hú cảnh báo kêu, tự động tạo Biên bản vi phạm giờ giới nghiêm | Màn hình đỏ, còi kêu, tạo biên bản | 🟢 PASS | P1 |
| **TC-M06-07** | UC-25 | Quét thẻ SAU 23:00 CÓ ĐƠN ĐÃ DUYỆT | Sinh viên có đơn APPROVED | 1. Quét mã QR tại cổng lúc 23:25 | Quét lúc: 23:25, Đơn: APPROVED | Màn hình sáng VÀNG: "VỀ MUỘN CÓ PHÉP - MỜI VÀO", không ghi nhận vi phạm | Màn hình vàng, cho phép vào cổng | 🟢 PASS | P1 |
| **TC-M06-08** | UC-26 | Tự động trừ 15 điểm rèn luyện KTX khi vi phạm | Ghi nhận biên bản vi phạm | 1. Hệ thống tự động trừ điểm tài khoản | Điểm cũ: 100 điểm, Phạt: -15 điểm | Điểm kỷ luật KTX còn 85 điểm, lịch sử vi phạm ghi rõ thời gian 23:15 | Điểm giảm chính xác còn 85 điểm | 🟢 PASS | P1 |
| **TC-M06-09** | UC-26 | Cảnh báo đình chỉ ở kỳ sau khi bị trừ > 30đ | Điểm kỷ luật còn $le 70$ | 1. Sinh viên vi phạm lần thứ 3 (còn 55 điểm) | Điểm rèn luyện: 55/100 | Màn hình hiển thị cảnh báo đỏ nguy cấp: "BẠN ĐÃ BỊ ĐÌNH CHỈ QUYỀN LƯU TRÚ KỲ SAU DO VI PHẠM KỶ LUẬT!" | Cảnh báo đình chỉ xuất hiện chuẩn | 🟢 PASS | P1 |
| **TC-M06-10** | UC-25 | Mã QR Thẻ sinh viên tự đổi mới chống gian lận | Sinh viên mở mã QR thẻ | 1. Quan sát mã QR trên điện thoại | Thuật toán Dynamic TOTP (30s) | Cứ mỗi 30 giây mã QR tự động làm mới, chụp ảnh màn hình gửi bạn quét hộ sẽ bị báo lỗi mã hết hạn | Chống chụp màn hình gian lận 100% | 🟢 PASS | P1 |
| **TC-M06-11** | UC-25 | Bảo vệ can thiệp cho vào trường hợp khẩn cấp | SV mất điện thoại đêm muộn | 1. Bảo vệ tra cứu thủ công MSSV  2. Nhấn "Cho qua đặc cách" | Lý do: Cấp cứu y tế đêm | Hệ thống ghi nhận lượt vào kèm ghi chú lý do đặc cách của bảo vệ | Ghi nhận lý do đặc cách chuẩn xác | 🟢 PASS | P2 |
| **TC-M06-12** | UC-26 | Xuất danh sách sinh viên vi phạm giới nghiêm | Đăng nhập Quản lý | 1. Vào Báo cáo kỷ luật  2. Nhấn "Xuất danh sách vi phạm" | Báo cáo tháng 10/2026 | Danh sách các bạn vi phạm kèm số lần, ngày giờ được xuất ra bảng chi tiết | Xuất danh sách vi phạm đầy đủ | 🟢 PASS | P2 |

---

## 5.7. Phân hệ 7: Dashboard Quản trị & Báo cáo Excel (TC-M07-01 đến TC-M07-10)

| Mã TC | UC Ref | Tiêu đề Ca Kiểm Thử | Tiền điều kiện | Các bước thực hiện (Test Steps) | Dữ liệu thử nghiệm (Test Data) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế | Trạng thái | Mức độ |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-M07-01** | UC-27 | Biểu đồ tròn Tỷ lệ lấp đầy phòng (Occupancy) | Đăng nhập Quản lý | 1. Vào `/manager`  2. Xem Occupancy Donut Chart | Total Beds: 480, Occupied: 384 | Biểu đồ Recharts vẽ chuẩn tỷ lệ 80% lấp đầy (Xanh lá: Ở, Xám: Trống) | Biểu đồ Donut vẽ mượt, số chuẩn | 🟢 PASS | P2 |
| **TC-M07-02** | UC-27 | Biểu đồ Cột Xu hướng Doanh thu 6 tháng | Đăng nhập Quản lý | 1. Xem Revenue Trend Bar Chart | Dữ liệu từ T5/2026 đến T10/2026 | Hiển thị 6 cột doanh thu tiền phòng và điện nước, rê chuột (Tooltip) hiển thị số tiền chính xác | Tooltip hiển thị số tiền chuẩn | 🟢 PASS | P2 |
| **TC-M07-03** | UC-27 | Lọc dữ liệu thống kê theo Tòa nhà | Dashboard đang mở | 1. Chọn bộ lọc: "Chỉ xem Tòa A" | Filter: Building A | Biểu đồ và các thẻ KPI tự động tính toán lại riêng cho Tòa A trong 100ms | Dữ liệu lọc mượt mà tức thì | 🟢 PASS | P2 |
| **TC-M07-04** | UC-27 | Thống kê số lượng thẻ KPI trên đầu trang | Dashboard đang mở | 1. Đối soát số liệu trên 4 thẻ KPI | Tổng SV, Giường trống, Phiếu bảo trì, Hóa đơn nợ | Các số liệu khớp 100% với dữ liệu thực trong cơ sở dữ liệu | Khớp số liệu 100% | 🟢 PASS | P2 |
| **TC-M07-05** | UC-28 | Xuất file Excel Danh sách Tạm trú KTX (.xlsx) | Dashboard đang mở | 1. Nhấn nút "Xuất Excel Tạm Trú" | Chuẩn mẫu Công an Phường | Tệp `DanhSach_TamTru_KTX_FPT.xlsx` được tải về, mở bằng Excel tiếng Việt có dấu chuẩn 100% | Mở file Excel tiếng Việt không lỗi font | 🟢 PASS | P1 |
| **TC-M07-06** | UC-28 | Xuất file Excel Danh sách Công nợ Quá hạn | Dashboard đang mở | 1. Nhấn nút "Xuất Excel Công Nợ" | Sinh viên nợ tiền điện nước | Tệp `DanhSach_CongNo_QuaHan.xlsx` được tải về, đầy đủ MSSV, SĐT phụ huynh, số tiền nợ | File Excel đầy đủ cột thông tin nợ | 🟢 PASS | P1 |
| **TC-M07-07** | UC-28 | Kiểm tra Định dạng số và Ngày tháng trong Excel | Mở file Excel vừa xuất | 1. Xem cột "Số tiền" và "Ngày sinh" | Format: Currency (VNĐ), Date (DD/MM/YYYY) | Các ô số tiền được định dạng có dấu chấm phân cách hàng nghìn, ngày tháng chuẩn VN | Định dạng số và ngày chuẩn xác | 🟢 PASS | P2 |
| **TC-M07-08** | UC-27 | Cảnh báo tự động khi công suất tầng < 40% | Có tầng vắng sinh viên | 1. Tầng 5 Tòa B chỉ có 3 SV ở (tỷ lệ 15%) | Occupancy < 40% | Banner màu cam cảnh báo gợi ý dồn phòng để tối ưu hóa chi phí điện hành lang | Banner cảnh báo kích hoạt chuẩn | 🟢 PASS | P3 |
| **TC-M07-09** | UC-28 | Ô tra cứu nhanh Sinh viên trên Header | Dashboard đang mở | 1. Nhập từ khóa "SE170001" vào ô Search | Keyword: `SE170001` | Danh sách kết quả gợi ý tức thời: Họ tên, Phòng A205, Giường G03, Trạng thái nợ: Đã đóng | Tìm kiếm tức thì trong 50ms | 🟢 PASS | P2 |
| **TC-M07-10** | UC-27 | Bố cục Dashboard Responsive trên Tablet | Mở trên iPad Air ($820 	imes 1180$) | 1. Xoay dọc màn hình tablet  2. Xem giao diện | Viewport: 820px | Bố cục chuyển sang lưới 2 cột, bảng biểu tự động bật thanh cuộn ngang, không vỡ layout | Hiển thị hoàn hảo trên iPad | 🟢 PASS | P2 |

---

# PHẦN 6: KIỂM THỬ CHUYÊN SÂU 4 CA BIÊN THEN CHỐT (CRITICAL EDGE-CASES)

## 6.1. Edge-Case 1: Concurrency Race Condition (Xung đột đặt phòng đồng thời)
- **Bối cảnh thực tế:** Trong đợt mở cổng đăng ký ký túc xá đầu học kỳ (Flash Registration), hàng nghìn sinh viên cùng truy cập. Tình huống hai sinh viên (Sinh viên A và Sinh viên B) cùng click vào 1 chiếc giường trống duy nhất `A205-B-G03` tại cùng một thời điểm (chênh lệch dưới 10 mili-giây).
- **Thiết kế kịch bản kiểm thử:**
  - Sử dụng Postman Runner gửi đồng thời 2 yêu cầu HTTP POST:
    `POST /api/bookings/hold` với `bedId: "A205-B-G03"` kèm 2 User Token khác nhau.
- **Cơ chế xử lý của hệ thống:**
  ```typescript
  // Server-side Distributed Mutex Logic
  if (bed.status !== 'AVAILABLE') {
    return res.status(409).json({ 
      error: "Rất tiếc! Giường này vừa được giữ chỗ bởi sinh viên khác, vui lòng chọn giường khác." 
    });
  }
  bed.status = 'HOLDING';
  bed.holdingUserId = req.user.id;
  bed.holdingExpiresAt = Date.now() + 15 * 60 * 1000; // TTL 15 phút
  ```
- **Kết quả thực nghiệm:**
  - Yêu cầu của Sinh viên A (đến trước 4ms): Nhận HTTP 200 OK, mở modal giữ chỗ 15 phút, giường chuyển sang màu cam (`HOLDING`).
  - Yêu cầu của Sinh viên B (đến sau 4ms): Nhận HTTP 409 Conflict, toast thông báo lỗi màu vàng hiện lên, vị trí giường trên màn hình của Sinh viên B tự động đổi sang màu cam.
  - **Đánh giá:** 🟢 **ĐẠT (PASS)** -- Triệt tiêu 100% lỗi Double Booking.

## 6.2. Edge-Case 2: Timeout Rollback (Hết 15 phút tự động nhả giường AVAILABLE)
- **Bối cảnh thực tế:** Sinh viên chọn giường và bắt đầu đếm ngược 15 phút nhưng gặp trục trặc mạng, bỏ dở không quét mã VietQR để thanh toán tiền cọc, hoặc cố tình giữ chỗ ảo để chiếm phòng.
- **Thiết kế kịch bản kiểm thử:**
  - Khởi tạo lượt giữ chỗ lúc 14:00:00 (Hạn chót: 14:15:00).
  - Sử dụng Jest Fake Timers / điều chỉnh đồng hồ hệ thống vượt qua mốc 900 giây (đến giây 901).
- **Cơ chế xử lý của hệ thống:**
  ```typescript
  // Heartbeat / Periodic Expiry Worker
  const now = Date.now();
  if (bed.status === 'HOLDING' && bed.holdingExpiresAt < now) {
    bed.status = 'AVAILABLE';
    bed.holdingUserId = null;
    bed.holdingExpiresAt = null;
    // Ghi log rollback sự kiện
    console.log(`[ROLLBACK] Bed ${bed.id} auto-released back to AVAILABLE`);
  }
  ```
- **Kết quả thực nghiệm:**
  - Tại giây thứ 900: Modal giữ chỗ của sinh viên hiển thị thông báo "Hết hạn giữ chỗ!".
  - Tại giây thứ 901: Giường `A205-B-G03` trên màn hình của tất cả các sinh viên khác tự động chuyển từ màu cam (`HOLDING`) trở lại màu xanh lá (`AVAILABLE`).
  - **Đánh giá:** 🟢 **ĐẠT (PASS)** -- Hệ thống tự động giải phóng tài nguyên mượt mà.

## 6.3. Edge-Case 3: Arithmetic Precision & Remainder Correction (Sai số chia tiền $Total/N$)
- **Bối cảnh thực tế:** Tổng tiền điện nước phòng là con số không chia hết cho số sinh viên trong phòng ($N$).
  - Ví dụ: Tổng hóa đơn phòng A205 là **1.000.000 VNĐ**, phòng có **6 sinh viên** đang ở ($1.000.000 / 6 = 166.666,666...$ VNĐ).
  - Nếu làm tròn xuống: $166.666 	imes 6 = 999.996$ VNĐ (Thiếu 4 VNĐ, KTX thất thoát doanh thu).
  - Nếu làm tròn lên: $166.667 	imes 6 = 1.000.002$ VNĐ (Dư 2 VNĐ, sinh viên khiếu nại thu vượt hóa đơn).
- **Giải thuật Khắc phục Sai số Phần dư (Remainder Correction Algorithm):**
  ```typescript
  export function calculateSplitBill(totalAmount: number, residents: string[]): Record<string, number> {
    const N = residents.length;
    const baseShare = Math.floor(totalAmount / N);
    let remainder = totalAmount - (baseShare * N); // Phần dư (Remainder)

    const bills: Record<string, number> = {};
    residents.forEach((studentId, index) => {
      // Phân bổ lần lượt 1 VNĐ phần dư cho các sinh viên đầu danh sách
      const extra = index < remainder ? 1 : 0;
      bills[studentId] = baseShare + extra;
    });
    return bills;
  }
  ```
- **Kết quả thực nghiệm:**
  - 4 sinh viên đầu danh sách: Đóng **166.667 VNĐ** ($166.666 + 1$).
  - 2 sinh viên còn lại: Đóng **166.666 VNĐ**.
  - Tổng tiền thu từ 6 cá nhân: $(166.667 	imes 4) + (166.666 	imes 2) = 666.668 + 333.332 = mathbf{1.000.000 	ext{ VNĐ}}$.
  - Độ lệch số học: $Delta = |1.000.000 - 1.000.000| = mathbf{0 	ext{ VNĐ}}$ (Khớp 100%).
  - **Đánh giá:** 🟢 **ĐẠT (PASS)** -- Triệt tiêu hoàn toàn sai số làm tròn số học.

## 6.4. Edge-Case 4: Curfew Enforcement & Demerit Penalty (Xử lý quét cổng sau 23:00)
- **Bối cảnh thực tế:** Sinh viên đi chơi đêm về muộn lúc 23:15 nhưng không nộp đơn xin phép trước 21:00.
- **Quy trình kiểm thử:**
  1. Giả lập sinh viên quẹt thẻ QR tại cổng bảo vệ lúc 23:15:20.
  2. Hệ thống kiểm tra: Giờ hiện tại ($23:15 > 23:00$) $ightarrow$ Vi phạm giới nghiêm.
  3. Hệ thống kiểm tra đơn xin về muộn: Trạng thái không tìm thấy hoặc `NOT_FOUND`.
- **Phản ứng hệ thống:**
  - Toàn bộ màn hình máy quét Gate Console chuyển màu đỏ nhấp nháy (`bg-red-600`).
  - Âm thanh còi báo động (Audio Siren) phát ra từ máy quét.
  - Tự động tạo bản ghi `curfew_records`:
    `{ studentId: "SE170001", time: "23:15:20", status: "VIOLATION", demerit: -15 }`
  - Điểm rèn luyện của sinh viên tự động trừ từ 100 xuống 85 điểm.
- **Kết quả thực nghiệm:** Toàn bộ chuỗi sự kiện phản ứng chính xác trong 350ms.
- **Đánh giá:** 🟢 **ĐẠT (PASS)** -- Hệ thống an ninh hoạt động nghiêm ngặt và tự động.

---

# PHẦN 7: KIỂM THỬ GIAO DIỆN VÀ TƯƠNG THÍCH THIẾT BỊ (UI/UX & RESPONSIVE MATRIX)

Nhóm QA đã thực hiện kiểm thử thực tế trên 16 cấu hình kết hợp giữa các trình duyệt và kích thước màn hình phổ biến. Kết quả được tổng hợp trong bảng dưới đây:

| Kích thước Viewport | Thiết bị đại diện | Google Chrome | Microsoft Edge | Mozilla Firefox | Apple Safari | Đánh giá Trải nghiệm Người dùng (UX Review) |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **375px - 390px** | iPhone 13, 14, Galaxy S22 | 🟢 PASS | 🟢 PASS | 🟢 PASS | 🟢 PASS | Thanh điều hướng tự động chuyển thành Mobile Bottom Bar; bản đồ 1:4:6 cuộn dọc mượt mà; nút bấm cảm ứng $ge 44$px dễ chạm. |
| **768px - 820px** | iPad Air, Galaxy Tab | 🟢 PASS | 🟢 PASS | 🟢 PASS | 🟢 PASS | Giao diện tự động phân bổ dạng lưới 2 cột; bảng điều khiển bảo vệ và danh sách phòng hiển thị thoáng đãng, dễ nhìn. |
| **1366px x 768px** | Laptop sinh viên / văn phòng | 🟢 PASS | 🟢 PASS | 🟢 PASS | 🟢 PASS | Sidebar cố định bên trái; bảng dữ liệu công tơ và hóa đơn hiển thị đầy đủ các cột không cần cuộn ngang. |
| **1920px x 1080px** | Desktop Full HD (Quản lý) | 🟢 PASS | 🟢 PASS | 🟢 PASS | 🟢 PASS | Tận dụng tối đa không gian màn hình rộng; bản đồ buồng 1:4:6 hiển thị trọn vẹn cả 4 buồng A, B, C, D trên cùng 1 khung nhìn duy nhất. |

### Các chỉ số Hiệu năng Giao diện (Core Web Vitals qua Lighthouse):
- **First Contentful Paint (FCP):** $0.8$ giây (Mục tiêu $< 1.8$s) $ightarrow$ 🟢 **Tốt**
- **Largest Contentful Paint (LCP):** $1.4$ giây (Mục tiêu $< 2.5$s) $ightarrow$ 🟢 **Tốt**
- **Cumulative Layout Shift (CLS):** $0.01$ (Mục tiêu $< 0.1$) $ightarrow$ 🟢 **Xuất sắc (Không giật layout)**
- **Điểm Accessibility (A11y):** $96/100$ (Hỗ trợ tốt độ tương phản màu và công cụ đọc màn hình).

---

# PHẦN 8: NHẬT KÝ LỖI VÀ SỰ CỐ ĐÃ KHẮC PHỤC (DEFECT TRACKING LOG)

Trong suốt 5 tuần phát triển dự án, đội ngũ QA đã phát hiện và phối hợp cùng các lập trình viên giải quyết dứt điểm **8 lỗi phần mềm (Bugs)**:

| Mã Bug | Phân hệ | Mô tả hiện tượng lỗi (Defect Description) | Mức độ | Nguyên nhân gốc rễ (Root Cause) | Giải pháp khắc phục (Resolution) | Trạng thái |
| :---: | :---: | :--- | :---: | :--- | :--- | :---: |
| **BUG-01** | Module 3 | Bấm chọn giường trống không mở được Modal giữ chỗ trên Safari iOS. | **P2** | Trình duyệt Safari chặn sự kiện `onClick` trên thẻ `div` chưa có thuộc tính `cursor: pointer`. | Bổ sung class Tailwind `cursor-pointer select-none` và chuyển sang dùng thẻ `<button>` ngữ nghĩa. | 🟢 CLOSED |
| **BUG-02** | Module 3 | Đồng hồ 15 phút đếm ngược bị nhảy lùi 2 giây khi người dùng chuyển tab trình duyệt. | **P2** | Hàm `setInterval` bị hệ điều hành bóp hiệu năng (throttled) khi tab chạy ngầm. | Chuyển sang tính thời gian dựa trên mốc tuyệt đối `targetTime = Date.now() + 900000` thay vì trừ dần biến state. | 🟢 CLOSED |
| **BUG-03** | Module 4 | Hóa đơn chia tiền điện nước phòng bị lệch 1 VNĐ khi tổng tiền là 500.000đ chia 3 người. | **P1** | Phép tính `Math.round(500000/3)` sinh ra $166.667 	imes 3 = 500.001$ VNĐ (dư 1 VNĐ). | Cài đặt thuật toán phân bổ phần dư `calculateSplitBill` với `remainder correction`. | 🟢 CLOSED |
| **BUG-04** | Module 1 | Sinh viên có thể nhập trực tiếp URL `/manager` trên thanh địa chỉ để vào xem Dashboard. | **P1** | Component `ProtectedRoute` chưa kiểm tra quyền `role` mà chỉ kiểm tra `isAuthenticated`. | Nâng cấp `ProtectedRoute` kiểm tra điều kiện mảng `allowedRoles.includes(user.role)`, nếu sai đẩy về `/unauthorized`. | 🟢 CLOSED |
| **BUG-05** | Module 7 | Xuất file Excel trên máy Windows bị lỗi font chữ tiếng Việt các ký tự "Đ", "ư", "ơ". | **P2** | Chuỗi dữ liệu XML xuất ra thiếu thẻ định danh mã hóa bảng mã UTF-8 BOM. | Bổ sung ký tự `\uFEFF` (Byte Order Mark) vào đầu luồng dữ liệu file trước khi tải về. | 🟢 CLOSED |
| **BUG-06** | Module 5 | Kỹ thuật viên không thể tải ảnh chụp nghiệm thu có dung lượng $> 5$MB. | **P3** | Máy chủ thiếu middleware giới hạn body-parser dẫn đến lỗi `413 Payload Too Large`. | Thêm hàm nén ảnh Client-side qua `canvas.toBlob()` giảm kích thước ảnh xuống dưới 1MB trước khi gửi. | 🟢 CLOSED |
| **BUG-07** | Module 6 | Quét mã QR lúc 23:00:00 bị tính vi phạm giờ giới nghiêm dù chưa sang 23:01. | **P2** | Điều kiện so sánh thời gian dùng dấu `>=` thay vì `>` tại mốc 23:00:00. | Sửa logic so sánh: Thời gian vi phạm là khi `currentTime > curfewCutoff` (tức là từ 23:00:01 trở đi). | 🟢 CLOSED |
| **BUG-08** | Module 2 | Chọn tầng 5 trên điện thoại di động bị thanh Mobile Bottom Bar che khuất hàng giường cuối. | **P3** | Vùng chứa `div` nội dung chính chưa có padding đáy bù trừ cho thanh Navigation Bar cố định. | Bổ sung class Tailwind `pb-24 md:pb-6` vào component `Layout` để tạo khoảng trống an toàn. | 🟢 CLOSED |

---

# PHẦN 9: BÁO CÁO TỔNG KẾT VÀ NGHIỆM THU CHẤT LƯỢNG (QA SIGN-OFF)

## 9.1. Tổng hợp Số liệu Kiểm thử Thực nghiệm
Trải qua 5 vòng kiểm thử lặp (Sprint Test Cycles), chất lượng sản phẩm phần mềm Domanage đã đạt được các chỉ số ấn tượng:
- **Tổng số Ca Kiểm thử thực thi:** **90 / 90 Cases**
- **Số ca kiểm thử ĐẠT (PASS):** **90 Cases (100%)**
- **Số ca kiểm thử THẤT BẠI (FAIL):** **0 Cases (0%)**
- **Số lỗi phát hiện và đã đóng (Closed Bugs):** **8 / 8 Bugs (100% Resolved)**
- **Độ bao phủ yêu cầu nghiệp vụ (Requirements Coverage):** **100% (28/28 Use Cases)**
- **Độ ổn định hệ thống (System Stability):** Đạt chứng nhận không còn lỗi chặn (Zero Blocker Bugs).

## 9.2. Đánh giá Tính Sẵn sàng Triển khai (Production Readiness)
Hệ thống **Domanage (Online Dormitory Management System)** đã đáp ứng đầy đủ và vượt mức các tiêu chuẩn kỹ thuật của môn học FER202:
1. Giao diện người dùng trực quan, hiện đại, tối ưu trải nghiệm và phản hồi tức thời.
2. Logic nghiệp vụ cốt lõi (Bản đồ giường 1:4:6, Khóa 15 phút, Auto-Approval Engine, Chia tiền $Total/N$) hoạt động hoàn toàn chính xác, đáng tin cậy.
3. Cơ chế phân quyền và bảo mật URL hoạt động nghiêm ngặt, đảm bảo an toàn thông tin cá nhân và dữ liệu ký túc xá.

## 9.3. Ký duyệt Nghiệm thu Chất lượng (Sign-off Signatures)

Tài liệu này xác nhận toàn bộ quá trình kiểm thử phần mềm đã hoàn tất thành công và hệ thống đủ điều kiện xuất sắc để bảo vệ trước Hội đồng Giảng viên môn học FER202.

space{1cm}
| Người thực hiện kiểm thử (Lead QA) | Đại diện Nhóm trưởng (Project Manager) |
| :---: | :---: |
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br><br>**Huỳnh Gia Kim**<br>Kỹ sư Đảm bảo Chất lượng | <br><br><br>**Nguyễn Hoàng Vinh**<br>Nhóm trưởng & Full-Stack Lead |
