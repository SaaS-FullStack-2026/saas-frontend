# 1. Estágio de Build (Node.js)
FROM node:20-alpine AS builder
WORKDIR /app

# Instalação de dependências
COPY package*.json ./
RUN npm ci || npm install

# Copia do código-fonte
COPY . .

# Argumento e variável de ambiente para a URL da API no Railway
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build de produção do Vite
RUN npm run build

# 2. Estágio de Servidor Web (Nginx Alpine)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpa página padrão do Nginx e copia o bundle do React
RUN rm -rf ./*
COPY --from=builder /app/dist .

# Copia o template de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Expõe as portas padrão
EXPOSE 80

# Inicia o Nginx escutando tanto na porta 80 quanto na variável $PORT do Railway (garantindo que nunca haja mismatch de portas 502)
CMD ["/bin/sh", "-c", "if [ -n \"$PORT\" ] && [ \"$PORT\" != \"80\" ]; then sed 's/LISTEN_DIRECTIVES/listen 80; listen '\"$PORT\"';/g' /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf; else sed 's/LISTEN_DIRECTIVES/listen 80;/g' /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf; fi && nginx -g 'daemon off;'"]
