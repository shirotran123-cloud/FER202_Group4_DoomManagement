import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react";
import { registerVisitor, checkInVisitor, checkOutVisitor, detectVisitorOverstay, type VisitorRecord } from "@/lib/dorm-ops";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";

const KEY = "dms_visitors_v1";

export const VisitorPage: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(visitors));
  }, [visitors]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const v = registerVisitor("QE202049", name, citizenId, new Date().toISOString().slice(0, 10), minutes);
      setVisitors([v, ...visitors]);
      setName("");
      setCitizenId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    }
  };

  const tickOverstay = () => {
    setVisitors((prev) => prev.map((v) => detectVisitorOverstay(v, 9999)));
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="An ninh · Khách thăm"
        title="Đăng ký khách ghé thăm"
        desc="Sinh viên đăng ký trước họ tên + CCCD + thời gian. Bảo vệ check-in/out tại cổng, tự động cảnh báo quá giờ."
        actions={<Button onClick={tickOverstay} variant="outline">Quét quá giờ</Button>}
      />
      <SectionCard title="Đăng ký khách mới" desc="Thời gian tối thiểu 15 phút">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên khách"  required />
          <Input
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="Số CCCD"
            inputMode="numeric"
            maxLength={12}
            pattern="\d{12}"
            title="CCCD gồm đúng 12 chữ số"
            className="font-mono"
            required
          />
          <Input type="number" min={15} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}  aria-label="So phut du kien" />
          <div className="sm:col-span-3">
            <Button type="submit">Đăng ký khách</Button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs font-semibold text-danger-soft-foreground" role="alert">{error}</p>}
      </SectionCard>
      <SectionCard title={`Danh sách khách (${visitors.length})`} desc="Check-in khi tới cổng, check-out khi rời đi">
        {visitors.length === 0 ? (
          <EmptyState title="Chưa có khách nào" desc="Đăng ký khách thăm đầu tiên để bảo vệ đối chiếu tại cổng." />
        ) : (
          <div className="space-y-2">
            {visitors.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-xs">
                <div>
                  <p className="font-bold text-foreground">{v.fullName} · {v.citizenId}</p>
                  <p className="text-muted-foreground">{v.id} · Dự kiến {v.expectedMinutes} phút · Trạng thái: <strong>{v.status}</strong></p>
                </div>
                <div className="flex gap-2">
                  {v.status === "PRE_REGISTERED" && <Button size="sm" onClick={() => setVisitors(visitors.map((x) => (x.id === v.id ? checkInVisitor(x, new Date().toISOString()) : x)))}>Check-in</Button>}
                  {(v.status === "CHECKED_IN" || v.status === "OVERSTAY") && (
                    <Button size="sm" variant="outline" onClick={() => setVisitors(visitors.map((x) => (x.id === v.id ? checkOutVisitor(x, new Date().toISOString()) : x)))}>Check-out</Button>
                  )}
                  {v.status === "OVERSTAY" && <span className="rounded-full bg-danger-soft px-2 py-1 text-[11px] font-bold text-danger-soft-foreground">Quá giờ</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
