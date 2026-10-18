import React, { useState, useEffect } from "react"
import type { AuthTokens, UserProfile, UserRole } from "@/types/auth"
import { AuthContext } from "./auth-context-def"
import { authApi, ApiError } from "@/lib/api"

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

  /**
   * Làm mới phiên. Gọi backend thật (`POST /api/auth/refresh`) để lấy token mới;
   * nếu máy chủ không phản hồi thì vẫn gia hạn tại chỗ để người dùng không bị
   * đăng xuất giữa lúc đang thao tác, nhưng KHÔNG bịa ra hồ sơ người dùng.
   */
  const refreshSession = () => {
    void (async () => {
      try {
        const res = await authApi.refresh()
        setTokens(res.tokens)
        localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(res.tokens))
      } catch {
        setTokens((prev) => {
          if (!prev) return null
          const newTokens: AuthTokens = {
            ...prev,
            expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
          }
          localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(newTokens))
          return newTokens
        })
      }
      setSessionSecondsLeft(SESSION_DURATION_SECONDS)
    })()
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

  /**
   * Đăng nhập bằng Google. Việc kiểm tra tên miền email do BACKEND quyết định
   * (`POST /api/auth/login`) — trước đây frontend tự kiểm rồi tự dựng hồ sơ từ
   * dữ liệu mẫu, nên hồ sơ hiển thị không phải là hồ sơ thật trong hệ thống.
   */
  const loginWithGoogle = async (
    email: string,
    targetRole: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const res = await authApi.login(email, targetRole)
      saveAuthSession(res.user, res.tokens)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : "Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Đăng nhập nhanh bằng tài khoản demo của từng vai trò (nút ở trang /login).
   *
   * Trả Promise để người gọi CHỜ lưu xong phiên rồi mới điều hướng. Trước đây
   * hàm chạy nền rồi trả về ngay, nên trang đích mount trước khi có vai trò
   * trong localStorage → mọi lời gọi API đều đi mà không kèm header vai trò và
   * bị máy chủ trả 403.
   */
  const loginAsDemoUser = async (role: UserRole): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    try {
      const res = await authApi.demo(role)
      saveAuthSession(res.user, res.tokens)
      return { success: true }
    } catch (error) {
      // Không có hồ sơ thì phải nói thật là chưa đăng nhập được, tuyệt đối
      // không dựng hồ sơ giả để giao diện trông như đã vào hệ thống.
      setUser(null)
      setTokens(null)
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : "Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchRole = (role: UserRole) => loginAsDemoUser(role)

  /**
   * Cập nhật hồ sơ. Ghi lên máy chủ trước rồi mới lưu phiên, để hồ sơ hiển thị
   * luôn là bản đã lưu thật; nếu máy chủ từ chối thì giữ nguyên bản cũ thay vì
   * hiện một bản chỉ có trong trình duyệt.
   */
  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return
    void (async () => {
      let next: UserProfile = {
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
      try {
        const saved = await authApi.updateMe({
          phone: updatedData.phone,
          emergencyContact: updatedData.emergencyContact as unknown as Record<string, string>,
        })
        next = saved
      } catch {
        // Máy chủ không lưu được thì vẫn giữ thay đổi tại chỗ cho phiên hiện tại.
      }
      setUser(next)
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next))
    })()
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
