"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AdminWorker } from "@/lib/types";
import StatsCards from "@/components/admin/StatsCards";
import WorkerCard from "@/components/admin/WorkerCard";
import WorkerTable from "@/components/admin/WorkerTable";
import WorkerDetailSheet from "@/components/admin/WorkerDetailSheet";
import EditWorkerModal from "@/components/admin/EditWorkerModal";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import {
  Search,
  Calendar,
  Download,
  LogOut,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const router = useRouter();
  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // PDF state
  const [pdfAllState, setPdfAllState] = useState<"idle" | "loading" | "error">("idle");

  // Modal state
  const [viewWorker, setViewWorker] = useState<AdminWorker | null>(null);
  const [editWorker, setEditWorker] = useState<AdminWorker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<AdminWorker | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWorkers = useCallback(async (q: string, date: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: q,
        date,
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/workers?${params}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      setWorkers(json.workers ?? []);
      setTotal(json.total ?? 0);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      // Total: all workers
      const totalRes = await fetch(`/api/admin/workers?limit=1&page=1`);
      const totalJson = await totalRes.json();

      // Today
      const today = new Date().toISOString().slice(0, 10);
      const todayRes = await fetch(`/api/admin/workers?date=${today}&limit=1&page=1`);
      const todayJson = await todayRes.json();

      // This week (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekRes = await fetch(`/api/admin/workers?limit=200&page=1`);
      const weekJson = await weekRes.json();
      const weekCount = (weekJson.workers ?? []).filter((w: AdminWorker) => {
        return new Date(w.registration_date) >= weekAgo;
      }).length;

      setStats({
        total: totalJson.total ?? 0,
        today: todayJson.total ?? 0,
        thisWeek: weekCount,
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchWorkers(search, dateFilter, page);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, dateFilter, page, fetchWorkers]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleExport = () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleDownloadAllPdf = async () => {
    if (pdfAllState === "loading") return;
    setPdfAllState("loading");
    try {
      const res = await fetch("/api/admin/workers/pdf-all");
      if (!res.ok) throw new Error("PDF report failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Workers_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfAllState("idle");
    } catch {
      setPdfAllState("error");
      setTimeout(() => setPdfAllState("idle"), 3000);
    }
  };

  const handleDelete = async (worker: AdminWorker) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/workers/${worker.id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkers((prev) => prev.filter((w) => w.id !== worker.id));
        setTotal((prev) => prev - 1);
        setStats((prev) => ({ ...prev, total: prev.total - 1 }));
        setDeleteWorker(null);
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleWorkerSaved = (updated: Partial<AdminWorker>) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === editWorker?.id ? { ...w, ...updated } : w
      )
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 max-w-5xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Admin Dashboard</p>
              <h1 className="text-sm font-bold text-slate-900">Worker Registration</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllPdf}
              disabled={pdfAllState === "loading"}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-60"
              title="Download All as PDF"
            >
              {pdfAllState === "loading" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {pdfAllState === "loading" ? "Building…" : pdfAllState === "error" ? "Failed" : "PDF Report"}
            </button>
            <button
              onClick={handleExport}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <StatsCards total={stats.total} today={stats.today} thisWeek={stats.thisWeek} />

      {/* Search + Filter */}
      <div className="px-4 pb-3 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name, mobile, or father's name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-base outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        {/* Date filter + mobile export */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-base outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleDownloadAllPdf}
            disabled={pdfAllState === "loading"}
            className="sm:hidden flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-semibold text-sm disabled:opacity-60"
            title="Download All PDF"
          >
            {pdfAllState === "loading" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Worker count */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          {loading ? "Loading…" : `${total} worker${total !== 1 ? "s" : ""} found`}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
        )}
      </div>

      {/* Worker list — cards on mobile, table on desktop */}
      <div className="px-4 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No workers found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || dateFilter ? "Try different search terms" : "No registrations yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="space-y-3 md:hidden">
              {workers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onView={setViewWorker}
                  onEdit={setEditWorker}
                />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <WorkerTable
                workers={workers}
                onView={setViewWorker}
                onEdit={setEditWorker}
                onDelete={setDeleteWorker}
              />
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkerDetailSheet
        worker={viewWorker}
        onClose={() => setViewWorker(null)}
        onEdit={(w) => { setViewWorker(null); setEditWorker(w); }}
        onDelete={(w) => { setViewWorker(null); setDeleteWorker(w); }}
      />
      <EditWorkerModal
        worker={editWorker}
        onClose={() => setEditWorker(null)}
        onSaved={handleWorkerSaved}
      />
      <DeleteConfirmDialog
        worker={deleteWorker}
        onClose={() => setDeleteWorker(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
