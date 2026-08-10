import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-700 flex items-center justify-center">
          <p className="text-white text-lg font-medium">Loading…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
