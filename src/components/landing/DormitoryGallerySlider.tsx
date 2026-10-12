import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Sparkles, Bed, BookOpen, Coffee, ShieldCheck, Pause, Play } from "lucide-react"

interface SlideItem {
  id: number
  title: string
  badge: string
  icon: React.ElementType
  subtitle: string
  imageUrl: string
  tags: string[]
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "Mô hình độc quyền 1:4:6",
    icon: Bed,
    title: "Không Gian Buồng Ngủ Riêng Tư & Tiện Nghi",
    subtitle:
      "Cấu trúc buồng riêng biệt với rèm kéo cách âm, đệm cao cấp, đèn đọc sách chuyên dụng, ổ sạc Type-C và tủ đồ khóa mã số cá nhân an toàn tuyệt đối.",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    tags: ["Rèm che riêng tư 100%", "Đèn học & Ổ cắm cá nhân", "Khóa tủ điện tử", "Điều hòa Inverter"],
  },
  {
    id: 2,
    badge: "Khu vực tự học & Sáng tạo",
    icon: BookOpen,
    title: "Phòng Tự Học Co-Working Mở Cửa 24/7",
    subtitle:
      "Không gian làm việc nhóm và ôn thi Capstone lý tưởng với bàn ghế công thái học, ánh sáng tiêu chuẩn bảo vệ mắt cùng mạng Wi-Fi 6 tốc độ cao miễn phí.",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    tags: ["Wi-Fi 6 Băng thông rộng", "Ghế công thái học", "Bàn học cá nhân & nhóm", "Môi trường yên tĩnh"],
  },
  {
    id: 3,
    badge: "Tiện ích sinh hoạt toàn diện",
    icon: Coffee,
    title: "Bếp Nấu Ăn Tầng 1 & Phòng Sinh Hoạt Chung",
    subtitle:
      "Trang bị đầy đủ hệ thống bếp từ âm an toàn PCCC, lò vi sóng, tủ lạnh lớn và khu máy giặt sấy tự động hiện đại giúp sinh viên an tâm sinh hoạt như tại nhà.",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    tags: ["Bếp điện từ & Lò vi sóng", "Máy giặt sấy thông minh", "Không gian sinh hoạt rộng", "Tủ lạnh bảo quản"],
  },
  {
    id: 4,
    badge: "An ninh 24/7 & Cảnh quan xanh",
    icon: ShieldCheck,
    title: "Khuôn Viên Xanh & Cổng Kiểm Soát Thông Minh",
    subtitle:
      "Cổng xoay an ninh tự động đối chiếu thẻ sinh viên RFID, bảo vệ trực ban 24/7 cùng khuôn viên nhiều cây xanh, sân thể thao bóng rổ năng động.",
    imageUrl:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    tags: ["Cổng trục xoay RFID", "Camera giám sát AI", "Sân bóng rổ & Thể thao", "Công viên dạo bộ"],
  },
]

export const DormitoryGallerySlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNext()
      }, 5000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, currentIndex])

  const currentSlide = SLIDES[currentIndex]
  const IconComponent = currentSlide.icon

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg group"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Main Image Banner with Smooth Crossfade */}
      <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] w-full overflow-hidden bg-slate-900">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-105"
            } transition-transform duration-1000`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-cover object-center brightness-[0.78] contrast-[1.05]"
            />
            {/* Dark & Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          </div>
        ))}

        {/* Content Box Over the Image */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white pointer-events-none">
          {/* Top Bar inside Slide */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-xs">
              <IconComponent className="h-4 w-4 text-orange-400" />
              <span className="text-orange-200">{currentSlide.badge}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium backdrop-blur-md hover:bg-black/60 transition-colors"
                title={isPlaying ? "Tạm dừng lướt tự động" : "Tiếp tục lướt tự động"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 text-white/80" />
                    <span className="text-white/80">Tự động chuyển</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-orange-400" />
                    <span className="text-orange-300">Đang dừng</span>
                  </>
                )}
              </button>

              <div className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-xs font-mono font-bold backdrop-blur-md">
                <span className="text-orange-400">0{currentIndex + 1}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/80">0{SLIDES.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom Captions & Feature Tags */}
          <div className="max-w-2xl space-y-3.5 pointer-events-auto">
            <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              {currentSlide.title}
            </h3>

            <p className="text-xs sm:text-sm lg:text-base text-white/85 leading-relaxed drop-shadow-sm max-w-xl">
              {currentSlide.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentSlide.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md text-white/95"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Prev & Next Floating Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-orange-600 hover:border-orange-500 hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-orange-600 hover:border-orange-500 hover:scale-110 active:scale-95 shadow-lg"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnail / Dot Navigation Bar at bottom */}
      <div className="bg-card/95 border-t border-border px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-bold text-foreground">
              Khám Phá Không Gian Ký Túc Xá FPT Chuẩn 1:4:6
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, sIdx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(sIdx)}
                className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  sIdx === currentIndex
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-transform ${
                    sIdx === currentIndex ? "bg-white scale-110" : "bg-muted-foreground/60"
                  }`}
                />
                <span className="hidden md:inline text-[11px]">
                  {sIdx === 0
                    ? "Buồng ngủ"
                    : sIdx === 1
                    ? "Tự học 24/7"
                    : sIdx === 2
                    ? "Bếp & Sinh hoạt"
                    : "Khuôn viên & An ninh"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
