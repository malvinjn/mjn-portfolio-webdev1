import type { Metadata } from "next";
import { ProjectManager } from "@/src/modules/projects/ProjectManager";

export const metadata: Metadata = {
  title: "Kelola Proyek (CRUD) | Malvin JN Portfolio",
  description:
    "Halaman manajemen database proyek dan keahlian (Create, Read, Update, Delete) dengan autentikasi Supabase dan Row Level Security.",
};

export default function ManagePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
          Manajemen Data Proyek (CRUD)
        </h1>
        <p className="mt-2 text-slate-600">
          Tambah, perbarui, atau hapus proyek beserta relasi teknologi yang
          tersimpan di Supabase.
        </p>
      </div>

      <ProjectManager />
    </main>
  );
}