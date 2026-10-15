import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Campus morning ambience: birdsong + soft wind, looped. Starts muted, never autoplays. */
export const AmbientAudioToggle: React.FC = () => {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio();
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    const ogg = document.createElement("source");
    ogg.src = "/assets/dorm-cinematic/campus-morning.ogg";
    ogg.type = "audio/ogg";
    const mp3 = document.createElement("source");
    mp3.src = "/assets/dorm-cinematic/campus-morning.mp3";
    mp3.type = "audio/mpeg";
    el.append(ogg, mp3);
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    const next = !on;
    setOn(next);
    if (next) {
      void el.play().catch(() => setOn(false));
      // smooth fade-in to 60% over ~1s
      const t0 = performance.now();
      const fade = () => {
        if (!audioRef.current) return;
        const k = Math.min(1, (performance.now() - t0) / 1000);
        el.volume = 0.6 * k;
        if (k < 1 && audioRef.current) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    } else {
      el.volume = 0;
      el.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Tat am thanh nen" : "Bat am thanh nen"}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-[13px] font-bold whitespace-nowrap shadow-lg backdrop-blur"
    >
      {on ? <Volume2 className="h-4 w-4 shrink-0" /> : <VolumeX className="h-4 w-4 shrink-0" />}
      {on ? "Tiếng campus: bật" : "Tiếng campus: tắt"}
    </button>
  );
};
