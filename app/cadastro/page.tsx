"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function fazerCadastro(e: React.FormEvent) {
    e.preventDefault();
    
    // Validação básica para ver se as senhas são iguais
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    try {
      // Chama a rota de cadastro que criamos no Flask
      const r = await axios.post("http://127.0.0.1:8000/auth/cadastro", {
        email,
        senha
      });
      
      alert(r.data.mensagem); // "Usuário cadastrado com sucesso!"
      
      // Manda o usuário para a tela de login após criar a conta
      router.push("/login"); 
    } catch (err: any) {
      // Se o backend retornar erro (ex: e-mail já cadastrado)
      alert(err.response?.data?.erro || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gray-900 transition-colors">
      <form onSubmit={fazerCadastro} className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          Criar Conta
        </h2>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Seu melhor e-mail" 
            required
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <input 
            type="password" 
            placeholder="Crie uma senha" 
            required
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
          />

          <input 
            type="password" 
            placeholder="Confirme a senha" 
            required
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmarSenha} 
            onChange={(e) => setConfirmarSenha(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white font-semibold p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Cadastrar"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Faça login aqui</a>
        </div>
      </form>
    </div>
  );
}