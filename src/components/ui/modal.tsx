import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, subtitle, children, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm md:items-center">
      <div className={cn("glass-panel w-full max-w-3xl rounded-[2rem] p-5 md:p-6", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source modal">
            <X size={18} />
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
