import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { SupabaseConfig, ConnectionTestResult } from "@/types/supabase"

const STORAGE_KEY_URL = "dms_supabase_url"
const STORAGE_KEY_ANON_KEY = "dms_supabase_anon_key"

// Cached client instance
let supabaseClientInstance: SupabaseClient | null = null

/**
 * Get the current Supabase configuration from localStorage or Vite environment variables.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_URL) : null
  const localKey = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_ANON_KEY) : null

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ""
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ""

  if (localUrl && localKey) {
    return {
      url: localUrl.trim(),
      anonKey: localKey.trim(),
      isConfigured: Boolean(localUrl.trim() && localKey.trim()),
      source: "localStorage",
    }
  }

  if (envUrl && envKey) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: Boolean(envUrl.trim() && envKey.trim()),
      source: "env",
    }
  }

  return {
    url: "",
    anonKey: "",
    isConfigured: false,
    source: "unconfigured",
  }
}

/**
 * Returns the Supabase Client. If credentials are not configured or invalid, returns null.
 */
export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig()

  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null
  }

  // Re-instantiate if URL or Key changed
  if (
    !supabaseClientInstance ||
    (supabaseClientInstance as any).__dms_url !== config.url ||
    (supabaseClientInstance as any).__dms_key !== config.anonKey
  ) {
    try {
      supabaseClientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
      ;(supabaseClientInstance as any).__dms_url = config.url
      ;(supabaseClientInstance as any).__dms_key = config.anonKey
    } catch (err) {
      console.error("[Supabase] Failed to initialize client:", err)
      return null
    }
  }

  return supabaseClientInstance
}

/**
 * Save custom credentials to localStorage and re-initialize client
 */
export function saveSupabaseConfig(url: string, anonKey: string): { success: boolean; message: string } {
  const cleanUrl = url.trim()
  const cleanKey = anonKey.trim()

  if (!cleanUrl || !cleanKey) {
    return { success: false, message: "URL và Anon Key không được để trống." }
  }

  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    return { success: false, message: "URL Supabase phải bắt đầu bằng https:// hoặc http://" }
  }

  try {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl)
    localStorage.setItem(STORAGE_KEY_ANON_KEY, cleanKey)
    supabaseClientInstance = null // force recreation
    return { success: true, message: "Đã lưu thông tin cấu hình Supabase thành công!" }
  } catch (err: any) {
    return { success: false, message: `Lỗi khi lưu cấu hình: ${err?.message || "Không xác định"}` }
  }
}

/**
 * Clear custom configuration and revert to environment variables
 */
export function resetSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_URL)
    localStorage.removeItem(STORAGE_KEY_ANON_KEY)
    supabaseClientInstance = null
  } catch (err) {
    console.error("[Supabase] Error clearing config:", err)
  }
}

/**
 * Ping Supabase to test connectivity and count records in tables if available
 */
export function testSupabaseConnection(overrideClient?: SupabaseClient): Promise<ConnectionTestResult> {
  const client = overrideClient || getSupabase()

  if (!client) {
    return Promise.resolve({
      success: false,
      message: "Chưa cấu hình Supabase URL và Anon Public Key.",
    })
  }

  const start = performance.now()

  return Promise.allSettled([
    client.from("buildings").select("id", { count: "exact", head: true }),
    client.from("rooms").select("id", { count: "exact", head: true }),
    client.from("compartments").select("id", { count: "exact", head: true }),
    client.from("beds").select("id", { count: "exact", head: true }),
    client.from("students").select("id", { count: "exact", head: true }),
    client.from("contracts").select("id", { count: "exact", head: true }),
  ]).then((results) => {
    const latencyMs = Math.round(performance.now() - start)

    const [bRes, rRes, cRes, bedRes, sRes, ctrRes] = results

    // Check if at least one request succeeded or returned valid Supabase HTTP response
    const hasAnySuccess = results.some((r) => r.status === "fulfilled" && !r.value.error)
    const allErrors = results.map((r) => (r.status === "fulfilled" ? r.value.error : r.reason))

    // If tables don't exist yet (PGRST205 / 42P01), connection to Supabase itself succeeded, but tables need to be created!
    const tableMissing = allErrors.some(
      (err) => err && (err.code === "PGRST205" || err.code === "42P01" || err.message?.includes("does not exist"))
    )

    if (hasAnySuccess) {
      const getCount = (r: PromiseSettledResult<any>) =>
        r.status === "fulfilled" && !r.value.error ? r.value.count || 0 : 0

      return {
        success: true,
        latencyMs,
        message: "Kết nối Supabase thành công! Các bảng dữ liệu đã sẵn sàng.",
        tables: {
          buildings: getCount(bRes),
          rooms: getCount(rRes),
          compartments: getCount(cRes),
          beds: getCount(bedRes),
          students: getCount(sRes),
          contracts: getCount(ctrRes),
        },
      }
    }

    if (tableMissing) {
      return {
        success: true,
        latencyMs,
        message:
          "Kết nối tới Supabase thành công! Tuy nhiên các bảng dữ liệu (buildings, rooms, students...) chưa được tạo. Hãy chạy mã SQL hoặc bấm 'Đồng bộ dữ liệu mẫu' bên dưới.",
        tables: {
          buildings: 0,
          rooms: 0,
          compartments: 0,
          beds: 0,
          students: 0,
          contracts: 0,
        },
      }
    }

    // Actual network or auth error
    const firstError = allErrors.find((e) => e != null)
    return {
      success: false,
      latencyMs,
      message: `Không thể kết nối tới Supabase: ${firstError?.message || "Kiểm tra lại URL hoặc Anon Key"}`,
    }
  })
}

