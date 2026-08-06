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
    <div className={cn("flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-10 text-center", className)}>
      <AlertTriangle className="h-10 w-10 text-warning" />
      <h3 className="mt-4 text-base font-semibold text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-secondary">{description}</p>
      {onRetry ? (
        <Button className="mt-6" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
