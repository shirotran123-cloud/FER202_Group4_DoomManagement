import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, BookOpen, Coffee, Pause, Play, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    badge: "KTX FPT Quy Nhơn",
    icon: BookOpen,
    title: "Toàn cảnh KTX",
    subtitle:
      "Toàn cảnh KTX FPT Quy Nhơn — ngôi nhà thứ hai của sinh viên.",
    imageUrl: "/assets/dorm-cinematic/dorm-keyframe-fpt-1.jpg",
    tags: ["Ảnh thật", "FPT Quy Nhơn", "Toàn cảnh"],
  },
  {
    id: 2,
    badge: "Phòng sinh hoạt chung",
    icon: Coffee,
    title: "Phòng sinh hoạt chung",
    subtitle:
      "Không gian sinh hoạt chung thoáng đãng — đúng chuẩn mô hình quản lý 1:4:6 của web.",
    imageUrl: "/assets/dorm-cinematic/dorm-keyframe-fpt-2.jpg",
    tags: ["Ảnh thật", "Sinh hoạt chung", "Mô hình 1:4:6"],
  },
  {
    id: 3,
    badge: "Buồng 6 người",
    icon: Coffee,
    title: "Buồng 6 người",
    subtitle:
      "Buồng ở 6 người gọn gàng, riêng tư — mỗi giường đều có không gian cá nhân.",
    imageUrl: "/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg",
    tags: ["Ảnh thật", "Buồng 6 người", "Riêng tư"],
  },
  {
    id: 4,
    badge: "Khu vực nhà vệ sinh",
    icon: BookOpen,
    title: "Khu vực nhà vệ sinh",
    subtitle:
      "Khu vệ sinh sạch sẽ, hiện đại — đảm bảo tiện nghi sinh hoạt hằng ngày.",
    imageUrl: "/assets/dorm-cinematic/dorm-keyframe-fpt-4.jpg",
    tags: ["Ảnh thật", "Tiện nghi", "Sạch sẽ"],
  },
]

const DOT_LABELS = ["Toàn cảnh", "SH chung", "Buồng 6", "Vệ sinh"]

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
      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Main Image Banner with Smooth Crossfade */}
      <div className="relative h-[380px] w-full overflow-hidden bg-[#171a26] sm:h-[460px] lg:h-[520px]">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? "z-10 scale-100 opacity-100" : "pointer-events-none z-0 scale-105 opacity-0"
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
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 text-white sm:p-10 lg:p-12">
          {/* Top Bar inside Slide */}
          <div className="pointer-events-auto flex items-center justify-between">
            <Badge variant="default" className="border-white/25 bg-black/40 text-white backdrop-blur-md">
              <IconComponent className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{currentSlide.badge}</span>
            </Badge>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium backdrop-blur-md transition-colors hover:bg-black/60 sm:inline-flex"
                title={isPlaying ? "Tạm dừng lướt tự động" : "Tiếp tục lướt tự động"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 shrink-0 text-white/80" />
                    <span className="whitespace-nowrap text-white/80">Tự động chuyển</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">Đang dừng</span>
                  </>
                )}
              </button>

              <div className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 font-mono text-xs font-bold backdrop-blur-md">
                <span>0{currentIndex + 1}</span>
                <span className="mx-1 text-white/40">/</span>
                <span className="text-white/80">0{SLIDES.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom Captions & Feature Tags */}
          <div className="pointer-events-auto max-w-2xl space-y-3.5">
            <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
              {currentSlide.title}
            </h3>

            <p className="max-w-xl text-xs leading-relaxed text-white/85 drop-shadow-sm sm:text-sm lg:text-base">
              {currentSlide.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentSlide.tags.map((tag, tIdx) => (
                <Badge
                  key={tIdx}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-[11px] font-medium text-white/95 backdrop-blur-md"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Prev & Next Floating Buttons */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Thumbnail / Dot Navigation Bar at bottom */}
      <div className="border-t border-border bg-card/95 px-4 py-3 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span className="whitespace-nowrap text-xs font-bold text-foreground">
              Không gian KTX FPT chuẩn 1:4:6
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, sIdx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(sIdx)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  sIdx === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full transition-transform ${
                    sIdx === currentIndex ? "scale-110 bg-current" : "bg-current opacity-60"
                  }`}
                />
                <span className="hidden whitespace-nowrap text-[11px] md:inline">{DOT_LABELS[sIdx]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
