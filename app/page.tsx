import { Suspense } from "react";
import Link from "next/link";
import { HeroSection } from "@/src/modules/home/HeroSection";
import { ProjectCard } from "@/src/components/ProjectCard";
import { supabase } from "@/src/lib/supabase";
import type { Project, Skill } from "@/src/types/project";

async function HomeContent() {
  const { data: rawProjects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, category, repo_url, image_url, featured, sort_order, created_at, skills(id, name, category)"
    )
    .order("sort_order", { ascending: true })
    .limit(3);

  const { data: skills } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("name", { ascending: true });

  const featuredProjects: Project[] = (rawProjects ?? []).map((item) => ({
    ...item,
    skills: Array.isArray(item.skills) ? (item.skills as Skill[]) : [],
  }));

  return (
    <>
      <section
        id="about"
        aria-labelledby="about-heading"
        className="border-y border-slate-200 bg-white py-14"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="about-heading" className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Tentang & Teknologi Utama
          </h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Fokus pada pengembangan aplikasi web modern, administrasi sistem Linux,
            dan otomatisasi infrastruktur jaringan. Berikut adalah daftar keahlian
            yang tersimpan secara dinamis di database Supabase:
          </p>

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {(skills ?? []).map((skill) => (
              <li
                key={skill.id}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-800"
              >
                {skill.name}{" "}
                <span className="text-xs text-blue-600">({skill.category})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="featured-projects"
        aria-labelledby="projects-heading"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="projects-heading" className="text-2xl font-bold text-slate-950 sm:text-3xl">
              Proyek Pilihan
            </h2>
            <p className="mt-2 text-slate-600">
              Beberapa proyek terbaru yang dimuat langsung dari database.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat Semua Proyek →
          </Link>
        </div>

        {projectsError ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat daftar proyek saat ini. Silakan muat ulang halaman.
          </p>
        ) : featuredProjects.length === 0 ? (
          <p className="mt-6 text-slate-600">Belum ada proyek yang ditambahkan.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6">
            Memuat data dari database...
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}