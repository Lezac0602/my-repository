import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "neutral" | "primary" | "success" | "warning";
}

const toneClasses = {
  neutral: "bg-slate-100 text-slate-600",
  primary: "bg-primarySoft text-primary",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
