import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[112px] w-full resize-none rounded-[1.5rem] border border-border bg-panel px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-muted focus:border-primary/30 focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    );
  },
);
