import { cn } from "../../lib/utils";

interface TogglePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function TogglePill({ label, active, onClick }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active ? "bg-slate-900 text-white" : "bg-panel text-muted hover:bg-panelMuted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
