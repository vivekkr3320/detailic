import type { AdminWorker } from "@/lib/types";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  worker: AdminWorker | null;
  onClose: () => void;
  onConfirm: (worker: AdminWorker) => void;
  deleting: boolean;
}

export default function DeleteConfirmDialog({
  worker,
  onClose,
  onConfirm,
  deleting,
}: DeleteConfirmDialogProps) {
  if (!worker) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 bottom-4 z-[60] bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto sm:inset-auto sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Worker?</h3>
          <p className="text-slate-600 text-sm mb-1">
            You are about to permanently delete:
          </p>
          <p className="font-bold text-slate-900 text-base mb-4">
            {worker.full_name}
          </p>
          <p className="text-red-600 text-sm font-medium mb-6">
            ⚠ This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold active:scale-95 transition-transform disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(worker)}
              disabled={deleting}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-semibold active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
