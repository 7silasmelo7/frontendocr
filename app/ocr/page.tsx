"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

interface HistoricoItem {
  id: number;
  filename: string;
  created_at: string;
}

export default function OCRDashboard() {
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
    // 1. Tenta pegar o token do localStorage
    const token = localStorage.getItem("token");

    // 2. Se o token NÃO existir, redireciona para a página de login
    if (!token) {
      router.push("/login");
      return; // O 'return' impede que o restante do código abaixo rode
    }

    // 3. Se o token existir, ensinamos o axios a usá-lo em todas as requisições
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 4. Só carrega os dados do dashboard se o usuário passar pela verificação
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


  function fazerLogout() {
    localStorage.removeItem("token"); // Remove o crachá do navegador
    delete axios.defaults.headers.common["Authorization"]; // Remove o cabeçalho do axios
    router.push("/login"); // Manda de volta pro login
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

    // Pega e valida o token antes de enviar
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      alert("Sessão expirada ou inválida. Faça login novamente.");
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setLoading(true);
    setResultado("");
    setPreview("");
    setOcrId("");

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const r = await axios.post(`${API}/ocr`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
            
      const textoContinuo = r.data.texto.replace(/\r?\n|\r/g, " ");
      setOcrId(r.data.id);
      setResultado(textoContinuo);
      
      const imgRes = await axios.get(`${API}/ocr/${r.data.id}/imagem`, { 
        responseType: 'blob',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setPreview(URL.createObjectURL(imgRes.data));
      carregarPaginado(1);
    } catch (err: any) {
      console.error("Erro no OCR:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Erro ao processar OCR.");
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
      const imgRes = await axios.get(`${API}/ocr/${r.data.id}/imagem`, { 
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
      const res = await axios.get(`${API}/ocr/${ocrId}/texto`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `texto_ocr_${ocrId}.txt`;
      link.click();
      URL.revokeObjectURL(url); // Limpa a memória
    } catch {
      alert("Erro ao baixar o texto.");
    }
    
  }

  async function baixarImagem() {
    if (!ocrId) return alert("Nenhum ID selecionado.");
    try{
      const res = await axios.get(`${API}/ocr/${ocrId}/imagem`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `imagem_${ocrId}.jpg`;
      link.click();
      URL.revokeObjectURL(url); // Limpa a memória
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

  // Função para converter "YYYY-MM-DD" para "DD-MM-YYYY"
  function formatarData(dataString: string) {
    if (!dataString) return "-";

    const [dataPart, horaPart] = dataString.split(" ");
    
    if (dataPart && dataPart.includes("-")) {
      const [ano, mes, dia] = dataPart.split("-");
      if (ano && mes && dia) {
        // Retorna no formato dd-mm-yyyy)
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            {/* Status */}
            <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
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
            
            <div className="p-5 bg-slate-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 transition-all">
              <h2 className="font-semibold mb-2">Enviar arquivo </h2>

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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Baixar Texto
                </button>

                <button
                  onClick={baixarImagem}
                  className="px-4 py-1.5 flex items-center gap-2 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
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

              {/* Cabeçalho do histórico */}

              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Histórico
                </h2>
                
                <button
                  onClick={() => setMostrarHistorico(!mostrarHistorico)}
                  className="px-4 py-1.5 flex items-center gap-2 text-sm font-medium rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {mostrarHistorico ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ocultar
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Mostrar
                    </>
                  )}
                </button>
              </div>
              

              {/* Conteúdo do Histórico */}
              {mostrarHistorico && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">

                  {/* Barra de busca*/}
                                    
                  <div className="relative flex w-full items-center mb-6 shadow-sm rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <div className="pl-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <input
                      type="text"
                      className="flex-1 p-3 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"
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

            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                Atualizar ou Deletar Registro
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 pl-10 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="ID do registro..."
                    value={updateId}
                    onChange={(e) => setUpdateId(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>

                <textarea
                  className="md:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  rows={2}
                  placeholder="Novo texto para atualização..."
                  value={updateTexto}
                  onChange={(e) => setUpdateTexto(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={atualizarTexto}
                  className="px-5 py-2 flex items-center gap-2 text-sm font-medium rounded-full bg-green-600 text-white hover:bg-green-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar Texto
                </button>

                <button
                  onClick={deletar}
                  className="px-5 py-2 flex items-center gap-2 text-sm font-medium rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Deletar Registro
                </button>
              </div>

              {(updateMsg || deleteMsg) && (
                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 animate-in fade-in duration-300">
                  {updateMsg && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {updateMsg}
                    </p>
                  )}
                  {deleteMsg && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {deleteMsg}
                    </p>
                  )}
                </div>
              )}
            </div>            
          </div>
        </div>
      </div>
    </div>
  );
}