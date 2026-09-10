import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OCR Inteligente",
  description: "Conversor de imagem/PDF para texto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR" translate="no"
      className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
