import { Menu, MoonStar, Search, SunMedium, LogOut, UserRound, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20 h-16 border-b border-border/80 bg-app/80 backdrop-blur-2xl transition-all duration-200",
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
            className="lg:hidden text-secondary hover:text-primary"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden min-w-0 sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <p className="truncate text-xs font-semibold text-secondary tracking-wider uppercase">
              {APP_NAME} Control Flightdeck
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <label className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/70" />
            <Input
              aria-label="Global search"
              className="h-9 rounded-full border-border/80 bg-surface/60 pl-10 pr-4 text-xs backdrop-blur-md transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              placeholder="Search target roles, resume builder, AI advice..."
              type="search"
            />
          </label>
        </div>

        <div className="flex items-center gap-2.5">
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
              className="border-indigo-500/30 bg-surface/80 hover:bg-hover backdrop-blur-md"
            >
              <Avatar
                name={user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "CareerOS user"}
                className="h-6 w-6"
              />
              <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
                {user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "Account"}
              </span>
            </Button>

            {menuOpen ? (
              <div className="absolute right-0 z-dropdown mt-2 w-64 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-border/60 px-3 py-3">
                  <p className="text-sm font-semibold text-primary">
                    {user ? `${user.first_name} ${user.last_name}`.trim() || "CareerOS User" : "CareerOS User"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-secondary">{user?.email ?? "No active account"}</p>
                </div>
                <div className="py-1.5 space-y-0.5">
                  <DropdownItem
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(APP_ROUTES.settings);
                    }}
                  >
                    <UserRound className="mr-2 h-4 w-4 text-indigo-400" />
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
                    <LogOut className="mr-2 h-4 w-4 text-red-400" />
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
