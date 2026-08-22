import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-5 py-8 text-center", className)}>
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-xs leading-normal text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
