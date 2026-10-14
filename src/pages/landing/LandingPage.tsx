import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { DormitoryGallerySlider } from "@/components/landing/DormitoryGallerySlider"
import {
  Building2,
  BedDouble,
  ShieldCheck,
  Zap,
  Receipt,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Flame,
  Wifi,
  Coffee,
  PhoneCall,
  MapPin,
  ChevronDown,
  Mail,
  Globe,
  ExternalLink,
  GraduationCap,
} from "lucide-react"

const FAQ_ITEMS = [
  {
    question: "Mô hình buồng riêng 1:4:6 là gì? Tôi có được riêng tư không?",
    answer:
      "Mỗi căn phòng lớn tiêu chuẩn có 4 buồng riêng biệt (A, B, C, D) với 6 giường/buồng (tổng 24 giường). Mỗi giường có rèm che chống nhìn xuyên thấu, đèn bàn LED, ổ cắm đôi và tủ cá nhân khóa số riêng biệt.",
  },
  {
    question: "Tiền điện nước được tính và chia như thế nào?",
    answer:
      "Công tơ điện và đồng hồ nước được chụp ảnh nghiệm thu từ ngày 25-28 hàng tháng. Hệ thống tự động áp công thức chia đều (Total ÷ N) cho số lượng sinh viên đang thực tế lưu trú trong phòng kèm mã VietQR tự động.",
  },
  {
    question: "Nếu tôi đi làm thêm hoặc học nhóm về muộn sau 23:00 thì sao?",
    answer:
      "Sinh viên chỉ cần gửi Đơn xin về muộn trực tuyến trên hệ thống trước 21:00 cùng ngày. BQL duyệt tự động và cấp mã QR mở cổng trục xoay an ninh ban đêm mà không bị trừ điểm rèn luyện.",
  },
  {
    question: "Quy trình thanh toán và nhận cọc diễn ra như thế nào?",
    answer:
      "Sau khi giữ chỗ 15 phút, bạn quét mã VietQR để thanh toán. Tiền đặt cọc an ninh 1.000.000 VNĐ sẽ được hoàn trả 100% về tài khoản ngân hàng của sinh viên ngay sau khi hoàn tất Biên bản bàn giao số hóa (UC-15).",
  },
  {
    question: "Sinh viên mới nhập học đăng nhập bằng tài khoản gì?",
    answer:
      "Sinh viên dùng Gmail cá nhân (@gmail.com) đã đăng ký trong hồ sơ tuyển sinh. Hệ thống tự động tra cứu và xác thực qua cơ sở dữ liệu nhập học FPT, không cần tạo tài khoản riêng.",
  },
  {
    question: "Khi buồng hỏng điều hòa hoặc vòi sen, báo sự cố ở đâu?",
    answer:
      "Đăng nhập vào hệ thống, chọn Phiếu Bảo Trì, mô tả sự cố và đính kèm ảnh chụp. Kỹ thuật viên sẽ tiếp nhận trong vòng 2 giờ và xử lý trong 24–48 giờ làm việc.",
  },
  {
    question: "Cơ chế khóa giữ chỗ 15 phút hoạt động như thế nào?",
    answer:
      "Khi bạn chọn giường và nhấn \"Giữ chỗ\", hệ thống sẽ khóa giường đó trong 15 phút để bạn hoàn tất thanh toán cọc qua VietQR. Nếu quá thời gian, giường sẽ tự động mở lại để sinh viên khác có thể đặt.",
  },
]

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="space-y-6 scroll-mt-24">
      <div className="max-w-2xl space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Hỏi đáp nhanh
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Câu Hỏi Thường Gặp Của Sinh Viên
        </h2>
        <p className="text-sm text-muted-foreground pt-1">
          Giải đáp mọi thắc mắc của tân sinh viên và phụ huynh về quy chế sinh hoạt tại KTX FPT.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-[#233944]/30 bg-[#f0f5f7] shadow-sm"
                  : "border-border bg-card hover:border-[#233944]/20 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isOpen
                        ? "bg-[#233944] text-white"
                        : "bg-orange-500/10 text-orange-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {item.question}
                </span>
                <ChevronDown
                  className={`shrink-0 h-4 w-4 text-[#73787b] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated slide-down answer */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed pl-14">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  const highlights = [
    {
      icon: BedDouble,
      title: "Mô hình Buồng riêng 1:4:6",
      desc: "Cấu trúc tiêu chuẩn: 1 Phòng = 4 Buồng riêng biệt (A, B, C, D) = 24 Giường. Mỗi sinh viên sở hữu rèm che riêng tư, ổ điện, đèn học và tủ locker mã số.",
      tag: "Signature Topology",
    },
    {
      icon: Zap,
      title: "Auto-Approval 0-Chạm",
      desc: "Engine tự động đối soát giới tính, thông tin tuyển sinh, tình trạng công nợ và thanh toán cọc trong 3 giây. Cấp ngay e-Contract PDF hợp lệ.",
      tag: "Zero-Touch",
    },
    {
      icon: Clock,
      title: "Khóa giữ chỗ 15 Phút",
      desc: "Cơ chế khóa concurrency lock thời gian thực với đồng hồ đếm ngược 900s. Tránh trùng lặp giường khi hàng trăm tân sinh viên cùng chọn.",
      tag: "Realtime Lock",
    },
    {
      icon: Receipt,
      title: "Minh bạch Điện Nước (Total / N)",
      desc: "Chụp ảnh công tơ điện nước phòng ngày 25-28 hàng tháng. Tự động tính thuế VAT và chia đều chính xác cho N sinh viên đang ở kèm mã VietQR.",
      tag: "Pro-Rata Split",
    },
    {
      icon: ShieldCheck,
      title: "An ninh 24/7 & Giới nghiêm 23:00",
      desc: "Cổng kiểm soát quét thẻ thông minh. Đơn xin về muộn ngoài giờ nộp online trước 21:00. Quản lý điểm rèn luyện KTX minh bạch.",
      tag: "Smart Gate",
    },
    {
      icon: FileCheck,
      title: "Biên bản Bàn giao Số hóa",
      desc: "Checklist điện tử khi Check-in và Check-out với ảnh hiện trạng thiết bị, tự động quyết toán và hoàn cọc không thủ tục rườm rà.",
      tag: "Digital Handover",
    },
  ]

  const feeTable = [
    { item: "Tiền thuê giường buồng riêng", price: "900.000 VNĐ", unit: "tháng / sinh viên", note: "Thu theo kỳ 4 tháng (3.600.000 VNĐ)" },
    { item: "Tiền ký quỹ đặt cọc tài sản", price: "1.000.000 VNĐ", unit: "lần đầu / hoàn lại khi trả phòng", note: "Quyết toán sau khi trừ hư hại nếu có" },
    { item: "Đơn giá điện phòng", price: "2.500 VNĐ", unit: "kWh (chưa VAT 8%)", note: "Tính theo chỉ số công tơ phòng thực tế" },
    { item: "Đơn giá nước sinh hoạt", price: "12.000 VNĐ", unit: "m³ (chưa VAT 5%)", note: "Chia đều cho số thành viên trong phòng" },
    { item: "Phí dịch vụ & vệ sinh hành lang", price: "30.000 VNĐ", unit: "tháng / sinh viên", note: "Bao gồm thu gom rác, vệ sinh khu chung" },
    { item: "Internet Wi-Fi tốc độ cao", price: "Miễn phí", unit: "phủ sóng toàn tòa nhà", note: "Tích hợp tài khoản sinh viên FPT" },
  ]

  const rules = [
    {
      title: "1. Khung giờ Giới nghiêm 23:00",
      content: "Cổng ký túc xá đóng lúc 23:00 và mở lúc 05:30 sáng hôm sau. Sinh viên về muộn do lịch học/công việc cần nộp đơn trực tuyến trên hệ thống trước 21:00.",
    },
    {
      title: "2. An toàn Phòng cháy & Thiết bị điện",
      content: "Nghiêm cấm nấu ăn bằng bếp gas, bếp từ, nồi chiên trong phòng ngủ. Chỉ sử dụng khu vực bếp chung tại Tầng 1. Tuyệt đối không tự ý câu móc dây điện.",
    },
    {
      title: "3. Quản lý Điểm rèn luyện KTX (100 Điểm)",
      content: "Mỗi sinh viên bắt đầu với 100 điểm. Vi phạm giờ giới nghiêm trừ 5-10 điểm/lần; gây mất trật tự sau 22:30 trừ 10 điểm. Bị trừ quá 30 điểm sẽ đình chỉ lưu trú kỳ tiếp theo.",
    },
    {
      title: "4. Quyền riêng tư & Bảo vệ Buồng cá nhân",
      content: "Không dẫn người lạ hoặc người khác giới vào buồng ngủ. Giữ gìn chìa khóa/thẻ từ cá nhân, khóa tủ bảo mật khi rời khỏi phòng.",
    },
  ]

  return (
    <div className="space-y-16 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-orange-500/5 p-8 sm:p-12 lg:p-16 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>FPT University Dormitory Management System • Kỳ Fall 2026</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
            Không Gian Sống Chuẩn Mực,{" "}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Trải Nghiệm Đại Học Trọn Vẹn
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Hệ thống đặt giường và quản lý Ký túc xá trực tuyến thông minh. Trải nghiệm mô hình buồng riêng <strong>1:4:6</strong> tiện nghi, cơ chế giữ chỗ 15 phút không xung đột, và hóa đơn điện nước minh bạch chia theo thời gian thực.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#3a505b]"
            >
              <BedDouble className="h-4 w-4" />
              <span>Xem Bản Đồ & Đặt Giường 1:4:6</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/billing"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white dark:bg-[#161e23] px-5 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
            >
              <Receipt className="h-4 w-4 text-primary" />
              <span>Hóa Đơn Điện Nước VietQR</span>
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
              >
                <span>Đăng Nhập Google (UC-02)</span>
              </Link>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={user?.role === "student" ? "/overview" : user?.role === "manager" ? "/manager" : user?.role === "technician" ? "/maintenance" : "/overview"}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Vào Bảng Điều Khiển ({user?.roleTitle})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {user?.role === "student" && (
                  <Link
                    to="/my-room"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
                  >
                    <span>Phòng Của Tôi (A205)</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/60">
            <div>
              <p className="text-2xl font-black text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">Giường tiêu chuẩn hiện đại</p>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-600">15 Phút</p>
              <p className="text-xs text-muted-foreground">Khóa giữ chỗ thanh toán</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">100%</p>
              <p className="text-xs text-muted-foreground">Tự động xét duyệt 0-chạm</p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">24/7</p>
              <p className="text-xs text-muted-foreground">An ninh bảo vệ & Kỹ thuật</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Slide giới thiệu không gian KTX chuẩn mô hình 1-4-6 */}
      <section className="space-y-4">
        <DormitoryGallerySlider />
      </section>

      <section id="mo-hinh" className="space-y-6 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Nền tảng công nghệ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Tính Năng Nổi Bật Chuẩn IEEE 830
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-orange-500/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                    {h.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{h.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="bieu-phi" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Chi phí công khai
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Biểu Phí Lưu Trú & Dịch Vụ
            </h2>
            <p className="text-sm text-muted-foreground">
              Áp dụng thống nhất cho Tòa nhà A (Nam) và Tòa nhà B (Nữ) năm học 2026-2027.
            </p>
          </div>
          <Link
            to="/billing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <span>Tra cứu chi tiết hóa đơn mẫu (Module 4)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5">Hạng mục dịch vụ</th>
                <th className="px-5 py-3.5">Đơn giá quy định</th>
                <th className="px-5 py-3.5">Đơn vị tính</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Ghi chú & Chính sách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feeTable.map((f, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f.item}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                    {f.price}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{f.unit}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground hidden md:table-cell">
                    {f.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="noi-quy" className="space-y-6 scroll-mt-24">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Nội quy bắt buộc
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Quy Định Chung & Kỷ Luật Lưu Trú
          </h2>
          <p className="text-sm text-muted-foreground">
            Sinh viên cam kết thực hiện nghiêm túc khi ký hợp đồng lưu trú điện tử.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <span>{r.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tien-ich" className="rounded-3xl border border-border bg-muted/20 p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Tiện Ích & Không Gian Chung Hiện Đại
          </h2>
          <p className="text-xs text-muted-foreground">
            Môi trường sinh hoạt an toàn, tiện nghi giúp sinh viên tập trung tối đa cho việc học.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Wifi className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Wi-Fi 6 Băng Thông Rộng</h4>
            <p className="text-[11px] text-muted-foreground">Phủ sóng toàn bộ phòng ngủ & sảnh</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Coffee className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Phòng Tự Học 24/7</h4>
            <p className="text-[11px] text-muted-foreground">Máy lạnh, bàn học nhóm yên tĩnh</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Flame className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Bếp Ăn Chung Tầng 1</h4>
            <p className="text-[11px] text-muted-foreground">Khu vực nấu nướng an toàn PCCC</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <ShieldCheck className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Bảo Vệ & Camera AI 24/7</h4>
            <p className="text-[11px] text-muted-foreground">Kiểm soát ra vào thông minh</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FaqSection />

      {/* ── FOOTER ── */}
      <footer className="mt-4">
        {/* Top dark band */}
        <div className="rounded-3xl bg-[#1a2c38] text-white overflow-hidden">
          {/* Orange accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />

          <div className="px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Col 1 – Brand */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-sm leading-tight">Ký Túc Xá</p>
                  <p className="text-[11px] text-orange-300 font-semibold">Đại Học FPT Quy Nhơn</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hệ thống quản lý KTX thông minh – minh bạch, tiện lợi và an toàn cho toàn thể sinh viên FPT.
              </p>
              <div className="flex gap-2 pt-1">
                
                <a
                  href="https://daihocfpt.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-orange-500 transition-colors flex items-center justify-center"
                  aria-label="Website FPT"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2 – Quick links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Truy cập nhanh</h4>
              <ul className="space-y-2">
                {[
                  { label: "Trang chủ KTX", href: "/" },
                  { label: "Đặt phòng / Giữ chỗ", href: "/login?mode=register" },
                  { label: "Đăng nhập hệ thống", href: "/login" },
                  { label: "Câu hỏi thường gặp", href: "/#faq" },
                  { label: "Tiện ích & Không gian", href: "/#tien-ich" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-xs text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 – FPT links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Về Đại Học FPT</h4>
              <ul className="space-y-2">
                {[
                  { label: "Trang chủ FPT Quy Nhơn", href: "https://daihoc.fpt.edu.vn/quy-nhon" },
                  { label: "Cổng sinh viên FAP", href: "https://fap.fpt.edu.vn" },
                  { label: "Phòng Công tác Sinh viên", href: "https://daihocfpt.edu.vn" },
                  { label: "Học bổng & Hỗ trợ", href: "https://daihocfpt.edu.vn" },
                  { label: "Lịch học & Thời khóa biểu", href: "https://fap.fpt.edu.vn" },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 – Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Liên hệ & Hỗ trợ</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    Khu Đô thị An Phú Thịnh,<br />
                    Phường Quy Nhơn Đông, Gia Lai
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-xs text-slate-300">Hotline BQL KTX: <span className="font-bold text-white">0987 807 074</span></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                  <a href="mailto:ktx.quynhon@fpt.edu.vn" className="text-xs text-slate-300 hover:text-orange-400 transition-colors">
                    ktx.quynhon@fpt.edu.vn
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-xs text-slate-300">Hỗ trợ học vụ: <span className="font-bold text-white">1900 6868</span></span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 text-xs font-bold text-white"
                >
                  Đăng ký lưu trú ngay
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© 2026 Ban Quản Lý Ký Túc Xá – Đại Học FPT Quy Nhơn. Bảo lưu mọi quyền.</span>
            <span className="text-slate-500">
              Đồ án FER202 – Group 4 &nbsp;·&nbsp; Front-End Web Development with React
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
