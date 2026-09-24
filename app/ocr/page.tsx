"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Instância centralizada do Axios para evitar repetição de headers
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

interface HistoricoItem {
  id: number;
  filename: string;
  created_at: string;
}

export default function OCRDashboard() {
  const [userRole, setUserRole] = useState<string>("user");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrId, setOcrId] = useState("");
  const [preview, setPreview] = useState("");
  const [resultado, setResultado] = useState("");
  const [busca, setBusca] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [paginacao, setPaginacao] = useState({ pagina: 1, total: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);

  const [updateId, setUpdateId] = useState("");
  const [updateTexto, setUpdateTexto] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  // Redimensionamento automático do textarea
  useEffect(() => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current!.style.height = "auto";    
        textareaRef.current!.style.height = `${textareaRef.current!.scrollHeight}px`;
      });
    }
  }, [resultado]);

  // Validação inicial do token, leitura da role e configuração do interceptor do Axios
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const roleSalva = localStorage.getItem("role"); // Lê a role salva no login[cite: 8]

    if (!token || token === "undefined" || token === "null") {
      router.push("/login");
      return;
    }

    if (roleSalva) {
      setUserRole(roleSalva); // Define o perfil no estado
    }

    // Interceptor para injetar o token Bearer automaticamente em todas as requisições da instância `api`
    api.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    checkStatus();
    carregarPaginado(1);
  }, [router]);

  // Limpeza automática de mensagens após 3 segundos
  useEffect(() => {
    if (updateMsg || deleteMsg) {
      const timer = setTimeout(() => {
        setUpdateMsg("");
        setDeleteMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMsg, deleteMsg]);

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="p-6 text-gray-500">
        Carregando...
      </div>
    );
  }

  // Logout limpo (reseta estados e remove credenciais)
  function fazerLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // Remove a role ao deslogar
    setResultado("");
    setPreview("");
    setOcrId("");
    setHistorico([]);
    router.push("/login");
  }

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  async function checkStatus() {
    try {
      await api.get("/status");
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
      const r = await api.post("/ocr", formData);
            
      const textoContinuo = r.data.texto.replace(/\r?\n|\r/g, " ");
      setOcrId(r.data.id);
      setResultado(textoContinuo);
      
      const imgRes = await api.get(`/ocr/${r.data.id}/imagem`, { 
        responseType: 'blob' 
      });
      setPreview(URL.createObjectURL(imgRes.data));
      carregarPaginado(1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Erro no OCR:", err.response?.data || err.message);
        alert(err.response?.data?.erro || "Erro ao processar OCR.");
      } else {
        alert("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function carregarPaginado(pagina = 1) {
    try {
      const r = await api.get("/ocr/paginado", {
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
      const r = await api.get(`/ocr/${id}`);
      setOcrId(r.data.id);
      const textoContinuo = r.data.texto.replace(/\r?\n|\r/g, " ");
      setResultado(textoContinuo);
      
      const imgRes = await api.get(`/ocr/${r.data.id}/imagem`, { 
        responseType: 'blob' 
      });
      setPreview(URL.createObjectURL(imgRes.data));
    } catch {
      alert("Erro ao buscar detalhes.");
      setResultado("Erro ao carregar o texto.");
    } finally {
      setLoading(false);
    }
  }

  async function baixarTexto() {
    if (!ocrId) return alert("Nenhum ID selecionado.");
    try {
      const res = await api.get(`/ocr/${ocrId}/texto`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `texto_ocr_${ocrId}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao baixar o texto.");
    }
  }

  async function baixarImagem() {
    if (!ocrId) return alert("Nenhum ID selecionado.");
    try {
      const res = await api.get(`/ocr/${ocrId}/imagem`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `imagem_${ocrId}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao baixar a imagem.");
    }
  }

  async function atualizarTexto() {
    if (!updateId || !updateTexto) {
      alert("Informe ID e texto.");
      return;
    }

    try {
      const r = await api.put(`/ocr/${updateId}`, {
        texto: updateTexto,
      });

      setUpdateMsg(r.data.mensagem || "Atualizado com sucesso!");
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
      const r = await api.delete(`/ocr/${updateId}`);
      setDeleteMsg(r.data.mensagem || "Removido com sucesso!");
      carregarPaginado(1);
    } catch {
      setDeleteMsg("Erro ao deletar o registro.");
    }
  }

  function formatarData(dataString: string) {
    if (!dataString) return "-";
    const [dataPart, horaPart] = dataString.split(" ");
    if (dataPart && dataPart.includes("-")) {
      const [ano, mes, dia] = dataPart.split("-");
      if (ano && mes && dia) {
        return `${dia}-${mes}-${ano}${horaPart ? ` ${horaPart}` : ""}`;
      }
    }
    return dataString;
  }

  return (
    <div suppressHydrationWarning className={theme === "dark" ? "dark" : ""}>
      <div suppressHydrationWarning className="min-h-screen p-6 space-y-6 bg-slate-100 text-slate-700 dark:bg-gray-900 dark:text-gray-200 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
            >
              {theme === "light" ? "Modo Escuro" : "Modo Claro"}
            </button>
            <button
              onClick={fazerLogout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            
            {/* Grid combinando Status da API e Perfil Logado lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  Conexão API
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {isOnline === null ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Verificando...</span>
                  ) : isOnline ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">Offline</span>
                    </>
                  )}
                </div>
              </div>

              {/* Perfil Logado */}
              <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  Perfil Logado
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full ${
                    userRole === "master" 
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300 dark:border-purple-700" 
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                  }`}>
                    {userRole === "master" ? "👑 Master" : "👤 Usuário"}
                  </span>
                </div>
              </div>
            </div>

            {/* Upload */}
            <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
              <h2 className="font-semibold mb-2">Enviar arquivo</h2>

              <div className="flex flex-col xl:flex-row items-center gap-3 mb-4">
                <input
                  type="file"
                  className="flex-1 block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2.5 file:px-4 file:cursor-pointer
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                    dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600
                    border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none transition-all cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <button
                  onClick={enviarArquivo}
                  disabled={loading || !file}
                  className="w-full xl:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Processando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>

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
                <Image
                  src={preview}
                  alt="Preview do OCR"
                  width={300}
                  height={400}
                  className="mt-2 border rounded max-w-[300px] h-auto"
                  unoptimized={true} 
                />
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={baixarTexto}
                  className="px-4 py-1.5 flex items-center gap-2 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Baixar Texto
                </button>

                <button
                  onClick={baixarImagem}
                  className="px-4 py-1.5 flex items-center gap-2 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Baixar Imagem
                </button>                
              </div>              
            </div>
          </div>

          {/* Coluna direita */}
          <div className="md:col-span-2 space-y-6">
            {/* Texto extraído */}
            <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
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
            <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-x-auto transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Histórico
                </h2>
                
                <button
                  onClick={() => setMostrarHistorico(!mostrarHistorico)}
                  className="px-4 py-1.5 flex items-center gap-2 text-sm font-medium rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-sm transition-all"
                >
                  {mostrarHistorico ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              {mostrarHistorico && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative flex w-full items-center mb-6 shadow-sm rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                    <input
                      type="text"
                      className="flex-1 p-3 pl-4 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"
                      placeholder="Buscar por nome do arquivo..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && carregarPaginado(1)}
                    />
                    <button
                      onClick={() => carregarPaginado(1)}
                      className="mr-1.5 my-1.5 px-6 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-full hover:bg-blue-700 shadow transition-colors"
                    >
                      Buscar
                    </button>
                  </div>

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
                          <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <td className="py-3 px-2 text-gray-800 dark:text-gray-200">{item.id}</td>
                            <td className="py-3 px-2 text-gray-800 dark:text-gray-200">{item.filename}</td>
                            <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{formatarData(item.created_at)}</td>
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
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                Atualizar ou Deletar Registro
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="number"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="ID do registro..."
                  value={updateId}
                  onChange={(e) => setUpdateId(e.target.value)}
                />

                <textarea
                  className="md:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={2}
                  placeholder="Novo texto para atualização..."
                  value={updateTexto}
                  onChange={(e) => setUpdateTexto(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={atualizarTexto}
                  className="px-5 py-2 flex items-center gap-2 text-sm font-medium rounded-full bg-green-600 text-white hover:bg-green-700 shadow-sm transition-all"
                >
                  Atualizar Texto
                </button>

                <button
                  onClick={deletar}
                  className="px-5 py-2 flex items-center gap-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all"
                >
                  Deletar Registro
                </button>
              </div>

              {(updateMsg || deleteMsg) && (
                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 animate-in fade-in duration-300">
                  {updateMsg && <p className="text-sm font-medium text-green-600 dark:text-green-400">{updateMsg}</p>}
                  {deleteMsg && <p className="text-sm font-medium text-red-600 dark:text-red-400">{deleteMsg}</p>}
                </div>
              )}
            </div>            
          </div>
        </div>
      </div>
    </div>
  );
}