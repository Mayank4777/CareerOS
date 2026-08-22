import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";

interface ModalShellProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  role?: "dialog" | "alertdialog";
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}

export function ModalShell({
  open,
  titleId,
  descriptionId,
  role = "dialog",
  children,
  className,
  panelClassName,
}: ModalShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-neutral-950/75 p-4 sm:p-6 backdrop-blur-xs",
        className
      )}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "flex w-full max-h-[85vh] flex-col overflow-y-auto rounded-lg border border-border bg-surface shadow-xl",
          panelClassName
        )}
        role={role}
      >
        {children}
      </div>
    </div>
  );
}
