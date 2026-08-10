"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { AdminWorker } from "@/lib/types";
import { X, Trash2, Edit2, Download, RefreshCw } from "lucide-react";

interface WorkerDetailSheetProps {
  worker: AdminWorker | null;
  onClose: () => void;
  onEdit: (worker: AdminWorker) => void;
  onDelete: (worker: AdminWorker) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-slate-900 font-medium leading-snug">{value}</p>
    </div>
  );
}

export default function WorkerDetailSheet({
  worker,
  onClose,
  onEdit,
  onDelete,
}: WorkerDetailSheetProps) {
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");

  if (!worker) return null;

  const initials = worker.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDownloadPdf = async () => {
    if (pdfState === "loading") return;
    setPdfState("loading");
    try {
      const res = await fetch(`/api/admin/workers/${worker.id}/pdf`);
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Worker_${worker.full_name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch {
      setPdfState("error");
      setTimeout(() => setPdfState("idle"), 3000);
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

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto max-w-lg mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Worker Details</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Photo + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-100 flex-shrink-0">
              {worker.photo_url ? (
                <Image
                  src={worker.photo_url}
                  alt={worker.full_name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">{initials}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">{worker.full_name}</h3>
              <span
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  worker.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {worker.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-slate-50 rounded-2xl px-4 divide-y divide-slate-100 mb-4">
            <DetailRow label="Worker ID" value={worker.id.slice(0, 8).toUpperCase() + "..."} />
            <DetailRow label="Mobile Number" value={`+91 ${worker.mobile_number}`} />
            <DetailRow label="Father's Name" value={worker.father_name} />
            <DetailRow label="Address" value={worker.address} />
            <DetailRow label="Aadhaar" value={worker.aadhaar_masked} />
            <DetailRow label="PAN" value={worker.pan_masked} />
            <DetailRow label="Registered On" value={formatDate(worker.registration_date)} />
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfState === "loading"}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm mb-4 transition-all active:scale-95 ${
              pdfState === "error"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            } disabled:opacity-70`}
          >
            {pdfState === "loading" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating PDF…
              </>
            ) : pdfState === "error" ? (
              <>
                <RefreshCw className="w-4 h-4" />
                PDF Failed — Tap to Retry
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Registration PDF
              </>
            )}
          </button>

          {/* Actions */}
          <div className="flex gap-3 pb-[var(--sab)]">
            <button
              onClick={() => onEdit(worker)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-2xl active:scale-95 transition-transform"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(worker)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl border border-red-200 active:scale-95 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
