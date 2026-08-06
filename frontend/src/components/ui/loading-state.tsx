import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";

interface LoadingStateProps {
  label?: string;
  className?: string;
  icon?: ReactNode;
}

export function LoadingState({ label = "Loading...", className, icon }: LoadingStateProps) {
  return (
    <div className={cn("flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface text-secondary", className)}>
      {icon ? <div className="text-muted">{icon}</div> : <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-r-transparent" />}
      <p className="text-sm">{label}</p>
    </div>
  );
}
