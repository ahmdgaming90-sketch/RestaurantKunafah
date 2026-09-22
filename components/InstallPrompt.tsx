"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "kunafa-sokara-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone()) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;

    if (isIos()) {
      setIosMode(true);
      setVisible(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-espresso/10 bg-paper p-4 shadow-lg shadow-espresso/10 sm:inset-x-auto sm:left-8 sm:w-96">
      <p className="text-sm font-semibold text-espresso">أضف كنافة سكره إلى الشاشة الرئيسية</p>

      {iosMode ? (
        <p className="mt-2 text-xs leading-relaxed text-espresso/60">
          اضغط زر المشاركة في المتصفح ثم اختر "إضافة إلى الشاشة الرئيسية".
        </p>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-espresso/60">للوصول السريع والطلب بدون فتح المتصفح في كل مرة.</p>
      )}

      <div className="mt-3 flex gap-2">
        {!iosMode ? (
          <button onClick={install} className="btn-primary !px-4 !py-2 text-xs">
            إضافة إلى الشاشة الرئيسية
          </button>
        ) : null}
        <button onClick={dismiss} className="btn-secondary !px-4 !py-2 text-xs">
          ليس الآن
        </button>
      </div>
    </div>
  );
}
