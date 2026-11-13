"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function ContactForm() {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanName = senderName.trim();
    const cleanEmail = senderEmail.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setError("Nama, email, dan isi pesan wajib diisi.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Format alamat email tidak valid.");
      return;
    }

    const mailtoSubject = encodeURIComponent(
      cleanSubject || `Pesan Portofolio dari ${cleanName}`
    );
    const mailtoBody = encodeURIComponent(
      `Halo Malvin,\n\nNama: ${cleanName}\nEmail: ${cleanEmail}\n\nPesan:\n${cleanMessage}`
    );

    window.location.href = `mailto:malvinjn24@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSenderName("");
    setSenderEmail("");
    setSubject("");
    setMessage("");
    setSuccess(
      "Terima kasih! Pesan Anda telah disiapkan di aplikasi email untuk dikirim."
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-950">Kirim Pesan Langsung</h2>
      <p className="text-sm text-slate-600">
        Isi formulir di bawah ini untuk berdiskusi mengenai proyek, kolaborasi,
        atau pertanyaan lebih lanjut.
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm font-medium text-green-700"
        >
          {success}
        </p>
      )}

      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-semibold text-slate-800"
        >
          Nama Lengkap *
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="Masukkan nama Anda"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-semibold text-slate-800"
        >
          Alamat Email *
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder="nama@email.com"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-semibold text-slate-800"
        >
          Subjek
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Topik diskusi atau kolaborasi"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-slate-800"
        >
          Pesan *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tuliskan pesan Anda di sini..."
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Kirim Pesan
      </button>
    </form>
  );
}