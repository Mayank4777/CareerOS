import { Menu, MoonStar, Search, SunMedium, LogOut, UserRound, X, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownItem } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { APP_NAME } from "@/constants/api";
import { APP_ROUTES } from "@/constants/routes";
import { navigationItems } from "@/constants/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/class-name";

import { NotificationPopover } from "@/features/notifications";

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  sidebarOffsetClassName: string;
}

export function TopNavbar({ onOpenMobileSidebar, sidebarOffsetClassName }: TopNavbarProps) {
  const { user, clearSession } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => setSearchOpen(false), searchOpen);

  const searchableItems = useMemo(() => {
    const list: { label: string; path: string; parentLabel?: string; icon: typeof UserRound }[] = [];
    navigationItems.forEach((item) => {
      list.push({ label: item.label, path: item.path, icon: item.icon });
      if (item.children) {
        item.children.forEach((child) => {
          list.push({ label: child.label, path: child.path, parentLabel: item.label, icon: child.icon });
        });
      }
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.parentLabel && item.parentLabel.toLowerCase().includes(q))
    ).slice(0, 7);
  }, [searchQuery, searchableItems]);

  const handleSelectSearchResult = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0].path);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20 h-14 border-b border-border bg-app/95 backdrop-blur-md transition-all duration-150",
        sidebarOffsetClassName
      )}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Open sidebar"
            variant="ghost"
            size="sm"
            onClick={onOpenMobileSidebar}
            className="lg:hidden text-secondary hover:text-primary"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden min-w-0 sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="truncate text-xs font-semibold text-secondary tracking-tight">
              {APP_NAME} Platform
            </p>
          </div>
        </div>

        {/* Global Interactive Search */}
        <div ref={searchRef} className="relative flex flex-1 items-center justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              aria-label="Global search"
              className="h-8 rounded-md border-border bg-surface/80 pl-9 pr-8 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="Search features, profile sections, tools..."
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Live Search Results Dropdown */}
          {searchOpen && searchQuery.trim() ? (
            <div className="absolute top-full left-0 right-0 mt-1 z-dropdown rounded-md border border-border bg-card p-1.5 shadow-xl max-h-72 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="px-2 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
                    Quick Navigation
                  </p>
                  {searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path + item.label}
                        type="button"
                        onClick={() => handleSelectSearchResult(item.path)}
                        className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-primary hover:bg-hover transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate font-medium">{item.label}</span>
                          {item.parentLabel ? (
                            <span className="text-[10px] text-muted truncate">in {item.parentLabel}</span>
                          ) : null}
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-xs text-muted">
                  No matching features or sections found.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <NotificationPopover />
          <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={toggleTheme} className="text-secondary hover:text-primary">
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>

          <div ref={menuRef} className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="border-border bg-surface hover:bg-hover"
            >
              <Avatar
                name={user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "CareerOS user"}
                className="h-5 w-5"
              />
              <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
                {user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "Account"}
              </span>
            </Button>

            {menuOpen ? (
              <div className="absolute right-0 z-dropdown mt-1.5 w-60 rounded-md border border-border bg-card p-1 shadow-md">
                <div className="border-b border-border/70 px-3 py-2">
                  <p className="text-xs font-semibold text-primary">
                    {user ? `${user.first_name} ${user.last_name}`.trim() || "CareerOS User" : "CareerOS User"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-secondary">{user?.email ?? "No active account"}</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <DropdownItem
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(APP_ROUTES.settings);
                    }}
                  >
                    <UserRound className="mr-2 h-3.5 w-3.5 text-indigo-400" />
                    Account & Preferences
                  </DropdownItem>
                  <DropdownItem
                    destructive
                    onClick={() => {
                      setMenuOpen(false);
                      clearSession();
                      navigate(APP_ROUTES.login);
                    }}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5 text-red-400" />
                    Sign out
                  </DropdownItem>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
