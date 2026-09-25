"use client";

import { useOCR } from "../hooks/useOCR";

export default function PreviewBox() {
  const { ocrId, texto, preview } = useOCR();

  if (!ocrId) return null;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Resultado OCR</h2>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Pré-visualização do documento" className="max-w-xs rounded border" />

      <textarea
        className="w-full h-40 p-3 rounded bg-gray-100 dark:bg-gray-700"
        value={texto}
        readOnly
      />
    </div>
  );
}
