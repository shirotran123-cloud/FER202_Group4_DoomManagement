import React from "react";
import { cn } from "cn";

/** Page header — compact eyebrow + display title + optional actions.
 *
 * Single-line contract: the title and eyebrow never wrap, they truncate. The
 * `min-w-0` on the text column is what actually lets truncation work inside a
 * flex row — without it a flex child refuses to shrink below its content width
 * and the heading pushes the actions off-screen instead of ellipsising. */
export function PageHeader({ eyebrow, title, desc, descClassName, actions }: { eyebrow?: string; title: string; desc?: string; descClassName?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap text-primary-soft-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display truncate text-[26px] leading-tight font-extrabold tracking-tight whitespace-nowrap sm:text-[32px]">{title}</h1>
        {desc && <p className={cn("mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground", descClassName)}>{desc}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, desc, descClassName, actions, children, className }: { title: string; desc?: string; descClassName?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("dms-card overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="min-w-0">
          <h2 className="font-display truncate text-[16px] font-bold tracking-tight whitespace-nowrap">{title}</h2>
          {desc && <p className={cn("mt-0.5 text-xs text-muted-foreground", descClassName)}>{desc}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4">{children}</div>
    </section>
  );
}

/** Stat tile. Tones map onto the 3-colour system: info=indigo, good=emerald, bad=red, neutral=grey. */
export function StatCard({ label, value, hint, tone = "neutral", icon, className }: { label: string; value: string; hint?: string; tone?: "neutral" | "good" | "warn" | "bad" | "info"; icon?: React.ReactNode; className?: string }) {
  const toneCls =
    tone === "good" ? "text-success"
    : tone === "bad" ? "text-danger"
    : tone === "info" || tone === "warn" ? "text-primary"
    : "text-foreground";
  return (
    <div className={cn("dms-card group p-4 transition-transform hover:-translate-y-0.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-bold tracking-[0.1em] whitespace-nowrap text-muted-foreground uppercase">{label}</p>
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("font-display mt-2 truncate text-[28px] font-extrabold tracking-tight whitespace-nowrap", toneCls)}>{value}</p>
      {hint && <p className="mt-1 truncate text-xs whitespace-nowrap text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-muted/40 p-10 text-center sm:p-14">
      <p className="font-display truncate text-[16px] font-bold whitespace-nowrap">{title}</p>
      {desc && <p className="mx-auto mt-1.5 max-w-md truncate text-[13px] text-muted-foreground">{desc}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
