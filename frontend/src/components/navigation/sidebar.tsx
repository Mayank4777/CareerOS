import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/api";
import { navigationItems, type NavigationItem } from "@/constants/navigation";
import { cn } from "@/lib/class-name";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

function SidebarGroup({
  item,
  collapsed,
}: {
  item: NavigationItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  return (
    <div className="space-y-1">
      <NavLink
        to={item.path}
        end={!hasChildren}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-normal",
            isActive
              ? "bg-brand-600 text-white shadow-sm"
              : "text-secondary hover:bg-hover hover:text-primary"
          )
        }
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed ? (
          <span className="flex-1 truncate">{item.label}</span>
        ) : null}
      </NavLink>

      {hasChildren && !collapsed ? (
        <div className="space-y-1 pl-2">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-normal",
                    isActive
                      ? "bg-hover text-primary"
                      : "text-secondary hover:bg-hover hover:text-primary"
                  )
                }
              >
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-neutral-950/50 lg:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-sidebar transition-transform duration-normal lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[80px]" : "lg:w-[280px]",
          "w-[280px]"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm">
              CO
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{APP_NAME}</p>
                <p className="text-xs text-secondary">Career operating system</p>
              </div>
            ) : null}
          </div>

          <Button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-4">
            {navigationItems.map((item) => (
              <SidebarGroup key={item.path} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-3">
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            {!collapsed ? (
              <>
                <p className="text-sm font-medium text-primary">Workspace ready</p>
                <p className="mt-1 text-xs leading-5 text-secondary">
                  The layout is prepared for future modules, nested navigation, and data-heavy screens.
                </p>
              </>
            ) : (
              <div className="flex justify-center text-secondary">
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
