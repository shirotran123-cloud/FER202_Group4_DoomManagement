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
import { UnauthorizedPage } from "@/pages/errors/UnauthorizedPage"
import { NotFoundPage } from "@/pages/errors/NotFoundPage"
import { MobileAppPage } from "@/pages/mobile/MobileAppPage"

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
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

            {/* Trải nghiệm Ứng dụng Di Động (Mobile App Simulator / Standalone PWA Screen) */}
            <Route path="/mobile" element={<MobileAppPage />} />

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

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
