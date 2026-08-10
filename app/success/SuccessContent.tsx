"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Copy, Check, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const refId = params.get("ref") ?? "WR-UNKNOWN";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex flex-col max-w-lg mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Success icon */}
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-3">
          Registration Successful!
        </h1>
        <p className="text-green-100 text-base text-center mb-10 leading-relaxed">
          Your worker registration has been submitted successfully. Please save your Registration ID below.
        </p>

        {/* Registration ID card */}
        <div className="w-full bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-8">
          <p className="text-green-200 text-sm font-semibold text-center mb-2">
            Registration ID
          </p>
          <div className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-3">
            <span className="text-white font-bold text-xl tracking-widest">
              {refId}
            </span>
            <button
              onClick={handleCopy}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center active:scale-90 transition-all"
              aria-label="Copy registration ID"
            >
              {copied ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-center text-green-200 text-xs mt-2">Copied to clipboard!</p>
          )}
        </div>

        {/* Info */}
        <div className="w-full bg-white/10 rounded-2xl p-4 mb-10">
          <p className="text-green-100 text-sm text-center leading-relaxed">
            Please share this Registration ID with your contractor as confirmation of your registration.
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-5 pb-[calc(2rem+var(--sab))] space-y-3">
        <Link
          href="/register"
          className="block w-full bg-white text-green-700 font-bold text-base py-4 rounded-2xl text-center active:scale-[0.98] transition-transform shadow-lg"
        >
          Register Another Worker
        </Link>
        <Link
          href="/"
          className="block w-full text-center text-white/80 font-medium py-3"
        >
          Done
        </Link>
      </div>
    </div>
  );
}
