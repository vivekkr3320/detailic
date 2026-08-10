"use client";

import { useState } from "react";
import type { AdminWorker } from "@/lib/types";
import { X, Save } from "lucide-react";

interface EditWorkerModalProps {
  worker: AdminWorker | null;
  onClose: () => void;
  onSaved: (updated: Partial<AdminWorker>) => void;
}

export default function EditWorkerModal({ worker, onClose, onSaved }: EditWorkerModalProps) {
  const [form, setForm] = useState({
    full_name: worker?.full_name ?? "",
    father_name: worker?.father_name ?? "",
    mobile_number: worker?.mobile_number ?? "",
    address: worker?.address ?? "",
    status: (worker?.status ?? "active") as "active" | "inactive",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  if (!worker) return null;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(undefined);

    try {
      const res = await fetch(`/api/admin/workers/${worker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Save failed. Please try again.");
        return;
      }

      onSaved({ ...form });
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-lg mx-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Edit Worker</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {[
            { id: "full_name", label: "Full Name", key: "full_name" as const },
            { id: "father_name", label: "Father's Name", key: "father_name" as const },
            { id: "mobile_number", label: "Mobile Number", key: "mobile_number" as const },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-slate-700 mb-1.5">
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                value={form[field.key]}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-base outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          ))}

          {/* Address */}
          <div>
            <label htmlFor="edit_address" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Address
            </label>
            <textarea
              id="edit_address"
              rows={3}
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-base outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="edit_status" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <select
              id="edit_status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "active" | "inactive" }))}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-base outline-none focus:border-blue-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-medium">⚠ {error}</p>
            </div>
          )}

          <div className="flex gap-3 pb-[var(--sab)]">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-2xl active:scale-95 transition-transform disabled:opacity-70"
            >
              {saving ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
