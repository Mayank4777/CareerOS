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
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold tracking-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 border border-indigo-500/80 shadow-xs font-semibold",
  gradient:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 border border-indigo-500/80 shadow-xs font-semibold",
  secondary:
    "border border-border bg-surface text-primary hover:bg-hover hover:border-neutral-600 font-semibold shadow-xs",
  outline:
    "border border-border bg-transparent text-primary hover:bg-hover font-semibold",
  ghost: "bg-transparent text-secondary hover:text-primary hover:bg-hover font-medium",
  destructive:
    "border border-red-500/30 bg-red-600 text-white hover:bg-red-500 font-semibold",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-4 text-xs sm:text-sm rounded-md",
  md: "h-9 px-6 text-sm sm:text-base rounded-md",
  lg: "h-10 px-8 text-base sm:text-lg rounded-md",
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
