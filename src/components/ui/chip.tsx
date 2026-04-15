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
          : "border-border bg-panel text-muted hover:bg-panelMuted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
