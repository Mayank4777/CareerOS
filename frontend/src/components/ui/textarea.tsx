import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm transition-colors duration-normal placeholder:text-muted focus:border-borderFocus focus:outline-none focus:ring-2 focus:ring-borderFocus/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
