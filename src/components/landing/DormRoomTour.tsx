import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BedDouble, DoorOpen, ShowerHead, LampDesk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROOMS = [
  { no: "101", side: "Trái", beds: "6 người" },
  { no: "102", side: "Phải", beds: "6 người" },
  { no: "103", side: "Trái", beds: "6 người" },
  { no: "104", side: "Phải", beds: "6 người" },
] as const;

const DETAILS = [
  { key: "room", label: "Buồng 6 người", icon: BedDouble, src: "/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg", text: "Buồng ở 6 người gọn gàng, riêng tư — mỗi giường đều có không gian cá nhân." },
  { key: "desk", label: "Bàn học", icon: LampDesk, src: "/assets/dorm-tour/room-desk.jpg", text: "Bàn học dài theo tường, đủ ánh sáng, ghế riêng từng người." },
  { key: "bath", label: "Vệ sinh", icon: ShowerHead, src: "/assets/dorm-tour/room-bath.jpg", text: "Khu vệ sinh khép kín trong buồng, sạch sẽ, nước nóng đầy đủ." },
] as const;

type Phase = "corridor" | "entering" | "room";

/**
 * Interactive dorm tour: scroll stops at the corridor, user picks a room
 * (hover glows the door, number shows on the door), camera enters that room,
 * scroll resumes inside. Back returns to the corridor. All rooms share the
 * 6-person interior; only the room number differs.
 */
export const DormRoomTour: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("corridor");
  const [room, setRoom] = useState<string | null>(null);
  const [enterStep, setEnterStep] = useState(0);
  const [detail, setDetail] = useState(0);
  const timer = useRef(0);

  const pick = useCallback((no: string) => {
    setRoom(no);
    setPhase("entering");
    setEnterStep(0);
    window.clearInterval(timer.current);
    // 0-2s turn, 2-5s approach, 5-7s door opens, 7-10s step inside
    timer.current = window.setInterval(() => {
      setEnterStep((s) => {
        if (s >= 3) {
          window.clearInterval(timer.current);
          setPhase("room");
          return 3;
        }
        return s + 1;
      });
    }, 900);
  }, []);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const back = useCallback(() => {
    window.clearInterval(timer.current);
    setPhase("corridor");
    setRoom(null);
    setDetail(0);
  }, []);

  const d = DETAILS[detail];
  const DIcon = d.icon;

  return (
    <section aria-label="Tham quan buồng KTX" className="scroll-mt-24">
      <Badge variant="info" className="mb-3">Tham quan tương tác</Badge>
      <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
        Chọn phòng, bước vào xem
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Cuộn dừng ở hành lang — rê chuột sáng cửa, nhấp để vào. Trong buồng 6 người: giường, bàn học, vệ sinh. Quay lại chọn phòng khác bất cứ lúc nào.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        {phase === "corridor" && (
          <div className="relative">
            <img
              src="/assets/dorm-cinematic/dorm-keyframe-fpt-1.jpg"
              alt="Hanh lang KTX voi 4 cua phong"
              className="h-[380px] w-full object-cover sm:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            {/* Door hotspots: number on the door, glow on hover */}
            <div className="absolute inset-0 grid grid-cols-4 items-center gap-2 px-6 sm:px-12">
              {ROOMS.map((r) => (
                <button
                  key={r.no}
                  type="button"
                  onClick={() => pick(r.no)}
                  className="group flex h-48 flex-col items-center justify-end gap-2 rounded-2xl border border-white/0 pb-4 transition-all hover:border-white/60 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] sm:h-64"
                  aria-label={`Chon phong ${r.no}`}
                >
                  <span className="rounded-lg bg-black/55 px-3 py-1 font-mono text-lg font-black tracking-widest text-white opacity-80 backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:opacity-100">
                    {r.no}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-bold text-white/85 backdrop-blur-md">
                    {r.side} · {r.beds}
                  </span>
                  <DoorOpen className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
                </button>
              ))}
            </div>
            <div className="absolute left-1/2 top-4 -translate-x-1/2">
              <Badge variant="default" className="border-white/25 bg-black/40 text-white backdrop-blur-md">
                <span className="whitespace-nowrap">Hành lang — chọn 1 trong 4 phòng</span>
              </Badge>
            </div>
          </div>
        )}

        {phase === "entering" && (
          <div className="relative">
            <img
              src="/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg"
              alt={`Dang vao phong ${room}`}
              className="h-[380px] w-full object-cover transition-transform duration-900 sm:h-[460px]"
              style={{ transform: `scale(${1 + enterStep * 0.08})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            <div className="absolute inset-x-0 bottom-6 text-center">
              <Badge variant="default" className="border-white/25 bg-black/40 text-white backdrop-blur-md">
                <span className="whitespace-nowrap">
                  {enterStep === 0 && `Rẽ về phòng ${room}…`}
                  {enterStep === 1 && `Tiến đến cửa phòng ${room}…`}
                  {enterStep === 2 && `Mở cửa phòng ${room}…`}
                  {enterStep >= 3 && `Bước vào phòng ${room}`}
                </span>
              </Badge>
            </div>
          </div>
        )}

        {phase === "room" && (
          <div>
            <div className="relative">
              <img
                key={d.key}
                src={d.src}
                alt={`${d.label} buong 6 nguoi phong ${room}`}
                className="h-[380px] w-full object-cover sm:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              <div className="absolute left-1/2 top-4 -translate-x-1/2">
                <Badge variant="default" className="border-white/25 bg-black/40 text-white backdrop-blur-md">
                  <span className="whitespace-nowrap">Phòng {room} · Buồng 6 người</span>
                </Badge>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <div className="flex items-center gap-2 rounded-2xl bg-black/55 p-3 text-white backdrop-blur-md">
                  <DIcon className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-sm font-bold">{d.label}</p>
                    <p className="truncate text-xs text-white/80">{d.text}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-card px-4 py-3">
              {DETAILS.map((t, i) => {
                const TIcon = t.icon;
                return (
                  <Button
                    key={t.key}
                    type="button"
                    variant={i === detail ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDetail(i)}
                  >
                    <TIcon className="h-4 w-4" /> {t.label}
                  </Button>
                );
              })}
              <Button type="button" variant="ghost" size="sm" onClick={back} className="ml-auto">
                <ArrowLeft className="h-4 w-4" /> Hành lang
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
