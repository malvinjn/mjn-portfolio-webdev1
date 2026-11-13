"use client";

import { useState } from "react";
import { ProjectCard } from "@/src/components/ProjectCard";
import type { Project } from "@/src/types/project";

type ProjectCatalogProps = {
  initialProjects: Project[];
};

export function ProjectCatalog({ initialProjects }: ProjectCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(initialProjects.map((p) => p.category))),
  ];

  const filteredProjects = initialProjects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.summary.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      (project.skills ?? []).some((s) => s.name.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section aria-label="Filter dan Daftar Proyek" className="space-y-8">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
        <div>
          <label
            htmlFor="search-project"
            className="block text-sm font-semibold text-slate-800"
          >
            Cari Proyek atau Teknologi
          </label>
          <input
            id="search-project"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik judul, deskripsi, atau skill (misal: Next.js)..."
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="filter-category"
            className="block text-sm font-semibold text-slate-800"
          >
            Filter Kategori
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <p role="status">
          Menampilkan <strong>{filteredProjects.length}</strong> dari{" "}
          {initialProjects.length} proyek.
        </p>
        {(searchQuery || selectedCategory !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-medium text-slate-700">
            Tidak ada proyek yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}