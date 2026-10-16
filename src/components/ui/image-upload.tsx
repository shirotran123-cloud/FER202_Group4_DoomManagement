import React, { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { loadPhotoRecords, savePhotoRecords, filesToPhotoRecords, type PhotoRecord } from "@/lib/photo-upload";

interface ImageUploadProps {
  storageKey: string;
  label?: string;
  hint?: string;
  value?: PhotoRecord[];
  onChange?: (records: PhotoRecord[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ storageKey, label = "Ảnh đính kèm", hint, value, onChange }) => {
  const [inner, setInner] = useState<PhotoRecord[]>(() => loadPhotoRecords(localStorage, storageKey));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const records = value ?? inner;

  const commit = (next: PhotoRecord[]) => {
    if (!value) setInner(next);
    try {
      savePhotoRecords(localStorage, storageKey, next);
    } catch {
      // storage full: keep in memory only
    }
    onChange?.(next);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const { records: added, rejected } = await filesToPhotoRecords(Array.from(files), records.length);
    if (added.length > 0) commit([...added, ...records]);
    if (rejected.length > 0) setError(`Không nhận ${rejected.join(", ")}. Chỉ nhận JPG/PNG/WebP, mỗi ảnh ≤ 5MB, tối đa 5 ảnh.`);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (id: string) => commit(records.filter((r) => r.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground">{label}</label>
        <span className="text-[11px] text-muted-foreground">{records.length}/5</span>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <ImagePlus className="h-4 w-4" />
        <span>Chọn ảnh từ máy</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
        aria-label={label}
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] font-semibold text-rose-600" role="alert">{error}</p>}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {records.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-lg border border-border">
              <img src={r.dataUrl} alt={r.name} className="h-20 w-full object-cover" loading="lazy" />
              <button
                type="button"
                onClick={() => removeAt(r.id)}
                className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label={`Xoa ${r.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
