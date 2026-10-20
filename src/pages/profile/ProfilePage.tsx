import React, { useState } from "react"
import { ContractRenewalModal } from "@/components/contract/ContractRenewalModal"
import { useAuth } from "@/contexts/useAuth"
import {
  User,
  Phone,
  Mail,
  BedDouble,
  CheckCircle2,
  Edit3,
  Save,
  X,
  FileDown,
  HeartHandshake,
  LogOut,
  CalendarCheck2,
  Building2,
  Briefcase,
  Wrench,
  Star,
} from "lucide-react"

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [phone, setPhone] = useState(user?.phone || "")
  const [parentName, setParentName] = useState(user?.emergencyContact?.parentName || "")
  const [parentPhone, setParentPhone] = useState(user?.emergencyContact?.phone || "")
  const [relationship, setRelationship] = useState(user?.emergencyContact?.relationship || "")
  const [parentAddress, setParentAddress] = useState(user?.emergencyContact?.address || "")
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [isRenewed, setIsRenewed] = useState(
    () => localStorage.getItem("dms_renewal_status") === "submitted"
  )

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground text-sm">Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    )
  }

  const isTechnician = user.role === "technician"
  const isManager = user.role === "manager" || user.role === "admin"
  const isManagerOrStaff = isManager || isTechnician

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      phone,
      emergencyContact: {
        parentName,
        relationship,
        phone: parentPhone,
        address: parentAddress,
      },
    })
    setIsEditing(false)
    setToastMessage("Đã cập nhật thông tin liên hệ thành công!")
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDownloadContract = () => {
    setToastMessage("Đang tải xuống tệp hợp đồng điện tử e-Contract PDF...")
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP PROFILE HEADER BANNER (CHUNG CHO CẢ CÁN BỘ & SINH VIÊN)                */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-primary/20 shadow-md"
              />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {user.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span className="font-bold text-primary">
                  {isTechnician
                    ? "Kỹ thuật viên · Tòa A"
                    : isManager
                      ? user.role === "admin"
                        ? "Quản trị viên Hệ thống KTX"
                        : "Cán bộ Quản lý KTX · Tòa A"
                      : "Sinh viên lưu trú"}
                </span>
                <span>•</span>
                {isManagerOrStaff ? (
                  <span className="font-mono font-semibold text-foreground">
                    {isTechnician ? "Mã KTV: " : "Mã CB: "}
                    {user.staffId || (isTechnician ? "TECH-012" : "MGR-004")}
                  </span>
                ) : (
                  <span className="font-mono font-semibold text-foreground">
                    MSSV: {user.studentId || "SE182049"}
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{user.phone}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Chỉnh sửa liên hệ</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hủy</span>
              </button>
            )}

            {!isManagerOrStaff && user.dormitoryStatus && (
              <button
                onClick={handleDownloadContract}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <FileDown className="h-3.5 w-3.5 text-primary" />
                <span>e-Contract PDF</span>
              </button>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 px-3 py-2.5 text-xs font-semibold hover:bg-destructive/10 transition-colors"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GIAO DIỆN CÁN BỘ QUẢN LÝ / NHÂN SỰ KTX (MANAGER / ADMIN / TECHNICIAN)     */}
      {/* ========================================================================= */}
      {isManagerOrStaff ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (7 COLS): HỒ SƠ NHÂN SỰ & LIÊN HỆ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Thông tin nhân sự cán bộ */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border pb-3">
                {isTechnician ? (
                  <Wrench className="h-4 w-4 text-primary" />
                ) : (
                  <Briefcase className="h-4 w-4 text-primary" />
                )}
                <span>
                  {isTechnician
                    ? "Hồ Sơ Kỹ Thuật Viên Cơ Điện & Vận Hành"
                    : "Hồ Sơ Cán Bộ Quản Lý Ký Túc Xá"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px]">Họ và tên đầy đủ</p>
                  <p className="font-semibold text-foreground">{user.fullName}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">
                    {isTechnician ? "Mã nhân viên kỹ thuật" : "Mã cán bộ"}
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {user.staffId || (isTechnician ? "TECH-012" : "MGR-004")}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Ngày sinh</p>
                  <p className="font-semibold text-foreground">{user.dob}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Giới tính</p>
                  <p className="font-semibold text-foreground">
                    {user.gender === "male" ? "Nam" : "Nữ"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Số CCCD / Định danh</p>
                  <p className="font-mono font-semibold text-foreground">{user.citizenId}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Quê quán / Thường trú</p>
                  <p className="font-semibold text-foreground">{user.hometown}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-[11px]">Đơn vị công tác</p>
                  <p className="font-semibold text-foreground">
                    {user.department || (isTechnician ? "Đội Kỹ thuật & Cơ điện Tòa A" : "Phòng Quản lý KTX & Công tác Sinh viên (CTSV)")}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Vị trí đảm nhiệm</p>
                  <p className="font-semibold text-foreground">
                    {user.roleTitle || (isTechnician ? "Kỹ thuật viên Tòa A" : "Quản lý Ký túc xá Tòa A")}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Trạng thái công tác</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {isTechnician ? "Đang trực ca kỹ thuật · Sẵn sàng xử lý" : "Đang công tác chính thức"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Thông tin liên hệ khẩn cấp & gia đình */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Thông Tin Liên Hệ Khẩn Cấp & Báo Cáo Nội Bộ</span>
                </div>
                <span className="text-[10px] font-mono rounded bg-primary/10 text-primary px-2 py-0.5 font-bold">
                  {isTechnician ? "Kỹ thuật viên · Tòa A" : "BQL Tòa A"}
                </span>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">


                  <div>
                    <p className="text-muted-foreground text-[11px]">Người liên hệ khẩn cấp</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.parentName || "Vũ Đình Khiêm"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">Mối quan hệ</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.relationship || "Thân nhân"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">SĐT liên hệ khẩn cấp</p>
                    <p className="font-mono font-semibold text-primary">
                      {user.emergencyContact?.phone || "0912 999 888"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">Địa chỉ liên lạc</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.address || "Khu Đô thị FPT City, Đà Nẵng"}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Họ tên người liên hệ khẩn cấp:
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Mối quan hệ (Thân nhân, gia đình...):
                      </label>
                      <input
                        type="text"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Số điện thoại người liên hệ khẩn cấp:
                      </label>
                      <input
                        type="text"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Địa chỉ liên lạc gia đình:
                    </label>
                    <textarea
                      rows={2}
                      value={parentAddress}
                      onChange={(e) => setParentAddress(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (5 COLS): PHẠM VI PHỤ TRÁCH KTX */}
          <div className="lg:col-span-5 space-y-6">
            {isTechnician ? (
              /* GIAO DIỆN KHU VỰC PHỤ TRÁCH KỸ THUẬT (TECHNICIAN) */
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span>Khu Vực Phụ Trách Kỹ Thuật</span>
                  </div>
                </div>

                {/* Tòa nhà phụ trách */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    ĐƠN VỊ KỸ THUẬT PHỤ TRÁCH
                  </span>
                  <p className="text-lg font-black text-foreground">
                    Tòa A (Ký túc xá Nam)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phụ trách cơ điện, cấp thoát nước & thiết bị phòng ở
                  </p>
                </div>

                {/* Quy mô kỹ thuật */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground block">Phạm vi thiết bị</span>
                    <p className="text-base font-black text-foreground mt-1">44 Phòng</p>
                    <p className="text-[10px] text-muted-foreground">Hệ thống điện nước Tòa A</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground block">Đánh giá trung bình</span>
                    <p className="text-base font-black text-amber-500 mt-1 flex items-center gap-1">
                      <span>4.9 / 5.0</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </p>
                    <p className="text-[10px] text-muted-foreground">Từ nhận xét sinh viên</p>
                  </div>
                </div>

                {/* Nghiệp vụ & Nhiệm vụ kỹ thuật viên */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Nhiệm Vụ Kỹ Thuật Chuyên Trách
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Tiếp nhận & sửa chữa sự cố điện nước, điều hòa, đồ gỗ Tòa A</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Ghi chỉ số công tơ điện nước & chụp ảnh đối soát định kỳ</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Lập biên bản nghiệm thu kỹ thuật và thống kê vật tư thay thế</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Bảo trì định kỳ hệ thống máy bơm, tủ điện tầng & thiết bị vệ sinh</span>
                    </div>
                  </div>
                </div>

                {/* Trạm kỹ thuật trực ca */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Trạm kỹ thuật: Phòng Kỹ thuật & Kho Vật tư, Tầng G, Tòa A
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ca trực: Trực kỹ thuật & ứng trực sự cố khẩn cấp 24/7
                  </p>
                </div>
              </div>
            ) : (
              /* GIAO DIỆN PHẠM VI QUẢN LÝ KTX (MANAGER / ADMIN) */
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Phạm Vi Phụ Trách Ký Túc Xá</span>
                  </div>
                </div>

                {/* Tòa nhà phụ trách */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    ĐƠN VỊ KÝ TÚC XÁ PHỤ TRÁCH
                  </span>
                  <p className="text-lg font-black text-foreground">
                    Tòa A (Ký túc xá Nam)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Khu Ký túc xá FPT University • Cơ sở Hòa Hải
                  </p>
                </div>

                {/* Quy mô quản lý */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground block">Quy mô quản lý</span>
                    <p className="text-base font-black text-foreground mt-1">44 Phòng</p>
                    <p className="text-[10px] text-muted-foreground">192 sinh viên lưu trú</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground block">Tỷ lệ lấp đầy</span>
                    <p className="text-base font-black text-emerald-600 mt-1">80%</p>
                    <p className="text-[10px] text-muted-foreground">154 / 192 giường ở</p>
                  </div>
                </div>

                {/* Trách nhiệm quản lý chính */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Quyền Hạn & Nhiệm Vụ Quản Lý
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Quản lý danh sách cư dân & phân bổ buồng phòng Tòa A</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Chốt số công tơ điện nước & phát hành hóa đơn hàng tháng</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Giám sát hệ thống an ninh trật tự & duyệt đơn sinh viên</span>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Tiếp nhận & điều phối kỹ thuật viên xử lý báo hỏng sửa chữa</span>
                    </div>
                  </div>
                </div>

                {/* Văn phòng trực ban */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Văn phòng BQL: Phòng 101, Tầng 1, Tòa A
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ca trực: Hành chính & Trực ban an ninh Tòa A
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* GIAO DIỆN HỒ SƠ SINH VIÊN (STUDENT)                                       */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border pb-3">
                <User className="h-4 w-4 text-primary" />
                <span>Thông tin Cá nhân & Học vụ (Hồ sơ Tuyển sinh)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px]">Họ và tên đầy đủ</p>
                  <p className="font-semibold text-foreground">{user.fullName}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Mã số sinh viên</p>
                  <p className="font-mono font-semibold text-foreground">{user.studentId}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Ngày sinh</p>
                  <p className="font-semibold text-foreground">{user.dob}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Giới tính</p>
                  <p className="font-semibold text-foreground">
                    {user.gender === "male" ? "Nam" : "Nữ"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Số CCCD</p>
                  <p className="font-mono font-semibold text-foreground">{user.citizenId}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Quê quán / Thường trú</p>
                  <p className="font-semibold text-foreground">{user.hometown}</p>
                </div>

                {user.major && (
                  <div>
                    <p className="text-muted-foreground text-[11px]">Ngành đào tạo</p>
                    <p className="font-semibold text-foreground">{user.major}</p>
                  </div>
                )}

                {user.cohort && (
                  <div>
                    <p className="text-muted-foreground text-[11px]">Khóa tuyển sinh</p>
                    <p className="font-semibold text-foreground">{user.cohort}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <HeartHandshake className="h-4 w-4 text-primary" />
                  <span>Thông tin Liên hệ Khẩn cấp (Cha Mẹ / Người Giám Hộ)</span>
                </div>
                <span className="text-[10px] font-mono rounded bg-primary/10 text-primary px-2 py-0.5 font-bold">
                  Bắt buộc
                </span>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px]">Họ tên phụ huynh / Người bảo hộ</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.parentName || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">Mối quan hệ</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.relationship || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">Số điện thoại khẩn cấp</p>
                    <p className="font-mono font-semibold text-primary">
                      {user.emergencyContact?.phone || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-[11px]">Địa chỉ liên lạc gia đình</p>
                    <p className="font-semibold text-foreground">
                      {user.emergencyContact?.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Số điện thoại cá nhân của bạn:
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Họ tên phụ huynh / Người giám hộ:
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Mối quan hệ:
                      </label>
                      <input
                        type="text"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Số điện thoại phụ huynh:
                      </label>
                      <input
                        type="text"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Địa chỉ gia đình thường trú:
                    </label>
                    <textarea
                      rows={2}
                      value={parentAddress}
                      onChange={(e) => setParentAddress(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {user.dormitoryStatus ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <BedDouble className="h-4 w-4 text-primary" />
                    <span>Vị Trí Lưu Trú Hiện Tại</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {user.dormitoryStatus.roomStatus}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Mã định danh giường (SSOT):
                    </p>
                    <p className="text-xl font-mono font-black text-primary tracking-wider">
                      {user.dormitoryStatus.bedCode.replace("-B1-", "-B-")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {user.dormitoryStatus.building} • Phòng {user.dormitoryStatus.room} •{" "}
                      {user.dormitoryStatus.compartment.replace("Buồng B1", "Buồng B")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-[10px] text-muted-foreground">Bắt đầu hợp đồng</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {user.dormitoryStatus.contractStart}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-[10px] text-muted-foreground">Hết hạn hợp đồng</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {user.dormitoryStatus.contractEnd}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Tình trạng công nợ</p>
                      <p className="font-bold text-emerald-600 mt-0.5">
                        {user.dormitoryStatus.debtStatus === 0
                          ? "0 VNĐ (Không nợ)"
                          : `${user.dormitoryStatus.debtStatus.toLocaleString()} VNĐ`}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div className="pt-2 border-t border-border">
                    {isRenewed ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Đã Nộp Đơn Gia Hạn Kỳ Spring 2027</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Mã đơn: EXT-2027-049 • Đang chờ BQL duyệt
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowRenewModal(true)}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Chi tiết
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowRenewModal(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
                      >
                        <CalendarCheck2 className="h-4 w-4" />
                        <span>Gia Hạn Hợp Đồng KTX (Kỳ Spring 2027)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <ContractRenewalModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        user={user}
        onRenewed={() => setIsRenewed(true)}
      />
    </div>
  )
}
