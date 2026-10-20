import React, { useState } from "react"
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
    FileCheck2,
      Check,
  Sparkles,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import type { MaintenanceTicket, MaintenanceCategory } from "@/types/maintenance"

interface TechnicianBountyBoardProps {
  tickets: MaintenanceTicket[]
  onAccept: (ticket: MaintenanceTicket) => void
  onComplete: (ticket: MaintenanceTicket) => void
  onView: (ticket: MaintenanceTicket) => void
  technicianName?: string
  building?: string
}

const CATEGORY_MAP: Record<
  MaintenanceCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  ELECTRIC: { label: "Sự cố Điện", icon: Zap, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  PLUMBING: { label: "Cấp Thoát Nước", icon: Droplets, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  HVAC: { label: "Điều Hòa & Máy Lạnh", icon: Wind, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  FURNITURE: { label: "Cơ Khí / Giường Tủ", icon: Wrench, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  NETWORK: { label: "Mạng & Đường Dây", icon: Sparkles, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  OTHER: { label: "Thiết Bị Khác", icon: Wrench, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
}

export const TechnicianBountyBoard: React.FC<TechnicianBountyBoardProps> = ({
  tickets,
  onAccept,
  onComplete,
  onView,
  technicianName = "Đỗ Mạnh Hùng",
  building = "Tòa A",
}) => {
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "RESOLVED">("PENDING")
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  
  // Filter lists
  const pendingTickets = tickets.filter((t) => t.status === "PENDING")
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS")
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED")

  // Calculate review stats
  const reviewedTickets = tickets.filter((t) => t.review && t.review.rating > 0)
  const averageRating =
    reviewedTickets.length > 0
      ? (
          reviewedTickets.reduce((acc, t) => acc + (t.review?.rating || 5), 0) /
          reviewedTickets.length
        ).toFixed(1)
      : "4.9"

  const currentList =
    activeTab === "PENDING"
      ? pendingTickets
      : activeTab === "IN_PROGRESS"
        ? inProgressTickets
        : resolvedTickets

  return (
    <div className="space-y-6">
      {/* 01. TECHNICIAN & REPUTATION BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Identity */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Bảng Tiếp Nhận Sửa Chữa Thiết Bị
            </h1>
            <p className="text-xs text-muted-foreground">
              Kỹ thuật viên: <strong className="text-foreground">{technicianName}</strong> • Khu vực phụ trách:{" "}
              <strong className="text-foreground">{building} (Ký túc xá Đại học FPT)</strong>
            </p>
          </div>

          {/* Right: Star Rating & Performance Box */}
          <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border shrink-0">
            <div className="text-center pr-3 border-r border-border">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-foreground font-mono">{averageRating}</span>
                <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Đánh giá trung bình từ SV {building}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>{resolvedTickets.length + 20} nhiệm vụ đã hoàn thành</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewsModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Xem nhận xét của sinh viên ({reviewedTickets.length + 3} đánh giá)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 02. BOUNTY TABS */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
          }`}
        >
          <span>🎯 Chờ tiếp nhận</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "PENDING"
                ? "bg-white/20 text-white"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {pendingTickets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "IN_PROGRESS"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
          }`}
        >
          <span>🛠️ Đang sửa chữa</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "IN_PROGRESS"
                ? "bg-white/20 text-white"
                : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
            }`}
          >
            {inProgressTickets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RESOLVED")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === "RESOLVED"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
          }`}
        >
          <span>📜 Đã hoàn thành</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "RESOLVED"
                ? "bg-white/20 text-white"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {resolvedTickets.length}
          </span>
        </button>
      </div>

      {/* 03. BOUNTY LIST */}
      {currentList.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Không có nhiệm vụ nào trong danh mục này</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === "PENDING"
              ? "Hiện tại không có sự cố mới nào đang chờ tiếp nhận tại Tòa A. Toàn bộ thiết bị đang vận hành ổn định!"
              : activeTab === "IN_PROGRESS"
                ? "Bạn chưa có nhiệm vụ nào đang xử lý. Hãy chuyển sang tab Chờ tiếp nhận để nhận nhiệm vụ mới."
                : "Chưa có nhiệm vụ hoàn thành nào được ghi nhận."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentList.map((ticket) => {
            const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER
            const CatIcon = cat.icon
            const isEmergency = ticket.urgency === "EMERGENCY"

            return (
              <div
                key={ticket.id}
                className={`rounded-2xl border transition-all p-5 shadow-xs bg-card ${
                  isEmergency
                    ? "border-rose-500/40 bg-gradient-to-r from-card to-rose-500/5 hover:border-rose-500"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Header row: Badge, Category, Urgency, ID */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cat.color}`}
                    >
                      <CatIcon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </span>

                    {isEmergency ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Khẩn cấp</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Tiêu chuẩn</span>
                      </span>
                    )}

                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      #{ticket.id}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{ticket.createdAt}</span>
                  </span>
                </div>

                {/* Main Content: Title & Student Description */}
                <div className="mt-3.5 space-y-3">
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {ticket.title}
                  </h3>



                  {/* 3 Info Columns: Location, Sender, Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    {/* Location */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          Vị trí khu vực:
                        </span>
                        <strong className="text-foreground">
                          {ticket.building || building} · Phòng {ticket.room}
                        </strong>
                        <span className="text-muted-foreground block text-[11px]">
                          {ticket.bedCode || ticket.compartment || "Phòng chung"}
                        </span>
                      </div>
                    </div>

                    {/* Sender */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                      <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          Người gửi yêu cầu:
                        </span>
                        <strong className="text-foreground">{ticket.studentName}</strong>
                        <span className="text-muted-foreground block text-[11px] font-mono">
                          MSSV: {ticket.studentId}
                        </span>
                      </div>
                    </div>

                    {/* Phone / Contact */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                          Liên hệ trực tiếp:
                        </span>
                        <a
                          href={`tel:${ticket.studentPhone}`}
                          className="font-mono font-bold text-primary hover:underline block"
                        >
                          {ticket.studentPhone}
                        </a>
                        <span className="text-muted-foreground text-[10px]">
                          Nhấn gọi khi tới cửa phòng
                        </span>
                      </div>
                    </div>
                  </div>



                  {/* Resolution Report (Biên bản nghiệm thu sửa chữa) if resolved */}
                  {ticket.resolution && (
                    <div className="mt-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <FileCheck2 className="h-4 w-4 text-emerald-600" />
                          <span>Biên Bản Nghiệm Thu Sửa Chữa (Đã Hoàn Tất)</span>
                        </span>
                        <span className="font-mono text-[11px] font-normal text-muted-foreground">
                          Ngày hoàn tất: {ticket.resolution.completedAt}
                        </span>
                      </div>
                      <p className="text-foreground/90 leading-relaxed font-sans">
                        <strong className="text-foreground">Phương án kỹ thuật đã xử lý:</strong>{" "}
                        {ticket.resolution.technicianNotes}
                      </p>
                      {ticket.resolution.materials && ticket.resolution.materials.length > 0 && (
                        <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            Vật tư thay thế:{" "}
                            {ticket.resolution.materials.map((m) => `${m.name} (x${m.quantity})`).join(", ")}
                          </span>
                          {ticket.resolution.totalMaterialCost ? (
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              Tổng chi phí: ₫{ticket.resolution.totalMaterialCost.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student Review Section if available */}
                  {ticket.review && (
                    <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <div className="flex">
                            {[...Array(ticket.review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="font-bold text-foreground">
                            {ticket.review.rating} / 5 sao
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {ticket.review.reviewedAt}
                        </span>
                      </div>
                      <p className="text-foreground/90 italic">
                        "{ticket.review.comment}"
                      </p>
                      <span className="text-[10px] text-muted-foreground block">
                        Đánh giá bởi sinh viên: {ticket.studentName} (Phòng {ticket.room})
                      </span>
                    </div>
                  )}

                  {activeTab === "RESOLVED" && !ticket.review && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground italic flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Đang chờ sinh viên phòng {ticket.room} trải nghiệm và gửi đánh giá sao.</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(ticket)}
                    className="text-xs font-semibold"
                  >
                    Xem chi tiết phiếu
                  </Button>

                  <div className="flex items-center gap-2">
                    {ticket.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onAccept(ticket)
                          setActiveTab("IN_PROGRESS")
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Tiếp Nhận Nhiệm Vụ</span>
                      </Button>
                    )}

                    {ticket.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        onClick={() => onComplete(ticket)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" />
                        <span>Hoàn Thành & Lập Biên Bản Nghiệm Thu</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 04. REVIEWS MODAL */}
      <Modal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground block">
                Đánh Giá Nghiệm Thu Từ Sinh Viên {building}
              </span>
              <span className="text-xs text-muted-foreground">
                Điểm uy tín kỹ thuật viên {technicianName}
              </span>
            </div>
          </div>
        }
      >
        <div className="space-y-3.5 py-1">
          {/* Average Overview */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-foreground font-mono">{averageRating} / 5.0</span>
              
            </div>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {[
              {
                name: "Huỳnh Gia Kim",
                room: "A205",
                stars: 5,
                comment: "Anh Hùng làm rất nhanh và nhiệt tình, dọn dẹp sạch sẽ sau khi xịt máy lạnh. Cảm ơn anh!",
                time: "08/10/2026",
              },
              {
                name: "Văn Thái Trung",
                room: "A302",
                stars: 5,
                comment: "Đến đúng giờ, thay bóng đèn LED ban công nhanh gọn và kiểm tra luôn công tắc cho phòng.",
                time: "05/10/2026",
              },
              {
                name: "Trần Thanh Nguyên",
                room: "A104",
                stars: 5,
                comment: "Xử lý vòi sen rò rỉ rất chuyên nghiệp, có mang theo gioăng cao su mới thay thế miễn phí.",
                time: "02/10/2026",
              },
              {
                name: "Lê Minh Quân",
                room: "A201",
                stars: 4,
                comment: "Sửa ổ cắm an toàn, thái độ rất tốt. Cảm ơn đội kỹ thuật Tòa A.",
                time: "28/09/2026",
              },
            ].map((rev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-card text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {rev.name} · Phòng {rev.room}
                  </span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground/90 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-muted-foreground font-mono block">{rev.time}</span>
              </div>
            ))}
          </div>

          <Button
            variant="default"
            onClick={() => setShowReviewsModal(false)}
            className="w-full font-bold"
          >
            Đóng
          </Button>
        </div>
      </Modal>


    </div>
  )
}
