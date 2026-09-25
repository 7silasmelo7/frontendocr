import { api } from "./api";

export interface HistoricoItem {
  id: number;
  filename: string;
  created_at: string;
}

export interface PaginacaoRes {
  resultados: HistoricoItem[];
  pagina: number;
  limite: number;
  total: number;
}

export const ocrService = {
  async verificarStatus() {
    const response = await api.get("/status");
    return response.data;
  },

  async enviarArquivo(file: File) {
    const formData = new FormData();
    formData.append("arquivo", file);
    const response = await api.post("/ocr", formData);
    return response.data;
  },

  async listarPaginado(pagina = 1, limite = 10, busca = ""): Promise<PaginacaoRes> {
    const response = await api.get("/ocr/paginado", {
      params: { pagina, limite, busca },
    });
    return response.data;
  },

  async obterDetalhes(id: number) {
    const response = await api.get(`/ocr/${id}`);
    return response.data;
  },

  async obterImagemBlob(id: number) {
    const response = await api.get(`/ocr/${id}/imagem`, {
      responseType: "blob",
    });
    return response.data;
  },

  async obterTextoBlob(id: number) {
    const response = await api.get(`/ocr/${id}/texto`, {
      responseType: "blob",
    });
    return response.data;
  },

  async atualizarTexto(id: number | string, texto: string) {
    const response = await api.put(`/ocr/${id}`, { texto });
    return response.data;
  },

  async deletarRegistro(id: number | string) {
    const response = await api.delete(`/ocr/${id}`);
    return response.data;
  },
};