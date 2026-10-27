import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { DormitoryGallerySlider } from "@/components/landing/DormitoryGallerySlider"
import {
  Building2,
  BedDouble,
  ShieldCheck,
  Receipt,
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
    question: "Phòng KTX có đảm bảo sự riêng tư không?",
    answer:
      "Mỗi căn phòng lớn tiêu chuẩn có 4 buồng riêng biệt (A, B, C, D) với 6 giường/buồng (tổng 24 giường). Mỗi giường có rèm che chống nhìn xuyên thấu, đèn bàn LED, ổ cắm đôi và tủ cá nhân khóa số riêng biệt.",
  },
  {
    question: "Tiền điện nước được tính và chia như thế nào?",
    answer:
      "Công tơ điện và đồng hồ nước được chụp ảnh nghiệm thu từ ngày 25-28 hàng tháng. Hệ thống tự động áp công thức chia đều cho số lượng sinh viên đang thực tế lưu trú trong phòng kèm mã VietQR tự động.",
  },
  {
    question: "Nếu tôi đi làm thêm hoặc học nhóm về muộn sau 23:00 thì sao?",
    answer:
      "Sinh viên chỉ cần gửi Đơn xin về muộn trực tuyến trên hệ thống trước 21:00 cùng ngày. BQL duyệt tự động và cấp mã QR mở cổng trục xoay an ninh ban đêm mà không bị trừ điểm rèn luyện.",
  },
  {
    question: "Quy trình thanh toán và nhận cọc diễn ra như thế nào?",
    answer:
      "Sau khi giữ chỗ 15 phút, bạn quét mã VietQR để thanh toán. Tiền đặt cọc an ninh 1.000.000 VNĐ sẽ được hoàn trả 100% về tài khoản ngân hàng của sinh viên ngay sau khi hoàn tất Biên bản bàn giao số hóa.",
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
      'Khi bạn chọn giường và nhấn "Giữ chỗ", hệ thống sẽ khóa giường đó trong 15 phút để bạn hoàn tất thanh toán cọc qua VietQR. Nếu quá thời gian, giường sẽ tự động mở lại để sinh viên khác có thể đặt.',
  },
]

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="scroll-mt-24 space-y-6">
      <div className="max-w-2xl space-y-1">
        
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Câu Hỏi Thường Gặp Của Sinh Viên
        </h2>
        <p className="pt-1 text-sm text-muted-foreground">
          Giải đáp mọi thắc mắc của tân sinh viên và phụ huynh về quy chế sinh
          hoạt tại KTX FPT.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? "border-[#233944]/30 bg-[#f0f5f7] shadow-sm"
                  : "border-border bg-card hover:border-[#233944]/20 hover:shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isOpen
                        ? "bg-[#233944] text-white"
                        : "bg-sky-500/10 text-sky-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#73787b] transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Animated slide-down answer */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 pl-14 text-sm leading-relaxed text-muted-foreground">
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
      title: "Mô hình Buồng",
      desc: "Cấu trúc 1 Phòng = 4 Buồng riêng biệt (A, B, C, D) = 24 Giường. Mỗi sinh viên sở hữu rèm che riêng tư, ổ điện, đèn học và tủ locker mã số.",
    },
    {
      icon: Receipt,
      title: "Minh bạch Điện Nước",
      desc: "Tự động tính thuế VAT và chia đều chính xác cho số lượng sinh viên đang ở kèm mã VietQR.",
          },
    {
      icon: ShieldCheck,
      title: "An ninh 24/7 & Giờ giới nghiêm",
      desc: "Cổng kiểm soát quét thẻ thông minh. Đơn xin về muộn ngoài giờ nộp online.",
          },
    {
      icon: FileCheck,
      title: "Biên bản Bàn giao Số hóa",
      desc: "Checklist điện tử khi Check-in và Check-out với ảnh hiện trạng, tự động quyết toán hoàn cọc.",
          },
  ]

  const feeTable = [
    {
      item: "Tiền thuê giường",
      price: "900.000 VNĐ",
      unit: "tháng / sinh viên",
      note: "Thu theo kỳ 4 tháng (3.600.000 VNĐ)",
    },
    {
      item: "Tiền ký quỹ đặt cọc tài sản",
      price: "1.000.000 VNĐ",
      unit: "lần đầu / hoàn lại khi trả phòng",
      note: "Quyết toán sau khi trừ hư hại nếu có",
    },
    {
      item: "Đơn giá điện phòng",
      price: "2.500 VNĐ",
      unit: "kWh (chưa VAT 8%)",
      note: "Chia đều cho số thành viên trong phòng",
    },
    {
      item: "Đơn giá nước sinh hoạt",
      price: "12.000 VNĐ",
      unit: "m³ (chưa VAT 5%)",
      note: "Chia đều cho số thành viên trong phòng",
    },
    {
      item: "Phí dịch vụ & vệ sinh hành lang",
      price: "30.000 VNĐ",
      unit: "tháng / sinh viên",
      note: "Bao gồm thu gom rác, vệ sinh khu chung",
    },
    {
      item: "Internet Wi-Fi tốc độ cao",
      price: "Miễn phí",
      unit: "phủ sóng toàn tòa nhà",
      note: "Tích hợp tài khoản sinh viên FPT",
    },
  ]

  const rules = [
    {
      title: "1. Khung giờ Giới nghiêm",
      content:
        "Cổng ký túc xá đóng lúc 23:00 và mở lúc 05:30 sáng hôm sau. Sinh viên về muộn do lịch học/công việc cần nộp đơn trực tuyến trên hệ thống trước 21:00.",
    },
    {
      title: "2. An toàn Phòng cháy & Thiết bị điện",
      content:
        "Nghiêm cấm nấu ăn bằng bếp gas, bếp từ, nồi chiên trong phòng ngủ. Chỉ sử dụng khu vực bếp chung tại Tầng 1. Tuyệt đối không tự ý câu móc dây điện.",
    },
    {
      title: "3. Quản lý Điểm rèn luyện KTX",
      content:
        "Mỗi sinh viên bắt đầu với 100 điểm. Vi phạm giờ giới nghiêm trừ 5-10 điểm/lần; gây mất trật tự sau 22:30 trừ 10 điểm. Bị trừ quá 30 điểm sẽ đình chỉ lưu trú kỳ tiếp theo.",
    },
    {
      title: "4. Quyền riêng tư & Bảo vệ Buồng cá nhân",
      content:
        "Không dẫn người lạ hoặc người khác giới vào buồng ngủ. Giữ gìn chìa khóa/thẻ từ cá nhân, khóa tủ bảo mật khi rời khỏi phòng.",
    },
  ]

  return (
    <div className="space-y-16 pb-12">
      <section id="dat-phong" className="scroll-mt-24 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-sky-500/5 p-8 shadow-sm sm:p-12 lg:p-16">
        <div className="relative z-10 max-w-3xl space-y-6">
                    <h1 className="text-3xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Không Gian Sống Chuẩn Mực,{" "}
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Trải Nghiệm Đại Học Trọn Vẹn
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-[#3a505b]"
            >
              <BedDouble className="h-4 w-4" />
              <span>Đặt Phòng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {isAuthenticated && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={
                    user?.role === "student"
                      ? "/overview"
                      : user?.role === "manager"
                        ? "/manager"
                        : user?.role === "technician"
                          ? "/maintenance"
                          : "/overview"
                  }
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

          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-black text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">
                Giường tiêu chuẩn hiện đại
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-600">15 Phút</p>
              <p className="text-xs text-muted-foreground">
                Khóa giữ chỗ thanh toán
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">100%</p>
              <p className="text-xs text-muted-foreground">
                Tự động xét duyệt 0-chạm
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">24/7</p>
              <p className="text-xs text-muted-foreground">
                An ninh bảo vệ & Kỹ thuật
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </section>

      {/* Slide giới thiệu không gian KTX */}
      <section className="space-y-4">
        <DormitoryGallerySlider />
      </section>

      <section id="tinh-nang" className="scroll-mt-24 space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Tính Năng Nổi Bật Của Hệ Thống
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-sky-500/40 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  {h.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {h.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="bieu-phi" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Biểu Phí Lưu Trú & Dịch Vụ
            </h2>
            <p className="text-sm text-muted-foreground">
              Áp dụng thống nhất cho năm học
              2026-2027.
            </p>
          </div>
          <Link
            to="/billing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>Tra cứu chi tiết hóa đơn mẫu </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3.5">Hạng mục dịch vụ</th>
                <th className="px-5 py-3.5">Đơn giá quy định</th>
                <th className="px-5 py-3.5">Đơn vị tính</th>
                <th className="hidden px-5 py-3.5 md:table-cell">
                  Ghi chú & Chính sách
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feeTable.map((f, i) => (
                <tr key={i} className="transition-colors hover:bg-muted/30">
                  <td className="flex items-center gap-2 px-5 py-4 font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f.item}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                    {f.price}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{f.unit}</td>
                  <td className="hidden px-5 py-4 text-xs text-muted-foreground md:table-cell">
                    {f.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="noi-quy" className="scroll-mt-24 space-y-6">
        <div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Quy Định Chung & Kỷ Luật Lưu Trú
          </h2>
          <p className="text-sm text-muted-foreground">
            Sinh viên cam kết thực hiện nghiêm túc khi ký hợp đồng lưu trú điện
            tử.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rules.map((r, i) => (
            <div
              key={i}
              className="space-y-2 rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span>{r.title}</span>
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {r.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="tien-ich"
        className="space-y-6 rounded-3xl border border-border bg-muted/20 p-8 sm:p-10"
      >
        <div className="mx-auto max-w-xl space-y-2 text-center">
          <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
            Tiện Ích & Không Gian Chung Hiện Đại
          </h2>
          <p className="text-xs text-muted-foreground">
            Môi trường sinh hoạt an toàn, tiện nghi giúp sinh viên tập trung tối
            đa cho việc học.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-center">
            <Wifi className="mx-auto h-6 w-6 text-sky-600" />
            <h4 className="text-xs font-bold text-foreground">
              Wi-Fi 6 Băng Thông Rộng
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Phủ sóng toàn bộ phòng ngủ & sảnh
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-center">
            <Coffee className="mx-auto h-6 w-6 text-sky-600" />
            <h4 className="text-xs font-bold text-foreground">
              Phòng Tự Học 24/7
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Máy lạnh, bàn học nhóm yên tĩnh
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-center">
            <Flame className="mx-auto h-6 w-6 text-sky-600" />
            <h4 className="text-xs font-bold text-foreground">
              Bếp Ăn Chung Tầng 1
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Khu vực nấu nướng an toàn PCCC
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-sky-600" />
            <h4 className="text-xs font-bold text-foreground">
              Bảo Vệ & Camera AI 24/7
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Kiểm soát ra vào thông minh
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FaqSection />

      {/* ── FOOTER ── */}
      <footer className="mt-4">
        {/* Top dark band */}
        <div className="overflow-hidden rounded-3xl bg-[#1a2c38] text-white">
          {/* Cool accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600" />

          <div className="grid grid-cols-1 gap-10 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1 – Brand */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm leading-tight font-extrabold">
                    Ký Túc Xá
                  </p>
                  <p className="text-[11px] font-semibold text-sky-300">
                    Đại Học FPT Quy Nhơn
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Hệ thống quản lý KTX thông minh – minh bạch, tiện lợi và an toàn
                cho toàn thể sinh viên FPT.
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href="https://daihocfpt.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-sky-500"
                  aria-label="Website FPT"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2 – Quick links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                Truy cập nhanh
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Trang chủ KTX", href: "/" },
                  {
                    label: "Đặt phòng / Giữ chỗ",
                    href: "/login?mode=register",
                  },
                  { label: "Đăng nhập hệ thống", href: "/login" },
                  { label: "Câu hỏi thường gặp", href: "/#faq" },
                  { label: "Tiện ích & Không gian", href: "/#tien-ich" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="flex items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-sky-400"
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
              <h4 className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                Về Đại Học FPT
              </h4>
              <ul className="space-y-2">
                {[
                  {
                    label: "Trang chủ FPT Quy Nhơn",
                    href: "https://daihoc.fpt.edu.vn/quy-nhon",
                  },
                  {
                    label: "Cổng sinh viên FAP",
                    href: "https://fap.fpt.edu.vn",
                  },
                  {
                    label: "Phòng Công tác Sinh viên",
                    href: "https://daihocfpt.edu.vn",
                  },
                  {
                    label: "Học bổng & Hỗ trợ",
                    href: "https://daihocfpt.edu.vn",
                  },
                  {
                    label: "Lịch học & Thời khóa biểu",
                    href: "https://fap.fpt.edu.vn",
                  },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-300 transition-colors hover:text-sky-400"
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
              <h4 className="text-xs font-bold tracking-widest text-sky-400 uppercase">
                Liên hệ & Hỗ trợ
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  <span className="text-xs leading-relaxed text-slate-300">
                    Khu Đô thị An Phú Thịnh,
                    <br />
                    Phường Quy Nhơn Đông, Gia Lai
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="h-4 w-4 shrink-0 text-sky-400" />
                  <span className="text-xs text-slate-300">
                    Hotline BQL KTX:{" "}
                    <span className="font-bold text-white">0987 807 074</span>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-sky-400" />
                  <a
                    href="mailto:ktx.quynhon@fpt.edu.vn"
                    className="text-xs text-slate-300 transition-colors hover:text-sky-400"
                  >
                    ktx.quynhon@fpt.edu.vn
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 shrink-0 text-sky-400" />
                  <span className="text-xs text-slate-300">
                    Hỗ trợ học vụ:{" "}
                    <span className="font-bold text-white">1900 6868</span>
                  </span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/login?mode=register"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-600"
                >
                  Đăng ký lưu trú ngay
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 px-8 py-4 text-[11px] text-slate-400 sm:flex-row">
            <span>
              © 2026 Ban Quản Lý Ký Túc Xá – Đại Học FPT Quy Nhơn. Bảo lưu mọi
              quyền.
            </span>
            <span className="text-slate-500">
              Đồ án FER202 – Group 4 &nbsp;·&nbsp; Front-End Web Development
              with React
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
