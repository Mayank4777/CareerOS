import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import { Container } from "@/components/ui/container";
import { TopNavbar } from "@/components/navigation/top-navbar";
import { Sidebar } from "@/components/navigation/sidebar";
import { cn } from "@/lib/class-name";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarPaddingClassName = useMemo(
    () => (sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[280px]"),
    [sidebarCollapsed]
  );

  const sidebarHeaderOffsetClassName = useMemo(
    () => (sidebarCollapsed ? "lg:left-[80px]" : "lg:left-[280px]"),
    [sidebarCollapsed]
  );

  return (
    <div className="min-h-screen bg-app text-primary">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <TopNavbar
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        sidebarOffsetClassName={sidebarHeaderOffsetClassName}
      />
      <main className={cn("pt-16 transition-[padding] duration-normal", sidebarPaddingClassName)}>
        <Container className="py-6 sm:py-8 lg:py-10">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
