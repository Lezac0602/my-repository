import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-white/55 px-5 py-8 text-center">
      {icon ? <div className="mb-4 flex justify-center text-slate-400">{icon}</div> : null}
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
