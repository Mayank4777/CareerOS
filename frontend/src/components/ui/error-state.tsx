import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-name";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-border bg-surface px-5 py-8 text-center", className)}>
      <AlertTriangle className="h-8 w-8 text-warning" />
      <h3 className="mt-3 text-sm font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-xs leading-normal text-secondary">{description}</p>
      {onRetry ? (
        <Button size="sm" className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
