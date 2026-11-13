import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Navigasi Utama"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6"
      >
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/faticon.png"
            alt="Logo Malvin JN"
            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
          />
          <span className="text-sm font-bold tracking-tight text-slate-900 transition group-hover:text-blue-600 sm:text-base">
            Welcome to My Portofolio
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
          <Link href="/" className="transition hover:text-blue-600">
            Home
          </Link>
          <Link href="/projects" className="transition hover:text-blue-600">
            Projects
          </Link>
          <Link href="/contact" className="transition hover:text-blue-600">
            Contact
          </Link>
          <Link
            href="/manage"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-white transition hover:bg-blue-600"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}