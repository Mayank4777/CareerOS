import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { Container } from "@/components/ui/container";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-app">
      <Container className="py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-primary">CareerOS</div>
          <div className="text-sm text-secondary">AI-first career operating system</div>
        </div>
      </Container>
      {children ?? <Outlet />}
    </div>
  );
}
