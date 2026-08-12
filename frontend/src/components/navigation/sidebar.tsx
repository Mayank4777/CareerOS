import { ChevronRight, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
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
    <div className="space-y-0.5">
      <NavLink
        to={item.path}
        end={!hasChildren}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            "group flex items-center rounded-md py-1.5 text-[15px] font-medium transition-colors duration-150",
            collapsed ? "justify-center h-8.5 w-8.5 mx-auto" : "gap-2.5 px-3",
            isActive
              ? "bg-indigo-500/10 text-indigo-400 font-semibold border-l-2 border-indigo-500"
              : "text-secondary hover:bg-hover hover:text-primary"
          )
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed ? (
          <span className="flex-1 truncate tracking-tight">{item.label}</span>
        ) : null}
      </NavLink>

      {hasChildren && !collapsed ? (
        <div className="space-y-0.5 pl-3 mt-0.5 border-l border-border ml-3.5">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2.5 py-1 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                      : "text-secondary hover:bg-hover hover:text-primary"
                  )
                }
              >
                <ChildIcon className="h-[13px] w-[13px] shrink-0 opacity-75" />
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
          className="fixed inset-0 z-30 bg-neutral-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-border bg-sidebar transition-[width,transform] duration-150 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[64px]" : "lg:w-[264px]",
          "w-[264px]"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          {collapsed ? (
            <button
              aria-label="Expand sidebar"
              className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
              onClick={onToggleCollapse}
              type="button"
            >
              CO
            </button>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate tracking-tight">{APP_NAME}</p>
                <p className="text-xs text-muted truncate">AI Career Operating System</p>
              </div>
            </div>
          )}

          {!collapsed ? (
            <Button
              aria-label="Collapse sidebar"
              size="sm"
              variant="ghost"
              onClick={onToggleCollapse}
              className="hidden h-7 w-7 p-0 shrink-0 lg:inline-flex text-secondary hover:text-primary"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarGroup key={item.path} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-2">
          <div className={cn("rounded-md border border-border bg-surface/60 p-2.5", collapsed ? "px-1 text-center" : "px-2.5")}>
            {!collapsed ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs font-semibold text-primary">Status: Active</p>
                </div>
                <p className="text-[11px] text-muted leading-snug truncate">
                  All platform modules ready.
                </p>
              </div>
            ) : (
              <div className="flex justify-center text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
