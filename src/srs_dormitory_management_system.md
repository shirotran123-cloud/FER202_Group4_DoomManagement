# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TRỰC TUYẾN (DORMITORY MANAGEMENT SYSTEM - DMS)

---

> **Thông tin tài liệu**  
> - **Tên dự án**: Dormitory Management System (DMS)  
> - **Phiên bản**: 1.2.0  
> - **Tiêu chuẩn tham chiếu**: IEEE Std 830-1998  
> - **Đối tượng áp dụng**: Sinh viên nội trú, Cán bộ quản lý KTX, Kỹ thuật/Bảo vệ, Quản trị viên hệ thống  

---

## MỤC LỤC
1. [Giới thiệu tổng quan (Introduction)](#1-giới-thiệu-tổng-quan-introduction)
2. [Mô tả tổng thể hệ thống (Overall Description)](#2-mô-tả-tổng-thể-hệ-thống-overall-description)
3. [Các tác nhân và ma trận phân quyền (Actors & RBAC)](#3-các-tác-nhân-và-ma-trận-phân-quyền-actors--rbac)
4. [Yêu cầu chức năng chi tiết (Functional Requirements)](#4-yêu-cầu-chức-năng-chi-tiết-functional-requirements)
   - Module 1: Xác thực & Phân quyền Tài khoản (Auth & Identity Management)
   - Module 2: Quản lý Cấu trúc Hạ tầng Phòng - Buồng - Giường (Dorm Inventory)
   - Module 3: Đăng ký, Xếp phòng, Check-in & Check-out (Booking, Contract & Handover)
   - Module 4: Quản lý Công tơ, Tính thuế VAT & Chia tiền Điện Nước theo Phòng (Utility & Split Billing)
   - Module 5: Yêu cầu Sửa chữa & Báo hỏng Cơ sở vật chất (Maintenance & Tickets)
   - Module 6: Quản lý An ninh, Ra vào ngoài giờ & Kỷ luật (Curfew & Security)
   - Module 7: Thống kê & Báo cáo Quản trị (Dashboard & Analytics)
5. [Yêu cầu phi chức năng (Non-Functional Requirements)](#5-yêu-cầu-phi-chức-năng-non-functional-requirements)
6. [Thiết kế Cơ sở Dữ liệu Mức Khái niệm (Database Entity Relationship)](#6-thiết-kế-cơ-sở-dữ-liệu-mức-khái-niệm-database-entity-relationship)
7. [Khuyến nghị Công nghệ & Triển khai Đồ án (Tech Stack Guidelines)](#7-khuyến-nghị-công-nghệ--triển-khai-đồ-án-tech-stack-guidelines)

---

## 1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)

### 1.1. Mục đích (Purpose)
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này quy định chi tiết các yêu cầu nghiệp vụ, luồng xử lý chức năng, ràng buộc kỹ thuật và cấu trúc dữ liệu cho hệ thống **Quản lý Ký túc xá Trực tuyến (DMS)**. Tài liệu là căn cứ pháp lý và kỹ thuật xuyên suốt cho các thành viên nhóm phát triển, phục vụ việc phân tích, thiết kế giao diện, lập trình Frontend - Backend, kiểm thử và nghiệm thu đồ án.

### 1.2. Phạm vi sản phẩm (Scope)
Hệ thống DMS giải quyết toàn bộ bài toán vận hành KTX trường đại học:
- **Phân định rõ ràng cơ chế đăng nhập**: Sinh viên sử dụng tài khoản **Gmail cá nhân** đã đăng ký trong hồ sơ tuyển sinh; Cán bộ/Nhân viên sử dụng tài khoản email công vụ do trường cấp (`@fpt.edu.vn` hoặc `@fe.edu.vn`).
- **Mô hình không gian KTX đặc thù**: Quản lý đa tầng theo cấu trúc: **Tòa $\rightarrow$ Tầng $\rightarrow$ Phòng (Room) $\rightarrow$ Buồng (Compartment) $\rightarrow$ Giường (Bed)**, trong đó mỗi phòng gồm 4 buồng, mỗi buồng gồm 6 giường (tổng 24 giường/phòng).
- **Quy trình Check-in / Check-out số hóa**: Biên bản bàn giao tài sản điện tử, kiểm kê hư hại, đối soát tiền cọc trực tiếp trên hệ thống.
- **Tính toán và chia tiền điện nước tự động (Smart Utility Split)**: Đo chỉ số công tơ điện nước tổng của phòng, tính thuế Giá trị gia tăng (VAT), và chia đều tự động cho tất cả thành viên đang sinh sống trong phòng đó theo từng kỳ hóa đơn.

### 1.3. Từ viết tắt & Thuật ngữ (Definitions & Acronyms)
| Thuật ngữ | Ý nghĩa |
| :--- | :--- |
| **DMS** | Dormitory Management System (Hệ thống Quản lý KTX) |
| **SRS** | Software Requirements Specification (Đặc tả yêu cầu phần mềm) |
| **RBAC** | Role-Based Access Control (Phân quyền truy cập dựa trên vai trò) |
| **Room (Phòng)** | Đơn vị phòng ở lớn (căn hộ/flat), có công tơ điện nước riêng và khu vệ sinh chung. |
| **Buồng (Compartment)** | Không gian phòng ngủ nhỏ phân chia bên trong 1 Phòng (1 Phòng = 4 Buồng). |
| **Giường (Bed)** | Đơn vị chỗ ở cá nhân tối thiểu của sinh viên (1 Buồng = 6 Giường). |
| **Check-in** | Quy trình tiếp nhận sinh viên, kiểm kê thiết bị và kích hoạt hợp đồng lưu trú. |
| **Check-out** | Quy trình trả phòng, nghiệm thu hư hại cơ sở vật chất, thanh toán công nợ và hoàn trả tiền cọc. |
| **VAT** | Value-Added Tax (Thuế giá trị gia tăng áp dụng trên tiền điện, nước). |
| **Utility Split** | Cơ chế chia đều tổng hóa đơn điện nước phòng cho số lượng sinh viên đang ở thực tế. |

---

## 2. MÔ TẢ TỔNG THỂ HỆ THỐNG (OVERALL DESCRIPTION)

### 2.1. Sơ đồ Ngữ cảnh Hệ thống (System Context)
```
       +--------------------------------------------------------------------------+
       |                           NGƯỜI DÙNG HỆ THỐNG                            |
       |  [Sinh viên (Gmail cá nhân)]   [Cán bộ Quản lý / NV (@fpt/@fe.edu.vn)]   |
       +--------------------------------------------------------------------------+
                                             |
                                  (HTTPS / RESTful API)
                                             v
       +--------------------------------------------------------------------------+
       |                         FRONTEND WEB APPLICATION                         |
       |          (React / Vite + Tailwind CSS + ShadCN UI + Pop Buttons)         |
       +--------------------------------------------------------------------------+
                                             |
                                      (JSON Payloads)
                                             v
       +--------------------------------------------------------------------------+
       |                          BACKEND API & MICROSERVICES                     |
       |  - Auth Service (OAuth2 Google / JWT)   - Inventory (Room/Buồng/Bed)     |
       |  - Check-in/Check-out Inspector         - Utility & VAT Calculator       |
       |  - Room Split Billing Engine            - Ticket & Discipline Tracking   |
       +--------------------------------------------------------------------------+
                         |                                        |
                         v                                        v
       +------------------------------------+   +---------------------------------+
       |          DATABASE STORAGE          |   |        EXTERNAL SERVICES        |
       |   (PostgreSQL / MySQL / MS SQL)    |   | - VietQR / VNPay Sandbox        |
       | - Users, Contracts, Handover Logs  |   | - Google OAuth2 Identity API    |
       | - Compartments, Beds, Meters, Bills|   | - Resend / Nodemailer (Alerts)  |
       +------------------------------------+   +---------------------------------+
```

### 2.2. Giả định & Ràng buộc Nghiệp vụ cốt lõi (Core Business Rules)
1. **Quy định Đăng nhập & Định danh (BR-01)**:
   - **Sinh viên**: Đăng nhập qua Google Login bằng **tài khoản Gmail cá nhân** mà sinh viên đã đăng ký chính thức với nhà trường trong hồ sơ nhập học.
   - **Nhân viên, Cán bộ quản lý, Kỹ thuật, Admin**: Đăng nhập bằng tài khoản email tổ chức do trường cấp với đuôi `@fpt.edu.vn` hoặc `@fe.edu.vn`. Hệ thống tự động từ chối nếu cán bộ dùng Gmail ngoài, hoặc sinh viên dùng tài khoản sai lệch hồ sơ.
2. **Quy định Cấu trúc Không gian (BR-02)**:
   - Một tòa nhà bao gồm nhiều tầng và nhiều phòng.
   - **1 Phòng (Room)** được thiết kế thành **4 Buồng (Compartments)** (Buồng A, Buồng B, Buồng C, Buồng D).
   - **1 Buồng** được bố trí **6 Giường (Beds)** (từ Giường 01 đến Giường 06).
   - Tổng công suất tối đa của một phòng là: $4 \text{ buồng} \times 6 \text{ giường} = 24 \text{ sinh viên}$.
3. **Quy định Đo đếm & Tính tiền Điện Nước (BR-03)**:
   - Mỗi **Phòng** được gắn 01 đồng hồ điện tổng và 01 đồng hồ nước tổng phục vụ chung cho cả 4 buồng.
   - Hóa đơn điện nước tính theo đơn giá định mức/lũy tiến, cộng thêm **thuế Giá trị Gia tăng (VAT)**.
   - Toàn bộ chi phí điện, nước và dịch vụ chung của phòng sẽ được **chia đều cho tất cả sinh viên đang thực tế lưu trú trong phòng đó** tại kỳ tính phí:
     $$\text{Số tiền mỗi sinh viên} = \frac{\text{Tổng tiền điện nước phòng (đã gồm VAT)}}{\text{Số lượng sinh viên đang ở thực tế trong phòng}}$$

---

## 3. CÁC TÁC NHÂN VÀ MA TRẬN PHÂN QUYỀN (ACTORS & RBAC)

### 3.1. Danh sách Tác nhân (Actors)
1. **Khách vãng lai (Guest)**: Xem thông tin giới thiệu KTX, cơ sở vật chất, biểu giá phòng và nội quy chung.
2. **Sinh viên nội trú (Student / Resident)**: Đăng nhập Gmail cá nhân; đăng ký phòng, thực hiện thủ tục Check-in/Check-out, nhận hóa đơn cá nhân được chia từ phòng, thanh toán trực tuyến, gửi ticket sửa chữa và xin phép ra vào ngoài giờ.
3. **Quản lý KTX (Dorm Manager / Staff)**: Đăng nhập bằng `@fpt.edu.vn` / `@fe.edu.vn`; giám sát tỷ lệ lấp đầy (hệ thống tự động duyệt đặt phòng theo điều kiện), điều hành quy trình Check-in / Check-out, nhập chỉ số công tơ, kích hoạt hóa đơn chia tự động, xử lý kỷ luật.
4. **Nhân viên Kỹ thuật & Bảo vệ (Technician / Guard)**: Đăng nhập bằng `@fpt.edu.vn` / `@fe.edu.vn`; tiếp nhận sửa chữa báo hỏng, tuần tra ký túc xá, điểm danh và ghi nhận sinh viên vi phạm giờ giới nghiêm.
5. **Quản trị viên (Admin)**: Toàn quyền cấu hình bảng giá, cấu trúc buồng/phòng, phân quyền tài khoản cán bộ và kết xuất báo cáo tài chính.

### 3.2. Ma trận Phân quyền Chức năng (RBAC Matrix)

| Nhóm nghiệp vụ chi tiết | Guest | Student (Gmail) | Manager (@fpt/@fe) | Tech/Guard (@fpt/@fe) | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Xem danh mục tòa, phòng, giường trống | x | x | x | x | x |
| Chọn giường cụ thể & Đặt phòng (Auto-duyệt) | - | Thực hiện (Auto duyệt) | Giám sát/Hỗ trợ | - | Giám sát |
| Thực hiện thủ tục Check-in (Nhận phòng & Tài sản) | - | Ký xác nhận | Lập biên bản/Bàn giao | - | Giám sát |
| Thực hiện thủ tục Check-out (Trả phòng & Quyết toán) | - | Gửi yêu cầu | Nghiệm thu/Trừ cọc | - | Giám sát |
| Ghi chỉ số công tơ điện nước tổng phòng | - | - | x | x (Hỗ trợ) | x |
| Tính tiền VAT & Chia đều hóa đơn phòng | - | - | Kích hoạt | - | Cấu hình giá |
| Xem & Thanh toán hóa đơn cá nhân qua QR | - | x | Kiểm tra | - | Báo cáo tài chính |
| Gửi phiếu báo hỏng thiết bị buồng/phòng | - | x | Điều phối | Tiếp nhận/Sửa chữa | Toàn quyền |
| Ghi nhận ra vào ngoài giờ (sau 23:00) & Vi phạm | - | Nộp đơn xin phép | Phê duyệt/Kỷ luật | Ghi nhận tại cổng | Toàn quyền |
| Quản lý tài khoản, cấu hình phòng, buồng, giường | - | - | - | - | Toàn quyền |

---

## 4. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 📦 MODULE 1: XÁC THỰC & PHÂN QUYỀN TÀI KHOẢN (AUTH & IDENTITY)

- **FR-1.1 Đăng nhập Sinh viên bằng Gmail cá nhân**:
  - Sinh viên chỉ được phép sử dụng **tài khoản Google cá nhân (Gmail)** đã đăng ký chính thức với nhà trường lúc nhập học.
  - Khi sinh viên đăng nhập qua Google OAuth, hệ thống kiểm tra đối chiếu địa chỉ Gmail đó với cơ sở dữ liệu hồ sơ sinh viên đã được trường import trước:
    - Nếu Gmail khớp: Cho phép đăng nhập thành công và liên kết tự động tới MSSV, Họ tên, Khóa học.
    - Nếu Gmail không có trong danh sách hồ sơ: Chặn đăng nhập và thông báo: *"Email chưa được liên kết với hồ sơ sinh viên. Vui lòng liên hệ Phòng CTSV"*.
- **FR-1.2 Đăng nhập Cán bộ & Quản lý bằng Email nhà trường**:
  - Cán bộ quản lý, bảo vệ, thợ kỹ thuật và admin bắt buộc đăng nhập bằng tài khoản email có đuôi **`@fpt.edu.vn`** hoặc **`@fe.edu.vn`**.
  - Hệ thống kiểm tra tên miền (domain validation). Mọi tài khoản có đuôi thông thường khác như `@gmail.com`, `@yahoo.com` đều bị từ chối truy cập vào cổng quản lý.
- **FR-1.3 Quản lý phiên làm việc & Đăng xuất (Session & JWT)**:
  - Cấp phát JWT Access Token (hiệu lực 30 phút) và Refresh Token được lưu trong HttpOnly Secure Cookie.
  - Hỗ trợ đăng xuất an toàn trên thiết bị hiện tại hoặc hủy toàn bộ phiên làm việc trên các thiết bị khác.
- **FR-1.4 Quản lý Thông tin Cá nhân (Student Profile)**:
  - Sinh viên xem và cập nhật: Số điện thoại cá nhân, số CCCD/CMND, ảnh chân dung, địa chỉ quê quán, thông tin liên lạc khẩn cấp của phụ huynh (Họ tên, SĐT, quan hệ).
  - Không cho phép sinh viên tự ý sửa đổi MSSV, Họ tên và Gmail cá nhân đã định danh (chỉ Admin mới có quyền điều chỉnh).

---

### 🏢 MODULE 2: QUẢN LÝ CẤU TRÚC PHÒNG - BUỒNG - GIƯỜNG (DORM INVENTORY)

- **FR-2.1 Quản lý Tòa nhà & Tầng (Block & Floor)**:
  - Khai báo danh mục tòa (Ví dụ: Dom A, Dom B, Dom C) kèm loại hình quy định (Tòa Nam, Tòa Nữ, Tòa Quốc tế).
  - Khai báo số tầng trong mỗi tòa và danh sách lối thoát hiểm, camera an ninh.
- **FR-2.2 Quản lý Cấu trúc Phòng (Room Management)**:
  - Mỗi phòng mang một mã định danh duy nhất (Ví dụ: `P.205-DomA`).
  - **Quy tắc cấu trúc**: **1 Phòng = 4 Buồng** (Ký hiệu: Buồng 1, Buồng 2, Buồng 3, Buồng 4 hoặc Buồng A, B, C, D).
  - Mỗi phòng có khu vực sinh hoạt chung (khu vệ sinh khép kín, ban công phơi đồ, cửa ra vào chính).
  - **Quản lý thiết bị chung của phòng**: 01 công tơ điện tổng, 01 đồng hồ nước tổng, bình nóng lạnh chung, gương, bồn rửa mặt.
  - Trạng thái phòng: `Đang sử dụng`, `Đã đầy`, `Còn chỗ`, `Tạm ngưng / Bảo trì`.
- **FR-2.3 Quản lý Cấu trúc Buồng & Giường (Compartment & Bed Management)**:
  - **Quy tắc cấu trúc**: **1 Buồng = 6 Giường** (Ký hiệu: Giường G01 $\rightarrow$ Giường G06).
  - Tổng số giường trong một phòng là: $4 \text{ buồng} \times 6 \text{ giường} = 24 \text{ giường}$.
  - Mỗi buồng có trang bị: Hệ thống đèn chiếu sáng buồng, quạt/điều hòa nhiệt độ riêng cho buồng đó, 6 hộc tủ đựng đồ cá nhân có khóa.
  - Mã giường chuẩn hóa theo phân cấp: `[Mã Phòng]-[Mã Buồng]-[Số Giường]` (Ví dụ: `A205-B1-G03`: Tòa A, Phòng 205, Buồng 1, Giường số 03).
  - Trạng thái giường: `Còn trống`, `Đang khóa tạm thời (Holding)`, `Đã đặt thành công`, `Đang có sinh viên ở`, `Đang hỏng/Khóa`.

---

### 📝 MODULE 3: ĐĂNG KÝ, TỰ ĐỘNG XÉT DUYỆT, CHECK-IN & CHECK-OUT (BOOKING & HANDOVER)

- **FR-3.1 Bắt buộc Chọn đích danh Phòng - Buồng - Giường (Visual Bed Selection)**:
  - Sinh viên xem sơ đồ phân cấp trực quan theo thời gian thực: Chọn Tòa $\rightarrow$ Xem danh sách Phòng $\rightarrow$ Chọn Buồng (1-4) $\rightarrow$ Xem 6 giường trong buồng.
  - **Quy định bắt buộc**: Sinh viên phải chọn chính xác một vị trí giường cụ thể (Ví dụ: Giường 02 - Buồng 3 - Phòng 205) để đặt chỗ. Không hỗ trợ đăng ký chung chung rồi chờ ban quản lý xếp phòng thủ công.
  - Hiển thị trực quan trạng thái: Màu xanh lá (`Còn trống`), Màu xám (`Đã có người`), Màu cam (`Đang có người giữ chỗ`), Màu đỏ (`Đang bảo trì`).
  - *Lưu ý*: Loại bỏ hoàn toàn thủ tục tải lên minh chứng diện ưu tiên (không cần giấy tờ ưu tiên). Quá trình đăng ký áp dụng theo cơ chế giữ chỗ trực tuyến công bằng (First-Come, First-Served).
- **FR-3.2 Khóa giữ chỗ Tạm thời & Thanh toán Trực tuyến (Temporary Bed Holding)**:
  - Khi sinh viên chọn giường còn trống và bấm `Xác nhận giữ chỗ`, hệ thống tự động khóa giữ chỗ tạm thời (Hold lock) giường đó trong vòng **15 phút**.
  - Trong thời gian 15 phút, các sinh viên khác không thể chọn giường này.
  - Sinh viên tiến hành thanh toán tiền cọc / tiền phòng qua mã VietQR hoặc cổng VNPay hiển thị trên màn hình.
  - Nếu sau 15 phút sinh viên không hoàn tất thanh toán: Hệ thống tự động hủy đơn giữ chỗ, giải phóng giường về trạng thái `Còn trống`.
- **FR-3.3 Cơ chế Tự động Xét duyệt Đặt phòng (Automated Approval Engine)**:
  - **Hệ thống tự động phê duyệt ngay lập tức (Auto-Approve)** khi thỏa mãn đầy đủ các điều kiện:
    1. Giới tính của sinh viên khớp đúng với quy định của Tòa/Phòng (Sinh viên Nam chỉ được chọn Tòa/Phòng Nam; Sinh viên Nữ chỉ được chọn Tòa/Phòng Nữ).
    2. Tài khoản sinh viên hợp lệ: Đang có trạng thái học tập tích cực, không có công nợ KTX kỳ trước, không bị kỷ luật đình chỉ nội trú.
    3. Cổng thanh toán phản hồi giao dịch thanh toán tiền cọc/tiền phòng thành công.
  - **Xử lý sau khi Tự động Phê duyệt**:
    - Ngay khi nhận IPN webhook thanh toán thành công, hệ thống tự động chuyển đơn sang trạng thái `Đã phê duyệt thành công (Auto-Approved)`.
    - Chuyển trạng thái giường sang `Đã đặt chỗ / Chờ check-in`.
    - **Không cần Ban quản lý KTX phải ngồi bấm duyệt thủ công từng đơn**, giúp tiết kiệm 100% công sức xét duyệt hành chính vào đầu kỳ cao điểm. Quản lý chỉ theo dõi danh sách, số liệu thống kê và hỗ trợ khi có phát sinh đổi/hủy phòng.
- **FR-3.4 Hợp đồng Lưu trú Điện tử (Electronic Contract)**:
  - Hệ thống tự động sinh hợp đồng điện tử có đầy đủ mã số hợp đồng duy nhất, họ tên, MSSV, mã giường (`[Phòng]-[Buồng]-[Giường]`), thời hạn thuê, giá thuê và số tiền cọc đã đóng.
  - Tự động gửi thông báo xác nhận và file hợp đồng PDF về tài khoản/email của sinh viên.
- **FR-3.5 Quy trình Check-in Nhận phòng (Check-in Workflow)**:
  ```
  [Sinh viên đến KTX] 
          |
          v
  [Cán bộ mở hồ sơ trên DMS] ---> Đối chiếu CCCD & Ảnh thẻ sinh viên
          |
          v
  [Kiểm kê tài sản điện tử (Checklist Handover)]
    - Kiểm tra thiết bị phòng chung (Cửa chính, bình nóng lạnh, bóng đèn)
    - Kiểm tra thiết bị buồng & giường (Nệm, hộc tủ cá nhân, ổ cắm, quạt)
    - Ghi nhận chỉ số công tơ điện nước ban đầu của phòng
          |
          v
  [Ký biên bản giao nhận] ---> Sinh viên bấm [Xác nhận nhận phòng] trên điện thoại
          |
          v
  [Bàn giao chìa khóa/Thẻ từ] ---> Kích hoạt Hợp đồng sang trạng thái [Đang lưu trú]
  ```
  - Cán bộ và sinh viên cùng kiểm tra tình trạng vật chất. Nếu có trầy xước/hư hỏng sẵn, cán bộ chụp ảnh tải trực tiếp lên biên bản check-in để làm bằng chứng tránh tranh chấp sau này.
- **FR-3.6 Quy trình Check-out Trả phòng (Check-out Workflow)**:
  ```
  [Sinh viên nộp đơn trả phòng / Kết thúc kỳ học]
          |
          v
  [Hẹn lịch kiểm tra phòng (Room Inspection)]
          |
          v
  [Cán bộ đối chiếu tài sản theo Biên bản Check-in]
    - Kiểm tra hư hại giường, khóa tủ, trang thiết bị buồng & phòng
    - Ghi nhận chỉ số điện/nước cuối kỳ của phòng
          |
          v
  [Tính toán Quyết toán Tài chính (Settlement)]
    - Khấu trừ tiền điện nước sinh viên còn nợ đến ngày rời đi
    - Khấu trừ chi phí đền bù hư hỏng tài sản cá nhân/phòng (nếu có)
    - Hoàn trả số dư tiền cọc vào tài khoản ngân hàng của sinh viên
          |
          v
  [Thu hồi chìa khóa/Thẻ từ] ---> Cập nhật giường sang [Còn trống], Hợp đồng [Đã kết thúc]
  ```

---

### 💡 MODULE 4: QUẢN LÝ CÔNG TƠ, TÍNH VAT & CHIA TIỀN ĐIỆN NƯỚC THEO PHÒNG (UTILITY & SPLIT BILLING)

> [!IMPORTANT]
> **Nguyên tắc cốt lõi**: Đồng hồ đo điện và nước được lắp đặt theo **Phòng** (đo lường tổng 4 buồng). Hóa đơn phòng sau khi cộng thuế VAT sẽ được **tự động chia đều cho các cá nhân sinh viên đang cư trú thực tế tại phòng đó**.

- **FR-4.1 Ghi nhận Chỉ số Công tơ Phòng hàng tháng**:
  - Định kỳ ngày 25-28 hàng tháng, nhân viên quản lý KTX ghi số điện và số nước của từng **Phòng**.
  - Hỗ trợ nhập trực tiếp trên Mobile Web hoặc tải lên bằng file Excel theo mẫu chuẩn.
  - Bắt buộc chụp ảnh đồng hồ công tơ đính kèm vào hệ thống làm minh chứng minh bạch cho sinh viên kiểm tra chéo.
  - Thuật toán cảnh báo: Tự động báo lỗi nếu $\text{Chỉ số mới} < \text{Chỉ số cũ}$, hoặc mức tiêu thụ tăng vọt bất thường vượt quá $200\%$ so với tháng trước (cảnh báo nghi ngờ rò rỉ nước hoặc chập điện).
- **FR-4.2 Tính toán Tổng chi phí Tiền Điện & Nước Phòng (kèm thuế VAT)**:
  - **Điện năng tiêu thụ**:
    $$\Delta E = E_{\text{mới}} - E_{\text{cũ}} \quad (\text{kWh})$$
    $$\text{Tiền điện trước thuế} = \Delta E \times \text{Đơn giá điện}$$
    $$\text{Tiền điện có thuế} = \text{Tiền điện trước thuế} \times (1 + \text{VAT}_{\text{điện}})$$
    *(Trong đó thuế suất VAT điện áp dụng theo quy định hiện hành, ví dụ: 8% hoặc 10%)*
  - **Nước sinh hoạt tiêu thụ**:
    $$\Delta W = W_{\text{mới}} - W_{\text{cũ}} \quad (\text{m}^3)$$
    $$\text{Tiền nước trước thuế} = \Delta W \times \text{Đơn giá nước}$$
    $$\text{Tiền nước có thuế} = \text{Tiền nước trước thuế} \times (1 + \text{VAT}_{\text{nước}})$$
  - **Tổng chi phí dịch vụ phòng tháng $M$**:
    $$\text{Tổng tiền phòng} = \text{Tiền điện có thuế} + \text{Tiền nước có thuế} + \text{Phí vệ sinh/rác thải phòng}$$
- **FR-4.3 Thuật toán Tự động Chia đều Tiền Điện Nước cho Cá nhân (Split Billing Engine)**:
  - Hệ thống tự động truy vấn danh sách hợp đồng **đang lưu trú (Active Residents)** trong phòng đó tại tháng tính phí.
  - Giả sử tại phòng $R$, tổng số sinh viên đang ở thực tế là $N$ ($1 \le N \le 24$).
  - Số tiền chia đều cho từng sinh viên:
    $$\text{Tiền điện nước cá nhân} = \frac{\text{Tổng tiền điện nước phòng (đã gồm VAT)}}{N}$$
  - Trường hợp sinh viên check-in giữa kỳ hoặc check-out sớm: Hệ thống cung cấp cơ chế tính tiền theo tỷ lệ ngày ở thực tế ($\text{Pro-rata} = \text{Tiền ngày} \times \text{Số ngày lưu trú}$).
- **FR-4.4 Sinh Hóa đơn Cá nhân & Thanh toán Độc lập (Individual Invoices)**:
  - Hệ thống tự động tạo ra $N$ hóa đơn riêng biệt gửi vào tài khoản cá nhân của từng sinh viên trong phòng.
  - Hóa đơn cá nhân hiển thị công khai:
    - Ảnh chụp công tơ điện nước tổng của phòng.
    - Bảng diễn giải: Chỉ số cũ, chỉ số mới, tổng tiền phòng, thuế VAT, số thành viên trong phòng ($N$), và số tiền chia cho cá nhân.
    - Mã VietQR động kèm chính xác số tiền và cú pháp chuyển khoản: `DMS [MãHóaĐơn] [MSSV]`.
  - Sinh viên tự thanh toán hóa đơn của chính mình, không cần cử trưởng phòng thu hộ, loại bỏ hoàn toàn rủi ro thiếu nợ hoặc đùn đẩy trách nhiệm giữa các buồng.
- **FR-4.5 Kiểm soát Công nợ & Thông báo tự động**:
  - Gửi email thông báo tự động và đẩy thông báo (In-app notification) khi có hóa đơn mới.
  - Nhắc nợ tự động trước ngày hết hạn 3 ngày, 1 ngày. Quá hạn tự động tính phí phạt trả chậm theo quy định của nhà trường.

---

### 🛠️ MODULE 5: YÊU CẦU SỬA CHỮA & BÁO HỎNG (MAINTENANCE TICKETS)

- **FR-5.1 Phân cấp Báo hỏng (Thiết bị Phòng vs Thiết bị Buồng)**:
  - Sinh viên gửi phiếu báo hỏng thiết bị, chỉ rõ vị trí:
    - **Khu vực Phòng chung**: Hỏng vòi sen nhà vệ sinh, hỏng bình nóng lạnh, bóng đèn ban công, hỏng khóa cửa chính.
    - **Khu vực Buồng cá nhân**: Hỏng quạt buồng, hỏng điều hòa buồng 2, chập ổ cắm giường 4.
  - Sinh viên chụp ảnh minh chứng hiện trường và chọn mức độ khẩn cấp (`Bình thường` hoặc `Khẩn cấp - Nguy cơ rò điện/ngập nước`).
- **FR-5.2 Điều phối & Nghiệm thu Kỹ thuật**:
  - Quản lý tiếp nhận và bàn giao cho nhân viên kỹ thuật tòa nhà.
  - Kỹ thuật viên sau khi sửa xong cập nhật ảnh chụp kết quả và ghi nhận vật tư đã thay thế.
  - Sinh viên tạo ticket xác nhận nghiệm thu và đánh giá mức độ hài lòng (1 đến 5 sao).

---

### 🚨 MODULE 6: QUẢN LÝ AN NINH, RA VÀO NGOÀI GIỜ & KỶ LUẬT (SECURITY & CURFEW)

- **FR-6.1 Quản lý Ra Vào Ngoài Giờ (Curfew Tracking - Giờ giới nghiêm 23:00)**:
  - Sinh viên có nhu cầu về muộn hoặc đi thực tập/về quê qua đêm nộp "Đơn xin phép vắng mặt / về muộn" trực tuyến trên hệ thống trước 21:00 kèm lý do chính đáng.
  - Tại cổng bảo vệ: Bảo vệ quét mã thẻ sinh viên hoặc tìm theo MSSV để đối chiếu:
    - Nếu có đơn đã duyệt: Ghi nhận thời gian vào an toàn.
    - Nếu không có đơn: Hệ thống tự động ghi nhận lỗi "Vi phạm giờ giới nghiêm", tích lũy số lần vi phạm.
- **FR-6.2 Quản lý Kỷ luật & Trừ điểm Rèn luyện KTX**:
  - Cán bộ quản lý lập biên bản vi phạm trực tuyến: Tụ tập ồn ào ảnh hưởng buồng khác, nấu ăn sai quy định, hút thuốc trong phòng, mang người lạ vào buồng.
  - Tự động trừ điểm kỷ luật nội trú. Khi vượt ngưỡng (ví dụ bị trừ quá 30 điểm), hệ thống tự động xuất thông báo cảnh cáo và đưa vào danh sách không xét duyệt KTX kỳ sau.

---

### 📊 MODULE 7: BÁO CÁO & THỐNG KÊ QUẢN TRỊ (DASHBOARD & ANALYTICS)

- **FR-7.1 Dashboard Trực quan Tổng quan**:
  - Thống kê tỷ lệ lấp đầy theo phân cấp: Số giường trống / tổng giường; Số buồng trống; Số phòng trống.
  - Thống kê doanh thu tiền phòng, tiền điện nước và tiền dịch vụ theo tháng/quý.
  - Biểu đồ theo dõi mức tiêu thụ điện nước trung bình giữa các tòa để phát hiện bất thường tiêu hao năng lượng.
- **FR-7.2 Kết xuất Báo cáo Nghiệp vụ**:
  - Xuất file Excel danh sách sinh viên nội trú phục vụ khai báo tạm trú tạm vắng với Công an địa phương.
  - Xuất danh sách công nợ sinh viên quá hạn chưa nộp tiền điện nước để gửi thông báo đôn đốc.

---

## 5. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 5.1. Hiệu năng & Khả năng Chịu tải (Performance & Scalability)
- **Tốc độ phản hồi API**: Thời gian xử lý trung bình $< 300\text{ms}$ cho các tác vụ tra cứu, $< 1\text{s}$ cho tác vụ chạy thuật toán chia hóa đơn điện nước toàn bộ các phòng trong tòa.
- **Tải cao điểm (Concurrency)**: Hệ thống chịu tải đồng thời tối thiểu $1,000$ sinh viên truy cập chọn giường trong vòng 10 phút đầu tiên khi mở đợt đăng ký phòng mà không bị nghẽn (sử dụng cơ chế Pessimistic Locking hoặc Redis Lock để chống xung đột chọn trùng 1 giường).

### 5.2. An toàn & Bảo mật (Security)
- **Kiểm soát Tên miền Đăng nhập chặt chẽ**:
  - Cán bộ/Nhân viên: Khóa cứng chỉ chấp nhận email có đuôi `@fpt.edu.vn` hoặc `@fe.edu.vn`.
  - Sinh viên: Đối chiếu chính xác địa chỉ Gmail cá nhân từ cổng Google OAuth với bảng danh sách sinh viên hợp lệ.
- **Bảo mật dữ liệu cá nhân**: Mã hóa số CCCD, số điện thoại phụ huynh; chống lỗ hổng bảo mật Web theo OWASP Top 10 (SQL Injection, XSS, CSRF, IDOR).

### 5.3. Độ tin cậy & Tính Toàn vẹn Dữ liệu (Reliability & Data Integrity)
- **Toàn vẹn số liệu tài chính**: Toàn bộ thao tác chia hóa đơn điện nước và cập nhật thanh toán phải nằm trong các Transaction cơ sở dữ liệu (`ACID Transactions`), đảm bảo không bị sai lệch số dư dù có sự cố mất kết nối mạng giữa chừng.
- **Sao lưu tự động (Backup)**: Tự động sao lưu Database hàng ngày vào lúc 02:00 sáng, lưu trữ tối thiểu 30 ngày gần nhất.

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU MỨC KHÁI NIỆM (DATABASE ENTITY RELATIONSHIP)

Cấu trúc các bảng dữ liệu mô hình hóa chính xác mối quan hệ **Phòng (1:4) Buồng (1:6) Giường**, quy trình Check-in/Check-out và Hóa đơn điện nước chia theo phòng:

```
+------------------------------------------------------------------------------------+
|                                    USERS TABLE                                     |
| id | email (Gmail/FPT) | full_name | mssv | cccd | phone | role | is_active        |
+------------------------------------------------------------------------------------+
       |                                      |
       | (1:N)                                | (1:N)
       v                                      v
+-----------------------------+       +----------------------------------------------+
|     HANDOVER_RECORDS        |       |                  CONTRACTS                   |
| id                          |       | id                                           |
| contract_id (FK)            |       | student_id (FK Users)                        |
| type [CHECK_IN | CHECK_OUT] |<------+ bed_id (FK Beds)                             |
| staff_id (FK Users)         |       | start_date | end_date | deposit | status     |
| initial_electric_meter      |       +----------------------------------------------+
| final_electric_meter        |                         |
| asset_checklist (JSON)      |                         | (N:1)
| damage_fee | notes          |                         v
| confirmed_by_student (bool) |       +----------------------------------------------+
+-----------------------------+       |                     BEDS                     |
                                      | id | compartment_id (FK) | bed_code | status |
                                      +----------------------------------------------+
                                                        |
                                                        | (6:1) Mỗi Buồng có 6 Giường
                                                        v
                                      +----------------------------------------------+
                                      |                 COMPARTMENTS                 |
                                      | id | room_id (FK) | compartment_code (A/B/C/D)|
                                      +----------------------------------------------+
                                                        |
                                                        | (4:1) Mỗi Phòng có 4 Buồng
                                                        v
+-----------------------------+       +----------------------------------------------+
|     ROOM_UTILITY_METERS     |       |                    ROOMS                     |
| id                          |       | id | block_id (FK) | room_code (e.g. A205)   |
| room_id (FK Rooms)          |<------+ max_capacity (24) | status                   |
| month | year                |       +----------------------------------------------+
| old_electric | new_electric |                         |
| old_water    | new_water    |                         | (N:1)
| electric_rate | water_rate  |                         v
| vat_rate_percent            |       +----------------------------------------------+
| total_room_amount_with_vat  |       |                    BLOCKS                    |
| active_student_count (N)    |       | id | block_name | gender_type | total_floors |
| meter_image_url             |       +----------------------------------------------+
+-----------------------------+
       |
       | (1:N) Chia đều cho N sinh viên trong phòng
       v
+------------------------------------------------------------------------------------+
|                             INDIVIDUAL_INVOICES                                    |
| id | room_utility_meter_id (FK) | student_id (FK) | split_amount | payment_status   |
| qr_payment_code | paid_at | payment_method [VIETQR | VNPAY] | overdue_penalty_fee  |
+------------------------------------------------------------------------------------+
```

### Chi tiết các Bảng Nghiệp vụ Mới & Quan Trọng:
1. **`COMPARTMENTS` (Buồng)**: Khóa ngoại trỏ về `ROOMS`. Một phòng liên kết chính xác 4 buồng.
2. **`BEDS` (Giường)**: Khóa ngoại trỏ về `COMPARTMENTS`. Một buồng liên kết chính xác 6 giường (Tổng 24 giường/phòng).
3. **`ROOM_UTILITY_METERS` (Công tơ & Hóa đơn tổng phòng)**: Lưu số công tơ điện nước đầu/cuối kỳ của phòng, đơn giá, phần trăm thuế VAT, tổng tiền sau thuế của cả phòng, và số lượng sinh viên thực tế đang ở tại thời điểm tính tiền ($N$).
4. **`INDIVIDUAL_INVOICES` (Hóa đơn cá nhân)**: Lưu khoản tiền điện nước của từng sinh viên sau khi lấy tổng tiền chia đều cho $N$. Mỗi hóa đơn có mã QR thanh toán riêng biệt.
5. **`HANDOVER_RECORDS` (Biên bản Check-in / Check-out)**: Lưu trữ checklist bàn giao tài sản, hình ảnh hiện trạng, chỉ số điện nước lúc nhận/trả phòng, chi phí hư tổn đền bù và xác nhận số của sinh viên.

---

## 7. KHUYẾN NGHỊ CÔNG NGHỆ & TRIỂN KHAI ĐỒ ÁN (TECH STACK GUIDELINES)

| Thành phần | Lựa chọn Đề xuất | Mô tả & Lý do |
| :--- | :--- | :--- |
| **Frontend Framework** | **React (Vite) + Tailwind CSS** | Khởi động nhanh, tối ưu hóa giao diện với hệ thống UI component hiện đại (ShadCN UI, Lucide Icons, Pop Buttons). Hiển thị mượt mà sơ đồ chọn buồng và giường. |
| **Backend API** | **Node.js (Express / NestJS) hoặc Spring Boot** | Xử lý tốt các logic nghiệp vụ chia tiền, tích hợp xác thực Google OAuth2 và các tác vụ nền gửi mail nhắc nợ. |
| **Database** | **PostgreSQL hoặc MS SQL Server** | Hỗ trợ quan hệ toàn vẹn dữ liệu chặt chẽ giữa Phòng - Buồng - Giường, đảm bảo độ chính xác tuyệt đối khi phân bổ số tiền lẻ sau khi chia hóa đơn. |
| **Xác thực (Auth)** | **Google OAuth2 + JWT** | Kiểm tra phân tách miền email: Gmail cá nhân (cho sinh viên) và Google Workspace `@fpt.edu.vn` / `@fe.edu.vn` (cho cán bộ). |
| **Cổng Thanh toán** | **VietQR / SePay / VNPay Sandbox** | Tự động sinh mã QR chuyển khoản có sẵn mã hóa đơn và số tiền, giúp demo sinh động khi bảo vệ đồ án. |
| **Lưu trữ Ảnh** | **Cloudinary API** | Lưu ảnh chụp đồng hồ điện nước minh chứng, ảnh thẻ sinh viên và ảnh hiện trường lúc check-in/check-out. |
