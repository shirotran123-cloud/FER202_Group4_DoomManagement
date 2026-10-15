import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react";
import { createMarketplaceListing, createLostFoundPost, type MarketplaceListing, type LostFoundPost } from "@/lib/dorm-ops";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import type { PhotoRecord } from "@/lib/photo-upload";

const MKT_KEY = "dms_marketplace_v1";
const LAF_KEY = "dms_lostfound_v1";

export const MarketplacePage: React.FC = () => {
  const [tab, setTab] = useState<"MARKET" | "LOST">("MARKET");
  const [listings, setListings] = useState<MarketplaceListing[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MKT_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [posts, setPosts] = useState<LostFoundPost[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LAF_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(100000);
  const [item, setItem] = useState("");
  const [kind, setKind] = useState<"LOST" | "FOUND">("LOST");
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(MKT_KEY, JSON.stringify(listings));
  }, [listings]);
  useEffect(() => {
    localStorage.setItem(LAF_KEY, JSON.stringify(posts));
  }, [posts]);

  const submitMarket = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const l = createMarketplaceListing("SE182049", title, price, "DO_CU", photos.map((p) => p.id));
      setListings([l, ...listings]);
      setTitle("");
      setPhotos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng bài thất bại");
    }
  };

  const submitLost = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const p = createLostFoundPost("SE182049", kind, item, "KTX", photos.map((ph) => ph.id));
      setPosts([p, ...posts]);
      setItem("");
      setPhotos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng tin thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader eyebrow="Cộng đồng · Chợ & thất lạc" title="Chợ đồ cũ & Tìm đồ thất lạc" desc="Nhượng tủ lạnh, quạt, sách vở. Báo mất/nhặt được đồ trong KTX, kèm ảnh upload." />
      <div className="flex gap-2">
        <Button variant={tab === "MARKET" ? "default" : "outline"} onClick={() => setTab("MARKET")}>Chợ đồ cũ ({listings.length})</Button>
        <Button variant={tab === "LOST" ? "default" : "outline"} onClick={() => setTab("LOST")}>Thất lạc ({posts.length})</Button>
      </div>
      {tab === "MARKET" ? (
        <SectionCard title="Đăng bán đồ cũ">
          <form onSubmit={submitMarket} className="grid gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Quạt cây cũ còn tốt"  required />
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}  aria-label="Gia ban" />
            <ImageUpload storageKey="dms_market_photos" label="Ảnh món đồ" value={photos} onChange={setPhotos} />
            <div><Button type="submit">Đăng bán</Button></div>
          </form>
          {error && <p className="mt-2 text-xs text-danger-soft-foreground" role="alert">{error}</p>}
          <div className="mt-4 space-y-2">
            {listings.length === 0 ? <EmptyState title="Chưa có tin bán" /> : listings.map((l) => (
              <div key={l.id} className="rounded-xl border border-border p-3 text-xs">
                <p className="font-bold">{l.title} · {l.price.toLocaleString()}đ · {l.photoIds.length} ảnh</p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Báo mất / nhặt được">
          <form onSubmit={submitLost} className="grid gap-3">
            <div className="flex gap-2">
              <Button type="button" variant={kind === "LOST" ? "default" : "outline"} onClick={() => setKind("LOST")}>Mất đồ</Button>
              <Button type="button" variant={kind === "FOUND" ? "default" : "outline"} onClick={() => setKind("FOUND")}>Nhặt được</Button>
            </div>
            <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="VD: Ví da màu đen khu sân A"  required />
            <ImageUpload storageKey="dms_lostfound_photos" label="Ảnh minh chứng" value={photos} onChange={setPhotos} />
            <div><Button type="submit">Đăng tin</Button></div>
          </form>
          {error && <p className="mt-2 text-xs text-danger-soft-foreground" role="alert">{error}</p>}
          <div className="mt-4 space-y-2">
            {posts.length === 0 ? <EmptyState title="Chưa có tin thất lạc" /> : posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-border p-3 text-xs">
                <p className="font-bold">[{p.kind}] {p.item} · {p.location}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
};
