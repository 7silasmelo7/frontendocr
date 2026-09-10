"use client";

import axios from "axios";
import { useState } from "react";

const API = "http://127.0.0.1:8000";

export function useOCR() {
  const [loading, setLoading] = useState(false);
  const [ocrId, setOcrId] = useState("");
  const [texto, setTexto] = useState("");
  const [preview, setPreview] = useState("");

  async function enviarArquivo(file: File) {
    setLoading(true);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const r = await axios.post(`${API}/ocr`, formData);
      setOcrId(r.data.id);
      setTexto(r.data.texto);
      setPreview(`${API}/ocr/${r.data.id}/imagem`);
    } finally {
      setLoading(false);
    }
  }

  return { loading, enviarArquivo, ocrId, texto, preview };
}
