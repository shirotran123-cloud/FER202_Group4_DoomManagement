# HƯỚNG DẪN BIÊN DỊCH VÀ SỬ DỤNG BÁO CÁO LATEX TRÊN OVERLEAF

> **Đề tài:** Domanage -- Online Dormitory Management System (DMS)  
> **Môn học:** FER202 -- Front-End Web Development with React  
> **Nhóm:** FER202_Group4 -- Trường Đại học FPT  

Thư mục `latex_report` chứa toàn bộ mã nguồn báo cáo đồ án (Project Report) chuẩn học thuật, tương thích 100% với trình biên dịch của **Overleaf** mà không gặp bất kỳ lỗi phông chữ tiếng Việt hay gói thư viện nào.

---

## 📁 CẤU TRÚC THƯ MỤC BÁO CÁO

```text
latex_report/
├── main.tex                    # File cấu hình chính (gọi các chương qua \input)
├── cover.tex                   # Trang bìa chuẩn định dạng Đại học FPT
├── chapters/                   # Các chương nội dung phân tách theo module
│   ├── 01_introduction.tex         # Chương 1: Giới thiệu & Đặt vấn đề
│   ├── 02_system_requirements.tex  # Chương 2: Phân tích Yêu cầu (28 Use Cases, NFR)
│   ├── 03_system_architecture.tex  # Chương 3: Kiến trúc & Thiết kế Dữ liệu (1:4:6, 12 thực thể)
│   ├── 04_core_modules.tex         # Chương 4: Hiện thực các Phân hệ Cốt lõi
│   ├── 05_testing_qa.tex           # Chương 5: Đảm bảo Chất lượng & Kiểm thử (4 Edge-cases)
│   ├── 06_project_management.tex   # Chương 6: Quản trị Dự án (RACI, 5 Sprint)
│   └── 07_conclusion.tex          # Chương 7: Kết luận & Hướng phát triển
├── references.bib              # Danh mục tài liệu tham khảo BibTeX (IEEE style)
├── all_in_one_report.tex       # File GỘP TOÀN BỘ (Dùng để copy-paste 1 lần ăn ngay)
└── README.md                   # Hướng dẫn chi tiết này
```

---

## 🚀 2 CÁCH ĐƯA LÊN OVERLEAF ĐƠN GIẢN NHẤT

### CÁCH 1: COPY - PASTE 1 LẦN ĂN NGAY (KHUYÊN DÙNG - NHANH NHẤT ⚡)
1. Đăng nhập vào [Overleaf.com](https://www.overleaf.com/).
2. Nhấn nút **New Project** $\rightarrow$ chọn **Blank Project**.
3. Đặt tên dự án: `FER202_Group4_Domanage_Report`.
4. Mở file `all_in_one_report.tex` trong thư mục này trên máy của bạn, sao chép toàn bộ nội dung (`Ctrl + A`, `Ctrl + C`).
5. Quay lại Overleaf, xóa sạch nội dung mặc định trong file `main.tex` và dán nội dung vừa copy vào (`Ctrl + V`).
6. Nhấn nút xanh lá cây **Recompile** (hoặc `Ctrl + Enter`).
7. Báo cáo PDF chuyên nghiệp của bạn sẽ xuất hiện ngay lập tức bên phải!

---

### CÁCH 2: NÉN FILE VÀ TẢI NGUYÊN BỘ LÊN OVERLEAF (MODULAR PROJECT 📦)
1. Nén toàn bộ thư mục `latex_report` (hoặc các file bên trong: `main.tex`, `cover.tex`, thư mục `chapters/`, `references.bib`) thành file zip: `latex_report.zip`.
2. Trên Overleaf, nhấn **New Project** $\rightarrow$ chọn **Upload Project**.
3. Kéo thả file `latex_report.zip` lên. Overleaf sẽ tự động giải nén và giữ nguyên cấu trúc thư mục.
4. Đảm bảo file chính được chọn là `main.tex`.
5. Nhấn **Recompile** để xem kết quả.

---

## ⚙️ CẤU HÌNH TRÌNH BIÊN DỊCH TRÊN OVERLEAF (MENU SETTINGS)

Mã nguồn đã được tối ưu hóa để chạy mặc định với **pdfLaTeX**:
* **Compiler:** `pdfLaTeX` (hoặc `XeLaTeX` / `LuaLaTeX` đều hỗ trợ tốt).
* **TeX Live version:** `2024` (hoặc phiên bản mới nhất).
* **Main document:** `main.tex` (hoặc `all_in_one_report.tex`).

> **Lưu ý về Tiếng Việt:** Báo cáo sử dụng gói `\usepackage[vietnamese]{babel}` kết hợp bảng mã phông `\usepackage[T5]{fontenc}` và `\usepackage[utf8]{inputenc}`, giúp toàn bộ dấu tiếng Việt hiển thị sắc nét, chuẩn Unicode và ngắt dòng từ ngữ chuẩn xác.

---

## 📝 DANH SÁCH THÀNH VIÊN VÀ PHÂN CÔNG (TRANG BÌA & CHƯƠNG 6)

| STT | Họ và Tên | MSSV | Vai trò chính | Module phụ trách |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Nguyễn Hoàng Vinh** | SE170001 | Project Manager & Full-Stack Lead | Module 1: Auth (OAuth 2.0, JWT, Profile), Base Setup |
| **2** | **Trần Công Tiến** | SE170002 | Frontend Lead & UI/UX Designer | Module 2 & 3: Bản đồ 1:4:6, Giữ chỗ 15m, VietQR UI |
| **3** | **Trần Thanh Nguyên** | SE170003 | Backend Engineer & Database Architect | Database Schema 12 bảng, Auto-Approval, e-Contract PDF |
| **4** | **Văn Thái Trung** | SE170004 | Frontend Developer & Integration Specialist | Module 4: Ghi số công tơ, Chia tiền $Total/N$, Handover |
| **5** | **Đinh Thanh Trung** | SE170005 | Backend Developer & Security Analyst | Module 5: Ticket Bảo trì, Module 6: Giới nghiêm 23:00, Module 7: Dashboard Recharts, Xuất Excel |
| **6** | **Huỳnh Gia Kim** | SE170006 | Quality Assurance (QA) & Test Engineer | 90 Test Cases (4 Edge-cases), Responsive, Slide & Demo |

*(Bạn có thể chỉnh sửa lại Mã số sinh viên MSSV thực tế của từng bạn trong file `cover.tex` hoặc `all_in_one_report.tex` nếu cần).*

