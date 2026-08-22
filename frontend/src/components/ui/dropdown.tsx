import { useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/class-name";
import { useClickOutside } from "@/hooks/use-click-outside";
import { Button } from "@/components/ui/button";

interface DropdownProps {
  triggerLabel: string;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ triggerLabel, children, align = "right", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, () => setOpen(false), open);

  const contentAlignment = useMemo(
    () => (align === "right" ? "right-0" : "left-0"),
    [align]
  );

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Button variant="secondary" size="sm" type="button" onClick={() => setOpen((current) => !current)}>
        {triggerLabel}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute z-dropdown mt-1.5 min-w-44 rounded-md border border-border bg-surface p-1 shadow-md",
            contentAlignment
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownItem({ className, destructive = false, ...props }: DropdownItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded px-2.5 py-1.5 text-left text-xs sm:text-sm text-primary transition-colors hover:bg-hover",
        destructive && "text-danger",
        className
      )}
      {...props}
    />
  );
}
