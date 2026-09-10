"use client";

import { useOCR } from "../hooks/useOCR";
import Loader from "./Loader";

export default function UploadBox() {
  const { enviarArquivo, loading } = useOCR();

  function handleUpload(e) {
    const file = e.target.files[0];
    if (file) enviarArquivo(file);
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Enviar Arquivo</h2>

      <input
        type="file"
        onChange={handleUpload}
        className="block w-full mb-3"
      />

      {loading && <Loader />}
    </div>
  );
}
