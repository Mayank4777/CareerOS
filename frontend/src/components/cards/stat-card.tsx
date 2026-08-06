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
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-secondary">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-primary">{value}</p>
          {description ? <p className="text-sm text-secondary">{description}</p> : null}
          {change ? <Badge tone={tone}>{change}</Badge> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-hover text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
