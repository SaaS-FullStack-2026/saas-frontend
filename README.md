# FieldOps Frontend — Single Page Application (React 19 + Vite)

[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-brightgreen?logo=leaflet)](https://leafletjs.com/)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-Railway-success?logo=railway)](https://fieldopss.up.railway.app/)

O **FieldOps Frontend** é a interface web moderna e responsiva da plataforma FieldOps. Desenvolvido com React 19, Tailwind CSS e Leaflet, entrega uma experiência fluida para dois públicos principais: gestores de escritório em telas desktop e técnicos de campo em dispositivos móveis.

---

## 🎨 Principais Telas e Funcionalidades

### 1. Cockpit de Comando Operacional (`/dashboard`)
- Indicadores em tempo real (KPIs de O.S. Pendentes, Em Campo, Concluídas, Pontualidade BI e Média CSAT).
- Painel de status ao vivo de cada técnico da equipe com localização aproximada.
- Tabela de ordens críticas e chamados em atraso viário com alertas em vermelho/âmbar.
- Acesso direto ao **Modo Simulação Operacional**.

### 2. Mapa em Tempo Real (`/mapa`)
- Visualização geográfica interativa desenvolvida com Leaflet (OpenStreetMap e Camada Satélite).
- Marcador da **Sede TechOps (Base Central de Despacho)** na Av. Paulista.
- Marcadores com radar pulsante dos **Técnicos em Campo** e das **Ordens de Serviço do Dia**.
- Traçado de rotas viárias encadeadas conectando a sede, o técnico e os clientes agendados.
- Filtro por colaborador para isolar a rota do dia de um técnico específico.

### 3. Linha do Tempo Gantt (`/linha-do-tempo`)
- Cronograma horizontal interativo das 07:00 às 20:00 agrupado por colaborador.
- Detecção visual de sobreposição e imprevistos de trânsito em tempo real.
- Motor de sugestão de técnicos por proximidade para rebalanceamento imediato com 1 clique.

### 4. Central de Cadastros (`/cadastros`)
- Tríade administrativa integrada em abas:
  - **Colaboradores:** Gestão de usuários, perfis (`GESTOR` / `AGENTE`), senhas e ativação/inativação com 1 clique.
  - **Clientes:** Cadastro de clientes com preenchimento de endereço e coordenadas GPS (latitude e longitude) para plotagem no mapa.
  - **Equipamentos & Ativos:** Inventário de equipamentos industriais vinculados aos clientes com geração de código QR.

### 5. Modo Técnico Mobile (`/mobile`)
- Interface PWA pensada para smartphone:
  - Roadmap encadeado das entregas do dia com cards de fácil toque.
  - Botões de transição da máquina de estados: *Iniciar Trânsito*, *Check-in no Local*, *Finalizar Serviço*.
  - Formulário de laudo técnico de conformidade.
  - **Canvas Touch:** Coleta da assinatura digital do cliente diretamente com a ponta dos dedos na tela do celular.

### 6. Rastreamento Público de O.S. (`/rastreio/:codigoRastreio`)
- Página pública (sem necessidade de login) no estilo Uber/iFood:
  - O cliente final visualiza o status do técnico a caminho em um radar ao vivo.
  - Dados do técnico responsável e estimativa de chegada.
  - Coleta de nota de satisfação de 1 a 5 estrelas (**CSAT**) com envio de comentário e feedback.

### 7. Central do Modo Simulação (Digital Twin)
- Modal com telemetria e terminal de logs com auto-scroll atualizado a cada 3,5 segundos.
- Seletor de cadência de disparo (1 min, 5 min, 10 min, 30 min, 1 hora).
- Botão **`[⚡ Executar Ciclo Agora]`** para testes sob demanda.
- Botão **`[🌱 Auto-popular Equipe & Locais]`** para povoamento automático de técnicos e clientes com GPS em São Paulo.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `saas-frontend`:

```env
# URL da API do FieldOps (com /api no final)
VITE_API_BASE_URL=http://localhost:8080/api

# Para ambiente de produção no Railway:
# VITE_API_BASE_URL=https://apifieldopss.up.railway.app/api
```

---

## 🛠️ Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor Vite com Hot Module Replacement (HMR)
npm run dev

# 3. Compilar bundle otimizado de produção
npm run build
```

---

## 🐳 Container Docker e Nginx

O frontend utiliza um Dockerfile multi-stage com Node 20 para compilar o bundle estático e Nginx Alpine como servidor web leve de alta performance:

```bash
# Build da imagem Docker
docker build -t fieldops-frontend --build-arg VITE_API_BASE_URL=http://localhost:8080/api .

# Rodar container na porta 80
docker run -p 80:80 fieldops-frontend
```
