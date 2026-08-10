import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { AdminWorker } from "@/lib/types";
import { Eye, Edit2, Trash2 } from "lucide-react";

interface WorkerTableProps {
  workers: AdminWorker[];
  onView: (worker: AdminWorker) => void;
  onEdit: (worker: AdminWorker) => void;
  onDelete: (worker: AdminWorker) => void;
}

export default function WorkerTable({ workers, onView, onEdit, onDelete }: WorkerTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Worker</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Mobile</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Father&apos;s Name</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Aadhaar</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">PAN</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Date</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker, i) => (
            <tr
              key={worker.id}
              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                i === workers.length - 1 ? "border-0" : ""
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-100 flex-shrink-0">
                    {worker.photo_url ? (
                      <Image
                        src={worker.photo_url}
                        alt={worker.full_name}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">
                          {worker.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 whitespace-nowrap">
                      {worker.full_name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {worker.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                +91 {worker.mobile_number}
              </td>
              <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                {worker.father_name}
              </td>
              <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap text-xs">
                {worker.aadhaar_masked}
              </td>
              <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap text-xs">
                {worker.pan_masked}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    worker.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {worker.status === "active" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {formatDate(worker.registration_date)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView(worker)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(worker)}
                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(worker)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
