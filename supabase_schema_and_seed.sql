-- ==============================================================================
-- DORMITORY MANAGEMENT SYSTEM (DMS) - SUPABASE SCHEMA & SAMPLE SEED DATA
-- FPT University Dormitory Management System
-- Cấu trúc: Tòa nhà -> Tầng -> Phòng (24 giường) -> Buồng (4 buồng A,B,C,D) -> Giường (6 giường)
-- ==============================================================================

-- 1. BẬT TIỆN ÍCH MỞ RỘNG (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TẠO CÁC BẢNG DỮ LIỆU CỐT LÕI (TABLE DEFINITIONS)

-- 2.1. BẢNG TÒA NHÀ (BUILDINGS)
CREATE TABLE IF NOT EXISTS public.buildings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender_type TEXT NOT NULL CHECK (gender_type IN ('MALE', 'FEMALE', 'MIXED')),
    total_floors INTEGER NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.2. BẢNG PHÒNG Ở TRONG TÒA (ROOMS)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    floor INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 24,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RENOVATING')),
    price_per_month NUMERIC(12, 2) NOT NULL DEFAULT 950000,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.3. BẢNG BUỒNG TRONG PHÒNG (COMPARTMENTS - Mỗi phòng gồm 4 buồng A, B, C, D)
CREATE TABLE IF NOT EXISTS public.compartments (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    code TEXT NOT NULL CHECK (code IN ('A', 'B', 'C', 'D')),
    title TEXT NOT NULL,
    zone_description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.4. BẢNG GIƯỜNG (BEDS - Mỗi buồng gồm 6 giường G01 đến G06)
CREATE TABLE IF NOT EXISTS public.beds (
    id TEXT PRIMARY KEY,
    compartment_id TEXT NOT NULL REFERENCES public.compartments(id) ON DELETE CASCADE,
    bed_code TEXT NOT NULL UNIQUE,
    slot TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('lower', 'upper')),
    price NUMERIC(12, 2) NOT NULL DEFAULT 950000,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'holding', 'maintenance')),
    student_id TEXT,
    student_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.5. BẢNG SINH VIÊN KÝ TÚC XÁ (STUDENTS)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE, -- MSSV (ví dụ: SE182049)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    citizen_id TEXT UNIQUE, -- CCCD
    gender TEXT CHECK (gender IN ('Nam', 'Nữ')),
    dob DATE,
    hometown TEXT,
    major TEXT,
    cohort TEXT,
    building TEXT,
    room TEXT,
    compartment TEXT,
    bed_code TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_checkout')),
    debt_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    parent_name TEXT,
    parent_phone TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.6. BẢNG HỢP ĐỒNG LƯU TRÚ (CONTRACTS)
CREATE TABLE IF NOT EXISTS public.contracts (
    id TEXT PRIMARY KEY,
    contract_code TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    student_name TEXT,
    bed_code TEXT NOT NULL,
    room TEXT NOT NULL,
    building TEXT NOT NULL,
    semester TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 1000000,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2.7. BẢNG NHẬT KÝ QUÉT CỔNG AN NINH & GIỜ GIỚI NGHIÊM (GATE ACCESS LOGS)
CREATE TABLE IF NOT EXISTS public.gate_access_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    room TEXT NOT NULL,
    bed_code TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('IN', 'OUT')),
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'danger')),
    message TEXT,
    gate_name TEXT DEFAULT 'Cổng chính Tòa A (Turnstile 01)',
    hmac_token TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. THIẾT LẬP CHỈ MỤC TỐI ƯU HIỆU NĂNG (INDEXES)
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON public.rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_compartments_room_id ON public.compartments(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_compartment_id ON public.beds(compartment_id);
CREATE INDEX IF NOT EXISTS idx_beds_bed_code ON public.beds(bed_code);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_bed_code ON public.students(bed_code);
CREATE INDEX IF NOT EXISTS idx_contracts_student_id ON public.contracts(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_logs_student_id ON public.gate_access_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_logs_created_at ON public.gate_access_logs(created_at);

-- 4. BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS POLICIES)
-- Kích hoạt RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_access_logs ENABLE ROW LEVEL SECURITY;

-- Cấp quyền truy cập mở (Public Access) phục vụ kết nối trực tiếp từ Web App Demo
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access for buildings" ON public.buildings;
    CREATE POLICY "Public access for buildings" ON public.buildings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for rooms" ON public.rooms;
    CREATE POLICY "Public access for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for compartments" ON public.compartments;
    CREATE POLICY "Public access for compartments" ON public.compartments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for beds" ON public.beds;
    CREATE POLICY "Public access for beds" ON public.beds FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for students" ON public.students;
    CREATE POLICY "Public access for students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for contracts" ON public.contracts;
    CREATE POLICY "Public access for contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access for gate_access_logs" ON public.gate_access_logs;
    CREATE POLICY "Public access for gate_access_logs" ON public.gate_access_logs FOR ALL USING (true) WITH CHECK (true);
END $$;


-- 5. CHÈN DỮ LIỆU MẪU (SEED DATA INSERTIONS)

-- 5.1. Dữ liệu các Tòa Nhà (Buildings)
INSERT INTO public.buildings (id, name, gender_type, total_floors, description)
VALUES
('b1', 'Tòa A (Khu Nam)', 'MALE', 5, 'Khu nội trú nam tiêu chuẩn FPT University, trang bị đầy đủ điều hòa, mạng wifi tốc độ cao'),
('b2', 'Tòa B (Khu Nam)', 'MALE', 5, 'Khu nội trú nam mở rộng, gần khu phức hợp thể thao, sân bóng rổ và thư viện trường'),
('b3', 'Tòa C (Khu Nữ)', 'FEMALE', 5, 'Khu nội trú nữ cao cấp, hệ thống an ninh thẻ từ 24/7, camera AI nhận diện khuôn mặt tại sảnh'),
('b4', 'Tòa D (Khu Nữ)', 'FEMALE', 5, 'Khu nội trú nữ không gian xanh, khuôn viên vườn sinh thái, phòng tự học và sinh hoạt tập thể')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    gender_type = EXCLUDED.gender_type,
    description = EXCLUDED.description;

-- 5.2. Dữ liệu các Phòng Ở Trong Tòa (Rooms)
INSERT INTO public.rooms (id, building_id, room_number, floor, max_capacity, status, price_per_month)
VALUES
-- Tòa A (Nam)
('r_a101', 'b1', 'A101', 1, 24, 'ACTIVE', 950000),
('r_a102', 'b1', 'A102', 1, 24, 'ACTIVE', 950000),
('r_a103', 'b1', 'A103', 1, 24, 'ACTIVE', 950000),
('r_a104', 'b1', 'A104', 1, 24, 'ACTIVE', 950000),
('r_a201', 'b1', 'A201', 2, 24, 'ACTIVE', 950000),
('r_a202', 'b1', 'A202', 2, 24, 'ACTIVE', 950000),
('r_a203', 'b1', 'A203', 2, 24, 'ACTIVE', 950000),
('r_a204', 'b1', 'A204', 2, 24, 'ACTIVE', 950000),
('r_a205', 'b1', 'A205', 2, 24, 'ACTIVE', 950000),
('r_a301', 'b1', 'A301', 3, 24, 'ACTIVE', 950000),
('r_a302', 'b1', 'A302', 3, 24, 'ACTIVE', 950000),
('r_a303', 'b1', 'A303', 3, 24, 'ACTIVE', 950000),
('r_a304', 'b1', 'A304', 3, 24, 'ACTIVE', 950000),
('r_a401', 'b1', 'A401', 4, 24, 'ACTIVE', 950000),
('r_a501', 'b1', 'A501', 5, 24, 'ACTIVE', 950000),

-- Tòa B (Nam)
('r_b101', 'b2', 'B101', 1, 24, 'ACTIVE', 950000),
('r_b201', 'b2', 'B201', 2, 24, 'ACTIVE', 950000),
('r_b302', 'b2', 'B302', 3, 24, 'ACTIVE', 950000),
('r_b304', 'b2', 'B304', 3, 24, 'ACTIVE', 950000),
('r_b401', 'b2', 'B401', 4, 24, 'ACTIVE', 950000),

-- Tòa C (Nữ)
('r_c101', 'b3', 'C101', 1, 24, 'ACTIVE', 950000),
('r_c102', 'b3', 'C102', 1, 24, 'ACTIVE', 950000),
('r_c201', 'b3', 'C201', 2, 24, 'ACTIVE', 950000),
('r_c205', 'b3', 'C205', 2, 24, 'ACTIVE', 950000),
('r_c301', 'b3', 'C301', 3, 24, 'ACTIVE', 950000),

-- Tòa D (Nữ)
('r_d101', 'b4', 'D101', 1, 24, 'ACTIVE', 950000),
('r_d102', 'b4', 'D102', 1, 24, 'ACTIVE', 950000),
('r_d201', 'b4', 'D201', 2, 24, 'ACTIVE', 950000),
('r_d202', 'b4', 'D202', 2, 24, 'ACTIVE', 950000),
('r_d301', 'b4', 'D301', 3, 24, 'ACTIVE', 950000)
ON CONFLICT (id) DO UPDATE SET
    room_number = EXCLUDED.room_number,
    floor = EXCLUDED.floor,
    status = EXCLUDED.status;

-- 5.3. Dữ liệu Buồng trong Phòng (Compartments)
INSERT INTO public.compartments (id, room_id, code, title, zone_description)
VALUES
-- Phòng A205
('comp_a205_a', 'r_a205', 'A', 'Window Bay', 'Đón nắng ban mai · Hướng Đông'),
('comp_a205_b', 'r_a205', 'B', 'Balcony Wing', 'Hướng ban công thoáng mát'),
('comp_a205_c', 'r_a205', 'C', 'Study Hub', 'Góc bàn học tập trung yên tĩnh'),
('comp_a205_d', 'r_a205', 'D', 'Main Door', 'Gần cửa chính và cụm vệ sinh khép kín'),

-- Phòng B302
('comp_b302_a', 'r_b302', 'A', 'Window Bay', 'Hướng Nam view sân bóng đá'),
('comp_b302_b', 'r_b302', 'B', 'Balcony Wing', 'Khu vực ban công'),
('comp_b302_c', 'r_b302', 'C', 'Study Hub', 'Khu vực bàn tự học'),
('comp_b302_d', 'r_b302', 'D', 'Main Door', 'Lối đi chính'),

-- Phòng C102
('comp_c102_a', 'r_c102', 'A', 'Garden View', 'Hướng vườn hoa nội khu'),
('comp_c102_b', 'r_c102', 'B', 'Balcony Wing', 'Ban công đón gió tự nhiên'),
('comp_c102_c', 'r_c102', 'C', 'Study Hub', 'Góc bàn học sinh viên'),
('comp_c102_d', 'r_c102', 'D', 'Main Door', 'Lối vào buồng')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    zone_description = EXCLUDED.zone_description;

-- 5.4. Dữ liệu Giường (Beds)
INSERT INTO public.beds (id, compartment_id, bed_code, slot, tier, price, status, student_id, student_name)
VALUES
-- Phòng A205 - Buồng B
('bed_a205_b_g01', 'comp_a205_b', 'A205-B-G01', 'G01', 'lower', 950000, 'occupied', 'SE181102', 'Trần Thanh Nguyên'),
('bed_a205_b_g02', 'comp_a205_b', 'A205-B-G02', 'G02', 'upper', 950000, 'occupied', 'SE180911', 'Lê Minh Tuấn'),
('bed_a205_b_g03', 'comp_a205_b', 'A205-B-G03', 'G03', 'lower', 950000, 'occupied', 'SE182049', 'Nguyễn Hoàng Vinh'),
('bed_a205_b_g04', 'comp_a205_b', 'A205-B-G04', 'G04', 'upper', 950000, 'occupied', 'IA180421', 'Văn Thái Trung'),
('bed_a205_b_g05', 'comp_a205_b', 'A205-B-G05', 'G05', 'lower', 950000, 'occupied', 'SE172301', 'Huỳnh Gia Kim'),
('bed_a205_b_g06', 'comp_a205_b', 'A205-B-G06', 'G06', 'upper', 950000, 'available', NULL, NULL),

-- Phòng A205 - Buồng A
('bed_a205_a_g01', 'comp_a205_a', 'A205-A-G01', 'G01', 'lower', 950000, 'occupied', NULL, 'Trần Minh Hải'),
('bed_a205_a_g02', 'comp_a205_a', 'A205-A-G02', 'G02', 'upper', 950000, 'occupied', NULL, 'Đỗ Khải Nam'),
('bed_a205_a_g03', 'comp_a205_a', 'A205-A-G03', 'G03', 'lower', 950000, 'available', NULL, NULL),
('bed_a205_a_g04', 'comp_a205_a', 'A205-A-G04', 'G04', 'upper', 950000, 'occupied', NULL, 'Hoàng Long'),
('bed_a205_a_g05', 'comp_a205_a', 'A205-A-G05', 'G05', 'lower', 950000, 'occupied', NULL, 'Phan Quang'),
('bed_a205_a_g06', 'comp_a205_a', 'A205-A-G06', 'G06', 'upper', 950000, 'holding', NULL, NULL),

-- Phòng B302 - Buồng A
('bed_b302_a_g01', 'comp_b302_a', 'B302-A-G01', 'G01', 'lower', 950000, 'occupied', 'SE180911', 'Lê Minh Tuấn'),
('bed_b302_a_g02', 'comp_b302_a', 'B302-A-G02', 'G02', 'upper', 950000, 'occupied', 'SS180124', 'Phạm Quốc Bảo'),
('bed_b302_a_g03', 'comp_b302_a', 'B302-A-G03', 'G03', 'lower', 950000, 'available', NULL, NULL),
('bed_b302_a_g04', 'comp_b302_a', 'B302-A-G04', 'G04', 'upper', 950000, 'maintenance', NULL, NULL),

-- Phòng C102 - Buồng A
('bed_c102_a_g01', 'comp_c102_a', 'C102-A-G01', 'G01', 'lower', 950000, 'occupied', 'SE184512', 'Trần Thị Mai Anh'),
('bed_c102_a_g02', 'comp_c102_a', 'C102-A-G02', 'G02', 'upper', 950000, 'occupied', 'MC180234', 'Lê Phương Thảo'),
('bed_c102_a_g03', 'comp_c102_a', 'C102-A-G03', 'G03', 'lower', 950000, 'available', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    student_id = EXCLUDED.student_id,
    student_name = EXCLUDED.student_name;

-- 5.5. Dữ liệu Sinh Viên Ký Túc Xá (Students)
INSERT INTO public.students (
    id, student_id, full_name, email, phone, citizen_id, gender, dob,
    hometown, major, cohort, building, room, compartment, bed_code,
    status, debt_amount, parent_name, parent_phone, joined_date
)
VALUES
('std_01', 'SE182049', 'Nguyễn Hoàng Vinh', 'hoangvinh.student@gmail.com', '0912 345 678', '079204018293', 'Nam', '2004-05-15', 'TP. Hồ Chí Minh', 'Kỹ thuật Phần mềm (Software Engineering)', 'K19 - Khóa 2023-2027', 'Tòa A (Khu Nam)', 'A205', 'Buồng B', 'A205-B-G03', 'active', 0, 'Nguyễn Văn Hùng', '0903 123 456', '2024-09-01'),
('std_02', 'SE181102', 'Trần Thanh Nguyên', 'nguyentt.student@gmail.com', '0987 654 321', '079204001235', 'Nam', '2004-08-20', 'Đồng Nai', 'An toàn Thông tin (Information Assurance)', 'K19 - Khóa 2023-2027', 'Tòa A (Khu Nam)', 'A205', 'Buồng B', 'A205-B-G01', 'active', 0, 'Trần Văn Nam', '0908 765 432', '2024-09-01'),
('std_03', 'IA180421', 'Văn Thái Trung', 'trungvt.student@gmail.com', '0909 112 233', '079204001236', 'Nam', '2004-03-12', 'Bình Dương', 'An toàn Thông tin', 'K19 - Khóa 2023-2027', 'Tòa A (Khu Nam)', 'A205', 'Buồng B', 'A205-B-G04', 'active', 0, 'Văn Đình Hòa', '0912 888 999', '2024-09-01'),
('std_04', 'SE172301', 'Huỳnh Gia Kim', 'kimhg.student@gmail.com', '0933 445 566', '079204001237', 'Nam', '2003-11-25', 'Cần Thơ', 'Kỹ thuật Phần mềm', 'K18 - Khóa 2022-2026', 'Tòa A (Khu Nam)', 'A205', 'Buồng B', 'A205-B-G05', 'active', 0, 'Huỳnh Văn Bảy', '0933 777 888', '2023-09-01'),
('std_05', 'SE180911', 'Lê Minh Tuấn', 'tuanlm.student@gmail.com', '0918 776 655', '079204001238', 'Nam', '2004-09-18', 'Bà Rịa - Vũng Tàu', 'Trí tuệ Nhân tạo (AI)', 'K19 - Khóa 2023-2027', 'Tòa B (Khu Nam)', 'B302', 'Buồng A', 'B302-A-G01', 'active', 218000, 'Lê Minh Trí', '0918 333 444', '2024-09-01'),
('std_06', 'SS180124', 'Phạm Quốc Bảo', 'baopq.student@gmail.com', '0977 889 900', '079204001239', 'Nam', '2004-05-30', 'Tây Ninh', 'Khoa học Dữ liệu (Data Science)', 'K19 - Khóa 2023-2027', 'Tòa B (Khu Nam)', 'B302', 'Buồng A', 'B302-A-G02', 'active', 0, 'Phạm Văn Sơn', '0977 222 333', '2024-09-01'),
('std_07', 'SE183492', 'Ngô Văn Khải', 'khainv.student@gmail.com', '0944 332 211', '079204001240', 'Nam', '2004-12-05', 'Long An', 'Thiết kế Vi mạch (Semiconductor)', 'K19 - Khóa 2023-2027', 'Tòa B (Khu Nam)', 'B304', 'Buồng C', 'B304-C-G01', 'active', 1445000, 'Ngô Văn Chiến', '0944 555 666', '2024-09-01'),
('std_08', 'SE184512', 'Trần Thị Mai Anh', 'maianhtt.student@gmail.com', '0903 556 677', '079204001241', 'Nữ', '2004-02-14', 'Đà Nẵng', 'Kỹ thuật Phần mềm', 'K19 - Khóa 2023-2027', 'Tòa C (Khu Nữ)', 'C102', 'Buồng A', 'C102-A-G01', 'active', 0, 'Trần Đình Khang', '0903 888 999', '2024-05-01'),
('std_09', 'MC180234', 'Lê Phương Thảo', 'thaolp.student@gmail.com', '0913 889 911', '079204001242', 'Nữ', '2004-06-25', 'Hà Nội', 'Truyền thông Đa phương tiện', 'K19 - Khóa 2023-2027', 'Tòa C (Khu Nữ)', 'C102', 'Buồng A', 'C102-A-G02', 'active', 0, 'Lê Văn Hùng', '0913 444 555', '2024-05-01'),
('std_10', 'SE182991', 'Nguyễn Thảo Vy', 'vynt.student@gmail.com', '0968 223 344', '079204001243', 'Nữ', '2004-10-10', 'Bình Định', 'Kỹ thuật Phần mềm', 'K19 - Khóa 2023-2027', 'Tòa C (Khu Nữ)', 'C205', 'Buồng B', 'C205-B-G01', 'active', 0, 'Nguyễn Văn Thái', '0968 111 222', '2024-05-01'),
('std_11', 'DS180112', 'Hoàng Khánh Linh', 'linhhk.student@gmail.com', '0982 445 566', '079204001244', 'Nữ', '2004-01-20', 'Lâm Đồng', 'Khoa học Dữ liệu', 'K19 - Khóa 2023-2027', 'Tòa D (Khu Nữ)', 'D101', 'Buồng A', 'D101-A-G01', 'active', 0, 'Hoàng Minh Đức', '0982 999 000', '2024-01-05'),
('std_12', 'SE184901', 'Đặng Ngọc Hà', 'hadn.student@gmail.com', '0938 112 233', '079204001245', 'Nữ', '2004-04-18', 'Khánh Hòa', 'Kỹ thuật Phần mềm', 'K19 - Khóa 2023-2027', 'Tòa D (Khu Nữ)', 'D101', 'Buồng A', 'D101-A-G02', 'active', 0, 'Đặng Quốc Việt', '0938 666 777', '2024-01-05')
ON CONFLICT (student_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    room = EXCLUDED.room,
    bed_code = EXCLUDED.bed_code,
    debt_amount = EXCLUDED.debt_amount;

-- 5.6. Dữ liệu Hợp Đồng Lưu Trú (Contracts)
INSERT INTO public.contracts (
    id, contract_code, student_id, student_name, bed_code, room, building,
    semester, start_date, end_date, deposit_amount, status
)
VALUES
('ctr_01', 'CTR-2026-001', 'SE182049', 'Nguyễn Hoàng Vinh', 'A205-B-G03', 'A205', 'Tòa A (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_02', 'CTR-2026-002', 'SE181102', 'Trần Thanh Nguyên', 'A205-B-G01', 'A205', 'Tòa A (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_03', 'CTR-2026-003', 'IA180421', 'Văn Thái Trung', 'A205-B-G04', 'A205', 'Tòa A (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_04', 'CTR-2026-004', 'SE172301', 'Huỳnh Gia Kim', 'A205-B-G05', 'A205', 'Tòa A (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_05', 'CTR-2026-005', 'SE180911', 'Lê Minh Tuấn', 'B302-A-G01', 'B302', 'Tòa B (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_06', 'CTR-2026-006', 'SS180124', 'Phạm Quốc Bảo', 'B302-A-G02', 'B302', 'Tòa B (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_07', 'CTR-2026-007', 'SE183492', 'Ngô Văn Khải', 'B304-C-G01', 'B304', 'Tòa B (Khu Nam)', 'Fall 2026', '2026-09-01', '2027-01-15', 1000000, 'ACTIVE'),
('ctr_08', 'CTR-2026-008', 'SE184512', 'Trần Thị Mai Anh', 'C102-A-G01', 'C102', 'Tòa C (Khu Nữ)', 'Summer 2026', '2026-05-01', '2026-08-30', 1000000, 'ACTIVE'),
('ctr_09', 'CTR-2026-009', 'MC180234', 'Lê Phương Thảo', 'C102-A-G02', 'C102', 'Tòa C (Khu Nữ)', 'Summer 2026', '2026-05-01', '2026-08-30', 1000000, 'ACTIVE'),
('ctr_10', 'CTR-2026-010', 'SE182991', 'Nguyễn Thảo Vy', 'C205-B-G01', 'C205', 'Tòa C (Khu Nữ)', 'Summer 2026', '2026-05-01', '2026-08-30', 1000000, 'ACTIVE'),
('ctr_11', 'CTR-2026-011', 'DS180112', 'Hoàng Khánh Linh', 'D101-A-G01', 'D101', 'Tòa D (Khu Nữ)', 'Spring 2026', '2026-01-05', '2026-04-30', 1000000, 'ACTIVE'),
('ctr_12', 'CTR-2026-012', 'SE184901', 'Đặng Ngọc Hà', 'D101-A-G02', 'D101', 'Tòa D (Khu Nữ)', 'Spring 2026', '2026-01-05', '2026-04-30', 1000000, 'ACTIVE')
ON CONFLICT (contract_code) DO UPDATE SET
    status = EXCLUDED.status,
    deposit_amount = EXCLUDED.deposit_amount;

