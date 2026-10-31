
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Platform",
  description:
    "Plataforma de gestão financeira para acompanhar receitas, despesas e saldo.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-screen font-sans">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
