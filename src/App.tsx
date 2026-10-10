import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { LandingPage } from "@/pages/landing/LandingPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { ProfilePage } from "@/pages/profile/ProfilePage"
import { BookingStubPage } from "@/pages/stubs/BookingStubPage"
import { BillingStubPage } from "@/pages/stubs/BillingStubPage"
import { MaintenancePage } from "@/pages/maintenance/MaintenancePage"
import { CurfewPage } from "@/pages/curfew/CurfewPage"
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage"
import { QATestPlanPage } from "@/pages/stubs/QATestPlanPage"
import { UnauthorizedPage } from "@/pages/errors/UnauthorizedPage"
import { NotFoundPage } from "@/pages/errors/NotFoundPage"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingStubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingStubPage />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App