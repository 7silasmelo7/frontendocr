"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Faz a requisição para a nova rota criada no Flask
      const r = await axios.post("http://127.0.0.1:8000/auth/login", { email, senha });
      
      // Salva o Token JWT gerado no armazenamento do navegador
      localStorage.setItem("token", r.data.token);
      localStorage.setItem("role", r.data.role);
      
      // Configura o Axios para mandar esse token em todas as requisições futuras
      axios.defaults.headers.common["Authorization"] = `Bearer ${r.data.token}`;
      
      alert("Login efetuado!");
      router.push("/"); // Redireciona para o Dashboard
    } catch (err) {
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={fazerLogin} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input 
          type="email" placeholder="E-mail" required
          className="w-full mb-3 p-2 border rounded"
          value={email} onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Senha" required
          className="w-full mb-4 p-2 border rounded"
          value={senha} onChange={(e) => setSenha(e.target.value)} 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Entrar
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <a href="/cadastro" className="text-blue-500">Criar conta</a>
          <a href="/esqueci-senha" className="text-blue-500">Esqueci a senha</a>
        </div>
      </form>
    </div>
  );
}