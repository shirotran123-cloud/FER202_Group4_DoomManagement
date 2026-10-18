/**
 * Sinh db.json khớp domain frontend (src/types + src/lib/dorm-ops).
 *
 * Chạy: node scripts/generate-db.js
 *
 * Đặc điểm:
 *  - MSSV QE200xxx (Vinh = QE200001), giống src/data/mockUsers.ts
 *  - 2 tòa: Tòa A (MALE, b1) và Tòa B (FEMALE, b2)
 *  - Cấu trúc 1:4:6 cho mỗi tòa: 5 tầng, 6 phòng/tầng, 4 buồng/phòng, 6 giường/buồng
 *    -> mỗi tòa 5 tầng / 30 phòng / 120 buồng / 720 giường
 *  - Mã phòng theo tòa: A101..A506 (Tòa A), B101..B506 (Tòa B)
 *  - Mã giường [Phòng]-[Buồng]1-[Giường], vd A205-B1-G03 / B201-A1-G01
 *  - configs khớp hằng số dorm-ops (điện bậc thang, nước, wifi, vệ sinh, VAT)
 *  - tickets / invoices / visitors / notices / marketplace / lostFound /
 *    curfewRequests / gateLogs / disciplineRecords / demeritSummaries
 *    lấy đúng shape frontend đang dùng
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- hằng số khớp src/lib/dorm-ops.ts ---------- */
const ELECTRICITY_TIERS = [
  { upToKwh: 50, pricePerKwh: 1800 },
  { upToKwh: 100, pricePerKwh: 2200 },
  { upToKwh: 200, pricePerKwh: 2600 },
  { upToKwh: null, pricePerKwh: 3100 }, // null = vô cực
];
const WATER_PRICE_PER_M3 = 18000;
const CURFEW_HOUR = 23;
const VISITOR_LATEST_HOUR = 21;
const ROOM_FEE_PER_STUDENT = 950000;
const WIFI_FEE_TOTAL = 120000;
const CLEANING_FEE_TOTAL = 60000;
const VAT = 0.08;

/* ---------- MSSV: Vinh 001, còn lại random cố định 002-310 ---------- */
/* Sinh viên Tòa A (Nam): phòng A101..A306 */
const STUDENTS = [
  { mssv: 'QE200001', name: 'Nguyễn Hoàng Vinh', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G03', debt: 0, suspended: false, phone: '0912 345 678', citizenId: '079204018293', dob: '2004-05-15', hometown: 'TP. Hồ Chí Minh', major: 'Kỹ thuật Phần mềm (Software Engineering)', cohort: 'K19 - Khóa 2023-2027', parentName: 'Nguyễn Văn Hùng', parentPhone: '0903 123 456' },
  { mssv: 'QE200047', name: 'Trần Thanh Nguyên', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G04', debt: 0, suspended: false, phone: '0905 111 222', citizenId: '049204001923', dob: '2004-08-20', hometown: 'Quảng Nam', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Trần Văn Toàn', parentPhone: '0905 888 999' },
  { mssv: 'QE200123', name: 'Văn Thái Trung', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G05', debt: 0, suspended: false, phone: '0934 999 888', citizenId: '052204008741', dob: '2004-11-12', hometown: 'Đà Nẵng', major: 'Khoa học Máy tính', cohort: 'K19 - Khóa 2023-2027', parentName: 'Văn Trọng Tuấn', parentPhone: '0918 333 444' },
  { mssv: 'QE200286', name: 'Huỳnh Gia Kim', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G06', debt: 0, suspended: false, phone: '0982 777 666', citizenId: '056204009214', dob: '2004-03-30', hometown: 'Khánh Hòa', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Huỳnh Minh Trí', parentPhone: '0983 456 789' },
  { mssv: 'QE200158', name: 'Lê Minh Tuấn', gender: 'MALE', room: 'A204', compartment: 'A1', bed: 'G01', debt: 218000, suspended: false, phone: '0961 223 344', citizenId: '038204001289', dob: '2004-07-04', hometown: 'Thanh Hóa', major: 'Thiết kế Đồ họa', cohort: 'K19 - Khóa 2023-2027', parentName: 'Lê Văn Tự', parentPhone: '0962 111 333' },
  { mssv: 'QE200094', name: 'Phạm Quốc Bảo', gender: 'MALE', room: 'A203', compartment: 'C1', bed: 'G04', debt: 0, suspended: false, phone: '0971 445 566', citizenId: '075204004561', dob: '2004-09-18', hometown: 'Đồng Nai', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Phạm Quốc Dũng', parentPhone: '0972 555 777' },
  { mssv: 'QE200231', name: 'Vũ Đức Anh', gender: 'MALE', room: 'A202', compartment: 'A1', bed: 'G02', debt: 0, suspended: false, phone: '0905 333 444', citizenId: '031204003344', dob: '2004-02-11', hometown: 'Hà Nội', major: 'Khoa học Máy tính', cohort: 'K19 - Khóa 2023-2027', parentName: 'Vũ Đức Long', parentPhone: '0905 444 555' },
  { mssv: 'QE200175', name: 'Đoàn Gia Bảo', gender: 'MALE', room: 'A201', compartment: 'B1', bed: 'G04', debt: 0, suspended: false, phone: '0977 123 456', citizenId: '079204007788', dob: '2004-06-22', hometown: 'TP. Hồ Chí Minh', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Đoàn Gia Hân', parentPhone: '0977 654 321' },
  { mssv: 'QE200309', name: 'Ngô Văn Khải', gender: 'MALE', room: 'A302', compartment: 'B1', bed: 'G05', debt: 1445000, suspended: false, phone: '0943 222 111', citizenId: '031204008922', dob: '2004-12-05', hometown: 'Hải Phòng', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Ngô Văn Chiến', parentPhone: '0944 333 222' },
  { mssv: 'QE200062', name: 'Hoàng Gia Huy', gender: 'MALE', room: 'A104', compartment: 'D1', bed: 'G06', debt: 1650000, suspended: true, phone: '0938 123 789', citizenId: '079204011122', dob: '2003-10-09', hometown: 'TP. Hồ Chí Minh', major: 'Thiết kế Đồ họa', cohort: 'K18 - Khóa 2022-2026', parentName: 'Hoàng Gia Bảo', parentPhone: '0938 987 654' },
  { mssv: 'QE200297', name: 'Trần Công Tiến', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G01', debt: 0, suspended: false, phone: '0934 112 233', citizenId: '052204002233', dob: '2004-04-02', hometown: 'Đà Nẵng', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Trần Công Danh', parentPhone: '0934 332 211' },
  { mssv: 'QE200204', name: 'Đinh Thanh Trung', gender: 'MALE', room: 'A205', compartment: 'B1', bed: 'G02', debt: 0, suspended: false, phone: '0988 990 011', citizenId: '038204006655', dob: '2004-01-25', hometown: 'Thanh Hóa', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Đinh Thanh Sơn', parentPhone: '0988 110 022' },

  /* Sinh viên Tòa B (Nữ): phòng B101..B503 — rải đều nhiều tầng, phần lớn giường vẫn AVAILABLE */
  { mssv: 'QE200013', name: 'Nguyễn Thị Mai Linh', gender: 'FEMALE', room: 'B101', compartment: 'A1', bed: 'G01', debt: 0, suspended: false, phone: '0912 456 789', citizenId: '079204012345', dob: '2004-03-08', hometown: 'TP. Hồ Chí Minh', major: 'Kỹ thuật Phần mềm (Software Engineering)', cohort: 'K19 - Khóa 2023-2027', parentName: 'Nguyễn Thị Hồng', parentPhone: '0903 456 789' },
  { mssv: 'QE200068', name: 'Trần Thị Thu Hà', gender: 'FEMALE', room: 'B101', compartment: 'A1', bed: 'G02', debt: 0, suspended: false, phone: '0905 234 567', citizenId: '049204015678', dob: '2004-07-19', hometown: 'Quảng Nam', major: 'Khoa học Máy tính', cohort: 'K19 - Khóa 2023-2027', parentName: 'Trần Văn Sơn', parentPhone: '0905 678 901' },
  { mssv: 'QE200137', name: 'Lê Thị Ngọc Anh', gender: 'FEMALE', room: 'B101', compartment: 'A1', bed: 'G03', debt: 0, suspended: false, phone: '0934 567 890', citizenId: '052204019012', dob: '2004-11-27', hometown: 'Đà Nẵng', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Lê Thị Bích', parentPhone: '0918 234 567' },
  { mssv: 'QE200082', name: 'Phạm Thị Khánh Vy', gender: 'FEMALE', room: 'B102', compartment: 'C1', bed: 'G05', debt: 0, suspended: false, phone: '0982 345 671', citizenId: '056204022345', dob: '2004-01-14', hometown: 'Khánh Hòa', major: 'Thiết kế Đồ họa', cohort: 'K19 - Khóa 2023-2027', parentName: 'Phạm Văn Hải', parentPhone: '0983 567 890' },
  { mssv: 'QE200191', name: 'Hoàng Thị Diễm Quỳnh', gender: 'FEMALE', room: 'B102', compartment: 'C1', bed: 'G06', debt: 0, suspended: false, phone: '0961 234 567', citizenId: '038204025678', dob: '2004-09-05', hometown: 'Thanh Hóa', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Hoàng Thị Lan', parentPhone: '0962 345 678' },
  { mssv: 'QE200106', name: 'Vũ Thị Phương Thảo', gender: 'FEMALE', room: 'B103', compartment: 'A1', bed: 'G02', debt: 218000, suspended: false, phone: '0971 456 789', citizenId: '031204028901', dob: '2004-05-21', hometown: 'Hà Nội', major: 'Khoa học Máy tính', cohort: 'K19 - Khóa 2023-2027', parentName: 'Vũ Văn Thắng', parentPhone: '0972 678 901' },
  { mssv: 'QE200243', name: 'Đặng Thị Bích Ngọc', gender: 'FEMALE', room: 'B201', compartment: 'B1', bed: 'G01', debt: 0, suspended: false, phone: '0905 678 912', citizenId: '075204032234', dob: '2004-02-17', hometown: 'Đồng Nai', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Đặng Thị Thu', parentPhone: '0905 789 012' },
  { mssv: 'QE200269', name: 'Bùi Thị Hồng Nhung', gender: 'FEMALE', room: 'B201', compartment: 'B1', bed: 'G02', debt: 0, suspended: false, phone: '0977 234 568', citizenId: '079204035567', dob: '2004-08-30', hometown: 'TP. Hồ Chí Minh', major: 'Thiết kế Đồ họa', cohort: 'K19 - Khóa 2023-2027', parentName: 'Bùi Văn Minh', parentPhone: '0977 890 123' },
  { mssv: 'QE200118', name: 'Ngô Thị Yến Nhi', gender: 'FEMALE', room: 'B202', compartment: 'D1', bed: 'G04', debt: 0, suspended: false, phone: '0943 345 678', citizenId: '031204038890', dob: '2004-12-03', hometown: 'Hải Phòng', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Ngô Thị Hạnh', parentPhone: '0944 567 890' },
  { mssv: 'QE200155', name: 'Đỗ Thị Thanh Tâm', gender: 'FEMALE', room: 'B202', compartment: 'D1', bed: 'G05', debt: 0, suspended: false, phone: '0938 456 712', citizenId: '079204041123', dob: '2004-04-26', hometown: 'TP. Hồ Chí Minh', major: 'Khoa học Máy tính', cohort: 'K19 - Khóa 2023-2027', parentName: 'Đỗ Văn Quang', parentPhone: '0938 678 901' },
  { mssv: 'QE200227', name: 'Dương Thị Minh Châu', gender: 'FEMALE', room: 'B301', compartment: 'A1', bed: 'G03', debt: 0, suspended: false, phone: '0934 678 923', citizenId: '052204044456', dob: '2004-06-11', hometown: 'Đà Nẵng', major: 'An toàn thông tin', cohort: 'K19 - Khóa 2023-2027', parentName: 'Dương Thị Kim', parentPhone: '0934 789 012' },
  { mssv: 'QE200294', name: 'Trịnh Thị Ánh Tuyết', gender: 'FEMALE', room: 'B401', compartment: 'B1', bed: 'G02', debt: 1650000, suspended: true, phone: '0988 123 467', citizenId: '038204047789', dob: '2003-10-22', hometown: 'Thanh Hóa', major: 'Thiết kế Đồ họa', cohort: 'K18 - Khóa 2022-2026', parentName: 'Trịnh Văn Lâm', parentPhone: '0988 234 578' },
  { mssv: 'QE200178', name: 'Lý Thị Mỹ Duyên', gender: 'FEMALE', room: 'B503', compartment: 'C1', bed: 'G06', debt: 0, suspended: false, phone: '0982 567 834', citizenId: '056204053012', dob: '2004-09-16', hometown: 'Khánh Hòa', major: 'Kỹ thuật Phần mềm', cohort: 'K19 - Khóa 2023-2027', parentName: 'Lý Văn Phúc', parentPhone: '0983 678 901' },
];

const STAFF = [
  {
    id: 'usr_manager_01', staffId: 'MGR-004', name: 'Thầy Vũ Thành Nam', email: 'namvt@fpt.edu.vn',
    role: 'MANAGER', phone: '0988 765 432', citizenId: '001082001924', dob: '1982-11-20',
    gender: 'MALE', hometown: 'Hà Nội', joinedDate: '2020-03-15',
    department: 'Phòng Quản lý KTX & Công tác Sinh viên (CTSV)',
    emergencyContact: { parentName: 'Vũ Đình Khiêm', relationship: 'Thân nhân', phone: '0912 999 888', address: 'Khu Đô thị FPT City, Đà Nẵng' },
  },
  {
    id: 'usr_tech_01', staffId: 'SEC-012', name: 'Chú Đỗ Mạnh Hùng', email: 'hungbv.guard@fe.edu.vn',
    role: 'TECHNICIAN', phone: '0977 112 233', citizenId: '034076008123', dob: '1976-08-10',
    gender: 'MALE', hometown: 'Đà Nẵng', joinedDate: '2021-08-01',
    department: 'Tổ An ninh Bảo vệ & Bảo trì Cơ sở vật chất',
    emergencyContact: { parentName: 'Đỗ Thị Mai', relationship: 'Vợ', phone: '0905 556 677', address: 'Đường Nam Kỳ Khởi Nghĩa, Đà Nẵng' },
  },
  {
    id: 'usr_admin_01', staffId: 'ADM-001', name: 'Ban Quản trị Hệ thống DMS', email: 'admin.dms@fpt.edu.vn',
    role: 'ADMIN', phone: '0236 730 0999', citizenId: '048090001234', dob: '1990-01-01',
    gender: 'MALE', hometown: 'Đà Nẵng', joinedDate: '2019-01-01',
    department: 'Trung tâm Hệ thống Thông tin (IT Center FPT)',
    emergencyContact: { parentName: 'Hotline Kỹ thuật CNTT', relationship: 'Tổng đài FPT', phone: '1900 6600', address: 'Tòa nhà FPT Complex, Đà Nẵng' },
  },
];

const db = {
  users: [], buildings: [], floors: [], rooms: [], compartments: [], beds: [],
  configs: [], bookings: [], contracts: [], utilityRecords: [], invoices: [],
  tickets: [], visitors: [], notices: [], marketplace: [], lostFound: [],
  curfewRequests: [], gateLogs: [], disciplineRecords: [], demeritSummaries: [],
};

/* 1. Configs — khớp hằng số dorm-ops để backend tính y hệt frontend */
db.configs.push({
  id: 'cfg_pricing',
  type: 'PRICING',
  electricityTiers: ELECTRICITY_TIERS,
  waterPricePerM3: WATER_PRICE_PER_M3,
  roomFeePerStudent: ROOM_FEE_PER_STUDENT,
  wifiFeeTotal: WIFI_FEE_TOTAL,
  cleaningFeeTotal: CLEANING_FEE_TOTAL,
  vat: VAT,
  curfewHour: CURFEW_HOUR,
  visitorLatestHour: VISITOR_LATEST_HOUR,
  defaultRoomSize: 4,      // 4 buồng / phòng
  defaultCompartmentSize: 6, // 6 giường / buồng
  depositAmount: 1000000,
});

/* 2. Users — shape UserProfile rút gọn + cờ auto-approval */
const studentByCode = new Map();
for (const s of STUDENTS) {
  const u = {
    id: `usr_${s.mssv.toLowerCase()}`,
    mssv: s.mssv,
    studentId: s.mssv,
    name: s.name,
    fullName: s.name,
    email: `${s.mssv.toLowerCase()}@gmail.com`,
    phone: s.phone,
    gender: s.gender,
    role: 'STUDENT',
    status: 'ACTIVE',
    citizenId: s.citizenId,
    dob: s.dob,
    hometown: s.hometown,
    major: s.major,
    cohort: s.cohort,
    joinedDate: '2024-09-01',
    room: s.room,
    compartment: s.compartment,
    bedCode: `${s.room}-${s.compartment}-${s.bed}`,
    previousDebt: s.debt,
    isSuspended: s.suspended,
    emergencyContact: {
      parentName: s.parentName,
      relationship: 'Phụ huynh',
      phone: s.parentPhone,
      address: s.hometown,
    },
  };
  db.users.push(u);
  studentByCode.set(s.mssv, u);
}
for (const st of STAFF) {
  db.users.push({
    id: st.id, staffId: st.staffId, name: st.name, fullName: st.name,
    email: st.email, role: st.role, status: 'ACTIVE', phone: st.phone,
    citizenId: st.citizenId, dob: st.dob, gender: st.gender, hometown: st.hometown,
    joinedDate: st.joinedDate, department: st.department,
    emergencyContact: st.emergencyContact,
    previousDebt: 0, isSuspended: false,
  });
}

/* 3. Tòa / tầng / phòng / buồng / giường — 1:4:6 cho cả 2 tòa
 *    Tòa A (Nam) mã phòng A101..A506, Tòa B (Nữ) mã phòng B101..B506.
 *    Bộ đếm id chạy LIÊN TỤC qua các tòa (f1..f10, r1..r60, c1..c240,
 *    bed1..bed1440) nên id không thể trùng giữa 2 tòa. */
const BUILDINGS = [
  { id: 'b1', name: 'Tòa A', genderType: 'MALE', roomPrefix: 'A' },
  { id: 'b2', name: 'Tòa B', genderType: 'FEMALE', roomPrefix: 'B' },
];
const COMP_NAMES = ['A', 'B', 'C', 'D'];
const FLOORS_PER_BUILDING = 5;
const ROOMS_PER_FLOOR = 6;
const BEDS_PER_COMPARTMENT = 6;

let fId = 1, rId = 1, cId = 1, bId = 1;
/* Thống kê thật theo từng tòa để in ở dòng tổng kết cuối file. */
const buildingStats = new Map();

for (const building of BUILDINGS) {
  const buildingId = building.id;
  db.buildings.push({
    id: buildingId,
    name: building.name,
    genderType: building.genderType,
    totalFloors: FLOORS_PER_BUILDING,
  });
  const stats = { floors: 0, rooms: 0, compartments: 0, beds: 0, occupied: 0 };
  buildingStats.set(buildingId, stats);

  for (let floor = 1; floor <= FLOORS_PER_BUILDING; floor++) {
    const floorId = `f${fId++}`;
    db.floors.push({ id: floorId, buildingId, level: floor });
    stats.floors += 1;

    for (let r = 1; r <= ROOMS_PER_FLOOR; r++) { // 6 phòng/tầng: A201..A206, B201..B206
      const roomId = `r${rId++}`;
      const roomName = `${building.roomPrefix}${floor}0${r}`;
      db.rooms.push({ id: roomId, floorId, name: roomName, status: 'ACTIVE' });
      stats.rooms += 1;

      for (const comp of COMP_NAMES) {
        const compId = `c${cId++}`;
        const compName = `${comp}1`;
        db.compartments.push({ id: compId, roomId, name: compName, roomName });
        stats.compartments += 1;

        for (let g = 1; g <= BEDS_PER_COMPARTMENT; g++) {
          const bedName = `G${String(g).padStart(2, '0')}`;
          const occupant = STUDENTS.find(
            (s) => s.room === roomName && s.compartment === compName && s.bed === bedName,
          );
          db.beds.push({
            id: `bed${bId++}`,
            compartmentId: compId,
            roomName,
            compartmentName: compName,
            name: bedName,
            fullCode: `${roomName}-${compName}-${bedName}`,
            status: occupant ? 'OCCUPIED' : 'AVAILABLE',
            studentId: occupant ? `usr_${occupant.mssv.toLowerCase()}` : null,
            tier: g % 2 === 1 ? 'lower' : 'upper',
            price: ROOM_FEE_PER_STUDENT,
          });
          stats.beds += 1;
          if (occupant) stats.occupied += 1;
        }
      }
    }
  }
}

/* 4. Hóa đơn tháng 09/2026 phòng A205 — khớp buildMonthlyInvoice */
function calculateTieredElectricity(kwh) {
  let remaining = Math.max(0, Math.floor(kwh));
  let total = 0;
  let prevCap = 0;
  for (const tier of ELECTRICITY_TIERS) {
    const cap = tier.upToKwh === null ? Infinity : tier.upToKwh;
    const usable = Math.min(remaining, cap - prevCap);
    if (usable > 0) { total += usable * tier.pricePerKwh; remaining -= usable; }
    prevCap = cap;
    if (remaining <= 0) break;
  }
  return total;
}

const A205_STUDENTS = STUDENTS.filter((s) => s.room === 'A205');
const elecOld = 12450, elecNew = 12620, waterOld = 840, waterNew = 854;
const deltaElec = elecNew - elecOld;
const deltaWater = waterNew - waterOld;
const elecCost = calculateTieredElectricity(deltaElec);
const waterCost = deltaWater * WATER_PRICE_PER_M3;
const sharedFees = WIFI_FEE_TOTAL + CLEANING_FEE_TOTAL;
const utilityTotal = elecCost + waterCost + sharedFees;
const perStudentUtility = Math.round(utilityTotal / A205_STUDENTS.length);
const perStudentTotal = perStudentUtility + ROOM_FEE_PER_STUDENT;
const utilityRecord = {
  id: 'util_a205_2026_09', room: 'A205', month: '2026-09',
  elecOld, elecNew, waterOld, waterNew,
  meterPhotoIds: [], recordedBy: 'usr_tech_01',
  recordedAt: '2026-09-26 09:30',
};
db.utilityRecords.push(utilityRecord);
db.invoices.push({
  id: 'INV-2026-09-A205', invoiceCode: 'INV-2026-09-A205', room: 'A205', month: '2026-09',
  utilityRecordId: utilityRecord.id,
  deltaElec, deltaWater, elecCost, waterCost, sharedFees,
  roomTotal: ROOM_FEE_PER_STUDENT * A205_STUDENTS.length,
  grandTotal: utilityTotal + ROOM_FEE_PER_STUDENT * A205_STUDENTS.length,
  perStudentUtility, perStudentTotal, numStudents: A205_STUDENTS.length,
  vat: VAT, status: 'ISSUED', dueDate: '2026-10-05', issuedAt: '2026-09-28 10:00',
  studentIds: A205_STUDENTS.map((s) => s.mssv),
  vietQrContent: `DIENNUOC_A205_${A205_STUDENTS[0].mssv}`,
});
// Hóa đơn quá hạn cho 2 SV nợ
for (const code of ['QE200309', 'QE200062']) {
  const u = studentByCode.get(code);
  db.invoices.push({
    id: `INV-OVERDUE-${code}`, invoiceCode: `INV-2026-08-${code.slice(-3)}`,
    room: u.room, month: '2026-08', perStudentTotal: u.previousDebt,
    perStudentUtility: u.previousDebt - ROOM_FEE_PER_STUDENT > 0 ? u.previousDebt - ROOM_FEE_PER_STUDENT : 0,
    numStudents: 4, status: 'OVERDUE', dueDate: '2026-09-05',
    studentIds: [code],
  });
}

/* 4b. Công tơ + hóa đơn cho MỌI phòng đang có người ở.
 *
 * Trước đây chỉ phòng A205 (và A206) có chỉ số, nên bảng điện nước và biểu đồ
 * tiêu thụ của các phòng còn lại trống — kể cả toàn bộ Tòa B. Nay mỗi phòng có
 * người ở đều có một bản ghi công tơ tháng 09/2026 và một hóa đơn tương ứng,
 * tính đúng bằng công thức bậc thang ở trên (không nhập tay số tiền).
 *
 * Chỉ số được suy ra một cách tất định từ tên phòng để chạy lại script luôn ra
 * cùng kết quả: phòng ở tầng cao dùng nhiều hơn (nắng nóng), phòng góc (số phòng
 * 01 và 06) dùng ít hơn một chút. Mức tiêu thụ nằm trong khoảng thực tế của KTX.
 */
const ROOM_CONSUMPTION_BASE = { elec: 150, water: 12 }; // kWh và m³ mỗi tháng
const occupiedRooms = [...new Set(db.beds.filter((b) => b.status === 'OCCUPIED').map((b) => b.roomName))].sort();

for (const room of occupiedRooms) {
  // Bỏ qua phòng đã có công tơ ở khối trên để không ghi trùng.
  if (db.utilityRecords.some((u) => u.room === room && u.month === '2026-09')) continue;

  const floor = Number(room.slice(1, 2));       // A205 -> 2
  const roomNo = Number(room.slice(2));         // A205 -> 05
  const isCorner = roomNo === 1 || roomNo === 6; // phòng góc thoáng hơn
  const occCount = db.beds.filter((b) => b.roomName === room && b.status === 'OCCUPIED').length;

  // Tầng cao dùng nhiều hơn; phòng góc bớt ~6%; nhiều người thì tăng nhẹ.
  const elecDelta = Math.round(
    ROOM_CONSUMPTION_BASE.elec * (0.85 + floor * 0.08) * (isCorner ? 0.94 : 1) + occCount * 3,
  );
  const waterDelta = Math.round(
    ROOM_CONSUMPTION_BASE.water * (0.9 + occCount * 0.06) * (isCorner ? 0.95 : 1),
  );

  const eOld = 10000 + floor * 500 + roomNo * 10;
  const wOld = 500 + floor * 40 + roomNo * 2;

  const uRec = {
    id: `util_${room.toLowerCase()}_2026_09`,
    room,
    month: '2026-09',
    elecOld: eOld,
    elecNew: eOld + elecDelta,
    waterOld: wOld,
    waterNew: wOld + waterDelta,
    meterPhotoIds: [],
    recordedBy: 'usr_tech_01',
    recordedAt: '2026-09-26 09:30',
  };
  db.utilityRecords.push(uRec);

  const eCost = calculateTieredElectricity(elecDelta);
  const wCost = waterDelta * WATER_PRICE_PER_M3;
  const shared = WIFI_FEE_TOTAL + CLEANING_FEE_TOTAL;
  const util = eCost + wCost + shared;
  const n = Math.max(1, occCount);
  const perUtil = Math.round(util / n);

  db.invoices.push({
    id: `INV-2026-09-${room}`,
    invoiceCode: `INV-2026-09-${room}`,
    room,
    month: '2026-09',
    utilityRecordId: uRec.id,
    deltaElec: elecDelta,
    deltaWater: waterDelta,
    elecCost: eCost,
    waterCost: wCost,
    sharedFees: shared,
    roomTotal: ROOM_FEE_PER_STUDENT * n,
    grandTotal: util + ROOM_FEE_PER_STUDENT * n,
    perStudentUtility: perUtil,
    perStudentTotal: perUtil + ROOM_FEE_PER_STUDENT,
    numStudents: n,
    vat: VAT,
    status: 'ISSUED',
    dueDate: '2026-10-05',
    issuedAt: '2026-09-28 10:00',
    studentIds: db.beds
      .filter((b) => b.roomName === room && b.status === 'OCCUPIED' && b.studentId)
      .map((b) => (studentByCode.get(b.studentId.replace('usr_', '').toUpperCase()) || {}).mssv || b.studentId),
    vietQrContent: `DIENNUOC_${room}_${room}`,
  });
}

/* 5. Tickets báo hỏng — shape MaintenanceTicket */
db.tickets.push(
  {
    id: 'TKT-2026-001', title: 'Chập ổ cắm điện đầu giường và có mùi khét',
    scope: 'COMPARTMENT_PRIVATE', building: 'Tòa A', room: 'A205',
    compartment: 'B1', bedCode: 'A205-B1-G03', category: 'ELECTRIC', urgency: 'EMERGENCY',
    description: 'Ổ cắm 220V cạnh giường G03 lỏng chân, cắm sạc phát tia lửa và mùi khét. Đã ngắt cầu dao buồng B1.',
    studentId: 'QE200001', studentName: 'Nguyễn Hoàng Vinh', studentPhone: '0912 345 678',
    evidenceImages: [], status: 'RESOLVED', createdAt: '2026-10-10 08:30',
    assignedTechnician: { id: 'usr_tech_01', name: 'Chú Đỗ Mạnh Hùng', phone: '0977 112 233', assignedAt: '2026-10-10 09:15', etaMinutes: 45 },
    resolution: {
      completedAt: '2026-10-10 10:40',
      technicianNotes: 'Thay mặt che và đế âm Sino 16A chống cháy, đo điện áp 224V ổn định.',
      completionImages: [],
      materials: [
        { id: 'mat_01', name: 'Ổ cắm đôi Sino 16A 3 chấu', quantity: 1, unitCost: 65000, paidBy: 'DORMITORY' },
        { id: 'mat_02', name: 'Băng keo cách điện 3M', quantity: 1, unitCost: 15000, paidBy: 'DORMITORY' },
      ],
      totalMaterialCost: 80000,
    },
  },
  {
    id: 'TKT-2026-002', title: 'Vỡ vòi sen nhà tắm số 2 gây ngập sàn',
    scope: 'ROOM_SHARED', building: 'Tòa A', room: 'A205',
    category: 'PLUMBING', urgency: 'EMERGENCY',
    description: 'Dây cấp nước vòi sen bục đầu nối ren, nước tràn ra hành lang. Đã khóa van tổng tạm.',
    studentId: 'QE200047', studentName: 'Trần Thanh Nguyên', studentPhone: '0905 111 222',
    evidenceImages: [], status: 'IN_PROGRESS', createdAt: '2026-10-10 14:10',
    assignedTechnician: { id: 'usr_tech_01', name: 'Chú Đỗ Mạnh Hùng', phone: '0977 112 233', assignedAt: '2026-10-10 14:30', etaMinutes: 30 },
  },
  {
    id: 'TKT-2026-003', title: 'Bóng đèn LED ban công A205 nhấp nháy',
    scope: 'ROOM_SHARED', building: 'Tòa A', room: 'A205',
    category: 'ELECTRIC', urgency: 'NORMAL',
    description: 'Bóng tuýp LED 1.2m ngoài ban công chập chờn, sáng yếu và kêu rè rè.',
    studentId: 'QE200123', studentName: 'Văn Thái Trung', studentPhone: '0934 999 888',
    evidenceImages: [], status: 'PENDING', createdAt: '2026-10-10 16:00',
  },
  {
    id: 'TKT-2026-004', title: 'Điều hòa buồng C2 không mát và chảy nước',
    scope: 'COMPARTMENT_PRIVATE', building: 'Tòa A', room: 'A205',
    compartment: 'C1', bedCode: 'A205-C1-G13', category: 'HVAC', urgency: 'NORMAL',
    description: 'Điều hòa Daikin 12000BTU bật 18 độ chỉ ra gió, máng ngưng tụ tắc tràn nước xuống sàn.',
    studentId: 'QE200286', studentName: 'Huỳnh Gia Kim', studentPhone: '0982 777 666',
    evidenceImages: [], status: 'CLOSED', createdAt: '2026-10-08 09:00',
    assignedTechnician: { id: 'usr_tech_01', name: 'Chú Đỗ Mạnh Hùng', phone: '0977 112 233', assignedAt: '2026-10-08 10:00', etaMinutes: 60 },
    resolution: {
      completedAt: '2026-10-08 11:30',
      technicianNotes: 'Vệ sinh lưới lọc, thông ống ngưng tụ, áp suất ga R32 đạt 140 PSI.',
      completionImages: [],
      materials: [{ id: 'mat_ac_01', name: 'Vệ sinh dàn lạnh', quantity: 1, unitCost: 150000, paidBy: 'DORMITORY' }],
      totalMaterialCost: 150000,
    },
    review: { rating: 5, reviewedAt: '2026-10-08 14:20', comment: 'Chú Hùng làm nhanh, dọn sạch sau khi xịt máy.', isSatisfied: true },
  },
);

/* 6. Khách thăm — không thời lượng, rời trước 21:00, không qua đêm */
db.visitors.push({
  id: 'VST-100001', studentId: 'QE200001', fullName: 'Nguyễn Văn Hùng',
  citizenId: '079204018293', visitDate: '2026-10-15', expectedMinutes: 0,
  status: 'PRE_REGISTERED', checkInAt: null, checkOutAt: null,
});

/* 7. Bảng tin */
db.notices.push(
  { id: 'NTC-SEED-1', title: 'Cắt điện bảo trì Tòa A', body: '8:00–10:00 ngày 15/10 bảo trì trạm điện. Sinh viên sạc dự phòng.', audience: 'BUILDING', startsAt: '2026-10-01', endsAt: '2026-10-31' },
  { id: 'NTC-SEED-2', title: 'Hóa đơn tháng 09 đã phát hành', body: 'Kiểm tra Billing và thanh toán VietQR trước 05/10.', audience: 'ALL', startsAt: '2026-10-01', endsAt: '2026-10-31' },
);

/* 8. Chợ & thất lạc */
db.marketplace.push({
  id: 'MKT-100001', sellerId: 'QE200001', title: 'Quạt cây cũ còn tốt',
  price: 150000, category: 'DO_CU', photoIds: [], status: 'ACTIVE',
});
db.lostFound.push({
  id: 'LAF-100001', reporterId: 'QE200047', kind: 'LOST',
  item: 'Ví da màu đen', location: 'Khu sân A', photoIds: [], status: 'OPEN',
});

/* 9. Giới nghiêm — đơn, log cổng, kỷ luật, điểm rèn luyện */
db.curfewRequests.push(
  {
    id: 'REQ-2026-089', studentId: 'QE200001', studentName: 'Nguyễn Hoàng Vinh', room: 'A205', phone: '0912 345 678',
    requestType: 'LATE_RETURN', date: '2026-10-10', expectedReturnTime: '23:45',
    reasonCategory: 'STUDY', reasonDetail: 'Họp nhóm hoàn thiện đồ án Capstone tại Thư viện Alpha.',
    parentPhone: '0903 123 456', parentConfirmed: true, submittedAt: '2026-10-10 18:20',
    isSubmittedBefore2100: true, status: 'APPROVED',
    reviewedBy: 'Thầy Vũ Thành Nam', reviewedAt: '2026-10-10 19:10',
    reviewNotes: 'Đã xác nhận lý do học tập và gọi phụ huynh.',
  },
  {
    id: 'REQ-2026-091', studentId: 'QE200286', studentName: 'Huỳnh Gia Kim', room: 'A205', phone: '0982 777 666',
    requestType: 'LATE_RETURN', date: '2026-10-10', expectedReturnTime: '00:30',
    reasonCategory: 'PART_TIME_JOB', reasonDetail: 'Tăng ca kiểm kê tại F-Mart đến 23:30.',
    parentPhone: '0983 456 789', parentConfirmed: false, submittedAt: '2026-10-10 21:40',
    isSubmittedBefore2100: false, status: 'PENDING',
  },
);
db.gateLogs.push(
  { id: 'LOG-101', studentId: 'QE200001', studentName: 'Nguyễn Hoàng Vinh', room: 'A205', timestamp: '2026-10-10T23:38:15', scanTimeFormatted: '23:38:15', curfewStatus: 'APPROVED_LATE', matchedRequestId: 'REQ-2026-089', guardNotes: 'Có đơn duyệt hợp lệ.', guardName: 'Chú Đỗ Mạnh Hùng' },
  { id: 'LOG-102', studentId: 'QE200158', studentName: 'Lê Minh Tuấn', room: 'A204', timestamp: '2026-10-10T23:45:20', scanTimeFormatted: '23:45:20', curfewStatus: 'UNAUTHORIZED_LATE', penaltyPointsDeducted: 10, guardNotes: 'Về muộn không có đơn.', guardName: 'Chú Đỗ Mạnh Hùng' },
  { id: 'LOG-103', studentId: 'QE200094', studentName: 'Phạm Quốc Bảo', room: 'A203', timestamp: '2026-10-10T22:45:00', scanTimeFormatted: '22:45:00', curfewStatus: 'ON_TIME', guardNotes: 'Về trước 23:00.', guardName: 'Chú Đỗ Mạnh Hùng' },
);
db.disciplineRecords.push({
  id: 'VIO-2026-001', studentId: 'QE200158', studentName: 'Lê Minh Tuấn', room: 'A204', date: '2026-10-10',
  infractionType: 'CURFEW_VIOLATION', infractionTitle: 'Vi phạm giờ giới nghiêm 23:00 không phép',
  pointsDeducted: 10, description: 'Quét cổng 23:45 không có đơn xin phép.', officerName: 'Chú Đỗ Mạnh Hùng', status: 'RECORDED',
});
db.demeritSummaries.push(
  { studentId: 'QE200001', studentName: 'Nguyễn Hoàng Vinh', room: 'A205', initialPoints: 100, totalDeducted: 0, remainingPoints: 100, status: 'NORMAL', violationCount: 0 },
  { studentId: 'QE200158', studentName: 'Lê Minh Tuấn', room: 'A204', initialPoints: 100, totalDeducted: 10, remainingPoints: 90, status: 'NORMAL', violationCount: 1 },
  { studentId: 'QE200062', studentName: 'Hoàng Gia Huy', room: 'A104', initialPoints: 100, totalDeducted: 35, remainingPoints: 65, status: 'SUSPENDED', violationCount: 3 },
);

const outputPath = path.join(__dirname, '../db.json');
fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));

/* 10. Tổng kết — số liệu lấy trực tiếp từ db vừa ghi, kèm chi tiết từng tòa */
const studentUsers = db.users.filter((u) => u.role === 'STUDENT');
const maleCount = studentUsers.filter((u) => u.gender === 'MALE').length;
const femaleCount = studentUsers.filter((u) => u.gender === 'FEMALE').length;
const perBuilding = BUILDINGS.map((b) => {
  const s = buildingStats.get(b.id);
  return `${b.name} (${b.id}/${b.genderType}): ${s.rooms} phòng, ${s.compartments} buồng, ` +
    `${s.beds} giường (${s.occupied} đang ở), ${s.floors} tầng`;
}).join(' | ');

console.log(
  `db.json ok: ${db.users.length} users (${studentUsers.length} SV: ${maleCount} nam / ${femaleCount} nữ), ` +
  `${db.buildings.length} tòa, ${db.floors.length} tầng, ${db.rooms.length} rooms, ` +
  `${db.compartments.length} compartments, ${db.beds.length} beds ` +
  `(${db.beds.filter((b) => b.status === 'OCCUPIED').length} occupied), ` +
  `${db.tickets.length} tickets, ${db.invoices.length} invoices`,
);
console.log(`  Theo tòa: ${perBuilding}`);
