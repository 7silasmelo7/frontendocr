"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden px-6 transition-colors">
      
      {/* Elementos de fundo dinâmicos para contrastar com o vidro */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-600/20"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-purple-600/20"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600/20"></div>

      {/* Container principal com efeito Glassmorphism */}
      <main className="relative z-10 flex flex-col items-center text-center space-y-8 p-10 max-w-xl w-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent drop-shadow-sm">
            Sistema OCR Inteligente
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            Converta imagens e PDFs em texto de forma rápida e precisa.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full mt-8">
          <Link
            href="/ocr"
            className="px-6 py-4 rounded-xl bg-blue-600/90 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 backdrop-blur-sm transition-all hover:scale-[1.02]"
          >
            Iniciar Conversão OCR
          </Link>

          
        </div>
      </main>

      {/* Footer reposicionado para fora do vidro */}
      <footer className="relative z-10 text-sm font-medium text-gray-500 dark:text-gray-400 mt-12 bg-white/30 dark:bg-gray-800/30 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 dark:border-gray-700/30">
        Desenvolvido por Silas — Next.js + Tailwind 3 + Flask OCR
      </footer>
    </div>
  );
}