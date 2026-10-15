import React from "react";
import { cn } from "cn";

const TINTS = [
  "bg-primary-soft text-primary-soft-foreground",
  "bg-success-soft text-success-soft-foreground",
  "bg-danger-soft text-danger-soft-foreground",
  "bg-muted text-muted-foreground",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span
    aria-label={name}
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full font-black",
      tintFor(name),
      className ?? "h-8 w-8 text-xs"
    )}
  >
    {initialsOf(name)}
  </span>
);
