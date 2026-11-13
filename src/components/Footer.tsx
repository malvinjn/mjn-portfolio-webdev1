import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-slate-600 sm:flex-row sm:px-6 sm:text-left">
        <p>© 2026 Malvin JN. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p>Built with Next.js, Tailwind CSS & Supabase | Thanks WebDev KMTETI</p>
          <span className="text-slate-300">•</span>
          <Link
            href="/manage"
            className="text-xs text-slate-400 transition hover:text-slate-700"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}