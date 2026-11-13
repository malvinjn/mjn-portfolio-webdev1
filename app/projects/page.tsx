import { Suspense } from "react";
import type { Metadata } from "next";
import { supabase } from "@/src/lib/supabase";
import { ProjectCatalog } from "@/src/modules/projects/ProjectCatalog";
import type { Project, Skill } from "@/src/types/project";

export const metadata: Metadata = {
  title: "Daftar Proyek | Malvin JN Portfolio",
  description:
    "Jelajahi seluruh proyek pengembangan aplikasi web, sistem jaringan, dan eksperimen teknologi yang dibangun oleh Malvin Juliyyan Nugraha.",
};

async function ProjectListLoader() {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, description, category, repo_url, image_url, featured, sort_order, created_at, skills(id, name, category)"
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Gagal mengambil data proyek dari database.");
  }

  const projects: Project[] = (data ?? []).map((item) => ({
    ...item,
    skills: Array.isArray(item.skills) ? (item.skills as Skill[]) : [],
  }));

  return <ProjectCatalog initialProjects={projects} />;
}

export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
          Katalog Proyek
        </h1>
        <p className="mt-2 text-slate-600">
          Gunakan kolom pencarian atau filter kategori di bawah ini untuk
          menemukan proyek spesifik.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-sm text-slate-600">
            Memuat daftar proyek...
          </p>
        }
      >
        <ProjectListLoader />
      </Suspense>
    </main>
  );
}