import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import React, { useEffect, useState } from "react";
import { createNotice, filterActiveNotices, type DormNotice } from "@/lib/dorm-ops";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";

const KEY = "dms_notices_v1";
const SYS_KEY = "dms_notifications_v1";

interface SysNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

function loadSysNotifications(): SysNotification[] {
  try {
    const raw = localStorage.getItem(SYS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
const SEED: DormNotice[] = [
  { id: "NTC-SEED-1", title: "Cắt điện bảo trì Tòa A", body: "8:00–10:00 ngày 15/10 bảo trì trạm điện. Sinh viên sạc dự phòng.", audience: "BUILDING", startsAt: "2026-10-01", endsAt: "2026-10-31" },
  { id: "NTC-SEED-2", title: "Hóa đơn tháng 09 đã phát hành", body: "Kiểm tra Billing và thanh toán VietQR trước 05/10.", audience: "ALL", startsAt: "2026-10-01", endsAt: "2026-10-31" },
];

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  // Only Ban Quản lý / Admin publish notices; students and technicians read-only.
  const canPublish = user?.role === "manager" || user?.role === "admin";
  const [notices, setNotices] = useState<DormNotice[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : SEED;
    } catch {
      return SEED;
    }
  });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sysNotices] = useState<SysNotification[]>(loadSysNotifications);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notices));
  }, [notices]);

  const active = filterActiveNotices(notices, new Date().toISOString());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    const n = createNotice(title, body, "ALL", new Date().toISOString().slice(0, 10), "2026-12-31");
    setNotices([n, ...notices]);
    setTitle("");
    setBody("");
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader eyebrow="Cộng đồng · Bảng tin" title="Thông báo KTX" desc="BQL gửi lịch cắt điện/nước, họp KTX. Thông báo tự động khi có hóa đơn mới." />
      {canPublish ? (
        <SectionCard title="Đăng thông báo" desc="Tiêu đề + nội dung bắt buộc, có hiệu lực tới 31/12">
          <form onSubmit={submit} className="grid gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề"  required />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nội dung" rows={3}  required />
            <div><Button type="submit">Đăng bảng tin</Button></div>
          </form>
        </SectionCard>
      ) : (
        <SectionCard title="Bảng tin Ban Quản lý" desc="Chỉ BQL và Admin được đăng thông báo. Sinh viên theo dõi tại đây.">
          <p className="text-xs text-muted-foreground">
            Bạn đang xem với quyền độc giả. Cần đăng thông báo? Liên hệ Ban Quản lý KTX.
          </p>
        </SectionCard>
      )}
      <SectionCard title={`Đang hiệu lực (${active.length})`}>
        {active.length === 0 ? (
          <EmptyState title="Chưa có thông báo hiệu lực" />
        ) : (
          <div className="space-y-2">
            {active.map((n) => (
              <div key={n.id} className="rounded-xl border border-border p-3 text-xs">
                <p className="font-bold text-foreground">{n.title}</p>
                <p className="mt-1 text-muted-foreground">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <SectionCard title={`Thông báo hệ thống (${sysNotices.length})`} desc="Tự động tạo khi kỹ thuật lưu chỉ số mới và phát hành hóa đơn">
        {sysNotices.length === 0 ? (
          <EmptyState title="Chưa có thông báo hệ thống" />
        ) : (
          <div className="space-y-2">
            {sysNotices.map((n) => (
              <div key={n.id} className="rounded-xl border border-border p-3 text-xs">
                <p className="font-bold text-foreground">{n.title}</p>
                <p className="mt-1 text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.at).toLocaleString("vi-VN")}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
