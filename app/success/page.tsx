import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";
import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Loading…</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}
