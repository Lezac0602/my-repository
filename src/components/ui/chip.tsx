import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ className, active, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-primary/20 bg-primarySoft text-primary"
          : "border-slate-200 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white",
        className,
      )}
      {...props}
    />
  );
}
