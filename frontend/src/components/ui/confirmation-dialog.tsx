import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
}: ConfirmationDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <ModalShell open={open} panelClassName="max-w-md" role="alertdialog" titleId="confirmation-dialog-title">
      <div className="p-4 sm:p-5">
        <h3 id="confirmation-dialog-title" className="text-base font-semibold text-primary">
          {title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary">{description}</p>
        {children ? <div className="mt-3">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
