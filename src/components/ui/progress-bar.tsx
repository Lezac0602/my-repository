import { cn, percentageLabel } from "../../lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  tone?: "primary" | "success" | "warning";
  showLabel?: boolean;
}

const toneClasses = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
};

export function ProgressBar({ value, className, tone = "primary", showLabel }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClasses[tone])}
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
      {showLabel ? <div className="text-xs font-medium text-slate-500">{percentageLabel(value)}</div> : null}
    </div>
  );
}
