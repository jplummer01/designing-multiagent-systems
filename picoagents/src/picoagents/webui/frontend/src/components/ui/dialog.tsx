/**
 * Dialog - Simple modal dialog component
 */

import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog Content */}
      <div
        className="relative z-10 bg-background rounded-lg shadow-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
}

export function DialogContent({ children }: DialogContentProps) {
  return <div className="overflow-auto max-h-[90vh]">{children}</div>;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
      {children}
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
