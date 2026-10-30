import { getSupabase } from "@/lib/supabase"
import type {
  DbBuilding,
  DbRoom,
  DbCompartment,
  DbBed,
  DbStudent,
  DbContract,
} from "@/types/supabase"
import {
  SEED_BUILDINGS,
  SEED_ROOMS,
  SEED_COMPARTMENTS,
  SEED_BEDS,
  SEED_STUDENTS,
  SEED_CONTRACTS,
} from "@/data/supabaseSeedData"

export interface ServiceResponse<T> {
  data: T
  isLive: boolean
  message?: string
}

/**
 * Fetch list of buildings
 */
export async function fetchBuildings(): Promise<ServiceResponse<DbBuilding[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .order("id", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbBuilding[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local sample buildings:", err)
    }
  }

  return { data: SEED_BUILDINGS, isLive: false }
}

/**
 * Fetch rooms, optionally filtered by building ID
 */
export async function fetchRooms(buildingId?: string): Promise<ServiceResponse<DbRoom[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      let query = supabase.from("rooms").select("*")
      if (buildingId && buildingId !== "all") {
        query = query.eq("building_id", buildingId)
      }
      const { data, error } = await query.order("room_number", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbRoom[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local sample rooms:", err)
    }
  }

  const filtered = buildingId && buildingId !== "all"
    ? SEED_ROOMS.filter((r) => r.building_id === buildingId)
    : SEED_ROOMS

  return { data: filtered, isLive: false }
}

/**
 * Fetch compartments for a room
 */
export async function fetchCompartments(roomId?: string): Promise<ServiceResponse<DbCompartment[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      let query = supabase.from("compartments").select("*")
      if (roomId) {
        query = query.eq("room_id", roomId)
      }
      const { data, error } = await query.order("code", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbCompartment[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local compartments:", err)
    }
  }

  const filtered = roomId
    ? SEED_COMPARTMENTS.filter((c) => c.room_id === roomId)
    : SEED_COMPARTMENTS

  return { data: filtered, isLive: false }
}

/**
 * Fetch beds, optionally by compartment
 */
export async function fetchBeds(compartmentId?: string): Promise<ServiceResponse<DbBed[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      let query = supabase.from("beds").select("*")
      if (compartmentId) {
        query = query.eq("compartment_id", compartmentId)
      }
      const { data, error } = await query.order("bed_code", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbBed[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local beds:", err)
    }
  }

  const filtered = compartmentId
    ? SEED_BEDS.filter((b) => b.compartment_id === compartmentId)
    : SEED_BEDS

  return { data: filtered, isLive: false }
}

/**
 * Fetch students with search and filters
 */
export async function fetchStudents(filters?: {
  query?: string
  building?: string
  gender?: string
}): Promise<ServiceResponse<DbStudent[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      let query = supabase.from("students").select("*")

      if (filters?.building && filters.building !== "all") {
        query = query.ilike("building", `%${filters.building}%`)
      }
      if (filters?.gender && filters.gender !== "all") {
        query = query.eq("gender", filters.gender)
      }
      if (filters?.query) {
        const q = filters.query.trim()
        query = query.or(`full_name.ilike.%${q}%,student_id.ilike.%${q}%,room.ilike.%${q}%,hometown.ilike.%${q}%`)
      }

      const { data, error } = await query.order("student_id", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbStudent[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local sample students:", err)
    }
  }

  let list = [...SEED_STUDENTS]

  if (filters?.building && filters.building !== "all") {
    list = list.filter((s) => s.building.toLowerCase().includes(filters.building!.toLowerCase()))
  }
  if (filters?.gender && filters.gender !== "all") {
    list = list.filter((s) => s.gender === filters.gender)
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase().trim()
    list = list.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.hometown.toLowerCase().includes(q)
    )
  }

  return { data: list, isLive: false }
}

/**
 * Fetch contracts
 */
export async function fetchContracts(): Promise<ServiceResponse<DbContract[]>> {
  const supabase = getSupabase()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("contract_code", { ascending: true })

      if (!error && data && data.length > 0) {
        return { data: data as DbContract[], isLive: true }
      }
    } catch (err) {
      console.warn("[Supabase] Fallback to local contracts:", err)
    }
  }

  return { data: SEED_CONTRACTS, isLive: false }
}

/**
 * Seeds or synchronizes the sample data directly into the connected Supabase database
 */
export async function seedSampleDataToSupabase(
  onProgress?: (step: string, percent: number) => void
): Promise<{ success: boolean; message: string; details?: any }> {
  const supabase = getSupabase()

  if (!supabase) {
    return {
      success: false,
      message: "Chưa kết nối Supabase! Hãy cấu hình Project URL và Anon Key trước.",
    }
  }

  try {
    // Step 1: Buildings
    onProgress?.("Đang đồng bộ danh mục 4 Tòa nhà (A, B, C, D)...", 15)
    const { error: bErr } = await supabase
      .from("buildings")
      .upsert(SEED_BUILDINGS, { onConflict: "id" })

    if (bErr) throw new Error(`Lỗi đồng bộ Buildings: ${bErr.message} (Gợi ý: Đảm bảo đã chạy SQL tạo bảng trước)`)

    // Step 2: Rooms
    onProgress?.("Đang đồng bộ 30 phòng ở các tầng trong tòa...", 35)
    const roomsToInsert = SEED_ROOMS.map(({ occupied_count, available_count, ...r }) => r)
    const { error: rErr } = await supabase
      .from("rooms")
      .upsert(roomsToInsert, { onConflict: "id" })

    if (rErr) throw new Error(`Lỗi đồng bộ Rooms: ${rErr.message}`)

    // Step 3: Compartments
    onProgress?.("Đang đồng bộ các Buồng phòng (A, B, C, D)...", 55)
    const { error: cErr } = await supabase
      .from("compartments")
      .upsert(SEED_COMPARTMENTS, { onConflict: "id" })

    if (cErr) throw new Error(`Lỗi đồng bộ Compartments: ${cErr.message}`)

    // Step 4: Beds
    onProgress?.("Đang đồng bộ danh sách Giường sinh viên...", 70)
    const { error: bedErr } = await supabase
      .from("beds")
      .upsert(SEED_BEDS, { onConflict: "id" })

    if (bedErr) throw new Error(`Lỗi đồng bộ Beds: ${bedErr.message}`)

    // Step 5: Students
    onProgress?.("Đang đồng bộ hồ sơ sinh viên nội trú KTX...", 85)
    const { error: sErr } = await supabase
      .from("students")
      .upsert(SEED_STUDENTS, { onConflict: "student_id" })

    if (sErr) throw new Error(`Lỗi đồng bộ Students: ${sErr.message}`)

    // Step 6: Contracts
    onProgress?.("Đang đồng bộ các hợp đồng lưu trú hoạt động...", 95)
    const { error: ctrErr } = await supabase
      .from("contracts")
      .upsert(SEED_CONTRACTS, { onConflict: "contract_code" })

    if (ctrErr) throw new Error(`Lỗi đồng bộ Contracts: ${ctrErr.message}`)

    onProgress?.("Hoàn tất! Toàn bộ dữ liệu mẫu đã được đồng bộ lên Supabase Cloud.", 100)

    return {
      success: true,
      message: "Đồng bộ thành công dữ liệu mẫu lên Supabase!",
      details: {
        buildings: SEED_BUILDINGS.length,
        rooms: SEED_ROOMS.length,
        compartments: SEED_COMPARTMENTS.length,
        beds: SEED_BEDS.length,
        students: SEED_STUDENTS.length,
        contracts: SEED_CONTRACTS.length,
      },
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Đã xảy ra lỗi khi đồng bộ dữ liệu mẫu lên Supabase.",
    }
  }
}

