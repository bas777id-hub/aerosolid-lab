import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA - Academic Project & Supervision Manager",
  description: "Expert-grade high-density project management system for academic research labs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-650 selection:text-white">
        {children}
      </body>
    </html>
  );
}
