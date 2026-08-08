import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

import { cn } from "@/lib/class-name";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-indigo-500/40 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/30",
  gradient:
    "border border-indigo-400/40 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:brightness-110",
  secondary:
    "border border-border bg-surface/80 text-primary backdrop-blur-md hover:border-brand-500/40 hover:bg-hover",
  outline:
    "border border-border/80 bg-transparent text-primary hover:border-brand-500/40 hover:bg-hover/60",
  ghost: "border-transparent bg-transparent text-primary hover:bg-hover/60",
  destructive:
    "border border-red-500/30 bg-red-600/90 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const resolvedClassName = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        className: cn(resolvedClassName, children.props.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={resolvedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
