import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "Malvin JN | Personal Portfolio & Project Showcase",
  description:
    "Portofolio web pribadi Malvin Juliyyan Nugraha berisi daftar proyek pengembangan web, arsitektur jaringan, dan manajemen proyek berbasis Supabase.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}