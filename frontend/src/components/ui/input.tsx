import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-8.5 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm text-primary shadow-xs transition-colors placeholder:text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
