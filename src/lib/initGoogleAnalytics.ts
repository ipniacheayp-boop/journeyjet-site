/** GA4: loads gtag.js into document.head when measurement ID is set. */
export function initGoogleAnalytics(): void {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!id) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}
