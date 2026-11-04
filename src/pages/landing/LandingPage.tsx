import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { DormitoryGallerySlider } from "@/components/landing/DormitoryGallerySlider"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
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
    <ScrollReveal>
      <section id="faq" className="scroll-mt-24 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold tracking-wider text-secondary uppercase">
            Hỗ trợ thông tin 24/7
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            1001 sự thật về KTX Đại học FPT
          </h2>
          <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
            Giải đáp mọi thắc mắc của tân sinh viên và phụ huynh về quy chế sinh
            hoạt tại KTX FPT.
          </p>
        </div>

        <StaggerContainer staggerDelay={0.1} className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <StaggerItem key={idx}>
                <div
                  className={`ui-card-interactive overflow-hidden rounded-2xl border ${
                    isOpen
                      ? "border-secondary/40 bg-muted/50 shadow-md"
                      : "border-border bg-card"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-4 text-base font-semibold text-foreground">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          isOpen
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen ? "rotate-180 text-secondary" : ""
                      }`}
                    />
                  </button>

                  {/* Animated slide-down answer */}
                  <div
                    className={`grid transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 pl-18 text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </section>
    </ScrollReveal>
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
    <div className="space-y-16 pb-16 lg:space-y-24">
      {/* HERO SECTION: 60% Dominant White Card, 30% Secondary Navy Accents, 10% High-Contrast Primary CTA */}
      <ScrollReveal>
        <section
          id="dat-phong"
          className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12 lg:p-16"
        >
          <div className="relative z-10 max-w-3xl space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-2 text-xs font-bold tracking-wider text-secondary uppercase">
                <Sparkles className="h-4 w-4 text-primary" />
                Ký Túc Xá Đại Học FPT Quy Nhơn · Học Kỳ 2026–2027
              </span>
              <h1 className="text-3xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Không Gian Sống Chuẩn Mực,{" "}
                <span className="text-secondary">
                  Trải Nghiệm Đại Học Trọn Vẹn
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed font-normal text-muted-foreground sm:text-lg">
                Hệ thống quản lý lưu trú số hóa toàn diện với mô hình buồng riêng
                tư, tự động hóa công tơ điện nước VietQR và kiểm soát an ninh thông
                minh 24/7.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* 10% Accent CTA Button (WCAG 2.1 AA Contrast 6.42:1) */}
              <Link
                to="/booking"
                className="ui-btn-interactive inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md hover:bg-[#235330] hover:shadow-lg"
              >
                <BedDouble className="h-5 w-5" />
                <span>Đặt Phòng Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-4">
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
                    className="ui-btn-interactive inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-bold text-secondary-foreground shadow-sm hover:bg-[#162c49]"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Vào Bảng Điều Khiển ({user?.roleTitle})</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {user?.role === "student" && (
                    <Link
                      to="/my-room"
                      className="ui-btn-interactive inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-sm font-semibold text-foreground shadow-xs hover:bg-muted"
                    >
                      <span>Phòng Của Tôi (A205)</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <StaggerContainer
              staggerDelay={0.1}
              className="grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4"
            >
              <StaggerItem>
                <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  500+
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Giường tiêu chuẩn hiện đại
                </p>
              </StaggerItem>
              <StaggerItem>
                <p className="text-2xl font-extrabold text-secondary sm:text-3xl">
                  15 Phút
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Khóa giữ chỗ thanh toán
                </p>
              </StaggerItem>
              <StaggerItem>
                <p className="text-2xl font-extrabold text-primary sm:text-3xl">
                  100%
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Tự động xét duyệt 0-chạm
                </p>
              </StaggerItem>
              <StaggerItem>
                <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  24/7
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  An ninh bảo vệ & Kỹ thuật
                </p>
              </StaggerItem>
            </StaggerContainer>
          </div>

          <div className="pointer-events-none absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
        </section>
      </ScrollReveal>

      {/* Slide giới thiệu không gian KTX */}
      <ScrollReveal>
        <section className="space-y-6">
          <DormitoryGallerySlider />
        </section>
      </ScrollReveal>

      {/* TÍNH NĂNG NỔI BẬT (Staggered 100ms Card Grid) */}
      <ScrollReveal>
        <section id="tinh-nang" className="scroll-mt-24 space-y-8">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <span className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold tracking-wider text-secondary uppercase">
              Hệ sinh thái số hóa
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Tính Năng Nổi Bật Của Hệ Thống
            </h2>
            <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
              Trải nghiệm quản lý lưu trú thông minh, minh bạch và tiện lợi dành
              riêng cho sinh viên FPT.
            </p>
          </div>

          <StaggerContainer
            staggerDelay={0.1}
            className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
          >
            {highlights.map((h, i) => {
              const Icon = h.icon
              return (
                <StaggerItem key={i}>
                  <div className="ui-card-interactive group relative h-full rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {h.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                      {h.desc}
                    </p>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* BIỂU PHÍ LƯU TRÚ & DỊCH VỤ */}
      <ScrollReveal>
        <section id="bieu-phi" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <span className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold tracking-wider text-secondary uppercase">
                Minh bạch tài chính
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Biểu Phí Lưu Trú & Dịch Vụ
              </h2>
              <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                Áp dụng thống nhất cho năm học 2026–2027.
              </p>
            </div>
            <Link
              to="/billing"
              className="ui-btn-interactive inline-flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-2 text-xs font-bold text-secondary hover:bg-secondary hover:text-secondary-foreground sm:text-sm"
            >
              <span>Tra cứu chi tiết hóa đơn mẫu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="ui-card-interactive overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs font-bold tracking-wider text-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Hạng mục dịch vụ</th>
                  <th className="px-6 py-4">Đơn giá quy định</th>
                  <th className="px-6 py-4">Đơn vị tính</th>
                  <th className="hidden px-6 py-4 md:table-cell">
                    Ghi chú & Chính sách
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feeTable.map((f, i) => (
                  <tr
                    key={i}
                    className="transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted/40"
                  >
                    <td className="flex items-center gap-2 px-6 py-4 font-semibold text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span>{f.item}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-secondary">
                      {f.price}
                    </td>
                    <td className="px-6 py-4 font-normal text-muted-foreground">
                      {f.unit}
                    </td>
                    <td className="hidden px-6 py-4 text-xs font-normal text-muted-foreground md:table-cell">
                      {f.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </ScrollReveal>

      {/* QUY ĐỊNH CHUNG & KỶ LUẬT (Staggered 100ms Card Grid) */}
      <ScrollReveal>
        <section id="noi-quy" className="scroll-mt-24 space-y-8">
          <div className="space-y-2">
            <span className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold tracking-wider text-secondary uppercase">
              Văn hóa nội trú
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Quy Định Chung & Kỷ Luật Lưu Trú
            </h2>
            <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
              Sinh viên cam kết thực hiện nghiêm túc khi ký hợp đồng lưu trú điện
              tử.
            </p>
          </div>

          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {rules.map((r, i) => (
              <StaggerItem key={i}>
                <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                    <span>{r.title}</span>
                  </h3>
                  <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                    {r.content}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* TIỆN ÍCH & KHÔNG GIAN CHUNG (30% Secondary Container + Staggered Cards) */}
      <ScrollReveal>
        <section
          id="tien-ich"
          className="space-y-8 rounded-3xl border border-border bg-muted/50 p-8 sm:p-12"
        >
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tiện Ích & Không Gian Chung Hiện Đại
            </h2>
            <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
              Môi trường sinh hoạt an toàn, tiện nghi giúp sinh viên tập trung tối
              đa cho việc học.
            </p>
          </div>

          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6 text-center">
                <Wifi className="mx-auto h-8 w-8 text-secondary" />
                <h4 className="text-sm font-bold text-foreground sm:text-base">
                  Wi-Fi 6 Băng Thông Rộng
                </h4>
                <p className="text-xs leading-relaxed font-normal text-muted-foreground">
                  Phủ sóng toàn bộ phòng ngủ & sảnh
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6 text-center">
                <Coffee className="mx-auto h-8 w-8 text-secondary" />
                <h4 className="text-sm font-bold text-foreground sm:text-base">
                  Phòng Tự Học 24/7
                </h4>
                <p className="text-xs leading-relaxed font-normal text-muted-foreground">
                  Máy lạnh, bàn học nhóm yên tĩnh
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6 text-center">
                <Flame className="mx-auto h-8 w-8 text-secondary" />
                <h4 className="text-sm font-bold text-foreground sm:text-base">
                  Bếp Ăn Chung Tầng 1
                </h4>
                <p className="text-xs leading-relaxed font-normal text-muted-foreground">
                  Khu vực nấu nướng an toàn PCCC
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-secondary" />
                <h4 className="text-sm font-bold text-foreground sm:text-base">
                  Bảo Vệ & Camera AI 24/7
                </h4>
                <p className="text-xs leading-relaxed font-normal text-muted-foreground">
                  Kiểm soát ra vào thông minh
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* FAQ Accordion Section */}
      <FaqSection />

      {/* ── FOOTER (30% Secondary Brand Deep Navy #1e3a5f with WCAG AAA White Text) ── */}
      <ScrollReveal>
        <footer className="mt-8">
          <div className="overflow-hidden rounded-3xl bg-secondary text-secondary-foreground shadow-lg">
            {/* Accent stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="grid grid-cols-1 gap-10 p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
              {/* Col 1 – Brand */}
              <div className="space-y-4 lg:col-span-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base leading-tight font-extrabold text-white">
                      Ký Túc Xá
                    </p>
                    <p className="text-xs font-semibold text-sky-200">
                      Đại Học FPT Quy Nhơn
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-normal text-slate-200 sm:text-sm">
                  Hệ thống quản lý KTX thông minh – minh bạch, tiện lợi và an toàn
                  cho toàn thể sinh viên FPT.
                </p>
                <div className="flex gap-2 pt-2">
                  <a
                    href="https://daihocfpt.edu.vn"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-primary"
                    aria-label="Website FPT"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Col 2 – Quick links */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest text-sky-200 uppercase">
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
                        className="ui-btn-interactive flex items-center gap-2 py-1 text-xs font-medium text-slate-200 hover:text-white sm:text-sm"
                      >
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        <span>{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 – FPT links */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest text-sky-200 uppercase">
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
                        className="ui-btn-interactive flex items-center gap-2 py-1 text-xs font-medium text-slate-200 hover:text-white sm:text-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span>{l.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4 – Contact */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest text-sky-200 uppercase">
                  Liên hệ & Hỗ trợ
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" />
                    <span className="text-xs leading-relaxed font-normal text-slate-200 sm:text-sm">
                      Khu Đô thị An Phú Thịnh,
                      <br />
                      Phường Quy Nhơn Đông, Gia Lai
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 shrink-0 text-sky-200" />
                    <span className="text-xs text-slate-200 sm:text-sm">
                      Hotline BQL KTX:{" "}
                      <span className="font-bold text-white">0987 807 074</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-sky-200" />
                    <a
                      href="mailto:ktx.quynhon@fpt.edu.vn"
                      className="text-xs text-slate-200 transition-colors hover:text-white sm:text-sm"
                    >
                      ktx.quynhon@fpt.edu.vn
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 shrink-0 text-sky-200" />
                    <span className="text-xs text-slate-200 sm:text-sm">
                      Hỗ trợ học vụ:{" "}
                      <span className="font-bold text-white">1900 6868</span>
                    </span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    to="/login?mode=register"
                    className="ui-btn-interactive inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-[#235330] sm:text-sm"
                  >
                    <span>Đăng ký lưu trú ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col items-center justify-between gap-2 border-t border-white/15 px-8 py-4 text-xs text-slate-200 sm:flex-row">
              <span>
                © 2026 Ban Quản Lý Ký Túc Xá – Đại Học FPT Quy Nhơn. Bảo lưu mọi
                quyền.
              </span>
              <span className="text-slate-300">
                Đồ án FER202 – Group 4 &nbsp;·&nbsp; Front-End Web Development
                with React
              </span>
            </div>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  )
}
