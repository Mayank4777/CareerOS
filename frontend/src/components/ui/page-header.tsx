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
    <header className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1", className)}>
      <div className="space-y-1">
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm sm:text-base text-secondary leading-relaxed">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div> : null}
    </header>
  );
}
