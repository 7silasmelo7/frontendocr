"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function OCRDashboard() {
  
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrId, setOcrId] = useState("");
  const [preview, setPreview] = useState("");
  const [resultado, setResultado] = useState("");
  const [busca, setBusca] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [paginacao, setPaginacao] = useState({ pagina: 1, total: 1 });

  const [updateId, setUpdateId] = useState("");
  const [updateTexto, setUpdateTexto] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  
  useEffect(() => {
    setMounted(true);
    checkStatus();
    carregarPaginado(1);
    
  }, []);

  
  if (!mounted) {
    return <div className="p-6 text-gray-500">Carregando...</div>;
  }

  
  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  async function checkStatus() {
    try {
      const r = await axios.get(`${API}/status`);
      setStatus(r.data.status);
    } catch {
      setStatus("Erro ao conectar na API.");
    }
  }

  async function enviarArquivo() {
    if (!file) {
      alert("Selecione um arquivo!");
      return;
    }

    setLoading(true);
    setResultado("");
    setPreview("");
    setOcrId("");

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const r = await axios.post(`${API}/ocr`, formData);
      setOcrId(r.data.id);
      setResultado(r.data.texto);
      setPreview(`${API}/ocr/${r.data.id}/imagem`);
      carregarPaginado(1);
    } catch {
      alert("Erro ao processar OCR.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarPaginado(pagina = 1) {
    try {
      const r = await axios.get(`${API}/ocr/paginado`, {
        params: { pagina, limite: 10, busca },
      });

      setHistorico(r.data.resultados);
      setPaginacao({
        pagina: r.data.pagina,
        total: Math.ceil(r.data.total / r.data.limite),
      });
    } catch {
      console.log("Erro ao carregar histórico");
    }
  }

  async function ver(id: number) {
    try {
      const r = await axios.get(`${API}/ocr/${id}`);
      setOcrId(r.data.id);
      setResultado(r.data.texto);
      setPreview(`${API}/ocr/${r.data.id}/imagem`);
    } catch {
      alert("Erro ao buscar detalhes.");
    }
  }

  function baixarTexto() {
    if (!ocrId) return alert("Nenhum ID selecionado.");
    window.open(`${API}/ocr/${ocrId}/texto`, "_blank");
  }

  function baixarImagem() {
    if (!ocrId) return alert("Nenhum ID selecionado.");
    window.open(`${API}/ocr/${ocrId}/imagem`, "_blank");
  }

  async function atualizarTexto() {
    if (!updateId || !updateTexto) {
      alert("Informe ID e texto.");
      return;
    }

    try {
      const r = await axios.put(`${API}/ocr/${updateId}`, {
        texto: updateTexto,
      });

      setUpdateMsg(r.data.mensagem || r.data.erro);
      carregarPaginado(1);
    } catch {
      setUpdateMsg("Erro ao atualizar o texto.");
    }
  }

  async function deletar() {
    if (!updateId) {
      alert("Informe o ID para deletar.");
      return;
    }

    try {
      const r = await axios.delete(`${API}/ocr/${updateId}`);
      setDeleteMsg(r.data.mensagem || r.data.erro);
      carregarPaginado(1);
    } catch {
      setDeleteMsg("Erro ao deletar o registro.");
    }
  }

  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen p-6 space-y-6 bg-gray-50 text-black dark:bg-gray-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard </h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            {theme === "light" ? "Modo Escuro" : "Modo Claro"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            {/* Status */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="font-semibold mb-2">Status da API</h2>
              <button
                onClick={checkStatus}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Verificar
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{status}</p>
            </div>

            {/* Upload */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="font-semibold mb-2">Enviar arquivo para OCR</h2>

              <input
                type="file"
                className="w-full mb-2 dark:text-gray-300"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <button
                onClick={enviarArquivo}
                disabled={loading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>

              {loading && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="animate-bounce w-3 h-3 bg-blue-600 rounded-full"></span>
                  <span className="animate-bounce w-3 h-3 bg-blue-600 rounded-full delay-150"></span>
                  <span className="animate-bounce w-3 h-3 bg-blue-600 rounded-full delay-300"></span>
                  <small className="dark:text-gray-300">Processando OCR...</small>
                </div>
              )}

              <p className="mt-2 dark:text-gray-300">
                <strong>ID gerado:</strong> {ocrId || "-"}
              </p>

              {preview && (
                <img
                  src={preview}
                  alt="Preview do OCR"
                  className="mt-2 border rounded max-w-[300px]"
                />
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={baixarTexto}
                  className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Baixar Texto
                </button>
                <button
                  onClick={baixarImagem}
                  className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Baixar Imagem
                </button>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="md:col-span-2 space-y-6">
            {/* Texto extraído */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="font-semibold mb-2">Texto extraído</h2>
              <textarea
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                rows={10}
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Histórico */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
              <h2 className="font-semibold mb-2">Histórico de OCR</h2>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white border-none"
                  placeholder="Buscar por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && carregarPaginado(1)}
                />
                <button
                  onClick={() => carregarPaginado(1)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Buscar
                </button>
              </div>

              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="py-2">ID</th>
                    <th>Arquivo</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length > 0 ? (
                    historico.map((item) => (
                      <tr key={item.id} className="border-b dark:border-gray-600">
                        <td className="py-2">{item.id}</td>
                        <td>{item.filename}</td>
                        <td>{item.created_at}</td>
                        <td>
                          <button
                            onClick={() => ver(item.id)}
                            className="px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Paginação */}
              {paginacao.total > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {Array.from({ length: paginacao.total }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => carregarPaginado(i + 1)}
                      className={`px-3 py-1 rounded ${
                        paginacao.pagina === i + 1
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Atualizar / Deletar */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h2 className="font-semibold mb-2">Atualizar / Deletar</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="number"
                  className="p-2 rounded bg-gray-100 dark:bg-gray-700 border-none"
                  placeholder="ID do OCR"
                  value={updateId}
                  onChange={(e) => setUpdateId(e.target.value)}
                />
                <textarea
                  className="md:col-span-2 p-2 rounded bg-gray-100 dark:bg-gray-700 border-none"
                  rows={3}
                  placeholder="Novo texto"
                  value={updateTexto}
                  onChange={(e) => setUpdateTexto(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={atualizarTexto}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Atualizar
                </button>
                <button
                  onClick={deletar}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Deletar
                </button>
              </div>

              {updateMsg && <p className="text-sm mt-2 text-green-600 dark:text-green-400">{updateMsg}</p>}
              {deleteMsg && <p className="text-sm mt-1 text-red-600 dark:text-red-400">{deleteMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}