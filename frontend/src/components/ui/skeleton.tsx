import { type HTMLAttributes } from "react";

import { cn } from "@/lib/class-name";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-hover", className)} {...props} />;
}
