import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { FireworksBackground } from "@/components/animate-ui/backgrounds/fireworks"
import { Sparkles, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/useAuth"

export const WelcomeFireworksOverlay: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [showFireworks, setShowFireworks] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Chỉ kích hoạt khi vừa đăng nhập thành công (được đánh dấu qua sessionStorage hoặc state)
    const hasSessionTrigger = sessionStorage.getItem("dms_show_welcome_fireworks") === "true"
    const hasStateTrigger = (location.state as { showWelcomeFireworks?: boolean } | null)?.showWelcomeFireworks === true

    if (hasSessionTrigger || hasStateTrigger) {
      setShowFireworks(true)
      setIsFadingOut(false)

      // Hiệu ứng pháo hoa kéo dài 3 giây
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true)

        // Sau 500ms làm mờ dần, gỡ bỏ overlay hoàn toàn và dọn dẹp cờ
        const cleanupTimer = setTimeout(() => {
          setShowFireworks(false)
          setIsFadingOut(false)
          try {
            sessionStorage.removeItem("dms_show_welcome_fireworks")
            if (window.history.replaceState) {
              window.history.replaceState({}, document.title)
            }
          } catch {}
        }, 500)

        return () => clearTimeout(cleanupTimer)
      }, 3000)

      return () => clearTimeout(fadeTimer)
    }
  }, [location])

  if (!showFireworks) return null

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-fireworks-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md overflow-hidden pointer-events-auto"
        onClick={() => {
          // Cho phép click để đóng nhanh nếu người dùng không muốn đợi đủ 3s
          setIsFadingOut(true)
          setTimeout(() => {
            setShowFireworks(false)
            sessionStorage.removeItem("dms_show_welcome_fireworks")
          }, 300)
        }}
      >
        {/* Pháo hoa Canvas nền với 11 gam màu rực rỡ */}
        <FireworksBackground className="absolute inset-0 z-0 pointer-events-none" population={3} />

        {/* Khung chữ Welcome to DOMANAGE ở trung tâm */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{
            scale: isFadingOut ? 1.05 : 1,
            opacity: isFadingOut ? 0 : 1,
            y: 0,
          }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl select-none"
        >
          {/* Quầng sáng gradient mờ huyền ảo phía sau */}
          <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/25 via-cyan-500/30 to-amber-500/25 blur-3xl rounded-full pointer-events-none" />

          {/* Tag FPT Dormitory */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-emerald-300 shadow-xl mb-4">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            <span>KÝ TÚC XÁ ĐẠI HỌC FPT</span>
          </div>

          {/* Dòng chữ chính Welcome to DOMANAGE */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_30px_rgba(16,185,129,0.6)] mb-3">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              DOMANAGE
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200/90 font-medium drop-shadow-md max-w-md">
            {user?.fullName
              ? `Xin chào ${user.fullName}! Không gian ký túc xá của bạn đã sẵn sàng.`
              : "Đăng nhập thành công! Không gian ký túc xá của bạn đã sẵn sàng."}
          </p>

          {/* Trạng thái sẵn sàng */}
          <div className="flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              Bảng điều khiển đã sẵn sàng
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WelcomeFireworksOverlay

