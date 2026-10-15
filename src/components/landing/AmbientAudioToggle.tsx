import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Ambient audio toggle: starts muted, never autoplays with sound. */
export const AmbientAudioToggle: React.FC = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    };
  }, []);

  const toggle = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 110;
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 165.2;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 480;
      osc1.connect(lp);
      osc2.connect(lp);
      lp.connect(gain);
      osc1.start();
      osc2.start();
      ctxRef.current = ctx;
      gainRef.current = gain;
    }
    const ctx = ctxRef.current!;
    void ctx.resume();
    const next = !on;
    setOn(next);
    const t = ctx.currentTime;
    gainRef.current!.gain.cancelScheduledValues(t);
    gainRef.current!.gain.linearRampToValueAtTime(next ? 0.12 : 0, t + 0.8);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Tat am thanh nen" : "Bat am thanh nen"}
      className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-[13px] font-bold shadow-lg backdrop-blur"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {on ? "Âm thanh: bật" : "Âm thanh: tắt"}
    </button>
  );
};
