import { X } from 'lucide-react';
import { ToastMessage } from '../types/expense';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-md bg-[#1F2421] text-[#FAF9F6] px-4 py-3 rounded-lg shadow-lg border border-[#343C37] flex items-center gap-4 text-sm"
    >
      <span className="leading-snug">{toast.text}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="font-semibold text-[#A7D3BE] hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-[#A8B0AB] hover:text-white p-1 -mr-1 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
