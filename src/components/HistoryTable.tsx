"use client";

import { useEffect, useState } from "react";
import { ocrService, HistoricoItem } from "../services/ocrService";

export default function HistoryTable() {
  const [data, setData] = useState<HistoricoItem[]>([]);
  const [busca, setBusca] = useState("");

  async function carregar(pagina = 1) {
    try {
      const res = await ocrService.listarPaginado(pagina, 10, busca);
      setData(res.resultados);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function formatarData(dataString: string) {
    if (!dataString) return "";
    const [dataPart, horaPart] = dataString.split(" ");
    if (dataPart && dataPart.includes("-")) {
      const [ano, mes, dia] = dataPart.split("-");
      if (ano && mes && dia) {
        return `${dia}/${mes}/${ano}${horaPart ? ` ${horaPart}` : ""}`;
      }
    }
    return dataString;
  }

  return (
    <div id="historico" className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Histórico</h2>

      <input
        className="p-2 rounded bg-gray-100 dark:bg-gray-700 mb-3 w-full"
        placeholder="Buscar..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && carregar(1)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4 hover:bg-blue-700"
        onClick={() => carregar(1)}
      >
        Buscar
      </button>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b dark:border-gray-600">
            <th className="py-2">ID</th>
            <th>Arquivo</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="border-b dark:border-gray-600">
                <td className="py-2">{item.id}</td>
                <td>{item.filename}</td>
                <td>{formatarData(item.created_at)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}