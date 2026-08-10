import Link from "next/link";
import { ClipboardList, ShieldCheck, Clock, Download } from "lucide-react";
import InstallPwaPrompt from "@/components/InstallPwaPrompt";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col">
      {/* Header */}
      <header className="px-5 pt-[calc(1rem+var(--sat))] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium tracking-wide uppercase">
              Contractor Portal
            </p>
            <h1 className="text-white font-semibold text-base leading-tight">
              Worker Registration
            </h1>
          </div>
        </div>

        <a
          href="https://www.pwabuilder.com/reportcard?site=https://detailic.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          <Download className="w-4 h-4 text-slate-900" />
          <span>Download App</span>
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 px-5 pt-8 pb-6 flex flex-col">
        <div className="flex-1">
          <div className="mb-2">
            <span className="inline-block bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
              Quick Registration
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Register as a<br />Worker
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Submit your details to complete your worker registration. Takes
            about 2–3 minutes.
          </p>

          {/* PWA Install Banner */}
          <InstallPwaPrompt />

          {/* Info cards */}
          <div className="space-y-3 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">What you need</p>
                <p className="text-blue-200 text-sm mt-0.5">
                  Aadhaar card, PAN card, and a photo
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Takes 2–3 minutes</p>
                <p className="text-blue-200 text-sm mt-0.5">
                  Simple 3-step process
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Secure & Private</p>
                <p className="text-blue-200 text-sm mt-0.5">
                  Your information is used only for registration purposes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pb-[var(--sab)]">
          <Link
            href="/register"
            className="block w-full bg-white text-blue-700 font-bold text-lg py-4 rounded-2xl text-center shadow-lg active:scale-[0.98] transition-transform"
          >
            Start Registration
          </Link>
          <p className="text-center text-blue-200 text-xs px-6">
            Your information will be used only for worker registration and
            administrative purposes.
          </p>
        </div>
      </main>
    </div>
  );
}
