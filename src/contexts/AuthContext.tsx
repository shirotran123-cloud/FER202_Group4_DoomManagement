import React, { useState, useEffect } from "react"
import type { AuthTokens, UserProfile, UserRole } from "@/types/auth"
import { AuthContext } from "./auth-context-def"
import { MOCK_USERS } from "@/data/mockUsers"

const STORAGE_KEY_USER = "dms_auth_user_session"
const STORAGE_KEY_TOKENS = "dms_auth_tokens_session"
const SESSION_DURATION_SECONDS = 15 * 60 // 15 minutes JWT access token validity

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      // Clean up legacy mock auto-saved keys from previous versions
      localStorage.removeItem("dms_auth_user")
      localStorage.removeItem("dms_auth_tokens")
      const saved = localStorage.getItem(STORAGE_KEY_USER)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOKENS)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(() => {
    if (!tokens) return 0
    return Math.max(0, Math.floor((tokens.expiresAt - Date.now()) / 1000))
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const saveAuthSession = (newUser: UserProfile, newTokens: AuthTokens) => {
    setUser(newUser)
    setTokens(newTokens)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(newTokens))
    setSessionSecondsLeft(SESSION_DURATION_SECONDS)
  }

  const refreshSession = () => {
    setTokens((prev) => {
      if (!prev) return null
      const newTokens: AuthTokens = {
        ...prev,
        accessToken: "refreshed_jwt_" + Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
      }
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(newTokens))
      return newTokens
    })
    setSessionSecondsLeft(SESSION_DURATION_SECONDS)
  }

  // Session timer countdown - only updates in timer callback
  useEffect(() => {
    if (!tokens || !user) return

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((tokens.expiresAt - Date.now()) / 1000))
      setSessionSecondsLeft(diff)

      if (diff <= 0) {
        console.warn("[Auth] Access token expired, auto-refreshing via simulated refresh token...")
        refreshSession()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tokens, user])

  const loginWithGoogle = async (
    email: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const cleanEmail = email.trim().toLowerCase()
    const isFptDomain = cleanEmail.endsWith("@fpt.edu.vn") || cleanEmail.endsWith("@fe.edu.vn")
    const isGmailDomain = cleanEmail.endsWith("@gmail.com")

    if (targetRole === "student") {
      if (isFptDomain) {
        setIsLoading(false)
        return {
          success: false,
          message:
            "Sinh viên vui lòng đăng nhập bằng Gmail cá nhân đã đăng ký trong hồ sơ tuyển sinh (không dùng email trường @fpt.edu.vn để tránh xung đột mã định danh sinh viên).",
        }
      }
      if (!isGmailDomain && !cleanEmail.includes("@")) {
        setIsLoading(false)
        return {
          success: false,
          message: "Email không hợp lệ. Vui lòng nhập địa chỉ Gmail cá nhân chính xác.",
        }
      }
    } else {
      if (!isFptDomain) {
        setIsLoading(false)
        return {
          success: false,
          message:
            "Quyền truy cập Cán bộ / Kỹ thuật viên / Quản lý yêu cầu xác thực bằng email tổ chức FPT Education (@fpt.edu.vn hoặc @fe.edu.vn).",
        }
      }
    }

    const baseProfile = MOCK_USERS[targetRole]
    const updatedProfile: UserProfile = {
      ...baseProfile,
      email: cleanEmail,
      fullName: cleanEmail.split("@")[0].toUpperCase() + " (" + baseProfile.roleTitle + ")",
    }

    const newTokens: AuthTokens = {
      accessToken: "jwt_token_" + btoa(cleanEmail) + "_" + Date.now(),
      refreshToken: "refresh_token_" + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }

    saveAuthSession(updatedProfile, newTokens)
    setIsLoading(false)
    return { success: true }
  }

  const loginWithCustomUser = (customUser: UserProfile) => {
    setIsLoading(true)
    const newTokens: AuthTokens = {
      accessToken: "custom_jwt_" + customUser.id + "_" + Date.now(),
      refreshToken: "custom_refresh_" + customUser.id + "_" + Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }
    saveAuthSession(customUser, newTokens)
    setIsLoading(false)
  }

  const loginAsDemoUser = (role: UserRole) => {
    setIsLoading(true)
    const demoProfile = MOCK_USERS[role]
    const newTokens: AuthTokens = {
      accessToken: "demo_jwt_" + role + "_" + Date.now(),
      refreshToken: "demo_refresh_" + role + "_" + Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }
    saveAuthSession(demoProfile, newTokens)
    setIsLoading(false)
  }

  const switchRole = (role: UserRole) => {
    loginAsDemoUser(role)
  }

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return
    const updated = {
      ...user,
      ...updatedData,
      emergencyContact: {
        ...user.emergencyContact,
        ...(updatedData.emergencyContact || {}),
      },
      dormitoryStatus: user.dormitoryStatus
        ? {
            ...user.dormitoryStatus,
            ...(updatedData.dormitoryStatus || {}),
          }
        : undefined,
    }
    setUser(updated)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKENS)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginAsDemoUser,
        loginWithCustomUser,
        switchRole,
        updateProfile,
        logout,
        sessionSecondsLeft,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
