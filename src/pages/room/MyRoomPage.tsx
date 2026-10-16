import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import { computeCheckoutSettlement, createRoomSwitchRequest, type DamageItem } from "@/lib/dorm-ops"
import { DoorClosed, FileText, Receipt, Wrench, LogOut, Users, CircleCheck, SquareCheck, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
export const MyRoomPage: React.FC = () => {
  const { user } = useAuth()
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [toRoom, setToRoom] = useState("A202")
  const [switchReason, setSwitchReason] = useState("")
  const [switchMsg, setSwitchMsg] = useState<string | null>(null)
  const [damages] = useState<DamageItem[]>([{ name: "Vòi sen rò rỉ", cost: 250000 }])
  const settlement = computeCheckoutSettlement(1000000, damages, 0)

  const roommates = [
    {
      name: "Nguyễn Hoàng Vinh",
      mssv: user?.studentId || "QE200001",
      bed: "B-G03 tầng dưới",
      major: "Kỹ thuật phần mềm",
      phone: "0912 345 678",
      dutyDay: "Thứ Hai & Thứ Năm",
      isMe: true,
    },
    {
      name: "Trần Công Tiến",
      mssv: "QE200062",
      bed: "B-G01 tầng dưới",
      major: "Thiết kế Đồ họa",
      phone: "0934 112 233",
      dutyDay: "Thứ Ba & Thứ Sáu",
      isMe: false,
    },
    {
      name: "Văn Thái Trung",
      mssv: "QE200297",
      bed: "B-G04 tầng trên",
      major: "Khoa học Máy tính",
      phone: "0977 445 566",
      dutyDay: "Thứ Tư & Thứ Bảy",
      isMe: false,
    },
    {
      name: "Đinh Thanh Trung",
      mssv: "QE200204",
      bed: "B-G05 tầng dưới",
      major: "An toàn thông tin",
      phone: "0988 990 011",
      dutyDay: "Chủ nhật tổng vệ sinh",
      isMe: false,
    },
  ]

  const inventoryItems = [
    { name: "Khung giường tầng & Thang leo", status: "Tốt", checked: true, note: "Chắc chắn, không rỉ sét" },
    { name: "Đệm Foam Orthopedic 1.0m x 2.0m", status: "Tốt", checked: true, note: "Bọc ga mới nguyên vẹn" },
    { name: "Bàn học & Giá sách cá nhân", status: "Tốt", checked: true, note: "Đèn bàn LED cảm ứng hoạt động" },
    { name: "Tủ Locker cá nhân kèm khóa số", status: "Tốt", checked: true, note: "Đã reset mã PIN mặc định" },
    { name: "Thẻ từ ra vào phòng A205", status: "Đã cấp", checked: true, note: "Quẹt nhận phòng ngày 05/09" },
    { name: "Điều hòa Inverter Daikin 2HP", status: "Tốt", checked: true, note: "Remote để tại giá treo cửa" },
  ]

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 01. TOP UNIT SUMMARY & OPERATIONAL ACTION BAR */}
      <div className="dms-card p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
            <DoorClosed className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-primary dark:text-primary tracking-tight">
                Phòng A205
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted/70">
                Khu A · Tầng 2
              </span>
              <Badge variant="success" dot>
                Đang lưu trú
              </Badge>
              <Badge variant="secondary">Sinh viên Chính quy K19</Badge>
            </div>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-foreground">Buồng B</span>
              <span>•</span>
              <span className="font-semibold text-primary dark:text-primary">Giường G03 tầng dưới</span>
              <span>•</span>
              <span>Học kỳ 1 năm học 2026–2027, hết hạn 15/01/2027</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => alert("Đang mở bản xem trước hợp đồng điện tử...")}
            className="text-xs h-9 gap-1.5 bg-muted/70 whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span>Hợp đồng</span>
          </Button>

          <Link to="/billing">
            <Button
              variant="outline"
              className="text-xs h-9 gap-1.5 bg-muted/70 whitespace-nowrap shrink-0"
            >
              <Receipt className="h-4 w-4 text-primary shrink-0" />
              <span>Hóa Đơn Điện Nước</span>
            </Button>
          </Link>

          <Link to="/maintenance">
            <Button className="text-xs h-9 gap-1.5 bg-primary text-white whitespace-nowrap shrink-0">
              <Wrench className="h-4 w-4 shrink-0" />
              <span>Báo Hỏng / Sửa Chữa</span>
            </Button>
          </Link>

          <Button
            onClick={() => setShowSwitchModal(true)}
            variant="outline"
            className="text-xs h-9 gap-1.5 whitespace-nowrap shrink-0"
          >
            <DoorClosed className="h-4 w-4 shrink-0" />
            <span>Yêu Cầu Đổi Phòng</span>
          </Button>

          <Button
            onClick={() => setShowCheckoutModal(true)}
            className="text-xs h-9 gap-1.5 bg-danger-soft hover:bg-danger-soft text-danger-soft-foreground whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Yêu Cầu Trả Phòng</span>
          </Button>
        </div>
      </div>

      {/* 02. ARCHITECTURAL BLUEPRINT MINI COMPARTMENT VISUALIZER */}
      <div className="dms-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div>
            <h2 className="font-bold text-sm text-foreground">
              Sơ đồ phòng A205
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Vị trí giường của bạn và các bạn cùng phòng theo kiến trúc tiêu chuẩn
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
              <strong className="text-primary dark:text-primary">Giường của bạn B-G03</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-muted"></span>
              <span>Đã có người ở</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-success"></span>
              <span>Còn trống</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Buồng A", "Buồng B của bạn", "Buồng C", "Buồng D"].map((comp, idx) => {
            const isMyComp = idx === 1
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isMyComp
                    ? "bg-primary/5 border-primary ring-1 ring-primary"
                    : "bg-muted/70 border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-foreground whitespace-nowrap truncate">{comp}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap shrink-0">
                    {idx === 1 ? "4/6 Đang ở" : "6/6 Đầy"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                  {[1, 2, 3, 4, 5, 6].map((g) => {
                    const isMyBed = isMyComp && g === 3
                    return (
                      <div
                        key={g}
                        className={`p-1.5 rounded-md font-bold ${
                          isMyBed
                            ? "bg-primary text-white shadow-xs"
                            : isMyComp && g === 2
                            ? "bg-primary-soft text-primary-soft-foreground"
                            : isMyComp && g === 6
                            ? "bg-success-soft text-success-soft-foreground"
                            : "bg-card border border-border text-muted-foreground"
                        }`}
                      >
                        G0{g}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 03. TWO-COLUMN: ROOMMATES ROSTER & DIGITAL HANDOVER CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ROOMMATES ROSTER (7 COLS) */}
        <div className="lg:col-span-7 dms-card flex h-full flex-col p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Bạn cùng buồng B
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Thông tin liên hệ & Lịch trực nhật vệ sinh buồng cá nhân
                </p>
              </div>
            </div>
            <Badge variant="success">4 thành viên</Badge>
          </div>

          <div className="space-y-3">
            {roommates.map((rm, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  rm.isMe
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-muted/70 border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={rm.name} className="h-12 w-12 text-xs" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{rm.name}</span>
                      {rm.isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary text-white font-semibold">
                          Bạn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      MSSV: <strong className="font-mono">{rm.mssv}</strong> • Giường:{" "}
                      <strong className="text-primary dark:text-primary">{rm.bed}</strong>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{rm.major}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-border text-xs shrink-0">
                  <span className="text-[11px] font-semibold text-success-soft-foreground bg-success-soft px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                    Trực nhật: {rm.dutyDay}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground mt-1 whitespace-nowrap">
                    {rm.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danh mục bàn giao thiết bị */}
        <div className="lg:col-span-5 dms-card flex h-full flex-col p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-success-soft text-success-soft-foreground">
                <SquareCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Biên bản bàn giao thiết bị
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Nghiệm thu tài sản khi nhận phòng & hoàn cọc
                </p>
              </div>
            </div>
            <Badge variant="success">Đã Ký Số</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            {inventoryItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-muted/70 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 text-success-soft-foreground shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.note}</span>
                  </div>
                </div>
                <Badge variant="success">{item.status}</Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              onClick={() => setShowHandoverModal(true)}
              variant="outline"
              className="w-full text-xs font-semibold h-9 gap-2 border-border transition-all shadow-xs"
            >
              <FileText className="h-4 w-4 text-success-soft-foreground shrink-0" />
              <span className="whitespace-nowrap truncate">Xem biên bản nghiệm thu & ảnh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* HANDOVER DETAILS MODAL */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Biên Bản Bàn Giao & Hiện Trạng Thiết Bị Số Hóa
              </h3>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Biên bản được lập tự động vào ngày <strong>05/09/2026</strong> giữa Ban Quản lý KTX và sinh viên{" "}
                <strong>{user?.fullName || "Nguyễn Hoàng Vinh"}</strong>. Mọi tài sản hỏng hóc trong thời gian lưu trú cần báo ngay qua mục Báo Hỏng.
              </p>

              <div className="p-3 bg-muted/70 rounded-xl space-y-1 font-mono text-[11px]">
                <div>Mã biên bản: BB-2026-A205-0905</div>
                <div>Chỉ số điện ban đầu: 12,450 kWh</div>
                <div>Chỉ số nước ban đầu: 840 m³</div>
                <div>Tình trạng tiền cọc: 1,000,000 VNĐ đang giữ tại quỹ</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => alert("Đã tải biên bản bàn giao PDF!")}
                  className="flex-1 bg-primary text-white text-xs font-bold"
                >
                  Tải bản PDF có chữ ký số
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHandoverModal(false)}
                  className="text-xs"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal trả phòng */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Yêu cầu đổi phòng</h3>
              <button onClick={() => setShowSwitchModal(false)} className="text-muted-foreground hover:text-foreground text-sm"><X className="h-4 w-4" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                try {
                  const req = createRoomSwitchRequest(user?.studentId || "QE200001", "A205", toRoom, switchReason)
                  try {
                    const raw = localStorage.getItem("dms_room_switch_v1")
                    const list = raw ? JSON.parse(raw) : []
                    localStorage.setItem("dms_room_switch_v1", JSON.stringify([req, ...list]))
                  } catch {
                    // ignore
                  }
                  setSwitchMsg(`Đã gửi ${req.id}: A205 → ${req.toRoom}. BQL duyệt rồi cập nhật sơ đồ phòng.`)
                } catch (err) {
                  setSwitchMsg(err instanceof Error ? err.message : "Gửi thất bại")
                }
              }}
              className="space-y-3 text-xs"
            >
              <Input value={toRoom} onChange={(e) => setToRoom(e.target.value)} placeholder="Nhập mã phòng mới, ví dụ A202"  required />
              <Textarea value={switchReason} onChange={(e) => setSwitchReason(e.target.value)} placeholder="Lý do đổi phòng" rows={3}  />
              <Button type="submit" className="w-full">Gửi yêu cầu đổi phòng</Button>
            </form>
            {switchMsg && <p className="text-xs font-semibold text-success-soft-foreground">{switchMsg}</p>}
          </div>
        </div>
      )}

      {/* Modal trả phòng */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Trả phòng & quyết toán hoàn cọc
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Kiểm kê tài sản → trừ hư hỏng → hoàn cọc. Tạm tính từ hư hỏng đã ghi nhận:
              </p>
              <div className="rounded-xl bg-muted/50 p-3 font-mono text-[11px]">
                <div>Cọc giữ: {settlement.deposit.toLocaleString()}đ</div>
                <div>Hư hỏng: {settlement.damageTotal.toLocaleString()}đ</div>
                <div>Khấu trừ: {settlement.deduction.toLocaleString()}đ</div>
                <div className="font-bold">Hoàn lại: {settlement.refund.toLocaleString()}đ</div>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                <li>Cán bộ KTX sẽ kiểm tra hiện trạng thiết bị và chỉ số công tơ cuối cùng.</li>
                <li>Nếu không có hư hại, <strong>100% tiền cọc 1,000,000 VNĐ</strong> sẽ được hoàn trả tự động vào tài khoản ngân hàng của sinh viên trong 48 giờ.</li>
              </ul>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    alert("Yêu cầu trả phòng đã được gửi tới Ban Quản lý KTX!")
                    setShowCheckoutModal(false)
                  }}
                  className="flex-1 bg-danger hover:bg-danger text-white text-xs font-bold"
                >
                  Gửi Yêu Cầu Trả Phòng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
