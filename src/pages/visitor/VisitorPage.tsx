import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react";
import { registerVisitor, VISITOR_LATEST_HOUR, type VisitorRecord } from "@/lib/dorm-ops";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";

const KEY = "dms_visitors_v1";

export const VisitorPage: React.FC = () => {
  const { user } = useAuth();
  // Chỉ sinh viên dùng trang này (route đã chặn các vai khác).
  const studentId = user?.studentId || "QE202049";
  const [visitors, setVisitors] = useState<VisitorRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [name, setName] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(visitors));
  }, [visitors]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const v = registerVisitor(studentId, name, citizenId, new Date().toISOString().slice(0, 10));
      setVisitors([v, ...visitors]);
      setName("");
      setCitizenId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="An ninh · Khách thăm"
        title="Đăng ký khách ghé thăm"
        desc={`Sinh viên đăng ký trước họ tên + CCCD. Khách chỉ ở trong ngày, rời KTX trước ${VISITOR_LATEST_HOUR}:00, không lưu trú qua đêm.`}
      />
      <SectionCard title="Đăng ký khách mới" desc={`Khách rời KTX trước ${VISITOR_LATEST_HOUR}:00 cùng ngày`}>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên khách" className="whitespace-nowrap" required />
          <Input
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="Số CCCD"
            inputMode="numeric"
            maxLength={12}
            pattern="\d{12}"
            title="CCCD gồm đúng 12 chữ số"
            className="font-mono whitespace-nowrap"
            required
          />
          <div className="sm:col-span-2">
            <Button type="submit" className="whitespace-nowrap">Đăng ký khách</Button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs font-semibold text-danger-soft-foreground" role="alert">{error}</p>}
      </SectionCard>
      <SectionCard title={`Danh sách khách (${visitors.length})`} desc={`Bảo vệ check-in tại cổng, khách rời trước ${VISITOR_LATEST_HOUR}:00`}>
        {visitors.length === 0 ? (
          <EmptyState title="Chưa có khách nào" desc="Đăng ký khách thăm đầu tiên để bảo vệ đối chiếu tại cổng." />
        ) : (
          <div className="space-y-2">
            {visitors.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-xs">
                <p className="truncate font-bold whitespace-nowrap text-foreground">{v.fullName} · {v.citizenId} · {v.id}</p>
                <div className="flex shrink-0 items-center gap-2">
                  {v.status === "PRE_REGISTERED" && <span className="whitespace-nowrap rounded-full bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary-soft-foreground">Chờ bảo vệ check-in</span>}
                  {(v.status === "CHECKED_IN" || v.status === "OVERSTAY") && (
                    <span className="whitespace-nowrap rounded-full bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">Bảo vệ xử lý tại cổng</span>
                  )}
                  {v.status === "OVERSTAY" && <span className="whitespace-nowrap rounded-full bg-danger-soft px-2 py-1 text-[11px] font-bold text-danger-soft-foreground">Quá 21:00</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
