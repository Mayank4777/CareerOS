import { type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  description?: string;
}

export function StatCard({ title, value, change, icon: Icon, tone = "neutral", description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium text-secondary">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-primary">{value}</p>
          {description ? <p className="text-xs text-muted leading-normal truncate">{description}</p> : null}
          {change ? <div className="pt-0.5"><Badge tone={tone}>{change}</Badge></div> : null}
        </div>
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-md border border-border bg-hover/40 text-secondary">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
