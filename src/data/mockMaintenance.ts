import type { MaintenanceTicket } from "@/types/maintenance"

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: "TKT-2026-001",
    title: "Chập ổ cắm điện đầu giường và có mùi khét",
    scope: "COMPARTMENT_PRIVATE",
    building: "Tòa A (Nam)",
    room: "A205",
    compartment: "Buồng B",
    bedCode: "A205-B-G03",
    category: "ELECTRIC",
    urgency: "EMERGENCY",
    description:
      "Ổ cắm điện 220V cạnh giường G03 bị lỏng chân, khi cắm sạc laptop phát ra tia lửa điện và có mùi khét cách điện nhựa. Đã tạm ngắt cầu dao buồng B để phòng cháy.",
    studentId: "SE182049",
    studentName: "Nguyễn Hoàng Vinh",
    studentPhone: "0912 345 678",
    evidenceImages: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    ],
    status: "RESOLVED",
    createdAt: "2026-10-10 08:30",
    assignedTechnician: {
      id: "usr_tech_01",
      name: " Đỗ Mạnh Hùng",
      phone: "0977 112 233",
      assignedAt: "2026-10-10 09:15",
      etaMinutes: 45,
    },
    resolution: {
      completedAt: "2026-10-10 10:40",
      technicianNotes:
        "Đã ngắt nguồn an toàn, tháo cụm ổ cắm Sino cũ bị chảy đế nhựa. Thay mới mặt che và đế âm Sino âm tường 16A chống cháy. Siết chặt đầu nối và đo điện áp 224V ổn định.",
      completionImages: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
      ],
      materials: [
        {
          id: "mat_01",
          name: "Ổ cắm đôi Sino 16A 3 chấu chống cháy",
          quantity: 1,
          unitCost: 65000,
          paidBy: "DORMITORY",
        },
        {
          id: "mat_02",
          name: "Băng keo cách điện nano 3M",
          quantity: 1,
          unitCost: 15000,
          paidBy: "DORMITORY",
        },
      ],
      totalMaterialCost: 80000,
    },
    // Chưa đánh giá, để sinh viên có thể test chức năng đánh giá 1-5 sao!
  },
  {
    id: "TKT-2026-002",
    title: "Vỡ vòi sen nhà tắm số 2 gây ngập sàn phòng vệ sinh chung",
    scope: "ROOM_SHARED",
    building: "Tòa A (Nam)",
    room: "A205",
    category: "PLUMBING",
    urgency: "EMERGENCY",
    description:
      "Dây cấp nước vòi sen tắm bị bục đầu nối ren, nước phun mạnh làm tràn ra hành lang phòng vệ sinh chung. Đã khóa tạm van tổng góc phòng.",
    studentId: "SE182050",
    studentName: "Trần Thanh Nguyên",
    studentPhone: "0905 111 222",
    evidenceImages: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    ],
    status: "IN_PROGRESS",
    createdAt: "2026-10-10 14:10",
    assignedTechnician: {
      id: "usr_tech_01",
      name: " Đỗ Mạnh Hùng",
      phone: "0977 112 233",
      assignedAt: "2026-10-10 14:30",
      etaMinutes: 30,
    },
  },
  {
    id: "TKT-2026-003",
    title: "Bóng đèn LED chiếu sáng ban công phòng A205 bị nhấp nháy",
    scope: "ROOM_SHARED",
    building: "Tòa A (Nam)",
    room: "A205",
    category: "ELECTRIC",
    urgency: "NORMAL",
    description:
      "Bóng tuýp LED 1.2m ngoài ban công phơi đồ chập chờn từ tối qua, sáng yếu và phát tiếng rè rè liên tục.",
    studentId: "SE182051",
    studentName: "Văn Thái Trung",
    studentPhone: "0934 999 888",
    evidenceImages: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
    ],
    status: "PENDING",
    createdAt: "2026-10-10 16:00",
  },
  {
    id: "TKT-2026-004",
    title: "Điều hòa buồng C không mát và chảy nước vào khe giường",
    scope: "COMPARTMENT_PRIVATE",
    building: "Tòa A (Nam)",
    room: "A205",
    compartment: "Buồng C",
    bedCode: "A205-C-G02",
    category: "HVAC",
    urgency: "NORMAL",
    description:
      "Điều hòa Daikin 12000BTU bật 18 độ nhưng chỉ ra gió quạt không có hơi lạnh, máng xối ngưng tụ bị tắc tràn nước nhỏ giọt xuống sàn.",
    studentId: "SE182052",
    studentName: "Huỳnh Gia Kim",
    studentPhone: "0982 777 666",
    evidenceImages: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
    ],
    status: "CLOSED",
    createdAt: "2026-10-08 09:00",
    assignedTechnician: {
      id: "usr_tech_01",
      name: " Đỗ Mạnh Hùng",
      phone: "0977 112 233",
      assignedAt: "2026-10-08 10:00",
      etaMinutes: 60,
    },
    resolution: {
      completedAt: "2026-10-08 11:30",
      technicianNotes:
        "Vệ sinh lưới lọc bụi, xịt thông ống thoát nước ngưng tụ. Đo áp suất ga R32 đủ 140 PSI. Máy chạy mát sâu 22 độ bình thường.",
      completionImages: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      ],
      materials: [
        {
          id: "mat_ac_01",
          name: "Vệ sinh xịt rửa bảo dưỡng dàn lạnh",
          quantity: 1,
          unitCost: 150000,
          paidBy: "DORMITORY",
        },
      ],
      totalMaterialCost: 150000,
    },
    review: {
      rating: 5,
      reviewedAt: "2026-10-08 14:20",
      comment:
        " Hùng làm rất nhanh và nhiệt tình, dọn dẹp sạch sẽ sau khi xịt máy. Cảm ơn !",
      isSatisfied: true,
    },
  },
]
