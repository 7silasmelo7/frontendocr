<div align="center">

# 🔍 OCR Inteligente

**Frontend moderno para extração de texto em imagens e PDFs**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Axios](https://img.shields.io/badge/Axios-1.20-5a29e4?style=flat-square&logo=axios)](https://axios-http.com)

</div>

---

## ✨ Visão Geral

Interface web responsiva para um **sistema de OCR** (Reconhecimento Óptico de Caracteres) que se comunica com uma API Flask backend. Permite enviar imagens e PDFs, visualizar o texto extraído, gerenciar o histórico de conversões e muito mais — tudo com suporte a **modo claro/escuro**.

---

## 🚀 Funcionalidades

| Recurso | Descrição |
|---|---|
| 📤 **Upload de arquivos** | Envio de imagens e PDFs para processamento via OCR |
| 📝 **Visualização do texto** | Exibição e edição do texto extraído em tempo real |
| 🖼️ **Preview da imagem** | Visualização da imagem processada diretamente no dashboard |
| 📜 **Histórico paginado** | Listagem de todos os OCRs realizados com busca por nome |
| ✏️ **Edição de registros** | Atualização do texto extraído por ID |
| 🗑️ **Exclusão de registros** | Remoção de entradas do histórico |
| ⬇️ **Download** | Exportação do texto extraído ou da imagem original |
| 🌙 **Modo escuro** | Alternância entre tema claro e escuro |
| 📡 **Status da API** | Monitoramento em tempo real da conexão com o backend |

---

## 🏗️ Estrutura do Projeto

```
frontend-next/
├── app/
│   ├── layout.tsx          # Layout raiz da aplicação
│   ├── page.tsx            # Página inicial (landing)
│   ├── globals.css         # Estilos globais
│   └── ocr/
│       ├── page.tsx        # Dashboard principal de OCR
│       ├── loading.tsx     # Componente de carregamento
│       ├── components/
│       │   ├── HistoryTable.tsx   # Tabela do histórico
│       │   ├── Loader.tsx         # Indicador de loading
│       │   ├── PreviewBox.tsx     # Preview da imagem
│       │   ├── ThemeToggle.tsx    # Botão de tema
│       │   └── UploadBox.tsx      # Área de upload
│       └── hooks/
│           └── useOCR.ts          # Hook customizado de OCR
├── public/                 # Assets estáticos (inclui arquitetura.png)
├── next.config.ts          # Configuração do Next.js
├── tailwind.config.js      # Configuração do Tailwind
├── tsconfig.json           # Configuração do TypeScript
├── Dockerfile              # Configuração do container Docker
└── package.json
```

---

## 🏛️ Arquiterura da Aplicação

![App Screenshot](https://i.ibb.co/XxLtZcZ1/arquitetura.png)

---

## ⚙️ Pré-requisitos

- **Node.js** 20.9.0 ou superior (Obrigatório para build do Next.js)
- **npm** ou outro gerenciador de pacotes
- **Backend Flask OCR** em execução em `http://127.0.0.1:8000`

---

## 🐳 Executando com Docker (Recomendado)

Este projeto contém um Dockerfile configurado para rodar a aplicação Next.js em um container isolado, cumprindo os requisitos de conteinerização.

### 1. Construa a imagem Docker:

```bash
docker build -t app-ocr-frontend .
```

### 2. Execute o container:

```bash
docker run -p 3000:3000 --name meu-frontend-ocr app-ocr-frontend
```
---

A interface estará disponível em [http://localhost:3000](http://localhost:3000)no navegador.


## 🛠️ Instalação e Execução Local (Sem Docker)

### 1. Clone o repositório

```bash
git clone <https://github.com/7silasmelo7/frontendocr>
cd frontend-next
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📦 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com hot reload
npm run build    # Build de produção otimizado
npm run start    # Inicia o servidor em modo produção
npm run lint     # Análise estática de código com ESLint
```

---

## 🔌 Integração com a API

O frontend se comunica com o backend Flask via **REST API** em `http://127.0.0.1:8000`.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/status` | Verifica o status da API |
| `POST` | `/ocr` | Envia arquivo para processamento |
| `GET` | `/ocr/paginado` | Lista histórico com paginação e busca |
| `GET` | `/ocr/:id` | Busca um registro por ID |
| `GET` | `/ocr/:id/texto` | Faz download do texto extraído |
| `GET` | `/ocr/:id/imagem` | Faz download da imagem processada |
| `PUT` | `/ocr/:id` | Atualiza o texto de um registro |
| `DELETE` | `/ocr/:id` | Remove um registro |

---

## 🧰 Stack Tecnológica

- **[Next.js 16](https://nextjs.org)** — Framework React com App Router
- **[React 19](https://react.dev)** — Biblioteca de UI com hooks modernos
- **[TypeScript 5](https://www.typescriptlang.org)** — Tipagem estática
- **[Tailwind CSS 3](https://tailwindcss.com)** — Estilização utility-first
- **[Axios](https://axios-http.com)** — Cliente HTTP para comunicação com a API

---

## 🚢 Deploy

A forma mais simples de fazer deploy é através da **[Vercel](https://vercel.com)**:

```bash
npx vercel
```

> Certifique-se de configurar a variável de ambiente com a URL do backend antes do deploy.

---

<div align="center">

Desenvolvido por **Silas** &bull; Next.js + Tailwind + Flask OCR

</div>


