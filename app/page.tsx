"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <main className="flex flex-col items-center text-center space-y-8 max-w-xl">

        <h1 className="text-4xl font-bold">
          Sistema OCR Inteligente
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400">
          Converta imagens e PDFs em texto de forma rápida e precisa.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link
            href="/ocr"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Iniciar Conversão OCR
          </Link>

          <Link
            href="/ocr#historico"
            className="px-6 py-3 rounded-lg border border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Ver Histórico
          </Link>
        </div>

        <footer className="text-sm text-gray-500 dark:text-gray-400 mt-10">
          Desenvolvido por Silas — Next.js + Tailwind 3 + Flask OCR
        </footer>
      </main>
    </div>
  );
}
