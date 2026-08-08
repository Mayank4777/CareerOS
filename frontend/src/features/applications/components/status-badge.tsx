import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "../types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getBadgeTone = (st: ApplicationStatus) => {
    switch (st) {
      case "wishlist":
        return "neutral";
      case "applied":
        return "info";
      case "interviewing":
        return "warning";
      case "offer":
      case "accepted":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <Badge tone={getBadgeTone(status)} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
