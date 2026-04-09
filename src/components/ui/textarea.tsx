import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[112px] w-full resize-none rounded-[1.5rem] border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    );
  },
);
