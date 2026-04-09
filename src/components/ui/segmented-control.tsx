import { cn } from "../../lib/utils";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: Array<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("inline-flex rounded-2xl bg-slate-100/90 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold transition",
            value === option.value ? "bg-white text-slate-900 shadow-soft" : "text-slate-500 hover:text-slate-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
