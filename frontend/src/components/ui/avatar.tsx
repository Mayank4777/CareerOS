import { UserRound } from "lucide-react";

import { cn } from "@/lib/class-name";

interface AvatarProps {
  name?: string | null;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  const initials =
    name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") ?? "";

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-hover text-sm font-semibold text-primary",
        className
      )}
      aria-hidden="true"
    >
      {initials ? initials : <UserRound className="h-4 w-4" />}
    </div>
  );
}
