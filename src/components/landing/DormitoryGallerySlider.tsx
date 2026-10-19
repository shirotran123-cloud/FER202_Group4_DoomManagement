import React, { useState, useEffect } from "react"
import {
  Bath,
  Bed,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  TreePine,
  Users,
} from "lucide-react"

interface SlideItem {
  id: number
  title: string
  badge: string
  icon: React.ElementType
  subtitle: string
  imageUrl: string
  navLabel: string
  tags: string[]
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "Buồng ngủ",
    icon: Bed,
    title: "Không Gian Buồng Ngủ Riêng Tư & Tiện Nghi",
    subtitle:
      "Cấu trúc buồng riêng biệt với rèm kéo cách âm, đệm cao cấp, đèn đọc sách chuyên dụng, ổ sạc Type-C và tủ đồ khóa mã số cá nhân an toàn tuyệt đối.",
    imageUrl: "/images/giuongtang.jpg",
    navLabel: "Buồng ngủ",
    tags: [
      "Rèm che riêng tư 100%",
      "Đèn học & Ổ cắm cá nhân",
      "Khóa tủ điện tử",
      "Điều hòa Inverter",
    ],
  },
  {
    id: 2,
    badge: "Khu vực tự học & Sáng tạo",
    icon: BookOpen,
    title: "Phòng Tự Học Co-Working Mở Cửa 24/7",
    subtitle:
      "Không gian làm việc nhóm và ôn thi Capstone lý tưởng với bàn ghế công thái học, ánh sáng tiêu chuẩn bảo vệ mắt cùng mạng Wi-Fi 6 tốc độ cao miễn phí.",
    imageUrl: "/images/phongo.jpg",
    navLabel: "Sinh hoạt chung",
    tags: [
      "Wi-Fi 6 Băng thông rộng",
      "Ghế công thái học",
      "Bàn học cá nhân & nhóm",
      "Môi trường yên tĩnh",
    ],
  },
  {
    id: 3,
    badge: "Tiện ích sinh hoạt toàn diện",
    icon: Coffee,
    title: "Bếp Nấu Ăn Tầng 1 & Phòng Sinh Hoạt Chung",
    subtitle:
      "Trang bị đầy đủ hệ thống bếp từ âm an toàn PCCC, lò vi sóng, tủ lạnh lớn và khu máy giặt sấy tự động hiện đại giúp sinh viên an tâm sinh hoạt như tại nhà.",
    imageUrl: "/images/khubep.jpg",
    navLabel: "Khu bếp",
    tags: [
      "Bếp điện từ & Lò vi sóng",
      "Máy giặt sấy thông minh",
      "Không gian sinh hoạt rộng",
      "Tủ lạnh bảo quản",
    ],
  },
  {
    id: 4,
    badge: "Khu vệ sinh sạch sẽ",
    icon: Bath,
    title: "Khu Vệ Sinh Sạch Sẽ & Tiện Nghi",
    subtitle:
      "Khu vực vệ sinh có bồn rửa, gương lớn và không gian sử dụng thoáng, sạch sẽ.",
    imageUrl: "/images/nhavesinh.jpg",
    navLabel: "Khu vệ sinh",
    tags: ["Khu vực vệ sinh riêng", "Bồn rửa & gương", "Không gian sạch sẽ"],
  },
  {
    id: 5,
    badge: "Sảnh tiếp đón & khu vực chờ",
    icon: Users,
    title: "Sảnh Tiếp Đón Ký Túc Xá",
    subtitle:
      "Không gian lễ tân sáng sủa, hiện đại với khu vực chờ thoải mái dành cho sinh viên và khách đến thăm.",
    imageUrl: "/images/anninh.jpg",
    navLabel: "Sảnh tiếp đón",
    tags: ["Khu vực lễ tân", "Khu vực chờ", "Không gian sáng sủa"],
  },
  {
    id: 6,
    badge: "Tòa nhà ký túc xá FPT",
    icon: Building2,
    title: "Khu Nhà Ở Sinh Viên FPT",
    subtitle:
      "Tòa ký túc xá hiện đại nằm trong khuôn viên trường, thuận tiện cho sinh hoạt và học tập.",
    imageUrl: "/images/kitucxa.jpg",
    navLabel: "Tòa KTX",
    tags: ["Ký túc xá FPT", "Khuôn viên trường", "Không gian xanh"],
  },
  {
    id: 7,
    badge: "Cảnh quan khuôn viên",
    icon: TreePine,
    title: "Khuôn Viên Xanh Thoáng Đãng",
    subtitle:
      "Khuôn viên rộng rãi với nhiều cây xanh, lối đi bộ và khoảng sân thoáng đãng quanh khu ký túc xá.",
    imageUrl: "/images/khuonvientruong.jpg",
    navLabel: "Khuôn viên",
    tags: ["Nhiều cây xanh", "Lối đi bộ", "Sân rộng thoáng đãng"],
  },
]

export const DormitoryGallerySlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

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
    const timer = setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % SLIDES.length)
    }, 2000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const currentSlide = SLIDES[currentIndex]
  
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
      {/* Main Image Banner with Smooth Crossfade */}
      <div className="relative h-[380px] w-full overflow-hidden bg-slate-900 sm:h-[460px] lg:h-[520px]">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex
                ? "z-10 scale-100 opacity-100"
                : "pointer-events-none z-0 scale-105 opacity-0"
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
          <div className="pointer-events-auto flex items-center justify-end">
            <div className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1 font-mono text-xs font-bold backdrop-blur-md">
              <span className="text-sky-400">0{currentIndex + 1}</span>
              <span className="mx-1 text-white/40">/</span>
              <span className="text-white/80">0{SLIDES.length}</span>
            </div>
          </div>

          {/* Bottom Captions & Feature Tags */}
          <div className="pointer-events-auto max-w-2xl space-y-3">
            <h3 className="text-xl leading-tight font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
              {currentSlide.title}
            </h3>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentSlide.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md"
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
          className="absolute top-1/2 left-4 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-sky-500 hover:bg-sky-600 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="absolute top-1/2 right-4 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-sky-500 hover:bg-sky-600 active:scale-95"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnail / Dot Navigation Bar at bottom */}
      <div className="border-t border-border bg-card/95 px-4 py-3 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Khám Phá Không Gian Ký Túc Xá FPT
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
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-transform ${
                    sIdx === currentIndex
                      ? "scale-110 bg-white"
                      : "bg-muted-foreground/60"
                  }`}
                />
                <span className="hidden text-[11px] md:inline">
                  {slide.navLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
