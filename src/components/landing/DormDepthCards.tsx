import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CARDS = [
  { src: "/assets/dorm-cinematic/dorm-keyframe-fpt-1.jpg", alt: "Toan canh KTX FPT Quy Nhon", caption: "Toàn cảnh KTX" },
  { src: "/assets/dorm-cinematic/dorm-keyframe-fpt-2.jpg", alt: "Phong sinh hoat chung", caption: "Phòng sinh hoạt chung" },
  { src: "/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg", alt: "Buong 6 nguoi", caption: "Buồng 6 người" },
  { src: "/assets/dorm-cinematic/dorm-keyframe-fpt-4.jpg", alt: "Khu vuc nha ve sinh", caption: "Khu vực nhà vệ sinh" },
];

/** 3D perspective cards per both skills: active card sharp, sides recede. */
export const DormDepthCards: React.FC = () => {
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: 1 | -1) => {
    setActive((a) => (a + dir + CARDS.length) % CARDS.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section aria-label="Khong gian KTX chieu sau" style={{ padding: "80px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <Badge variant="info" className="mb-3">Chiều sâu 3D</Badge>
      <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">KTX trong chiều sâu</h2>
      <p className="prose mt-2 max-w-2xl text-sm text-muted-foreground">
        Ảnh thật KTX FPT Quy Nhơn — thẻ giữa sắc nét, hai bên lùi sâu, mờ nhẹ. Vuốt, dùng phím mũi tên hoặc nút bấm.
      </p>
      <div
        style={{ perspective: 1200, marginTop: 36 }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div style={{ position: "relative", height: 380, transformStyle: "preserve-3d" }}>
          {CARDS.map((c, i) => {
            // Nearest-neighbour offset so the carousel wraps: the card before the first
            // steps in from the left instead of sliding across the whole row.
            let off = i - active;
            const half = CARDS.length / 2;
            if (off > half) off -= CARDS.length;
            if (off < -half) off += CARDS.length;
            const style: React.CSSProperties =
              off === 0
                ? { transform: "translate3d(0,0,0) scale(1)", opacity: 1, filter: "none", zIndex: 3 }
                : {
                    transform: `translate3d(${off > 0 ? 46 : -46}%,0,-150px) rotateY(${off > 0 ? -15 : 15}deg) scale(0.92)`,
                    opacity: 0.5,
                    filter: "blur(4px)",
                    zIndex: 1,
                  };
            return (
              <figure
                key={c.src}
                style={{
                  ...style,
                  position: "absolute", left: "50%", top: 0, width: "min(560px,86vw)", height: 340,
                  marginLeft: "calc(min(560px,86vw)/-2)", borderRadius: 20, overflow: "hidden",
                  border: "1px solid var(--border)", background: "var(--card)",
                  transition: "transform .5s, opacity .5s, filter .5s",
                }}
              >
                <img src={c.src} alt={c.alt} style={{ width: "100%", height: 296, objectFit: "cover", display: "block" }} loading="lazy" />
                <figcaption className="flex items-center justify-between gap-2" style={{ padding: "12px 16px", fontSize: 13 }}>
                  <span className="truncate font-bold">{c.caption}</span>
                  <Badge variant={off === 0 ? "info" : "neutral"} className="shrink-0">
                    {i + 1}/{CARDS.length}
                  </Badge>
                </figcaption>
              </figure>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
          <Button type="button" variant="outline" onClick={() => go(-1)} aria-label="Thẻ trước">
            <ChevronLeft className="h-4 w-4" /> Trước
          </Button>
          <Button type="button" onClick={() => go(1)} aria-label="Thẻ tiếp">
            Tiếp <ChevronRight className="h-4 w-4" />
          </Button>
          <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }} className="whitespace-nowrap text-muted-foreground">
            {active + 1} / {CARDS.length}
          </span>
        </div>
      </div>
    </section>
  );
};
