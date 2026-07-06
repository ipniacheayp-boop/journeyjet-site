import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGoogleAnalytics } from "./lib/initGoogleAnalytics";

initGoogleAnalytics();
// Remove the prerendered SEO shell so react-helmet fully owns the runtime <head>
// and there are never duplicate title/description/canonical/OG tags in the DOM.
document.getElementById("seo-static-content")?.remove();
document.querySelectorAll("[data-prerendered]").forEach((el) => el.remove());

createRoot(document.getElementById("root")!).render(<App />);
