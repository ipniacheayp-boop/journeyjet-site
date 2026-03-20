import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

// Versioned keys so the banner can be re-shown after UX/policy changes.
const CONSENT_STORAGE_KEY = "tripile_cookie_consent_accepted_v2";
const CONSENT_COOKIE_NAME = "tripile_cookie_consent_accepted_v2";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, ...rest] = c.split("=");
    if (!k) continue;
    if (decodeURIComponent(k) === name) return rest.join("=");
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export default function CookieConsentBanner() {
  const { language } = useLanguage();
  const location = useLocation();

  const initialAccepted = useMemo(() => {
    if (typeof window === "undefined") return false;
    const fromStorage = localStorage.getItem(CONSENT_STORAGE_KEY) === "1";
    const fromCookie = readCookie(CONSENT_COOKIE_NAME) === "1";
    return fromStorage || fromCookie;
  }, []);

  const [accepted, setAccepted] = useState<boolean>(initialAccepted);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (accepted) return;
    setClosing(false);
    setVisible(false);
    const raf = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, [accepted]);

  // Keep state in sync if another tab changes consent.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CONSENT_STORAGE_KEY) return;
      setAccepted((e.newValue ?? "") === "1" || readCookie(CONSENT_COOKIE_NAME) === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onAccept = () => {
    setClosing(true);
    window.setTimeout(() => {
      setAccepted(true);
      localStorage.setItem(CONSENT_STORAGE_KEY, "1");
      writeCookie(CONSENT_COOKIE_NAME, "1", 60 * 60 * 24 * 365);
    }, 180);
  };

  if (location.pathname !== "/") return null;
  if (accepted) return null;

  const text =
    language === "es"
      ? "Nuestro sitio usa cookies para brindarle la mejor experiencia web posible. "
      : "Our site uses cookies so we can provide you with the best possible web experience. ";

  const learnMore =
    language === "es" ? "Obtenga más información sobre cómo usamos cookies." : "Learn more about how we use cookies.";

  const acceptLabel = language === "es" ? "Aceptar y continuar" : "Accept & Continue";

  return (
    <div
      className={[
        "fixed bottom-0 left-0 right-0 z-[110] bg-slate-900 text-white border-t border-white/10",
        "transform transition-transform duration-300 ease-out will-change-transform",
        visible && !closing ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3.5">
          <p className="text-xs sm:text-sm leading-relaxed text-center sm:text-left">
            {text}
            <a href="/privacy" className="underline underline-offset-4 hover:opacity-90">
              {learnMore}
            </a>
          </p>
          <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end">
            <Button
              onClick={onAccept}
              size="sm"
              className="rounded-xl px-4 py-2"
            >
              {acceptLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

