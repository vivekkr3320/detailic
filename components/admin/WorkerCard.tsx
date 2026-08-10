import Image from "next/image";
import { formatDate, truncate } from "@/lib/utils";
import type { AdminWorker } from "@/lib/types";
import { Eye, Edit2, User } from "lucide-react";

interface WorkerCardProps {
  worker: AdminWorker;
  onView: (worker: AdminWorker) => void;
  onEdit: (worker: AdminWorker) => void;
}

export default function WorkerCard({ worker, onView, onEdit }: WorkerCardProps) {
  const initials = worker.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Photo */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-blue-100 flex-shrink-0">
          {worker.photo_url ? (
            <Image
              src={worker.photo_url}
              alt={worker.full_name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {worker.full_name}
            </h3>
            <span
              className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                worker.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {worker.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            📱 +91 {worker.mobile_number}
          </p>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            👤 S/o {worker.father_name}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Registered: {formatDate(worker.registration_date)}
          </p>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">
        📍 {truncate(worker.address, 80)}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onView(worker)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-transform"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => onEdit(worker)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-transform"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );
}
