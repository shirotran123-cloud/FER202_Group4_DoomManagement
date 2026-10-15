import React from "react"

/**
 * Dolly clip: dựng tay từ 4 ảnh thật KTX FPT (10s, 24fps, 1280x720):
 * Toàn cảnh KTX → Phòng sinh hoạt chung → Buồng 6 người → Nhà vệ sinh.
 * MP4 có duration chuẩn nên seek bar dùng được ngay.
 */
export const DormDollyClip: React.FC = () => {
  return (
    <video
      controls
      preload="metadata"
      playsInline
      src="/assets/dorm-cinematic/dorm-dolly-fpt.mp4"
      className="mt-6 w-full max-w-4xl rounded-3xl border border-border bg-black"
    />
  )
}
