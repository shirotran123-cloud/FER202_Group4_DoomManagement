import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import React, { useEffect, useState } from "react";
import type { DormNotice } from "@/lib/dorm-ops";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { isManagerOrAdmin } from "@/lib/role-access";
import { communityApi, ApiError, type AppNotification } from "@/lib/api";

/**
 * Bảng tin KTX và thông báo hệ thống, đọc từ BACKEND.
 *
 * Trước đây trang này lấy bảng tin từ `localStorage` kèm hai thông báo viết cứng
 * trong `SEED`, và "Thông báo hệ thống" đọc một key localStorage khác — nên chỉ
 * máy nào tự nhập thì máy đó thấy, mở máy khác là trắng. Nay cả hai đều là dữ
 * liệu thật của KTX: bảng tin qua `/api/community/notices`, thông báo hệ thống
 * qua `/api/community/notifications` (đã lọc theo đúng người đang đăng nhập).
 */
export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  // Chỉ Ban Quản lý / Admin đăng bảng tin; sinh viên và kỹ thuật chỉ xem.
  const canPublish = isManagerOrAdmin(user?.role);

  const [notices, setNotices] = useState<DormNotice[]>([]);
  const [sysNotices, setSysNotices] = useState<AppNotification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Tải bảng tin + thông báo hệ thống của chính người đang đăng nhập. */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      const [noticeRes, notifRes] = await Promise.allSettled([
        communityApi.notices() as Promise<DormNotice[]>,
        communityApi.notifications(),
      ]);
      if (cancelled) return;

      const problems: string[] = [];
      if (noticeRes.status === "fulfilled" && Array.isArray(noticeRes.value)) {
        setNotices(noticeRes.value);
      } else {
        problems.push("bảng tin");
      }
      if (notifRes.status === "fulfilled") {
        setSysNotices(notifRes.value.data ?? []);
      } else {
        problems.push("thông báo hệ thống");
      }
      setError(problems.length ? `Không tải được ${problems.join(" và ")} từ máy chủ.` : null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /**
   * Bảng tin đang hiệu lực: máy chủ đã lọc, nhưng vẫn kiểm tra lại ngày vì trang
   * này còn hiển thị cả tin chưa tới hạn.
   */
  const today = new Date().toISOString().slice(0, 10);
  const active = notices.filter(
    (n) => (!n.startsAt || n.startsAt <= today) && (!n.endsAt || n.endsAt >= today),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = (await communityApi.publishNotice({
        title,
        body,
        audience: "ALL",
        startsAt: today,
        endsAt: "2026-12-31",
      })) as DormNotice;
      setNotices((prev) => [created, ...prev]);
      setTitle("");
      setBody("");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Không đăng được thông báo. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader eyebrow="Cộng đồng · Bảng tin" title="Thông báo KTX" desc="Cắt điện/nước, họp KTX và tự động báo hóa đơn mới" />

      {/* Trạng thái tải / lỗi — nói thật thay vì hiện bảng trống */}
      {loading && (
        <div className="dms-card flex items-center gap-2 p-3 text-xs font-semibold text-muted-foreground" aria-busy="true">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Đang tải thông báo từ máy chủ…
        </div>
      )}
      {error && !loading && (
        <div className="dms-card border-danger/30 bg-danger-soft p-3 text-xs font-semibold text-danger-soft-foreground">
          {error}
        </div>
      )}

      {canPublish ? (
        <SectionCard title="Đăng thông báo" desc="Tiêu đề + nội dung bắt buộc, có hiệu lực tới 31/12">
          <form onSubmit={submit} className="grid gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề"  required />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nội dung" rows={3}  required />
            {submitError && (
              <p className="text-xs font-semibold text-danger-soft-foreground">{submitError}</p>
            )}
            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang đăng…" : "Đăng bảng tin"}
              </Button>
            </div>
          </form>
        </SectionCard>
      ) : (
        <SectionCard title="Bảng tin Ban Quản lý" desc="Chỉ BQL và Admin được đăng. Sinh viên theo dõi tại đây.">
          <p className="text-xs text-muted-foreground">
            Bạn đang xem với quyền độc giả. Cần đăng thông báo? Liên hệ Ban Quản lý KTX.
          </p>
        </SectionCard>
      )}
      <SectionCard title={`Đang hiệu lực (${active.length})`}>
        {active.length === 0 ? (
          <EmptyState title={loading ? "Đang tải…" : "Chưa có thông báo hiệu lực"} />
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
          <EmptyState title={loading ? "Đang tải…" : "Chưa có thông báo nào gửi cho bạn"} />
        ) : (
          <div className="space-y-2">
            {sysNotices.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3 text-xs ${
                  n.read ? "border-border" : "border-primary/30 bg-primary-soft"
                }`}
              >
                <p className="font-bold text-foreground">{n.title}</p>
                <p className="mt-1 text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(n.at).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
