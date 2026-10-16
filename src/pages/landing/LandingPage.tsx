import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { DormitoryGallerySlider } from "@/components/landing/DormitoryGallerySlider"
import { CinematicScrubStage } from "@/components/landing/CinematicScrubStage"
import { DormDepthCards } from "@/components/landing/DormDepthCards"
import { AmbientAudioToggle } from "@/components/landing/AmbientAudioToggle"
import { DormRoomTour } from "@/components/landing/DormRoomTour"
import { DormDollyClip } from "@/components/landing/DormDollyClip"
import { BedDouble, ShieldCheck, Zap, Receipt, Clock, Sparkles, ArrowRight, CircleCheck, ChevronDown, MoonStar } from "lucide-react"

const FAQ_ITEMS = [
  {
    question: "Mô hình buồng riêng 1:4:6 là gì?",
    answer:
      "Mỗi phòng lớn có 4 buồng riêng A, B, C, D, mỗi buồng 6 giường, tổng 24 giường. Mỗi giường có rèm che riêng tư, đèn bàn, ổ cắm và tủ locker khóa số.",
  },
  {
    question: "Tiền điện nước tính và chia như thế nào?",
    answer:
      "Công tơ được chụp ảnh nghiệm thu ngày 25–28 hàng tháng. Hệ thống tính điện theo bậc thang, cộng nước + wifi + vệ sinh rồi chia đều cho số sinh viên thực ở, kèm mã VietQR.",
  },
  {
    question: "Đi làm thêm, học nhóm về muộn sau 23:00 thì sao?",
    answer:
      "Gửi đơn xin về muộn trực tuyến trước 21:00 cùng ngày. BQL duyệt và cấp mã QR qua cổng mà không bị trừ điểm rèn luyện.",
  },
  {
    question: "Tiền cọc được hoàn lại khi nào?",
    answer:
      "Cọc 1.000.000đ được hoàn 100% về tài khoản ngân hàng sau khi hoàn tất biên bản bàn giao, trừ chi phí hư hại nếu có.",
  },
  {
    question: "Đăng nhập bằng tài khoản gì?",
    answer:
      "Sinh viên dùng Gmail cá nhân đã đăng ký trong hồ sơ tuyển sinh. Cán bộ dùng email @fpt.edu.vn hoặc @fe.edu.vn.",
  },
  {
    question: "Phòng hỏng điều hòa, vòi sen thì báo ở đâu?",
    answer:
      "Vào mục Báo hỏng, chọn vị trí, tải ảnh chụp hiện trường lên, mô tả sự cố. Khẩn cấp xử lý trong 2 giờ, thường trong 24 giờ.",
  },
]

const FEATURES = [
  { icon: BedDouble, title: "Buồng riêng 1:4:6", desc: "4 buồng riêng mỗi phòng, rèm che + tủ locker từng giường." },
  { icon: Zap, title: "Duyệt 0 chạm", desc: "Đối soát tự động, cấp e-Contract PDF trong vài giây." },
  { icon: Clock, title: "Giữ chỗ 15 phút", desc: "Khóa giường thời gian thực, không lo trùng lặp." },
  { icon: Receipt, title: "Hóa đơn minh bạch", desc: "Điện bậc thang + chia đều, VietQR tự điền." },
  { icon: ShieldCheck, title: "An ninh 24/7", desc: "QR qua cổng, quản lý điểm rèn luyện rõ ràng." },
  { icon: MoonStar, title: "Giới nghiêm 23:00", desc: "Đơn về muộn online trước 21:00." },
]

const FEES = [
  { item: "Thuê giường buồng riêng", price: "900.000đ", unit: "/tháng" },
  { item: "Đặt cọc tài sản", price: "1.000.000đ", unit: "hoàn khi trả phòng" },
  { item: "Điện (bậc thang)", price: "1.800–3.100đ", unit: "/kWh" },
  { item: "Nước sinh hoạt", price: "18.000đ", unit: "/m³" },
  { item: "Wifi + vệ sinh", price: "180.000đ", unit: "/phòng/tháng" },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-24">
      <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-primary">Hỏi đáp</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Câu hỏi thường gặp</h2>
      <div className="mt-5 space-y-2.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = open === idx
          return (
            <div key={idx} className={`overflow-hidden rounded-2xl border transition-all ${isOpen ? "border-primary/30 bg-primary-soft/60" : "border-border bg-card"}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold">{item.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="prose px-5 pb-4 text-[13.5px] leading-relaxed text-muted-foreground">{item.answer}</p>
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
  const { isAuthenticated } = useAuth()
  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
      {/* HERO */}
      <section className="dms-hero-grid relative overflow-hidden rounded-[28px] border border-border bg-card px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#171a26] px-4 py-1.5 text-xs font-bold whitespace-nowrap text-white dark:bg-white dark:text-black">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
            KTX FPT University · Kỳ Fall 2026
          </div>
          <h1 className="mt-5 font-display text-[34px] font-black leading-[1.12] tracking-tight sm:text-[52px]">
            Sống KTX
            <br />
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              nhẹ nhàng hơn
            </span>{" "}
            mỗi ngày.
          </h1>
          <p className="prose mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Đặt giường 1:4:6, hóa đơn điện nước chia tự động, báo hỏng kèm ảnh, QR qua cổng 23:00 — tất cả trong một nơi.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? "/booking" : "/login?mode=login"}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold whitespace-nowrap text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
            >
              <BedDouble className="h-4 w-4 shrink-0" />
              Đặt giường ngay
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <a
              href="#bieu-phi"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-bold whitespace-nowrap transition-colors hover:bg-muted"
            >
              <Receipt className="h-4 w-4 shrink-0" />
              Xem biểu phí
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {[
              ["2.400+", "giường quản lý"],
              ["98%", "hài lòng xử lý"],
              ["< 2h", "sự cố khẩn cấp"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-black">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODEL */}
      <section id="mo-hinh" className="scroll-mt-24">
        <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-primary">Mô hình 1:4:6</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Một phòng, bốn buồng riêng</h2>
        <p className="prose mt-2 max-w-2xl text-sm text-muted-foreground">
          1 phòng lớn chia 4 buồng A–B–C–D, mỗi buồng 6 giường. Riêng tư từng giường nhưng vẫn sinh hoạt chung thoải mái.
        </p>
        <div className="mt-6"><DormitoryGallerySlider /></div>
      </section>

      {/* CINEMATIC SCROLL: sticky canvas scrub qua 96-frame sequence KTX */}
      <CinematicScrubStage />

      {/* CHIỀU SÂU 3D: perspective cards cùng keyframes */}
      <DormDepthCards />

      {/* TOUR PHÂN NHÁNH: dừng ở hành lang, chọn phòng 101-104, vào buồng 6 người */}
      <DormRoomTour />

      {/* CLIP DOLLY: enhancement tuyến tính, scrub dùng ảnh tĩnh */}
      <section aria-label="Clip dolly KTX" className="scroll-mt-24">
        <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-primary">Chuyển động</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Clip dolly KTX FPT Quy Nhơn</h2>
        <p className="prose mt-2 max-w-2xl text-sm text-muted-foreground">
          Clip dựng tay từ đúng 4 ảnh gallery: Toàn cảnh → Sinh hoạt chung → Buồng 6 người → Nhà vệ sinh. Trang scrub qua ảnh tĩnh để tránh giật; clip chỉ phát tuyến tính khi bạn bấm play.
        </p>
        <DormDollyClip />
      </section>
      <AmbientAudioToggle />

      {/* FEATURES */}
      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Mọi việc KTX, gọn trong một app</h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="dms-card group p-5 transition-transform hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <p className="mt-3.5 font-display text-[15px] font-bold">{f.title}</p>
              <p className="prose mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEES */}
      <section id="bieu-phi" className="scroll-mt-24">
        <div className="dms-card overflow-hidden">
          <div className="border-b border-border bg-card px-6 py-5">
            <h2 className="font-display text-xl font-extrabold">Biểu phí minh bạch</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Không phí ẩn. Hóa đơn chi tiết từng tháng.</p>
          </div>
          <ul className="divide-y divide-border">
            {FEES.map((f) => (
              <li key={f.item} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <CircleCheck className="h-4 w-4 shrink-0 text-success" />
                  {f.item}
                </span>
                <span className="text-right">
                  <span className="font-display text-[15px] font-extrabold">{f.price}</span>{" "}
                  <span className="text-xs text-muted-foreground">{f.unit}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RULES */}
      <section id="noi-quy" className="scroll-mt-24">
        <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.14em] text-primary">Nội quy</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Sống chung văn minh</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            ["Giới nghiêm 23:00", "Cổng đóng 23:00 – mở 05:30. Đơn về muộn nộp online trước 21:00."],
            ["An toàn điện, PCCC", "Không nấu ăn trong buồng ngủ, chỉ dùng bếp chung tầng 1."],
            ["Điểm rèn luyện 100", "Vi phạm trừ 5–25 điểm tùy mức. Quá 30 điểm dừng lưu trú kỳ sau."],
            ["Tôn trọng riêng tư", "Không dẫn người lạ qua đêm chưa đăng ký. Giữ yên lặng sau 22:30."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-[15px] font-bold">{t}</p>
              <p className="prose mt-1 text-[13px] text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <Faq />

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary px-6 py-12 text-center text-primary-foreground sm:py-16">
        <h2 className="mx-auto max-w-xl font-display text-2xl font-black sm:text-4xl">Sẵn sàng dọn vào phòng mới?</h2>
        <p className="prose mx-auto mt-2 max-w-md text-sm opacity-80">Chọn giường, giữ chỗ 15 phút, thanh toán VietQR — xong trong 5 phút.</p>
        <Link
          to={isAuthenticated ? "/booking" : "/login?mode=login"}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-card px-7 py-3.5 text-sm font-bold whitespace-nowrap text-foreground transition-transform hover:scale-[1.03]"
        >
          Bắt đầu ngay <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </div>
  )
}
