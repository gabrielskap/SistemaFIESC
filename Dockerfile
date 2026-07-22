# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Stage 1 — build do front (Vite) + bundle do servidor (esbuild)
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Instala TODAS as dependências (o build precisa de vite/esbuild/typescript).
# Copiar só os manifests primeiro mantém esta camada em cache enquanto o
# package-lock.json não mudar.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# As VITE_* são lidas em tempo de BUILD (import.meta.env é inlinado no bundle
# do front). Definí-las só como env de runtime no EasyPanel não funciona —
# elas precisam chegar aqui como build args.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Gera dist/ (assets do front) + dist/server.cjs (servidor Express bundlado).
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2 — apenas as dependências de produção
# ─────────────────────────────────────────────────────────────
# O bundle é gerado com --packages=external, então o node_modules ainda é
# necessário em runtime — mas só o de produção (express, supabase-js, genai,
# dotenv). vite e afins ficam de fora.
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ─────────────────────────────────────────────────────────────
# Stage 3 — imagem final
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# NODE_ENV=production também é o que faz o server.ts servir dist/ em vez de
# subir o middleware do Vite (que não existe nesta imagem).
ENV NODE_ENV=production \
    PORT=3000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder  --chown=node:node /app/dist         ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
