import { type ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/class-name";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-secondary md:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
