import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#981919]",
  secondary: "bg-white/85 text-slate-700 ring-1 ring-slate-200 hover:bg-white",
  ghost: "bg-transparent text-slate-600 hover:bg-white/70",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm",
  icon: "h-11 w-11 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
