import { useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

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
            "absolute z-dropdown mt-2 min-w-48 rounded-xl border border-border bg-surface p-2 shadow-lg",
            contentAlignment
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownItem({ className, destructive = false, ...props }: DropdownItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-hover",
        destructive && "text-danger",
        className
      )}
      {...props}
    />
  );
}
