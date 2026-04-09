import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
}

export function Card({ className, muted, ...props }: CardProps) {
  return (
    <div
      className={cn(
        muted ? "muted-panel" : "glass-panel",
        "rounded-3xl border px-4 py-4 transition duration-200",
        className,
      )}
      {...props}
    />
  );
}
