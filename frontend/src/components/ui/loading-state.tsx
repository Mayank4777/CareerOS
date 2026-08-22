import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";

interface LoadingStateProps {
  label?: string;
  className?: string;
  icon?: ReactNode;
}

export function LoadingState({ label = "Loading...", className, icon }: LoadingStateProps) {
  return (
    <div className={cn("flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-secondary", className)}>
      {icon ? <div className="text-muted">{icon}</div> : <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-r-transparent" />}
      <p className="text-xs sm:text-sm font-medium">{label}</p>
    </div>
  );
}
