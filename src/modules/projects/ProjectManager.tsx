"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
import type { Project, Skill } from "@/src/types/project";

function compressImageToWebpDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal memproses gambar."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      img.onerror = () => reject(new Error("File gambar tidak valid."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

export function ProjectManager() {
  // State Auth
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // State Upload Gambar
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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
      setAuthChecking(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
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

    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoggingIn(false);

    if (error) {
      setAuthError("Login gagal. Periksa kembali email dan password Anda.");
      return;
    }

    setEmail("");
    setPassword("");
    setAuthMessage("Autentikasi berhasil. Selamat datang di Dashboard Admin!");
  }

  function fillDemoCredentials() {
    setEmail("demo@webmjn.my.id");
    setPassword("demoadmin");
    setAuthError(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setFormError(null);
    setFormSuccess(null);
    setAuthMessage("Anda telah keluar dari sesi Admin.");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setDescription("");
    setCategory("Frontend");
    setRepoUrl("");
    setImageUrl("");
    setUploadedFileName(null);
    setUploadNotice(null);
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
    const cleanImg =
      project.image_url && project.image_url !== "/project-placeholder.svg"
        ? project.image_url
        : "";
    setImageUrl(cleanImg);
    setUploadedFileName(null);
    setUploadNotice(null);
    setFeatured(project.featured);
    setSortOrder(String(project.sort_order));
    setSelectedSkillIds((project.skills ?? []).map((s) => s.id));
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSkillSelection(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  }

  // Handler Upload Gambar (Coba Supabase Storage -> Otomatis Fallback ke WebP jika bucket belum ada)
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setUploadNotice(null);

    if (!file.type.startsWith("image/")) {
      setFormError("File yang dipilih harus berupa gambar (PNG, JPG, WebP, atau SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setIsUploadingImage(true);
    setUploadedFileName(file.name);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(fileName);

        setImageUrl(publicUrlData.publicUrl);
        setUploadNotice(`Berhasil diunggah ke Storage: ${file.name}`);
      } else {
        // Fallback otomatis ke WebP terkompresi agar tetap berhasil disimpan tanpa bucket
        const webpDataUrl = await compressImageToWebpDataUrl(file);
        setImageUrl(webpDataUrl);
        setUploadNotice(`Gambar "${file.name}" siap disimpan (dioptimasi ke WebP).`);
      }
    } catch {
      setFormError("Gagal memproses gambar. Silakan coba gambar lain.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleAddSkill(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

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
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            title: cleanTitle,
            slug: cleanSlug,
            summary: cleanSummary,
            description: cleanDesc,
            category,
            repo_url: repoUrl.trim() || null,
            image_url: imageUrl.trim() || null,
            featured,
            sort_order: orderNum,
          })
          .eq("id", editingId);

        if (updateError) throw new Error(updateError.message);
        await supabase.from("project_skills").delete().eq("project_id", editingId);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("projects")
          .insert({
            title: cleanTitle,
            slug: cleanSlug,
            summary: cleanSummary,
            description: cleanDesc,
            category,
            repo_url: repoUrl.trim() || null,
            image_url: imageUrl.trim() || null,
            featured,
            sort_order: orderNum,
          })
          .select("id")
          .single();

        if (insertError || !inserted) throw new Error(insertError?.message);
        targetProjectId = inserted.id;
      }

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
          : `Proyek baru "${cleanTitle}" berhasil ditambahkan!`
      );
      resetForm();
      await fetchAllData();
    } catch {
      setFormError("Gagal menyimpan proyek. Pastikan slug unik dan seluruh input valid.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProject(project: Project) {
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("projects").delete().eq("id", project.id);

    if (error) {
      setFormError("Gagal menghapus proyek dari database.");
      return;
    }

    setProjects((prev) => prev.filter((item) => item.id !== project.id));
    if (editingId === project.id) resetForm();
    setFormSuccess(`Proyek "${project.title}" berhasil dihapus.`);
  }

  if (authChecking) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p role="status" className="text-sm font-medium text-slate-600">
          Memeriksa sesi autentikasi...
        </p>
      </div>
    );
  }

  // TAMPILAN SAAT BELUM LOGIN
  if (!user) {
    return (
      <section
        aria-labelledby="login-heading"
        className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Protected Area • Supabase RLS
          </span>
          <h2 id="login-heading" className="mt-3 text-2xl font-bold text-slate-950">
            Login Admin Portal
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Masuk dengan akun administrator untuk mengelola data proyek portofolio.
          </p>
        </div>

        {authError && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {authError}
          </p>
        )}
        {authMessage && (
          <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {authMessage}
          </p>
        )}

        <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-800">
              Email Administrator
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@webmjn.my.id"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoggingIn ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Penguji / Reviewer? Gunakan akun demo berikut:
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-2 w-full rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Isi Otomatis Akun Demo (demo@webmjn.my.id)
          </button>
        </div>
      </section>
    );
  }

  // TAMPILAN SAAT SUDAH LOGIN
  return (
    <div className="space-y-8">
      <section
        aria-label="Status Sesi dan Ringkasan Data"
        className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
            <p className="text-sm font-semibold text-slate-900">
              Sesi Aktif: {user.email}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Total <strong>{projects.length} Proyek</strong> dan{" "}
            <strong>{skills.length} Skills</strong> tersimpan di Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Logout Sesi
        </button>
      </section>

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

            {/* Area Upload Gambar yang Bersih & Bebas Broken Image */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="project-image-upload"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Upload Gambar Proyek (Maks 5MB)
                  </label>
                  <input
                    id="project-image-upload"
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={handleImageUpload}
                    className="mt-1.5 block w-full text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-600 file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-image"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Atau Tempel URL Gambar Eksternal
                  </label>
                  <input
                    id="project-image"
                    type="text"
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUploadedFileName(null);
                    }}
                    placeholder="https://... (opsional)"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              {isUploadingImage && (
                <p className="text-xs font-medium text-blue-600">
                  Memproses dan mengunggah gambar...
                </p>
              )}

              {uploadNotice && (
                <p className="text-xs font-medium text-green-700">
                  ✓ {uploadNotice}
                </p>
              )}

              {imageUrl && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Preview gambar proyek"
                      className="h-14 w-24 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800">
                        {uploadedFileName || "Gambar Proyek Aktif"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {imageUrl.startsWith("data:")
                          ? "Gambar terkompresi (WebP)"
                          : imageUrl}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setUploadedFileName(null);
                      setUploadNotice(null);
                    }}
                    className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>

            <fieldset className="pt-2">
              <legend className="text-sm font-semibold text-slate-800">
                Pilih Teknologi / Skills Terkait
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
              disabled={isSubmitting || isUploadingImage}
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
                placeholder="Misal: Mikrotik / Proxmox"
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
            {projects.map((project) => {
              const hasValidImg =
                project.image_url && project.image_url !== "/project-placeholder.svg";
              return (
                <article
                  key={project.id}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    {hasValidImg ? (
                      <img
                        src={project.image_url!}
                        alt={`Thumbnail ${project.title}`}
                        className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600">
                        MJN
                      </div>
                    )}
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
                      <h3 className="mt-0.5 font-bold text-slate-950">{project.title}</h3>
                      <p className="text-sm text-slate-600">{project.summary}</p>
                    </div>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}