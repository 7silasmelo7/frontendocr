"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";


const API = "http://127.0.0.1:8000";

export default function OCRDashboard() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrId, setOcrId] = useState("");
  const [preview, setPreview] = useState("");
  const [resultado, setResultado] = useState("");
  const [busca, setBusca] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [paginacao, setPaginacao] = useState({ pagina: 1, total: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);

  const [updateId, setUpdateId] = useState("");
  const [updateTexto, setUpdateTexto] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
  if (textareaRef.current) {
    requestAnimationFrame(() => {
      textareaRef.current!.style.height = "auto";    
      textareaRef.current!.style.height = `${textareaRef.current!.scrollHeight}px`;
    });
  }
  }, [resultado]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    checkStatus();
    carregarPaginado(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="p-6 text-gray-500">
        Carregando...
      </div>
    );
  }

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  async function checkStatus() {
    try {

      await axios.get(`${API}/status`);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
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
      const textoContinuo = r.data.texto.replace(/\r?\n|\r/g, " ");
      setOcrId(r.data.id);
      setResultado(textoContinuo);
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
    setLoading(true);
    setResultado("Carregando...");
    setPreview("");

    try {
      const r = await axios.get(`${API}/ocr/${id}`);
      setOcrId(r.data.id);
      const textoContinuo = r.data.texto.replace(/\r?\n|\r/g, " ");
      setResultado(textoContinuo);
      setPreview(`${API}/ocr/${r.data.id}/imagem`);
    } catch {
      alert("Erro ao buscar detalhes.");
      setResultado("Erro ao carregar o texto.");
    } finally {
      setLoading(false);
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
    <div suppressHydrationWarning className={theme === "dark" ? "dark" : ""}>
      <div suppressHydrationWarning className="min-h-screen p-6 space-y-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Conexão com a API
              </span>
              <div className="flex items-center gap-2">
                {isOnline === null ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Verificando...</span>
                ) : isOnline ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    <span className="text-sm font-mediumtext-red-600 dark:text-red-400">Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                  className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 rounded shadow-sm transition-colors"
                >
                  Baixar Texto
                </button>
                <button
                  onClick={baixarImagem}
                  className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 rounded shadow-sm transition-colors"
                >
                  Baixar Imagem
                </button>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="md:col-span-2 space-y-6">
            {/* Texto extraído */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold mb-2">Texto extraído</h2>
              <textarea
                ref={textareaRef}
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                rows={10}
                className="w-full p-3 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Histórico */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto transition-all">

              {/* Cabeçalho do histórico */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Histórico de OCR</h2>
                <button
                  onClick={() => setMostrarHistorico(!mostrarHistorico)}
                  className="px-3 py-1 text-sm border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 rounded shadow-sm transition-colors"
                >
                  {mostrarHistorico ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {/* Conteúdo do Histórico (Só aparece se mostrarHistorico for true) */}
              {mostrarHistorico && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">

                  {/* Barra de busca*/}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      className="flex-1 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buscar por nome..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && carregarPaginado(1)}
                    />
                    <button
                      onClick={() => carregarPaginado(1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                      >
                      Buscar
                    </button>
                  </div>
                  {/* Tabela do histórico */}
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Arquivo</th>
                        <th className="py-3 px-2">Data</th>
                        <th className="py-3 px-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.length > 0 ? (
                        historico.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <td className="py-3 px-2 text-gray-800 dark:text-gray-200">{item.id}</td>
                              <td className="py-3 px-2 text-gray-800 dark:text-gray-200">{item.filename}</td>
                              <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{item.created_at}</td>
                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => ver(item.id)}
                                  className="px-3 py-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 rounded shadow-sm transition-colors"
                                >
                                  Ver
                                </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                            Nenhum registro encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Paginação */}
                  {paginacao.total > 1 && (
                    <div className="flex gap-2 mt-4 flex-wrap justify-center">
                      {Array.from({ length: paginacao.total }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => carregarPaginado(i + 1)}
                          className={`px-3 py-1 rounded-md shadow-sm transition-colors ${
                            paginacao.pagina === i + 1
                             ? "bg-blue-600 text-white border-transparent"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Atualizar / Deletar */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold mb-2">Atualizar / Deletar</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="number"
                  className="p-3 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="ID do OCR"
                  value={updateId}
                  onChange={(e) => setUpdateId(e.target.value)}
                />
                <textarea
                  className="md:col-span-2 p-3 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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