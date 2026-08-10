"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, ExternalLink } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="bg-amber-400 text-slate-900 rounded-2xl p-4 mb-6 shadow-lg border border-amber-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-900/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5 text-slate-900" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-base text-slate-900">Download Mobile App / APK</p>
            <span className="bg-slate-900 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Android & iOS
            </span>
          </div>
          <p className="text-xs text-slate-800 mt-1 leading-relaxed">
            Install <strong>Detailic</strong> on your mobile phone or download the Android APK package.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-3">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 active:scale-95 transition-transform shadow-md"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Install App On Device
              </button>
            )}

            <a
              href="https://www.pwabuilder.com/reportcard?site=https://detailic.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 active:scale-95 transition-transform shadow-md hover:bg-slate-800"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download APK Package
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
