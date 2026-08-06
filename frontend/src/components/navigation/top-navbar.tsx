import { Bell, Menu, MoonStar, Search, SunMedium, LogOut, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownItem } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { APP_NAME } from "@/constants/api";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/class-name";

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20 h-16 border-b border-border bg-app/95 backdrop-blur supports-[backdrop-filter]:bg-app/85",
        sidebarOffsetClassName
      )}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            aria-label="Open sidebar"
            variant="ghost"
            size="sm"
            onClick={onOpenMobileSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-primary">{APP_NAME}</p>
            <p className="text-xs text-secondary">Premium career operations workspace</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <label className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              aria-label="Global search"
              className="h-10 rounded-full border-border bg-surface pl-9 pr-4"
              placeholder="Search careers, jobs, resumes, or interviews"
              type="search"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>

          <div ref={menuRef} className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <Avatar
                name={user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "CareerOS user"}
                className="h-7 w-7"
              />
              <span className="hidden max-w-28 truncate sm:inline">
                {user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "Account"}
              </span>
            </Button>

            {menuOpen ? (
              <div className="absolute right-0 z-dropdown mt-2 w-64 rounded-xl border border-border bg-surface p-2 shadow-lg">
                <div className="border-b border-border px-3 py-3">
                  <p className="text-sm font-medium text-primary">
                    {user ? `${user.first_name} ${user.last_name}`.trim() || "CareerOS User" : "CareerOS User"}
                  </p>
                  <p className="mt-1 truncate text-xs text-secondary">{user?.email ?? "No active account"}</p>
                </div>
                <div className="py-2">
                  <DropdownItem
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(APP_ROUTES.settings);
                    }}
                  >
                    <UserRound className="mr-2 h-4 w-4" />
                    Profile settings
                  </DropdownItem>
                  <DropdownItem
                    destructive
                    onClick={() => {
                      setMenuOpen(false);
                      clearSession();
                      navigate(APP_ROUTES.login);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
