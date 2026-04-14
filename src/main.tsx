import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGoogleAnalytics } from "./lib/initGoogleAnalytics";

initGoogleAnalytics();
document.getElementById("seo-static-content")?.remove();

createRoot(document.getElementById("root")!).render(<App />);
