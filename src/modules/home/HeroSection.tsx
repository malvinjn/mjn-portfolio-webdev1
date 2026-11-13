import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">
        Information Technology Undergraduate • UGM
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Membangun Aplikasi Web & Infrastruktur Modern yang Andal.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
        Selamat datang di portofolio saya. Proyek ini mendemonstrasikan integrasi
        Next.js App Router, TypeScript, Tailwind CSS, dan database relasional
        Supabase dengan Row Level Security.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/projects"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Jelajahi Proyek
        </Link>
        <Link
          href="/manage"
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Kelola Data (CRUD)
        </Link>
      </div>
    </section>
  );
}