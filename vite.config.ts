import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseOrigin = env.VITE_SUPABASE_URL?.replace(/\/$/, "") || "";

  // Same-origin proxy so Edge Function calls from localhost avoid browser cross-origin blocks
  // ("Load failed" / "Failed to send a request to the Edge Function").
  const supabaseFunctionsProxy = supabaseOrigin
    ? {
        "/supabase-functions": {
          target: supabaseOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (p: string) => p.replace(/^\/supabase-functions/, "/functions/v1"),
        },
      }
    : {};

  return {
  server: {
    host: "::",
    port: 8080,
    proxy: supabaseFunctionsProxy,
  },
  preview: {
    port: 8080,
    proxy: supabaseFunctionsProxy,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
};
});
