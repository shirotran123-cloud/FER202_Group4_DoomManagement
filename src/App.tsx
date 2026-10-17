import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
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
import { CurfewPage } from "@/pages/curfew/CurfewPage"
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage"
import { UnauthorizedPage } from "@/pages/errors/UnauthorizedPage"
import { NotFoundPage } from "@/pages/errors/NotFoundPage"
import { QATestPlanPage } from "@/pages/stubs/QATestPlanPage"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
        <Routes>
          {/* Trang chủ KTX: Không có Sidebar, trang đầu tiên khi truy cập localhost:5173 */}
          <Route
            path="/"
            element={
              <LandingLayout>
                <LandingPage />
              </LandingLayout>
            }
          />

          {/* Các phân hệ tác vụ có Sidebar Stitch: /overview, /my-room, /booking, etc. */}
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

            <Route
              path="/curfew"
              element={
                <ProtectedRoute>
                  <CurfewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/qa"
              element={
                <ProtectedRoute>
                  <QATestPlanPage />
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