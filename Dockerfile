# 1. Usa uma imagem oficial do Node.js, versão 20 (Alpine é uma versão super leve)
FROM node:20-alpine

# 2. Define a pasta de trabalho dentro do container
WORKDIR /app

# 3. Copia apenas os arquivos de dependência primeiro (Isso deixa o build mais rápido)
COPY package*.json ./

# 4. Instala as dependências do projeto
RUN npm install

# 5. Copia o restante do código fonte para dentro do container
COPY . .

# 6. Faz o build de produção do Next.js
RUN npm run build

# 7. Expõe a porta 3000, que é a padrão do Next.js
EXPOSE 3000

# 8. Comando para rodar a aplicação em modo de produção
CMD ["npm", "run", "start"]