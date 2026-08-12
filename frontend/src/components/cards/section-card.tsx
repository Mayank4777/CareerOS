import { type ReactNode } from "react";

import { cn } from "@/lib/class-name";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, children, footer, className }: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <div className="border-t border-border/70 px-4 py-3">{footer}</div> : null}
    </Card>
  );
}
