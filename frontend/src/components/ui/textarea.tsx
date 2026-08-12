import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-primary shadow-xs transition-colors placeholder:text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
