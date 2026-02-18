import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContrataFácil - Sistema de Recepción de CVs",
  description: "Sistema de recepción de currículums para pequeñas organizaciones. Recibe candidatos de forma fácil y organizada.",
  keywords: ["empleo", "trabajo", "currículum", "CV", "candidatos", "reclutamiento", "contratación"],
  authors: [{ name: "ContrataFácil" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ContrataFácil - Sistema de Recepción de CVs",
    description: "Recibe currículums de forma fácil y organizada",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
