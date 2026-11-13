"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
import type { Project, Skill } from "@/src/types/project";

export function ProjectManager() {
  // State Auth
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // State Data & Loading/Error
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State Form Project (Create & Update)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [repoUrl, setRepoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("/project-placeholder.svg");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // State Feedback Form
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Tambah Skill Baru
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Frontend");

  async function fetchAllData() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [projectsRes, skillsRes] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, title, slug, summary, description, category, repo_url, image_url, featured, sort_order, created_at, skills(id, name, category)"
          )
          .order("sort_order", { ascending: true }),
        supabase.from("skills").select("id, name, category").order("name"),
      ]);

      if (projectsRes.error || skillsRes.error) {
        throw new Error("Gagal memuat data dari server.");
      }

      const formattedProjects: Project[] = (projectsRes.data ?? []).map((item) => ({
        ...item,
        skills: Array.isArray(item.skills) ? (item.skills as Skill[]) : [],
      }));

      setProjects(formattedProjects);
      setSkills(skillsRes.data ?? []);
    } catch {
      setLoadError("Tidak dapat memuat data proyek dan skill. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchAllData();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (!email.trim() || !password) {
      setAuthError("Email dan password wajib diisi.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError("Login gagal. Periksa kembali email dan password Anda.");
      return;
    }

    setEmail("");
    setPassword("");
    setAuthMessage("Berhasil login! Anda kini dapat menambah, mengubah, dan menghapus data.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthMessage("Anda telah logout.");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setDescription("");
    setCategory("Frontend");
    setRepoUrl("");
    setImageUrl("/project-placeholder.svg");
    setFeatured(false);
    setSortOrder("0");
    setSelectedSkillIds([]);
  }

  function handleSelectEdit(project: Project) {
    setEditingId(project.id);
    setTitle(project.title);
    setSlug(project.slug);
    setSummary(project.summary);
    setDescription(project.description);
    setCategory(project.category);
    setRepoUrl(project.repo_url ?? "");
    setImageUrl(project.image_url ?? "/project-placeholder.svg");
    setFeatured(project.featured);
    setSortOrder(String(project.sort_order));
    setSelectedSkillIds((project.skills ?? []).map((s) => s.id));
    setFormError(null);
    setFormSuccess(null);
  }

  function toggleSkillSelection(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  }

  async function handleAddSkill(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      setFormError("Silakan login terlebih dahulu untuk menambah skill.");
      return;
    }

    const cleanName = newSkillName.trim();
    if (!cleanName) {
      setFormError("Nama skill tidak boleh kosong.");
      return;
    }

    const { error } = await supabase
      .from("skills")
      .insert({ name: cleanName, category: newSkillCategory });

    if (error) {
      setFormError("Gagal menambahkan skill. Pastikan nama skill belum terdaftar.");
      return;
    }

    setNewSkillName("");
    setFormSuccess(`Skill "${cleanName}" berhasil ditambahkan.`);
    await fetchAllData();
  }

  async function handleSubmitProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      setFormError("Akses ditolak: Anda harus login untuk menyimpan perubahan ke database.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanSlug =
      slug.trim() ||
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const cleanSummary = summary.trim();
    const cleanDesc = description.trim();
    const orderNum = Number(sortOrder);

    if (!cleanTitle || !cleanSlug || !cleanSummary || !cleanDesc) {
      setFormError("Judul, slug, ringkasan, dan deskripsi wajib diisi.");
      return;
    }

    if (cleanDesc.length > 1000) {
      setFormError("Deskripsi maksimal 1000 karakter.");
      return;
    }

    if (!Number.isInteger(orderNum)) {
      setFormError("Urutan tampil (Sort Order) harus berupa bilangan bulat.");
      return;
    }

    setIsSubmitting(true);

    try {
      let targetProjectId = editingId;

      if (editingId) {
        // UPDATE Project
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            title: cleanTitle,
            slug: cleanSlug,
            summary: cleanSummary,
            description: cleanDesc,
            category,
            repo_url: repoUrl.trim() || null,
            image_url: imageUrl.trim() || "/project-placeholder.svg",
            featured,
            sort_order: orderNum,
          })
          .eq("id", editingId);

        if (updateError) throw new Error(updateError.message);

        // Sinkronisasi relasi project_skills
        await supabase.from("project_skills").delete().eq("project_id", editingId);
      } else {
        // CREATE Project
        const { data: inserted, error: insertError } = await supabase
          .from("projects")
          .insert({
            title: cleanTitle,
            slug: cleanSlug,
            summary: cleanSummary,
            description: cleanDesc,
            category,
            repo_url: repoUrl.trim() || null,
            image_url: imageUrl.trim() || "/project-placeholder.svg",
            featured,
            sort_order: orderNum,
          })
          .select("id")
          .single();

        if (insertError || !inserted) throw new Error(insertError?.message);
        targetProjectId = inserted.id;
      }

      // INSERT relasi ke project_skills jika ada skill yang dipilih
      if (targetProjectId && selectedSkillIds.length > 0) {
        const skillRows = selectedSkillIds.map((skillId) => ({
          project_id: targetProjectId,
          skill_id: skillId,
        }));
        const { error: relError } = await supabase.from("project_skills").insert(skillRows);
        if (relError) throw new Error(relError.message);
      }

      setFormSuccess(
        editingId
          ? `Proyek "${cleanTitle}" berhasil diperbarui!`
          : `Proyek baru "${cleanTitle}" berhasil ditambahkan ke database!`
      );
      resetForm();
      await fetchAllData();
    } catch {
      setFormError(
        "Gagal menyimpan proyek. Pastikan slug unik dan seluruh input sudah benar."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProject(project: Project) {
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      setFormError("Silakan login terlebih dahulu untuk menghapus proyek.");
      return;
    }

    const { error } = await supabase.from("projects").delete().eq("id", project.id);

    if (error) {
      setFormError("Gagal menghapus proyek dari database.");
      return;
    }

    setProjects((prev) => prev.filter((item) => item.id !== project.id));
    if (editingId === project.id) resetForm();
    setFormSuccess(`Proyek "${project.title}" berhasil dihapus.`);
  }

  return (
    <div className="space-y-10">
      {/* Panel Autentikasi Supabase */}
      <section
        aria-labelledby="auth-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="auth-heading" className="text-lg font-bold text-slate-950">
          Status Autentikasi (Row Level Security)
        </h2>

        {authError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {authError}
          </p>
        )}
        {authMessage && (
          <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {authMessage}
          </p>
        )}

        {user ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-700">
              Login sebagai: <strong className="text-slate-950">{user.email}</strong>{" "}
              <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                Authenticated (Full CRUD Access)
              </span>
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700">
                Email Admin
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@webdev.ugm"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Login untuk Akses CRUD
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Notifikasi Global Form CRUD */}
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {formError}
        </div>
      )}
      {formSuccess && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
        >
          {formSuccess}
        </div>
      )}

      {/* Grid Form Project & Form Skill */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section
          aria-labelledby="form-project-heading"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 id="form-project-heading" className="text-xl font-bold text-slate-950">
              {editingId ? "Edit Proyek" : "Tambah Proyek Baru"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-600 hover:underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitProject} noValidate className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="project-title" className="block text-sm font-semibold text-slate-800">
                  Judul Proyek *
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Monitoring Jaringan"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="project-slug" className="block text-sm font-semibold text-slate-800">
                  Slug URL (Unik) *
                </label>
                <input
                  id="project-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="otomatis-dari-judul-jika-kosong"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="project-category" className="block text-sm font-semibold text-slate-800">
                  Kategori *
                </label>
                <select
                  id="project-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Fullstack">Fullstack</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Network & Infra">Network & Infra</option>
                </select>
              </div>

              <div>
                <label htmlFor="project-order" className="block text-sm font-semibold text-slate-800">
                  Urutan Tampil (Sort Order) *
                </label>
                <input
                  id="project-order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="project-summary" className="block text-sm font-semibold text-slate-800">
                Ringkasan Singkat *
              </label>
              <input
                id="project-summary"
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Satu kalimat penjelasan proyek"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="project-desc" className="block text-sm font-semibold text-slate-800">
                Deskripsi Lengkap (Maks 1000 Karakter) *
              </label>
              <textarea
                id="project-desc"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fitur utama, arsitektur, dan manfaat proyek..."
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="project-repo" className="block text-sm font-semibold text-slate-800">
                  URL Repository / Live Demo
                </label>
                <input
                  id="project-repo"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="project-image" className="block text-sm font-semibold text-slate-800">
                  Path / URL Gambar
                </label>
                <input
                  id="project-image"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <fieldset className="pt-2">
              <legend className="text-sm font-semibold text-slate-800">
                Pilih Teknologi / Skills Terkait (Tabel Relasi)
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const checked = selectedSkillIds.includes(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        checked
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSkillSelection(skill.id)}
                        className="sr-only"
                      />
                      {skill.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="project-featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="project-featured" className="text-sm font-medium text-slate-800">
                Tandai sebagai Proyek Pilihan (Featured)
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan Proyek"
                : "Tambah Proyek ke Database"}
            </button>
          </form>
        </section>

        {/* Form Tambah Skill */}
        <section
          aria-labelledby="form-skill-heading"
          className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 id="form-skill-heading" className="text-xl font-bold text-slate-950">
            Tambah Skill Baru
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Tambahkan opsi teknologi ke tabel <code>skills</code>.
          </p>

          <form onSubmit={handleAddSkill} noValidate className="mt-4 space-y-4">
            <div>
              <label htmlFor="skill-name" className="block text-sm font-semibold text-slate-800">
                Nama Skill *
              </label>
              <input
                id="skill-name"
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Misal: Docker / PostgreSQL"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="skill-category" className="block text-sm font-semibold text-slate-800">
                Kategori Skill
              </label>
              <select
                id="skill-category"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Language">Language</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Tambah Skill
            </button>
          </form>
        </section>
      </div>

      {/* Daftar Proyek untuk Edit & Delete */}
      <section
        aria-labelledby="list-manage-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="list-manage-heading" className="text-xl font-bold text-slate-950">
          Daftar Proyek Tersimpan ({projects.length})
        </h2>

        {isLoading ? (
          <p role="status" className="mt-4 text-sm text-slate-600">
            Memuat data proyek...
          </p>
        ) : loadError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {loadError}
          </p>
        ) : projects.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Belum ada proyek di database.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase">
                      #{project.sort_order} • {project.category}
                    </span>
                    {project.featured && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-bold text-slate-950">{project.title}</h3>
                  <p className="text-sm text-slate-600">{project.summary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectEdit(project)}
                    className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}