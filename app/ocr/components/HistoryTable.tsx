"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function HistoryTable() {
  const [data, setData] = useState([]);
  const [busca, setBusca] = useState("");

  async function carregar(pagina = 1) {
    const r = await axios.get(`${API}/ocr/paginado`, {
      params: { pagina, limite: 10, busca }
    });
    setData(r.data.resultados);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div id="historico" className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Histórico</h2>

      <input
        className="p-2 rounded bg-gray-100 dark:bg-gray-700 mb-3 w-full"
        placeholder="Buscar..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        onClick={() => carregar(1)}
      >
        Buscar
      </button>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>ID</th>
            <th>Arquivo</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td>{item.id}</td>
              <td>{item.filename}</td>
              <td>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
