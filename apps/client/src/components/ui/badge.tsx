import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "buy" | "sell" | "outline" | "live";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "buy" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        variant === "sell" && "bg-red-50 text-red-700 ring-1 ring-red-200",
        variant === "live" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        variant === "outline" && "bg-muted text-muted-foreground ring-1 ring-border",
        className
      )}
    >
      {children}
    </span>
  );
}
