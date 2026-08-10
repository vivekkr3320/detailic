"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Eye, RefreshCw, FileText } from "lucide-react";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref_id") || "WR-REGISTRATION";
  const workerId = searchParams.get("id") || "";

  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const pdfApiUrl = `/api/register/pdf?id=${workerId}`;

  const handleDownload = async () => {
    if (pdfState === "loading") return;
    setPdfState("loading");
    try {
      const res = await fetch(pdfApiUrl);
      if (!res.ok) throw new Error("PDF failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Worker_Registration_${refId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };

  const handlePreview = () => {
    window.open(pdfApiUrl.replace("attachment", "inline") + "&view=1", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-600 to-emerald-900 flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Success Icon */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
          <CheckCircle className="w-14 h-14 text-emerald-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Registration Successful!
        </h1>
        <p className="text-emerald-100 text-center text-base mb-8 max-w-xs">
          Your worker registration has been completed and saved securely.
        </p>

        {/* Registration ID card */}
        <div className="w-full bg-white/15 backdrop-blur-sm rounded-3xl p-5 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="text-emerald-100 text-sm font-medium">Registration ID</p>
          </div>
          <p className="text-white font-mono font-bold text-2xl tracking-wider text-center py-2">
            {refId}
          </p>
          <p className="text-emerald-200 text-xs text-center mt-1">
            Save this ID for your records
          </p>
        </div>

        {/* PDF Section */}
        <div className="w-full bg-white/10 backdrop-blur-sm rounded-3xl p-5 mb-6 border border-white/15">
          <p className="text-white font-semibold text-sm mb-3 text-center">
            📄 Your Registration PDF is ready
          </p>

          {pdfState === "error" && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-3">
              <p className="text-white text-sm text-center">
                Registration was successful, but the PDF could not be generated. Please try again.
              </p>
            </div>
          )}

          {/* Primary: Download PDF */}
          <button
            onClick={handleDownload}
            disabled={pdfState === "loading"}
            className="w-full flex items-center justify-center gap-3 bg-white text-emerald-700 font-bold text-base py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-70 mb-3"
          >
            {pdfState === "loading" ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating PDF…
              </>
            ) : pdfState === "error" ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Try Again
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-emerald-600" />
                Download Registration PDF
              </>
            )}
          </button>

          {/* Secondary: View PDF */}
          <button
            onClick={handlePreview}
            className="w-full flex items-center justify-center gap-2 bg-white/20 text-white font-semibold text-sm py-3 rounded-2xl active:scale-[0.98] transition-transform border border-white/25"
          >
            <Eye className="w-4 h-4" />
            View PDF
          </button>
        </div>

        {/* Register Another */}
        <Link
          href="/"
          className="w-full text-center text-emerald-200 font-semibold py-3 rounded-2xl border border-white/20 active:scale-[0.98] transition-transform"
        >
          Register Another Worker
        </Link>

        <p className="text-emerald-300/70 text-xs text-center mt-6 px-4">
          The PDF is generated on-demand. Your data is stored securely and is not shared publicly.
        </p>
      </div>
    </div>
  );
}
