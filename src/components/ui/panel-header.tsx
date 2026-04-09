import { ReactNode } from "react";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PanelHeader({ title, subtitle, action }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
