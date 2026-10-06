import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "amber" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-raised text-muted",
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-soft text-amber",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
