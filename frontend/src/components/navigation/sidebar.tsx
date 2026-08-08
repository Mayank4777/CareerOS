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
    <div className="space-y-1">
      <NavLink
        to={item.path}
        end={!hasChildren}
        className={({ isActive }) =>
          cn(
            "group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
            collapsed ? "justify-center px-2" : "gap-3 px-3.5",
            isActive
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30"
              : "text-secondary hover:bg-hover hover:text-primary"
          )
        }
      >
        <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        {!collapsed ? (
          <span className="flex-1 truncate tracking-tight">{item.label}</span>
        ) : null}
      </NavLink>

      {hasChildren && !collapsed ? (
        <div className="space-y-1 pl-3.5 mt-1 border-l border-border/40 ml-4">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                      : "text-secondary hover:bg-hover hover:text-primary"
                  )
                }
              >
                <ChildIcon className="h-4 w-4 shrink-0 opacity-80" />
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
          className="fixed inset-0 z-30 bg-neutral-950/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col overflow-hidden border-r border-border/80 bg-sidebar/90 backdrop-blur-2xl transition-[width,transform] duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[80px]" : "lg:w-[280px]",
          "w-[280px]"
        )}
      >
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/60 px-3.5">
          <button
            aria-label={collapsed ? "Expand sidebar" : `${APP_NAME} brand`}
            className={cn(
              "flex min-w-0 items-center gap-3 overflow-hidden rounded-xl text-left transition-all duration-200",
              collapsed ? "w-full justify-center px-2 py-2 hover:bg-hover" : "px-1 py-1"
            )}
            onClick={collapsed ? onToggleCollapse : undefined}
            type="button"
          >
            {collapsed ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
                CO
              </div>
            ) : (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold tracking-tight text-primary gradient-text">{APP_NAME}</p>
                  <p className="text-[11px] text-secondary font-medium tracking-wide">AI Career Operating System</p>
                </div>
              </>
            )}
          </button>

          <Button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="hidden shrink-0 lg:inline-flex text-secondary hover:text-primary"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4">
          <nav className="space-y-4">
            {navigationItems.map((item) => (
              <SidebarGroup key={item.path} item={item} collapsed={collapsed} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border/60 p-3.5">
          <div className={cn("rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 backdrop-blur-md", collapsed ? "px-2" : "px-4")}>
            {!collapsed ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-semibold text-primary">MVP System Status: Active</p>
                </div>
                <p className="text-[11px] leading-relaxed text-secondary">
                  All 12 career platform modules built, verified, and ready.
                </p>
              </div>
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
