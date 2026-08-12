import { type HTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-hover text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium tracking-tight border border-current/15",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
