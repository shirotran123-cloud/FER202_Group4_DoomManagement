export interface PhotoRecord {
  id: string
  name: string
  mime: string
  size: number
  dataUrl: string
  createdAt: string
}

export const PHOTO_ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 5;

export function validatePhotoFile(file: { type: string; size: number; name: string }, existingCount: number): { ok: boolean; reason: string } {
  if (existingCount >= PHOTO_MAX_COUNT) return { ok: false, reason: "TOO_MANY" };
  if (!PHOTO_ACCEPTED_MIMES.includes(file.type)) return { ok: false, reason: "BAD_TYPE" };
  if (file.size <= 0 || file.size > PHOTO_MAX_SIZE_BYTES) return { ok: false, reason: "BAD_SIZE" };
  return { ok: true, reason: "OK" };
}

export function createPhotoRecord(name: string, mime: string, size: number, dataUrl: string): PhotoRecord {
  if (!dataUrl.startsWith("data:")) throw new Error("dataUrl must be a data URL");
  return {
    id: `PHO-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
    name,
    mime,
    size,
    dataUrl,
    createdAt: new Date().toISOString(),
  };
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.readAsDataURL(file);
  });
}

export async function filesToPhotoRecords(files: File[], existingCount: number): Promise<{ records: PhotoRecord[]; rejected: string[] }> {
  const records: PhotoRecord[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const check = validatePhotoFile({ type: file.type, size: file.size, name: file.name }, existingCount + records.length);
    if (!check.ok) {
      rejected.push(`${file.name}:${check.reason}`);
      continue;
    }
    const dataUrl = await readFileAsDataUrl(file);
    records.push(createPhotoRecord(file.name, file.type, file.size, dataUrl));
    if (existingCount + records.length >= PHOTO_MAX_COUNT) break;
  }
  return { records, rejected };
}

export function savePhotoRecords(storage: Storage, key: string, records: PhotoRecord[]): void {
  storage.setItem(key, JSON.stringify(records));
}

export function loadPhotoRecords(storage: Storage, key: string): PhotoRecord[] {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PhotoRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => typeof p?.dataUrl === "string" && p.dataUrl.startsWith("data:"));
  } catch {
    return [];
  }
}
