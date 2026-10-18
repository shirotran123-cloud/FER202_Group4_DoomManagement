import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import type { UserProfile } from "@/types/auth"
import {
  User,
  Phone,
  Mail,
  Shield,
  BedDouble,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  FileDown,
  HeartHandshake,
} from "lucide-react"

interface ProfileFormProps {
  user: UserProfile
  onSave: (phone: string, emergency: { parentName: string; phone: string; relationship: string; address: string }) => void
}

const ProfileDetailsAndForm: React.FC<ProfileFormProps> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [phone, setPhone] = useState(user.phone || "")
  const [parentName, setParentName] = useState(user.emergencyContact?.parentName || "")
  const [parentPhone, setParentPhone] = useState(user.emergencyContact?.phone || "")
  const [relationship, setRelationship] = useState(user.emergencyContact?.relationship || "")
  const [parentAddress, setParentAddress] = useState(user.emergencyContact?.address || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(phone, {
      parentName,
      phone: parentPhone,
      relationship,
      address: parentAddress,
    })
    setIsEditing(false)
  }

  const handleDownloadContract = () => {
    alert(
      `[e-Contract PDF Generator]:\nĐang tạo và tải xuống bản sao hợp đồng lưu trú điện tử cho sinh viên ${user.fullName} (Mã giường: ${user.dormitoryStatus?.bedCode || "N/A"}).`
    )
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-sky-500/20"
              />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  {user.fullName}
                </h1>
                <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {user.roleTitle}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                  Đang hoạt động
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                {user.studentId && (
                  <span className="font-mono font-semibold text-foreground">
                    MSSV: {user.studentId}
                  </span>
                )}
                {user.staffId && (
                  <span className="font-mono font-semibold text-foreground">
                    Mã CB: {user.staffId}
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

            {user.dormitoryStatus && (
              <button
                onClick={handleDownloadContract}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <FileDown className="h-3.5 w-3.5 text-sky-600" />
                <span>e-Contract PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground border-b border-border pb-3">
              <User className="h-4 w-4 text-sky-600" />
              <span>Thông tin Cá nhân & Học vụ (Hồ sơ Tuyển sinh)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Họ và tên đầy đủ</p>
                <p className="font-semibold text-foreground">{user.fullName}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-[11px]">Số CCCD / Định danh</p>
                <p className="font-mono font-semibold text-foreground">{user.citizenId}</p>
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

              {user.department && (
                <div>
                  <p className="text-muted-foreground text-[11px]">Đơn vị công tác</p>
                  <p className="font-semibold text-foreground">{user.department}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <HeartHandshake className="h-4 w-4 text-blue-500" />
                <span>Thông tin Liên hệ Khẩn cấp (Cha Mẹ / Người Giám Hộ)</span>
              </div>
              <span className="text-[10px] font-mono rounded bg-blue-500/10 text-blue-600 px-2 py-0.5 font-bold">
                Bắt buộc
              </span>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px]">Họ tên phụ huynh / Người bảo hộ</p>
                  <p className="font-semibold text-foreground">{user.emergencyContact?.parentName || "Chưa cập nhật"}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Mối quan hệ</p>
                  <p className="font-semibold text-foreground">{user.emergencyContact?.relationship || "Chưa cập nhật"}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Số điện thoại khẩn cấp</p>
                  <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {user.emergencyContact?.phone || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-[11px]">Địa chỉ liên lạc gia đình</p>
                  <p className="font-semibold text-foreground">{user.emergencyContact?.address || "Chưa cập nhật"}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
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
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Mối quan hệ (Bố, Mẹ, Người giám hộ...):
                    </label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Số điện thoại liên lạc khẩn cấp phụ huynh:
                    </label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
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
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
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
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700"
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
            <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-card to-sky-500/5 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <BedDouble className="h-4 w-4 text-sky-600" />
                  <span>Vị Trí Lưu Trú Hiện Tại</span>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  {user.dormitoryStatus.roomStatus}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-semibold">Mã định danh giường (SSOT):</p>
                  <p className="text-xl font-mono font-black text-sky-600 tracking-wider">
                    {user.dormitoryStatus.bedCode}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {user.dormitoryStatus.building} • Phòng {user.dormitoryStatus.room} • {user.dormitoryStatus.compartment}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] text-muted-foreground">Bắt đầu hợp đồng</p>
                    <p className="font-semibold text-foreground mt-0.5">{user.dormitoryStatus.contractStart}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] text-muted-foreground">Hết hạn hợp đồng</p>
                    <p className="font-semibold text-foreground mt-0.5">{user.dormitoryStatus.contractEnd}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Tình trạng công nợ</p>
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {user.dormitoryStatus.debtStatus === 0 ? "0 VNĐ (Không nợ)" : `${user.dormitoryStatus.debtStatus.toLocaleString()} VNĐ`}
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
              <BedDouble className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-bold text-sm">Chưa đăng ký phòng KTX</h3>
              <p className="text-xs text-muted-foreground">
                Tài khoản này chưa có hợp đồng lưu trú ký túc xá cho học kỳ Fall 2026.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs">
            <span className="font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-600" />
              <span>Chính sách Bảo mật Dữ liệu</span>
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Dữ liệu CCCD và thông tin gia đình được mã hóa tuân thủ theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="h-10 w-10 text-sky-600 mx-auto" />
        <h2 className="text-lg font-bold">Chưa đăng nhập</h2>
        <p className="text-sm text-muted-foreground">Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân.</p>
      </div>
    )
  }

  const handleSave = (
    phone: string,
    emergency: { parentName: string; phone: string; relationship: string; address: string }
  ) => {
    updateProfile({
      phone,
      emergencyContact: emergency,
    })
    setToastMessage("Đã cập nhật thông tin hồ sơ và người liên hệ khẩn cấp thành công!")
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Keyed by user.id so state automatically resets when switching roles without useEffect */}
      <ProfileDetailsAndForm key={user.id} user={user} onSave={handleSave} />

      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <button
          onClick={() => logout()}
          className="text-xs font-semibold text-blue-600 hover:bg-blue-500/10 px-4 py-2 rounded-xl transition-colors"
        >
          Đăng xuất tài khoản
        </button>
      </div>
    </div>
  )
}
