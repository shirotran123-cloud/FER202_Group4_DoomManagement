import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingLayout } from "@/components/layout/LandingLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LandingPage } from "@/pages/landing/LandingPage"

// Landing stays in the initial bundle; the task pages are split per route so the
// first paint only pays for the shell plus whatever page the visitor opens.
const StudentOverviewPage = lazy(() =>
  import("@/pages/overview/StudentOverviewPage").then((m) => ({ default: m.StudentOverviewPage })),
)
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })))
const ProfilePage = lazy(() =>
  import("@/pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
)
const BookingPage = lazy(() =>
  import("@/pages/booking/BookingPage").then((m) => ({ default: m.BookingPage })),
)
const BillingPage = lazy(() =>
  import("@/pages/billing/BillingPage").then((m) => ({ default: m.BillingPage })),
)
const MyRoomPage = lazy(() => import("@/pages/room/MyRoomPage").then((m) => ({ default: m.MyRoomPage })))
const MaintenancePage = lazy(() =>
  import("@/pages/maintenance/MaintenancePage").then((m) => ({ default: m.MaintenancePage })),
)
const CurfewPage = lazy(() =>
  import("@/pages/curfew/CurfewPage").then((m) => ({ default: m.CurfewPage })),
)
const ManagerDashboardPage = lazy(() =>
  import("@/pages/manager/ManagerDashboardPage").then((m) => ({ default: m.ManagerDashboardPage })),
)
const VisitorPage = lazy(() =>
  import("@/pages/visitor/VisitorPage").then((m) => ({ default: m.VisitorPage })),
)
const NoticesPage = lazy(() =>
  import("@/pages/notices/NoticesPage").then((m) => ({ default: m.NoticesPage })),
)
const MarketplacePage = lazy(() =>
  import("@/pages/marketplace/MarketplacePage").then((m) => ({ default: m.MarketplacePage })),
)
const UnauthorizedPage = lazy(() =>
  import("@/pages/errors/UnauthorizedPage").then((m) => ({ default: m.UnauthorizedPage })),
)
const NotFoundPage = lazy(() =>
  import("@/pages/errors/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="sr-only">Đang tải trang</span>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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

              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route
                path="/visitor"
                element={
                  <ProtectedRoute>
                    <VisitorPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notices"
                element={
                  <ProtectedRoute>
                    <NoticesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <MarketplacePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
