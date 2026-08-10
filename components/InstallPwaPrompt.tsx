"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS, show prompt if not in standalone mode
    if (iosDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || (!showPrompt && !deferredPrompt && !isIOS)) return null;

  return (
    <div className="bg-amber-400 text-slate-900 rounded-2xl p-4 mb-6 shadow-md relative">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute right-3 top-3 w-7 h-7 bg-amber-500/30 rounded-full flex items-center justify-center text-slate-900"
        aria-label="Close install banner"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-slate-900" />
        </div>
        <div className="pr-6">
          <p className="font-bold text-sm">Download Mobile App</p>
          <p className="text-xs text-slate-800 mt-0.5">
            {isIOS
              ? "Tap the Share icon in Safari, then select 'Add to Home Screen' to install."
              : "Install Detailic on your home screen for quick offline access."}
          </p>
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="mt-3 bg-slate-900 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Download className="w-3.5 h-3.5" />
              Install App Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
