import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";

import { cn } from "@/lib/class-name";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-transparent bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "border-border bg-surface text-primary hover:border-borderHover hover:bg-hover",
  outline:
    "border-border bg-transparent text-primary hover:border-borderHover hover:bg-hover",
  ghost: "border-transparent bg-transparent text-primary hover:bg-hover",
  destructive:
    "border-transparent bg-danger text-white shadow-sm hover:opacity-90 active:opacity-80",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5 text-base",
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
