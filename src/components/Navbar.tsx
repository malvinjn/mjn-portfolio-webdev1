import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Navigasi Utama"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/faticon.png"
            alt="Logo Malvin JN"
            className="h-9 w-9 rounded-full object-cover border border-slate-200"
          />
          <span className="text-sm font-bold tracking-tight text-slate-900 transition group-hover:text-blue-600 sm:text-base">
            Welcome to My Portofolio
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600 sm:gap-7">
          <Link href="/" className="transition hover:text-blue-600">
            Home
          </Link>
          <Link href="/projects" className="transition hover:text-blue-600">
            Projects
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-white transition hover:bg-blue-700"
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}