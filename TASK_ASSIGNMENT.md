# DỰ ÁN: ONLINE DORMITORY MANAGEMENT SYSTEM (DMS)
## BẢN PHÂN CÔNG NHIỆM VỤ & KẾ HOẠCH TRIỂN KHAI NHÓM (WORK BREAKDOWN STRUCTURE)

> **Thông tin chung:**
> - **Môn học:** FER202 – Front-End Web Development with React
> - **Nhóm thực hiện:** FER202_Group4
> - **Dự án:** Hệ thống Quản lý Ký túc xá Trực tuyến (DMS)
> - **Tài liệu tham chiếu:** SRS Document (IEEE Std 830-1998)
> - **Thời gian thực hiện:** Tháng 10/2026

---

## I. TỔNG QUAN VAI TRÒ & PHÂN CÔNG CHI TIẾT 6 THÀNH VIÊN

| STT | Họ và Tên | Vai trò chính (Role) | Module phụ trách | Use Cases chính |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Nguyễn Hoàng Vinh** | Project Manager & Full-Stack Lead | Module 1 (Auth), Architecture, Repo Setup | `UC-01`, `UC-02`, `UC-03`, `UC-04` |
| **2** | **Trần Công Tiến** | Frontend Lead & UI/UX Designer | Module 2 & 3 (Interactive Bed Picker, 1:4:6 Map) | `UC-09`, `UC-10` |
| **3** | **Trần Thanh Nguyên** | Backend Engineer & Database Architect | Database Schema, Mock APIs, Auto-Approval | `UC-05`, `UC-06`, `UC-07`, `UC-08`, `UC-11`, `UC-12`, `UC-13` |
| **4** | **Văn Thái Trung** | Frontend Developer & Integration Specialist | Module 4 (Utility & Split Billing), Handover | `UC-14`, `UC-15`, `UC-16`, `UC-17`, `UC-18`, `UC-19` |
| **5** | **Đinh Thanh Trung** | Backend Developer & Security Analyst | Module 5 (Maintenance), Module 6 (Curfew), Module 7 (Dashboard) | `UC-20`, `UC-21`, `UC-22`, `UC-23`, `UC-24`, `UC-25`, `UC-26`, `UC-27`, `UC-28` |
| **6** | **Huỳnh Gia Kim** | Quality Assurance (QA) & Test Engineer | Test Cases, QA Testing, Slide & Demo Script | Toàn bộ 28 Use Cases & NFR |

---

## II. CHI TIẾT NHIỆM VỤ TỪNG THÀNH VIÊN (DELIVERABLES)

### 1. 👑 Nguyễn Hoàng Vinh — `Project Manager & Full-Stack Lead`
* **Mục tiêu:** Quản trị tiến độ, thiết lập cấu trúc nền tảng và luồng phân quyền đăng nhập.
* **Các Use Case phụ trách:**
  - `UC-01`: Trang chủ giới thiệu KTX, biểu phí dịch vụ, hình ảnh cơ sở vật chất và nội quy chung.
  - `UC-02`: Đăng nhập Google OAuth 2.0 phân luồng:
    - *Sinh viên:* Dùng tài khoản Gmail cá nhân đã đăng ký tuyển sinh.
    - *Cán bộ / Kỹ thuật:* Bắt buộc dùng email tên miền trường (`@fpt.edu.vn` / `@fe.edu.vn`).
  - `UC-03`: Quản lý phiên làm việc JWT, Refresh Token qua HttpOnly Cookie và Đăng xuất an toàn.
  - `UC-04`: Màn hình Hồ sơ cá nhân (My Profile), cập nhật thông tin liên hệ khẩn cấp cha mẹ, CCCD.
* **Công việc cụ thể (Tasks):**
  1. Khởi tạo Git Repository, cấu hình ESLint, Prettier, TypeScript, TailwindCSS.
  2. Xây dựng bộ khung định tuyến Router (`react-router-dom`) và `ProtectedRoute` theo 4 vai trò: `Student`, `Dorm Manager`, `Technician / Guard`, `Admin`.
  3. Xây dựng State Management toàn cục (`AuthContext` hoặc `Zustand store`).
  4. Quản lý tiến độ trên Trello/GitHub Project, duyệt Pull Request và xử lý xung đột mã nguồn (Merge Conflict).

---

### 2. 🎨 Trần Công Tiến — `Frontend Lead & UI/UX Designer`
* **Mục tiêu:** Xây dựng Design System đồng bộ và thực hiện **tính năng trọng tâm (Signature Feature)**: Bản đồ chọn giường trực quan theo mô hình 1:4:6.
* **Các Use Case phụ trách:**
  - `UC-09`: Giao diện trực quan chọn giường (`Tòa nhà ➔ Tầng ➔ Phòng ➔ Buồng (A, B, C, D) ➔ Giường (G01 - G06)`).
  - `UC-10`: Modal khóa giữ chỗ 15 phút (Đồng hồ đếm ngược) & hiển thị cổng thanh toán VietQR / VNPay.
* **Công việc cụ thể (Tasks):**
  1. Xây dựng thư viện giao diện dùng chung (ShadCN UI + Tailwind CSS): Button, Input, Modal, Badge, Toast Notification, Loading Skeletons.
  2. **Code màn hình Interactive Floor & Bed Visualizer:**
     - Hiển thị cấu trúc phòng chuẩn: 1 Phòng = 4 Buồng; 1 Buồng = 6 Giường (Tổng 24 giường/phòng).
     - Phối màu theo trạng thái:
       - 🟢 Xanh lá: `AVAILABLE` (Còn trống)
       - 🟠 Màu cam: `HOLDING` (Đang giữ chỗ 15 phút)
       - 🔘 Màu xám: `OCCUPIED` (Đã có sinh viên ở)
       - 🔴 Màu đỏ: `MAINTENANCE` (Đang bảo trì/khóa)
  3. Cài đặt Component `CountdownTimer` (900 giây) kèm thanh tiến trình. Khi đếm về 0, tự động gọi API giải phóng giường về trạng thái trống.
  4. Đảm bảo giao diện chuẩn Responsive (hiển thị mượt mà trên Mobile 375px và Desktop 1920px).

---

### 3. 💾 Trần Thanh Nguyên — `Backend Engineer & Database Architect`
* **Mục tiêu:** Thiết kế cơ sở dữ liệu chuẩn 3NF, chuẩn bị dữ liệu mẫu và code luồng Tự động xét duyệt (Auto-Approval) không cần duyệt tay.
* **Các Use Case phụ trách:**
  - `UC-05`: Quản lý danh mục Tòa nhà, Tầng lầu và loại tòa (Nam / Nữ).
  - `UC-06`: Quản lý cấu trúc Phòng - Buồng - Giường và mã giường chuẩn hóa `[Phòng]-[Buồng]-[Giường]` (Ví dụ: `A205-B1-G03`).
  - `UC-07`: Cấu hình bảng giá phòng, đơn giá điện nước và thuế VAT (8% hoặc 10%).
  - `UC-08`: Quản trị tài khoản, phân quyền RBAC và import danh sách sinh viên tuyển sinh.
  - `UC-11`: Xây dựng **Logic Engine Tự động xét duyệt (Auto-Approval Engine)**.
  - `UC-12`: Tạo và xuất file Hợp đồng điện tử `e-Contract (PDF)` có mã xác thực duy nhất.
  - `UC-13`: Dashboard giám sát công suất lấp đầy phòng và xử lý ngoại lệ đổi/hủy phòng.
* **Công việc cụ thể (Tasks):**
  1. Thiết kế Database Schema gồm 12 bảng thực thể theo Data Dictionary của SRS trên Supabase / PostgreSQL hoặc Json-Server.
  2. Viết Script Seed Data: Tạo ít nhất 1 Tòa A (5 tầng, mỗi tầng 4 phòng, mỗi phòng 24 giường) với đa dạng trạng thái để nhóm test giao diện.
  3. Cài đặt thuật toán Auto-Approval: Tự động kiểm tra 3 điều kiện:
     - Giới tính sinh viên khớp với Tòa/Phòng.
     - Sinh viên không nợ tiền kỳ trước, không bị đình chỉ.
     - Thanh toán cọc thành công 100%.
  4. Tích hợp thư viện `jspdf` / `@react-pdf/renderer` để tự động render file Hợp đồng PDF gửi cho sinh viên.

---

### 4. ⚡ Văn Thái Trung — `Frontend Developer & Integration Specialist`
* **Mục tiêu:** Phụ trách Module nghiệp vụ tính toán phức tạp nhất: **Quản lý công tơ, Thuật toán chia đều tiền điện nước phòng ($Total / N$)** và Quy trình Bàn giao nhận/trả phòng.
* **Các Use Case phụ trách:**
  - `UC-14`: Quy trình Check-in nhận phòng (Biên bản bàn giao thiết bị phòng chung/buồng cá nhân & ghi số công tơ ban đầu).
  - `UC-15`: Quy trình Check-out trả phòng (Nghiệm thu hư hại & quyết toán hoàn tiền cọc).
  - `UC-16`: Form Quản lý ghi số công tơ điện nước phòng định kỳ ngày 25-28 hàng tháng (kèm upload ảnh đồng hồ).
  - `UC-17`: Thuật toán tự động tính tiền phòng kèm VAT & chia đều cho số sinh viên trong phòng ($1/N$).
  - `UC-18`: Màn hình Xem & Thanh toán hóa đơn cá nhân bằng mã VietQR độc lập.
  - `UC-19`: Hệ thống gửi thông báo phát hành hóa đơn và nhắc nợ tự động trước ngày hết hạn.
* **Công việc cụ thể (Tasks):**
  1. Xây dựng Form nhập chỉ số công tơ phòng hàng tháng:
     - Nhập $\Delta E$ (kWh), $\Delta W$ ($m^3$) và upload ảnh công tơ.
     - Cài đặt Validation: Báo lỗi nếu chỉ số mới < cũ; cảnh báo nghi ngờ rò rỉ nếu tiêu thụ > 200% tháng trước.
  2. Cài đặt **Thuật toán Chia tiền Điện Nước phòng:**
     $$\text{Tiền cá nhân} = \frac{\text{Tiền điện có VAT} + \text{Tiền nước có VAT} + \text{Phí vệ sinh}}{N \text{ (số sinh viên đang ở)}}$$
     - Hỗ trợ tính theo tỷ lệ ngày ở (Pro-rata) nếu sinh viên chuyển vào giữa tháng.
  3. Thiết kế giao diện Hóa đơn cá nhân minh bạch: Hiển thị ảnh công tơ tổng, bảng giải trình công thức, số lượng bạn cùng phòng ($N$), và mã VietQR động với cú pháp `DMS [MãHĐ] [MSSV]`.
  4. Xây dựng Form Checklist điện tử cho thủ tục Check-in và Check-out.

---

### 5. 🛡️ Đinh Thanh Trung — `Backend Developer & Security Analyst`
* **Mục tiêu:** Phụ trách các nghiệp vụ vận hành thực tế: **Hệ thống báo hỏng thiết bị, Kiểm soát giờ giới nghiêm 23:00, Trừ điểm kỷ luật** và **Dashboard thống kê báo cáo**.
* **Các Use Case phụ trách:**
  - `UC-20, UC-21, UC-22, UC-23`: Hệ thống Ticket Báo hỏng thiết bị (Phòng chung vs Buồng cá nhân, điều phối kỹ thuật, chụp ảnh kết quả và đánh giá 1-5 sao).
  - `UC-24`: Đơn xin vắng mặt / về muộn ngoài giờ nộp trước 21:00.
  - `UC-25`: Giao diện Cổng bảo vệ quét thẻ đối chiếu đơn về muộn và ghi nhận vi phạm giờ giới nghiêm sau 23:00.
  - `UC-26`: Biên bản xử lý vi phạm nội quy & Trừ điểm rèn luyện KTX (> 30 điểm thì đình chỉ ở kỳ sau).
  - `UC-27`: Màn hình Overview Dashboard cho Ban Quản lý (Công suất phòng, biểu đồ doanh thu).
  - `UC-28`: Xuất báo cáo danh sách tạm trú và công nợ ra file Excel (`.xlsx`).
* **Công việc cụ thể (Tasks):**
  1. Xây dựng luồng Ticket Maintenance hoàn chỉnh từ tạo phiếu $\rightarrow$ tiếp nhận $\rightarrow$ hoàn thành $\rightarrow$ nghiệm thu.
  2. Xây dựng giao diện dành riêng cho Bảo vệ (Security Gate Console): Ô tra cứu nhanh MSSV / quét mã vạch, tự động gắn cờ vi phạm nếu quét sau 23:00 mà không có đơn đã duyệt.
  3. Xây dựng màn hình Dashboard quản trị với biểu đồ trực quan (Recharts):
     - Biểu đồ tròn tỷ lệ lấp đầy giường (Occupancy Rate).
     - Biểu đồ cột doanh thu tiền phòng và mức tiêu thụ điện nước trung bình.
  4. Tích hợp thư viện `xlsx` để xuất báo cáo danh sách sinh viên tạm trú và danh sách sinh viên quá hạn thanh toán.

---

### 6. 🧪 Huỳnh Gia Kim — `Quality Assurance (QA) & Test Engineer`
* **Mục tiêu:** Đảm bảo chất lượng phần mềm, phát hiện lỗi giao diện/nghiệp vụ, soạn kịch bản thuyết trình và slide bảo vệ đồ án.
* **Công việc cụ thể (Tasks):**
  1. **Xây dựng Bảng Test Cases chi tiết (Excel / Sheet):**
     - Viết đầy đủ Test Cases cho 28 Use Cases (Positive, Negative, Boundary).
     - Tập trung kiểm thử các kịch bản Edge-cases quan trọng:
       - *Case 1 (Concurrency):* Hai sinh viên cùng bấm giữ 1 giường tại cùng 1 giây $\rightarrow$ Hệ thống có khóa đúng 1 người không?
       - *Case 2 (Timeout Rollback):* Sau 15 phút không thanh toán $\rightarrow$ Giường có tự nhả về màu xanh lá (`AVAILABLE`) không?
       - *Case 3 (Rounding Discrepancy):* Tổng tiền chia cho các sinh viên có khớp 100% với hóa đơn phòng (lệch không quá 1 VNĐ) không?
       - *Case 4 (Curfew Violation):* Quét cổng sau 23:00 không có đơn $\rightarrow$ Hệ thống có tự động ghi nhận lỗi vi phạm không?
  2. **Kiểm thử Responsive & Đa trình duyệt:**
     - Kiểm thử giao diện trên Chrome, Edge, Safari và các kích thước màn hình: Mobile (375px), Tablet (768px), Desktop (1080p).
  3. **Soạn Kịch bản Demo (Demo Script) & Hướng dẫn sử dụng:**
     - Viết kịch bản phân vai để nhóm demo trơn tru trước hội đồng:
       - *Bước 1:* Sinh viên đăng nhập Gmail cá nhân $\rightarrow$ Chọn giường A205-B1-G03.
       - *Bước 2:* Giữ chỗ 15 phút $\rightarrow$ Quét VietQR $\rightarrow$ Tự động duyệt $\rightarrow$ Nhận e-Contract PDF.
       - *Bước 3:* Quản lý ghi số điện nước phòng $\rightarrow$ Hệ thống tự chia đều.
       - *Bước 4:* Sinh viên xem hóa đơn cá nhân và thanh toán.
       - *Bước 5:* Check-out kiểm kê và quyết toán hoàn cọc.
  4. Thiết kế Slide thuyết trình PowerPoint/Canva chuyên nghiệp bám sát màu sắc nhận diện thương hiệu của dự án.

---

## III. MA TRẬN TRÁCH NHIỆM RACI (RACI MATRIX)

> **Quy ước:**
> - **R (Responsible):** Người trực tiếp thực hiện công việc.
> - **A (Accountable):** Người chịu trách nhiệm cao nhất về kết quả (Team Lead).
> - **C (Consulted):** Người hỗ trợ, cung cấp thông tin hoặc tư vấn kỹ thuật.
> - **I (Informed):** Người được thông báo kết quả.

| Phân hệ / Nghiệp vụ | Nguyễn Hoàng Vinh | Trần Công Tiến | Trần Thanh Nguyên | Văn Thái Trung | Đinh Thanh Trung | Huỳnh Gia Kim |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Module 1: Authentication & Identity** | **R / A** | C | C | I | I | C |
| **Module 2: Inventory Topology (1:4:6)** | A | **R** | **R** | I | I | C |
| **Module 3: Visual Bed Booking & Auto-Approval** | A | **R** | **R** | I | I | C |
| **Module 4: Room Utility & Split Billing** | A | C | C | **R** | I | C |
| **Module 5: Maintenance Ticket System** | A | I | I | I | **R** | C |
| **Module 6: Curfew 23:00 & Discipline Records** | A | I | I | I | **R** | C |
| **Module 7: Dashboard Analytics & Reports** | A | C | I | I | **R** | C |
| **Quality Assurance, Test Cases & Slide Demo** | A | I | I | I | I | **R** |

---

## IV. LỘ TRÌNH TRIỂN KHAI 5 TUẦN (SPRINT ROADMAP)

```
Tuần 1: Setup & Nền tảng ──► Tuần 2: Core Đặt Giường ──► Tuần 3: Điện Nước & Bàn Giao ──► Tuần 4: Bảo Trì & An Ninh ──► Tuần 5: Test & Bảo Vệ
```

### 🔹 Tuần 1: Thiết lập Kiến trúc & Nền tảng (Foundation Week)
- [x] Chốt hoàn chỉnh tài liệu SRS, sơ đồ Context, Swimlane, State Diagram.
- [ ] **Vinh:** Setup Git Repo, cài đặt React + TypeScript + Tailwind, cấu hình Routing và Auth Context.
- [ ] **Tiến:** Xây dựng Design System, Header, Navbar, Sidebar và Layout mẫu cho từng Role.
- [ ] **Nguyên:** Tạo Database Schema 12 bảng, tạo dữ liệu mẫu (Seed Data) Tòa A.
- [ ] **Thái Trung, Thanh Trung, Kim:** Nghiên cứu kỹ Use Cases được phân công, chuẩn bị mockup giao diện.

### 🔹 Tuần 2: Luồng Đặt phòng Trọng tâm (Core Booking Workflow)
- [ ] **Tiến:** Hoàn thành Component Bản đồ phòng trực quan 1:4:6 (Chọn Tòa $\rightarrow$ Phòng $\rightarrow$ Buồng $\rightarrow$ Giường).
- [ ] **Tiến & Vinh:** Ráp Modal giữ chỗ 15 phút, đếm ngược và hiển thị mã QR thanh toán.
- [ ] **Nguyên:** Cài đặt logic Auto-Approval Engine và thư viện xuất Hợp đồng lưu trú PDF.
- [ ] **Kim:** Viết Test Cases cho Module 1, 2, 3 và test thử nghiệm luồng đặt chỗ.

### 🔹 Tuần 3: Điện Nước & Quy trình Bàn giao (Billing & Handover Workflow)
- [ ] **Thái Trung:** Code Form ghi số công tơ điện nước phòng ngày 25-28 hàng tháng (kèm upload ảnh).
- [ ] **Thái Trung:** Viết thuật toán tự động chia tiền phòng kèm VAT cho $N$ sinh viên ($Total / N$).
- [ ] **Thái Trung:** Code giao diện Hóa đơn cá nhân hiển thị mã VietQR động độc lập.
- [ ] **Thái Trung:** Xây dựng Form Checklist điện tử cho Check-in và Check-out.
- [ ] **Kim:** Kiểm thử logic tính tiền điện nước, kiểm tra làm tròn số và chia tiền pro-rata.

### 🔹 Tuần 4: Vận hành Cơ sở vật chất & Quản trị (Operations & Analytics)
- [x] **Thanh Trung:** Hoàn thành hệ thống Ticket báo hỏng thiết bị phòng và buồng cá nhân (UC-20, UC-21, UC-22, UC-23).
- [x] **Thanh Trung:** Code giao diện Bảo vệ trực cổng: quét thẻ đối chiếu đơn về muộn và ghi nhận vi phạm sau 23:00, hệ thống 100đ kỷ luật (UC-24, UC-25, UC-26).
- [x] **Thanh Trung:** Code trang Dashboard quản lý tỷ lệ lấp đầy phòng và tính năng xuất file Excel danh sách tạm trú & công nợ (UC-27, UC-28).
- [ ] **Vinh:** Rà soát toàn bộ kết nối API, tối ưu hóa hiệu năng tải trang.

### 🔹 Tuần 5: Kiểm thử Toàn diện & Chuẩn bị Báo cáo (Final Polish & Defense)
- [ ] **Kim:** Thực hiện kiểm thử toàn bộ 28 Use Cases, bắt lỗi giao diện Responsive và log lỗi vào Issue Tracker.
- [ ] **Cả nhóm:** Sửa toàn bộ bug tồn đọng, đóng băng mã nguồn (Code Freeze).
- [ ] **Kim & Vinh:** Hoàn thiện Slide thuyết trình PowerPoint/Canva và tập dượt Demo theo kịch bản.
- [ ] **Cả nhóm:** Báo cáo thử nghiệm nội bộ trước ngày bảo vệ chính thức.

---

## V. QUY ƯỚC LÀM VIỆC NHÓM (TEAM WORKING AGREEMENTS)

1. **Quy tắc Git & Nhánh (Branching Strategy):**
   - Nhánh `main`: Nhánh chạy ổn định, chỉ merge khi có sự đồng ý của Team Lead (Vinh).
   - Nhánh `develop`: Nhánh tích hợp chung của nhóm.
   - Nhánh tính năng: Đặt tên theo cú pháp:
     - `feature/auth-login`
     - `feature/bed-visualizer`
     - `feature/utility-split`
     - `feature/maintenance-tickets`
2. **Quy tắc Commit Message:**
   - `feat: thêm chức năng chọn giường trực quan`
   - `fix: sửa lỗi đếm ngược 15 phút không nhả giường`
   - `style: cập nhật giao diện modal thanh toán VietQR`
   - `docs: cập nhật tài liệu kiểm thử`
3. **Giao tiếp & Báo cáo hàng tuần:**
   - Họp nhanh (Standup) 15-20 phút vào đầu tuần để tổng kết việc đã làm và rà soát vướng mắc.
   - Mỗi thành viên chủ động báo cáo ngay nếu gặp khó khăn để các bạn khác hỗ trợ kịp thời.
