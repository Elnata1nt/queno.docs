# ==========================================
# 🏗️ ESTÁGIO 1: BUILD
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia manifests de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Instala dependências
RUN pnpm install --frozen-lockfile

# Copia código-fonte
COPY . .

# Gera os arquivos estáticos de produção na pasta build/
RUN pnpm run build

# ==========================================
# 🚀 ESTÁGIO 2: NGINX (PRODUÇÃO ESTÁTICA)
# ==========================================
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
