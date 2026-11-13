import type { Metadata } from "next";
import { ContactForm } from "@/src/components/ContactForm";

export const metadata: Metadata = {
  title: "Hubungi Saya (Contact) | Malvin JN Portofolio",
  description:
    "Hubungi Malvin Juliyyan Nugraha melalui email, LinkedIn, Instagram, atau formulir pesan untuk kolaborasi proyek web dan infrastruktur jaringan.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">
          Get In Touch
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
          Mari Terhubung & Berkolaborasi
        </h1>
        <p className="mt-3 text-slate-600">
          Silakan hubungi saya melalui kanal kontak di bawah ini atau kirimkan
          pesan langsung melalui formulir yang tersedia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <section
          aria-label="Informasi Kontak"
          className="space-y-4 lg:col-span-2"
        >
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-blue-600 uppercase">
              Email
            </h2>
            <p className="mt-1 font-bold text-slate-950">
              malvinjn24@gmail.com
            </p>
            <a
              href="mailto:malvinjn24@gmail.com"
              className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline"
            >
              Kirim Email →
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-blue-600 uppercase">
              Lokasi & Institusi
            </h2>
            <p className="mt-1 font-bold text-slate-950">
              Sleman, Daerah Istimewa Yogyakarta
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Teknologi Informasi — DTETI FT Universitas Gadjah Mada
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-blue-600 uppercase">
              Profil & Media Sosial
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm font-medium text-slate-700">
              <li>
                <a
                  href="https://github.com/malvinjn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 hover:underline"
                >
                  GitHub — github.com/malvinjn
                </a>
              </li>
              <li>
                <a
                  href="https://webmjn.my.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 hover:underline"
                >
                  Website — webmjn.my.id
                </a>
              </li>
            </ul>
          </article>
        </section>

        <section aria-label="Formulir Kontak" className="lg:col-span-3">
          <ContactForm />
        </section>
      </div>
    </main>
  );
}