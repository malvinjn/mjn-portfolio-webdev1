import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
        <span>Welcome to My Portofolio</span>
        <span>•</span>
        <span>Information Technology UGM</span>
      </div>

      <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Merancang infrastruktur jaringan & ekosistem web with ❤️
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
        Saya Malvin Juliyyan Nugraha. Mahasiswa S1 Teknologi Informasi Universitas Gadjah Mada dengan pengalaman kepemimpinan dan pengelolaan sistem digital, mulai dari pengembangan website, administrasi jaringan (Mikrotik & Proxmox VE), manajemen penyiaran (live streaming), hingga kelancaran publikasi acara.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/projects"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Jelajahi Proyek
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Hubungi Saya
        </Link>
      </div>
    </section>
  );
}