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
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center", className)}>
      {icon ? <div className="mb-4 text-muted">{icon}</div> : null}
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
