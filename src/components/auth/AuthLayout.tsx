import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import tripileLogo from "@/assets/tripile-logo.svg";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

const AuthLayout = ({ title, subtitle, footer, children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="container mx-auto flex items-center justify-between px-4 py-5">
          <Link to="/" className="flex items-center gap-2" aria-label="Tripile home">
            <img src={tripileLogo} alt="Tripile" className="h-8 w-auto" />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Back to site
          </Link>
        </header>

        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-10">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-8">
              {children}
            </div>

            {footer ? (
              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
            ) : null}
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
