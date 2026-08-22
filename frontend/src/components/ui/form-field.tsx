import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  children,
  description,
  error,
  required,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-primary" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {description ? <p className="text-xs leading-5 text-secondary">{description}</p> : null}
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
