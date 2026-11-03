const fs = require('fs');

// Read extracted_doc.md as base
let content = fs.readFileSync('scripts/extracted_doc.md', 'utf8');

// Enhance formatting
// 1. Title and header styling
const header = `# BÁO CÁO DỰ ÁN MÔN HỌC (PROJECT REPORT)
## MÔN HỌC: FER202 – FRONT-END WEB DEVELOPMENT WITH REACT
### ĐỀ TÀI: DOMANAGE – HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TRỰC TUYẾN
*(ONLINE DORMITORY MANAGEMENT SYSTEM – DMS)*

---

> **TRƯỜNG ĐẠI HỌC FPT – KHOA CÔNG NGHỆ THÔNG TIN**  
> **Giảng viên hướng dẫn:** ThS. Giảng viên Bộ môn FER202  
> **Nhóm thực hiện:** FER202_Group4  
> **Thời gian hoàn thành:** Tháng 10/2026  

---

### DANH SÁCH THÀNH VIÊN THỰC HIỆN DỰ ÁN

| STT | Họ và Tên | MSSV | Vai trò chính trong dự án | Phân hệ phụ trách chính |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Nguyễn Hoàng Vinh** | SE170001 | Project Manager & Full-Stack Lead | Module 1: Auth (OAuth 2.0, JWT, Profile), Base Setup |
| **2** | **Trần Công Tiến** | SE170002 | Frontend Lead & UI/UX Designer | Module 2 & 3: Bản đồ 1:4:6, Giữ chỗ 15m, VietQR UI |
| **3** | **Trần Thanh Nguyên** | SE170003 | Backend Engineer & Database Architect | Database Schema 12 bảng, Auto-Approval, e-Contract PDF |
| **4** | **Văn Thái Trung** | SE170004 | Frontend Developer & Integration Specialist | Module 4: Ghi số công tơ, Chia tiền $Total/N$, Handover |
| **5** | **Đinh Thanh Trung** | SE170005 | Backend Developer & Security Analyst | Module 5: Ticket Bảo trì, Module 6: Giới nghiêm 23:00, Module 7: Dashboard |
| **6** | **Huỳnh Gia Kim** | SE170006 | Quality Assurance (QA) & Test Engineer | 90 Test Cases (4 Edge-cases), Responsive, Slide & Demo |

---

## 📑 MỤC LỤC BÁO CÁO (TABLE OF CONTENTS)

- [Lời Cam Đoan](#lời-cam-đoan)
- [Lời Cảm Ơn](#lời-cảm-ơn)
- [Tóm Tắt Đề Tài (Abstract)](#tóm-tắt-đề-tài-abstract)
- [Chương 1: Giới Thiệu và Đặt Vấn Đề](#chương-1-giới-thiệu-và-đặt-vấn-đề)
  - [1.1. Bối cảnh và Lý do chọn đề tài](#11-bối-cảnh-và-lý-do-chọn-đề-tài)
  - [1.2. Mục tiêu của Dự án](#12-mục-tiêu-của-dự-án)
  - [1.3. Phạm vi của Đề tài](#13-phạm-vi-của-đề-tài)
  - [1.4. Đối tượng sử dụng Hệ thống (Stakeholders & Actors)](#14-đối-tượng-sử-dụng-hệ-thống-stakeholders--actors)
- [Chương 2: Phân Tích Yêu Cầu Hệ Thống](#chương-2-phân-tích-yêu-cầu-hệ-thống)
  - [2.1. Danh mục Yêu cầu Chức năng (28 Use Cases)](#21-danh-mục-yêu-cầu-chức-năng-28-use-cases)
  - [2.2. Đặc tả Chi tiết các Use Case Trọng tâm](#22-đặc-tả-chi-tiết-các-use-case-trọng-tâm)
  - [2.3. Yêu cầu Phi chức năng (Non-Functional Requirements)](#23-yêu-cầu-phi-chức-năng-non-functional-requirements)
- [Chương 3: Kiến Trúc Hệ Thống và Thiết Kế Dữ Liệu](#chương-3-kiến-trúc-hệ-thống-và-thiết-kế-dữ-liệu)
  - [3.1. Kiến trúc Kỹ thuật Tổng thể](#31-kiến-trúc-kỹ-thuật-tổng-thể)
  - [3.2. Mô hình Không gian Phân cấp 1:4:6 (Spatial Topology)](#32-mô-hình-không-gian-phân-cấp-146-spatial-topology)
  - [3.3. Thiết kế Cơ sở Dữ liệu 12 Thực thể (Database Schema)](#33-thiết-kế-cơ-sở-dữ-liệu-12-thực-thể-database-schema)
- [Chương 4: Hiện Thực các Phân Hệ Cốt Lõi](#chương-4-hiện-thực-các-phân-hệ-cốt-lõi)
  - [4.1. Module 1: Phân quyền RBAC & Điều hướng Tự động](#41-module-1-phân-quyền-rbac--điều-hướng-tự-động)
  - [4.2. Module 2 & 3: Bản đồ Giường 1:4:6 và Động cơ Auto-Approval](#42-module-2--3-bản-đồ-giường-146-và-động-cơ-auto-approval)
  - [4.3. Module 4: Quản lý Công tơ & Chia đều Tiền Điện Nước](#43-module-4-quản-lý-công-tơ--chia-đều-tiền-điện-nước)
  - [4.4. Module 5: Phân hệ Tiếp nhận Báo hỏng & Bảo trì](#44-module-5-phân-hệ-tiếp-nhận-báo-hỏng--bảo-trì)
  - [4.5. Module 6: Thẻ QR Di động & Giờ Giới Nghiêm 23:00](#45-module-6-thẻ-qr-di-động--giờ-giới-nghiêm-2300)
  - [4.6. Module 7: Bảng điều khiển Quản trị & Báo cáo Excel](#46-module-7-bảng-điều-khiển-quản-trị--báo-cáo-excel)
- [Chương 5: Đảm Bảo Chất Lượng và Kiểm Thử Phần Mềm](#chương-5-đảm-bảo-chất-lượng-và-kiểm-thử-phần-mềm)
  - [5.1. Kiểm thử 4 Ca Biên Then chốt (Critical Edge-cases)](#51-kiểm-thử-4-ca-biên-then-chốt-critical-edge-cases)
  - [5.2. Ma trận Kết quả Thực thi Kiểm thử 90 Ca Kiểm Thử](#52-ma-trận-kết-quả-thực-thi-kiểm-thử)
- [Chương 6: Quản Trị Dự Án và Phân Công Công Việc](#chương-6-quản-trị-dự-án-và-phân-công-công-việc)
  - [6.1. Ma trận Trách nhiệm RACI](#61-ma-trận-trách-nhiệm-raci)
  - [6.2. Lộ trình Triển khai 5 Tuần (Agile Scrum)](#62-lộ-trình-triển-khai-5-tuần-agile-scrum)
  - [6.3. Đánh giá Mức độ Đóng góp của Từng Thành viên](#63-đánh-giá-mức-độ-đóng-góp-của-từng-thành-viên)
- [Chương 7: Kết Luận và Hướng Phát Triển](#chương-7-kết-luận-và-hướng-phát-triển)
  - [7.1. Kết quả Đạt được của Đề tài](#71-kết-quả-đạt-được-của-đề-tài)
  - [7.2. Hạn chế của Hệ thống Hiện tại](#72-hạn-chế-của-hệ-thống-hiện-tại)
  - [7.3. Hướng Phát triển trong Tương lai](#73-hướng-phát-triển-trong-tương-lai)
- [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---
`;

// Extract from Lời cam đoan onwards
const camDoanIndex = content.indexOf('# **LỜI CAM ĐOAN**');
let body = content.substring(camDoanIndex);

// Clean up markdown markers
body = body.replace(/# \*\*(.*?)\*\*/g, '# $1');
body = body.replace(/## \*\*(.*?)\*\*/g, '## $1');
body = body.replace(/### \*\*(.*?)\*\*/g, '### $1');

// Add Mermaid architecture diagram to Chapter 3
const archInsertMarker = '## 3.1. Kiến trúc Kỹ thuật Tổng thể';
const archDiagram = `## 3.1. Kiến trúc Kỹ thuật Tổng thể

\`\`\`mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (React 19 + Vite)"]
        UI["🖥️ UI Components (Tailwind CSS v4 + Radix UI)"]
        Router["🧭 React Router DOM v7 (Role-Based ProtectedRoute)"]
    end

    subgraph StateLayer ["State Management & Business Engines"]
        AuthCtx["🔑 AuthContext (JWT & Dual-Token)"]
        BookingCtx["🛏️ BookingContext (15-Minute Mutex Lock)"]
        AutoApprove["⚡ Auto-Approval Engine (3-Step Validation)"]
        SplitBill["💰 Split-Billing Calculator (Total / N + Remainder)"]
    end

    subgraph ServiceLayer ["Service & Data Persistence"]
        MockServer["⚙️ RESTful API / JSON-Server (server.js)"]
        DB[("🗄️ LowDB Database (db.json) / Supabase 12 Tables")]
    end

    subgraph ExternalLayer ["External Services & Exports"]
        VietQR["📱 VietQR Napas 247 Dynamic Payment"]
        jsPDF["📄 jsPDF Digital e-Contract Generator"]
        Excel["📊 XLSX Export Engine (Residence & Overdue Debts)"]
    end

    UI --> Router
    Router --> AuthCtx
    UI --> BookingCtx
    BookingCtx --> AutoApprove
    UI --> SplitBill
    AuthCtx --> MockServer
    BookingCtx --> MockServer
    SplitBill --> MockServer
    MockServer --> DB
    AutoApprove --> jsPDF
    BookingCtx --> VietQR
    MockServer --> Excel
\`\`\`
`;

body = body.replace(archInsertMarker, archDiagram);

// Add Mermaid 1:4:6 spatial diagram to Chapter 3.2
const topoInsertMarker = '## 3.2. Mô hình Không gian Phân cấp 1:4:6 (Spatial Topology)';
const topoDiagram = `## 3.2. Mô hình Không gian Phân cấp 1:4:6 (Spatial Topology)

\`\`\`mermaid
graph TD
    Building["🏢 Cấp 1: Tòa nhà (Building A - Ký túc xá Nam)"]
    Floor["🪜 Cấp 2: Tầng lầu (Tầng 1 - Tầng 5)"]
    Room["🚪 Cấp 3: Phòng lớn (Ví dụ: Phòng A205)"]
    CompA["🪟 Buồng A: Window Bay (G01 - G06)"]
    CompB["🍃 Buồng B: Balcony Wing (G01 - G06)"]
    CompC["📚 Buồng C: Study Corner (G01 - G06)"]
    CompD["🛋️ Buồng D: Inner Suite (G01 - G06)"]

    Building --> Floor
    Floor --> Room
    Room --> CompA
    Room --> CompB
    Room --> CompC
    Room --> CompD
\`\`\`
`;

body = body.replace(topoInsertMarker, topoDiagram);

const finalMd = header + '\n\n' + body;
fs.writeFileSync('docs/PROJECT_REPORT.md', finalMd, 'utf8');
console.log('Generated docs/PROJECT_REPORT.md, length:', finalMd.length);

