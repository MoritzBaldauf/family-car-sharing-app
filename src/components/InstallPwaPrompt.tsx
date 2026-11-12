import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InstallPwaPrompt: React.FC = () => {
  const { t } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Capture Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || dismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 shadow-sm relative flex items-start gap-3 text-xs transition-colors">
      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#0a84ff] shrink-0">
        <Download className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{t.installAppTitle}</h4>
        <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-snug">
          {isIOS ? (
            <span className="inline-flex items-center gap-1 flex-wrap">
              <Share className="w-3 h-3 inline text-[#0071e3] dark:text-[#0a84ff]" /> {t.installAppDescIOS} <PlusSquare className="w-3 h-3 inline text-[#0071e3] dark:text-[#0a84ff]" />
            </span>
          ) : deferredPrompt ? (
            t.installAppDescOther
          ) : (
            t.installAppDescOther
          )}
        </p>

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="mt-2 px-3 py-1 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-lg shadow-2xs transition-all active-press cursor-pointer"
          >
            {t.installNow}
          </button>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
