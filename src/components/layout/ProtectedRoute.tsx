 import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import type { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />
  }

  return <>{children}</>
}