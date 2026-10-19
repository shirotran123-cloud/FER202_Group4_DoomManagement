import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BedDouble, DoorOpen, LampDesk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Ảnh hành lang — ảnh thật của KTX FPT Quy Nhơn.
 *
 * Đã chuẩn hoá về 1920x1080 (tỉ lệ 16:9), bằng đúng tỉ lệ các ảnh khác trong
 * tour, nên khung hiển thị không cắt mất phần nào của ảnh.
 * Tạo lại bằng: `python scripts/prepare-tour-image.py <nguồn> <đích>`
 */
const CORRIDOR_SRC = "/assets/dorm-tour/corridor-hallway.jpg";

const ROOMS = [
  { no: "101", side: "Trái", beds: "6 người" },
  { no: "102", side: "Phải", beds: "6 người" },
  { no: "103", side: "Trái", beds: "6 người" },
  { no: "104", side: "Phải", beds: "6 người" },
] as const;

const DETAILS = [
  {
    key: "room",
    label: "Buồng 6 người",
    icon: BedDouble,
    src: "/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg",
    text: "Buồng ở 6 người gọn gàng, riêng tư — mỗi giường đều có không gian cá nhân.",
    /** Ảnh ngang 16:9 nên lấp đầy khung được. */
    portrait: false,
  },
  {
    key: "desk",
    label: "Bàn học",
    icon: LampDesk,
    src: "/assets/dorm-tour/room-desk.jpg",
    text: "Bàn học dài theo tường, đủ ánh sáng, ghế riêng từng người.",
    /**
     * Ảnh này là ảnh DỌC (1000x1533). Nếu ép vào khung 16:9 thì phải bỏ tới 63%
     * chiều cao, gần như chắc chắn mất bàn học. Nên hiện trọn ảnh trên nền mờ.
     */
    portrait: true,
  },
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
      <p className="prose mt-2 max-w-2xl text-sm text-muted-foreground">
        Cuộn dừng ở hành lang — rê chuột sáng cửa, nhấp để vào. Trong buồng 6 người: giường và bàn học. Quay lại chọn phòng khác bất cứ lúc nào.
      </p>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        {phase === "corridor" && (
          <div className="relative">
            {/* Khung 16:9 khớp đúng tỉ lệ ảnh, nên không bị cắt mất cửa phòng. */}
            <img
              src={CORRIDOR_SRC}
              alt="Hành lang KTX FPT Quy Nhơn với 4 cửa phòng"
              width={1920}
              height={1080}
              className="aspect-video w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            {/* Bốn nút cửa phòng: hiện số trên cửa, rê chuột thì sáng lên */}
            <div className="absolute inset-0 grid grid-cols-2 place-items-stretch gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:px-10">
              {ROOMS.map((r) => (
                <button
                  key={r.no}
                  type="button"
                  onClick={() => pick(r.no)}
                  className="group flex flex-col items-center justify-end gap-2 rounded-2xl border border-white/0 pb-4 transition-all hover:border-white/60 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
                  aria-label={`Chọn phòng ${r.no}`}
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
            {/* Cùng khung 16:9 với bước hành lang để ảnh không nhảy kích thước. */}
            <img
              src="/assets/dorm-cinematic/dorm-keyframe-fpt-3.jpg"
              alt={`Đang vào phòng ${room}`}
              width={1280}
              height={720}
              className="aspect-video w-full object-cover transition-transform duration-700"
              style={{ transform: `scale(${1 + enterStep * 0.06})` }}
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
              {/*
                Ảnh dọc không lấp đầy khung 16:9 được, nên hiện trọn ảnh trên nền
                mờ lấy từ chính ảnh đó (blur + tối) — vừa giữ đủ nội dung, vừa
                không chừa hai dải trống trông như lỗi.
              */}
              {d.portrait && (
                <img
                  src={d.src}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50"
                />
              )}
              <img
                key={d.key}
                src={d.src}
                alt={`${d.label} buồng 6 người phòng ${room}`}
                className={
                  d.portrait
                    ? "relative mx-auto h-[380px] w-auto object-contain sm:h-[460px]"
                    : "aspect-video w-full object-cover"
                }
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
