"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X, ExternalLink } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

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
        setIsInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="bg-amber-400 text-slate-900 rounded-2xl p-4 mb-6 shadow-md relative">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute right-3 top-3 w-7 h-7 bg-amber-500/30 rounded-full flex items-center justify-center text-slate-900 hover:bg-amber-500/50 transition-colors"
        aria-label="Close install banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-500/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5 text-slate-900" />
        </div>
        <div className="pr-6">
          <p className="font-bold text-sm">Download Mobile App / APK</p>
          <p className="text-xs text-slate-800 mt-1 leading-relaxed">
            {isIOS
              ? "Tap Safari's Share button below, then select 'Add to Home Screen'."
              : "Install directly on your phone or download the Android APK file."}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-slate-900 text-white font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}

            <a
              href="https://www.pwabuilder.com/reportcard?site=https://detailic.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 text-slate-900 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform border border-amber-500/30 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              Download APK Package
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
