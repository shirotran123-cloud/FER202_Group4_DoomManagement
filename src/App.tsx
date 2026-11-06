import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/useAuth"
import { BookingProvider } from "@/contexts/BookingContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingLayout } from "@/components/layout/LandingLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LandingPage } from "@/pages/landing/LandingPage"
import { StudentOverviewPage } from "@/pages/overview/StudentOverviewPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { ProfilePage } from "@/pages/profile/ProfilePage"
import { BookingPage } from "@/pages/booking/BookingPage"
import { BillingPage } from "@/pages/billing/BillingPage"
import { MyRoomPage } from "@/pages/room/MyRoomPage"
import { MaintenancePage } from "@/pages/maintenance/MaintenancePage"
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage"
import { SupabaseManagerPage } from "@/pages/supabase/SupabaseManagerPage"
import { UnauthorizedPage } from "@/pages/errors/UnauthorizedPage"
import { NotFoundPage } from "@/pages/errors/NotFoundPage"
import { MobileAppPage } from "@/pages/mobile/MobileAppPage"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

function HomeRoute() {
  const { isAuthenticated, user } = useAuth()

  // Chưa đăng nhập -> Hiện trang chào mừng (Landing Page)
  if (!isAuthenticated || !user) {
    return (
      <LandingLayout>
        <LandingPage />
      </LandingLayout>
    )
  }

  // Đã đăng nhập -> Tự động chuyển thẳng tới Bảng điều khiển tương ứng theo vai trò
  const destination =
    user.role === "manager"
      ? "/manager"
      : user.role === "technician"
        ? "/maintenance"
        : "/overview"

  return <Navigate to={destination} replace />
}

export function App() {
  // Hiệu ứng Ripple cho tất cả các nút bấm (Button / role="button") trên toàn bộ hệ thống
  useEffect(() => {
    const handleGlobalRipple = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "clientX" in e ? e.clientX : e.touches && e.touches[0]?.clientX
      const clientY =
        "clientY" in e ? e.clientY : e.touches && e.touches[0]?.clientY
      if (clientX === undefined || clientY === undefined) return

      const target = (e.target as HTMLElement | null)?.closest(
        'button, [role="button"], a.btn, .ui-btn-interactive'
      ) as HTMLElement | null
      if (!target) return

      // Bỏ qua nếu đã được quản lý bởi @animate-ui RippleButton
      if (target.getAttribute("data-slot") === "ripple-button") return

      const rect = target.getBoundingClientRect()
      const diameter = Math.max(rect.width, rect.height) * 2
      const radius = diameter / 2
      const x = clientX - rect.left - radius
      const y = clientY - rect.top - radius

      const ripple = document.createElement("span")
      ripple.className = "global-btn-ripple"
      ripple.style.width = `${diameter}px`
      ripple.style.height = `${diameter}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`

      const pos = window.getComputedStyle(target).position
      if (pos === "static") {
        target.style.position = "relative"
      }
      target.style.overflow = "hidden"

      target.appendChild(ripple)
      setTimeout(() => {
        ripple.remove()
      }, 650)
    }

    document.addEventListener("pointerdown", handleGlobalRipple)
    return () => {
      document.removeEventListener("pointerdown", handleGlobalRipple)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <ErrorBoundary>
            <Routes>
              {/* Trang chủ KTX: Chưa đăng nhập -> Trang chào mừng; Đã đăng nhập -> Bảng điều khiển */}
              <Route path="/" element={<HomeRoute />} />

              {/* Đường dẫn xem trực tiếp trang chào mừng nếu cần */}
              <Route
                path="/welcome"
                element={
                  <LandingLayout>
                    <LandingPage />
                  </LandingLayout>
                }
              />

              {/* Các phân hệ tác vụ có Sidebar & Mobile Bottom Navigation: /overview, /my-room, /booking, etc. */}
              <Route element={<AppLayout />}>
                {/* Bảng điều khiển sinh viên (Overview): Sau khi đăng nhập */}
                <Route
                  path="/overview"
                  element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                      <StudentOverviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Thẻ QR Ra Vào Cổng & Giới Nghiêm */}
                <Route
                  path="/mobile"
                  element={
                    <ProtectedRoute>
                      <MobileAppPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gate-pass"
                  element={
                    <ProtectedRoute>
                      <MobileAppPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-room"
                  element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                      <MyRoomPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/billing"
                  element={
                    <ProtectedRoute>
                      <BillingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute>
                      <MaintenancePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/curfew" element={<Navigate to="/manager" replace />} />

                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                      <ManagerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/supabase"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "admin"]}>
                      <SupabaseManagerPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
