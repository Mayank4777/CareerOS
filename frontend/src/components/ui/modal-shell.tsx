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
        "fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-neutral-900/60 px-4 py-6 sm:px-6",
        className
      )}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "flex w-full max-h-[90vh] flex-col overflow-y-auto rounded-xl border border-border bg-surface shadow-lg",
          panelClassName
        )}
        role={role}
      >
        {children}
      </div>
    </div>
  );
}
