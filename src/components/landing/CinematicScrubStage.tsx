import React, { useEffect, useRef } from "react";
import { dprCap, frameFor, hasConverged, lerpStep, phaseFor, type ScrubPhase } from "@/lib/scroll-scrub";

const frameUrl = (i: number) => `/assets/dorm-cinematic/scrub-fpt/frame-${String(i).padStart(3, "0")}.jpg`;
const TOTAL = 96;
const LERP = 0.28;

const SCENES = ["Toàn cảnh KTX", "Phòng sinh hoạt chung", "Buồng 6 người", "Khu vực nhà vệ sinh"];

const CAPTIONS: { phase: ScrubPhase; title: string; body: string }[] = [
  {
    phase: "entry",
    title: "Bay về phía KTX FPT",
    body: "Cuộn xuống để camera dolly-in qua 4 cảnh: Toàn cảnh → Sinh hoạt chung → Buồng 6 người → Nhà vệ sinh.",
  },
  {
    phase: "scrub",
    title: "Tiến gần hơn từng tầng",
    body: "Frame scrub mượt với quán tính lerp — cuộn nhanh không trắng hình nhờ fallback frame gần nhất.",
  },
  {
    phase: "morph",
    title: "Khung hình hóa thẻ nổi",
    body: "Giai đoạn morph: sân khấu co lại thành thẻ, mở ra không gian KTX bên dưới.",
  },
];

/** Sticky full-viewport canvas scrub stage per cinematic-scroll skills. */
export const CinematicScrubStage: React.FC = () => {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ target: 1, current: 1, lastDrawn: 1, cache: [] as (HTMLImageElement | null)[], phase: "entry" as ScrubPhase });

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = stateRef.current;
    st.cache = new Array(TOTAL + 1).fill(null);
    let cancelled = false;
    let raf = 0;

    const nearestLoaded = (idx: number): HTMLImageElement | null => {
      for (let off = 1; off <= 30; off++) {
        const prev = st.cache[idx - off];
        if (prev?.complete && prev.naturalWidth > 0) return prev;
        const next = st.cache[idx + off];
        if (next?.complete && next.naturalWidth > 0) return next;
      }
      return st.cache[st.lastDrawn];
    };

    const draw = (idx: number) => {
      const i = Math.min(Math.max(Math.round(idx), 1), TOTAL);
      let img = st.cache[i];
      if (!img || !img.complete || img.naturalWidth === 0) img = nearestLoaded(i);
      if (img && img.complete && img.naturalWidth > 0) {
        // Cover-fit: keep the 16:9 frame's aspect ratio and crop the overflow, so a
        // portrait canvas never stretches the building.
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
        st.lastDrawn = i;
      }
    };

    const fit = () => {
      const dpr = dprCap(window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === 0 || h === 0) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        draw(st.target);
      }
    };

    const renderCaption = () => {
      const host = captionRef.current;
      if (!host) return;
      // During scrub, show the scene name matching the current 24-frame segment
      if (st.phase === "scrub") {
        const seg = Math.min(3, Math.floor((Math.round(st.target) - 1) / 24));
        host.querySelector("h2")!.textContent = SCENES[seg];
        host.querySelector("p")!.textContent = `Cảnh ${seg + 1}/4 — cuộn tiếp để đi tới cảnh tiếp theo.`;
        return;
      }
      const c = CAPTIONS.find((x) => x.phase === st.phase) ?? CAPTIONS[0];
      host.querySelector("h2")!.textContent = c.title;
      host.querySelector("p")!.textContent = c.body;
    };

    const morph = (p: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const m = p < 0.8 ? 0 : (p - 0.8) / 0.2;
      wrap.style.width = m > 0 ? `calc(100vw - ${24 * m}vw)` : "100%";
      wrap.style.maxWidth = m > 0 ? "1280px" : "100%";
      wrap.style.height = m > 0 ? `calc(100dvh - ${26 * m}dvh)` : "100%";
      wrap.style.borderRadius = m > 0 ? `${32 * m}px` : "0px";
      wrap.style.boxShadow = m > 0 ? `0 25px 60px -15px rgba(180,160,220,${0.45 * m})` : "none";
      wrap.style.transform = m > 0 ? `translateY(-${40 * m}px)` : "none";
    };

    const onScroll = () => {
      // Track-relative progress: 0 when the stage top hits viewport top,
      // 1 when the track bottom reaches viewport bottom. Window height is read
      // live so Lenis smoothing or mobile URL bars never freeze progress.
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const dist = rect.height - vh;
      const p = dist <= 0 ? 0 : Math.min(Math.max(-rect.top / dist, 0), 1);
      st.target = frameFor(p, TOTAL);
      const ph = phaseFor(p);
      if (ph !== st.phase) {
        st.phase = ph;
        renderCaption();
      }
      morph(p);
    };

    const tick = () => {
      if (cancelled) return;
      if (!hasConverged(st.current, st.target)) {
        st.current = lerpStep(st.current, st.target, LERP);
        draw(st.current);
      }
      raf = requestAnimationFrame(tick);
    };

    // Dual-phase chunked preload per cinematic-scroll skill: frame 1 instantly,
    // then batches of 6 with 40ms breathing room.
    const first = new Image();
    first.onload = () => {
      if (cancelled) return;
      st.cache[1] = first;
      if (Math.abs(1 - Math.round(st.current)) <= 2) draw(1);
    };
    first.src = frameUrl(1);
    const queue: number[] = [];
    for (let i = 2; i <= TOTAL; i++) queue.push(i);
    let timer = 0;
    const loadBatch = () => {
      if (cancelled || queue.length === 0) return;
      queue.splice(0, 6).forEach((k) => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          st.cache[k] = img;
          if (Math.abs(k - Math.round(st.current)) <= 2) draw(k);
        };
        img.src = frameUrl(k);
      });
      if (queue.length > 0) timer = window.setTimeout(loadBatch, 40);
    };
    timer = window.setTimeout(loadBatch, 200);

    fit();
    draw(1);
    renderCaption();
    onScroll();
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Lenis smooths native scroll into an animated value, so during the glide
    // no native scroll events fire — poll progress each frame instead.
    let lastP = -1;
    const poll = window.setInterval(() => {
      if (cancelled) return;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const dist = rect.height - vh;
      const p = dist <= 0 ? 0 : Math.min(Math.max(-rect.top / dist, 0), 1);
      if (Math.abs(p - lastP) > 0.0005) {
        lastP = p;
        onScroll();
      }
    }, 100);
    const onResize = () => {
      fit();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    // The sticky wrapper is sized by CSS after mount, so the first fit() can see a
    // zero-size canvas. Observe the element to size the backing store as soon as it has one.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => fit());
    ro?.observe(canvas);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(poll);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      st.cache = [];
    };
  }, []);

  return (
    <section ref={trackRef} aria-label="Hành trình điện ảnh KTX" style={{ position: "relative", height: "420vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden", zIndex: 10 }}>
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background:
              "radial-gradient(circle at 20% 15%, rgba(79,70,229,.35), transparent 50%), radial-gradient(circle at 85% 80%, rgba(245,158,11,.18), transparent 45%), linear-gradient(#141a35,#0b0e1a)",
          }}
        />
        <div ref={wrapRef} style={{ position: "absolute", inset: 0, margin: "auto", zIndex: 10 }}>
          <canvas ref={canvasRef} width={1280} height={720} style={{ width: "100%", height: "100%", display: "block" }} aria-label="Khung hình điện ảnh KTX theo cuộn" />
        </div>
        <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}>
          <div
            aria-hidden
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: "46%",
              background: "linear-gradient(to top, rgba(6,8,16,.92), rgba(6,8,16,.55) 45%, transparent)",
            }}
          />
          <div ref={captionRef} style={{ position: "absolute", left: "50%", bottom: "12vh", transform: "translateX(-50%)", maxWidth: 720, width: "calc(100% - 48px)", textAlign: "center" }}>
            <h2 className="prose" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: "#ffffff", textShadow: "0 2px 18px rgba(0,0,0,.65)" }} />
            <p className="prose" style={{ marginTop: 12, color: "#dfe2ff", fontSize: 15, textShadow: "0 1px 12px rgba(0,0,0,.6)" }} />
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", fontSize: 12, letterSpacing: ".2em", color: "#c3c9e0" }}>
            CUỘN ĐỂ KHÁM PHÁ
          </div>
        </div>
      </div>
    </section>
  );
};
