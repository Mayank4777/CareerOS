import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm transition-colors duration-normal placeholder:text-muted focus:border-borderFocus focus:outline-none focus:ring-2 focus:ring-borderFocus/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
