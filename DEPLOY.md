# Deploy no EasyPanel (Docker)

O projeto é um container único: o Express serve a API **e** os arquivos
estáticos do front já compilados (`dist/`). Não precisa de Nginx separado.

## 1. Criar o app

No EasyPanel: **+ Service → App**, e em **Source** aponte para o repositório Git
(branch `main`). Em **Build**, escolha o método **Dockerfile** — o `Dockerfile`
na raiz já está pronto.

## 2. Variáveis de ambiente

Existem dois momentos distintos, e confundi-los é o erro mais comum aqui.

### 2.1 Build args — obrigatórias no BUILD

As `VITE_*` são inlinadas no bundle do front pelo Vite durante o build. Definir
só como variável de runtime **não funciona**: o JavaScript já foi gerado.

| Build arg                 | Observação                                   |
| ------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`       | ex.: `https://xxxx.supabase.co`              |
| `VITE_SUPABASE_ANON_KEY`  | chave anônima — pública por design, protegida pela RLS |

O EasyPanel repassa as variáveis do app como build args para builds via
Dockerfile. Se o seu painel tiver um campo **Build Args** separado, preencha as
duas lá também para garantir.

> **Trocou uma `VITE_*`? É preciso REBUILD, não basta restart.**

> Nunca coloque a `SUPABASE_SERVICE_ROLE_KEY` como build arg — ela iria parar
> dentro do bundle público. Ela é exclusivamente de runtime.

### 2.2 Runtime — na aba Environment

| Variável                    | Obrigatória | Observação                                          |
| --------------------------- | ----------- | --------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | sim         | segredo do servidor; grava acima da RLS             |
| `GEMINI_API_KEY`            | não         | sem ela, os endpoints de IA caem no fallback local  |
| `GEMINI_MODEL`              | não         | default `gemini-2.5-flash`                          |
| `APP_URL`                   | não         | URL pública, usada em links/callbacks               |
| `VITE_SUPABASE_URL`         | sim\*       | o servidor reaproveita esta URL para o client admin |
| `PORT`                      | não         | o Dockerfile já define `3000`                       |

\* Alternativamente defina `SUPABASE_URL`, que tem precedência equivalente no
servidor (ver [server/supabaseAdmin.ts](server/supabaseAdmin.ts)).

`EMAIL_*` e `BENNER_*` (ver [.env.example](.env.example)) só entram nas fases 5
e 6; deixe vazias até haver credenciais.

## 3. Rede e healthcheck

- **Porta**: `3000` (em **Proxy**, aponte a porta do domínio para 3000).
- **Healthcheck**: `GET /api/health` → `{"status":"ok"}`. Já existe um
  `HEALTHCHECK` no Dockerfile; ele responde sem depender de Supabase ou Gemini,
  então o container fica saudável mesmo com integrações pendentes.
- Habilite HTTPS/Let's Encrypt no domínio.

## 4. Como a imagem é montada

Três estágios, para que a imagem final não carregue toolchain de build:

1. **builder** — `npm ci` completo, roda `npm run build`: Vite gera `dist/` e o
   esbuild empacota o Express em `dist/server.cjs`.
2. **prod-deps** — `npm ci --omit=dev`. O bundle usa `--packages=external`, então
   o `node_modules` ainda é necessário em runtime, mas só o de produção.
3. **runner** — `node:22-alpine` com `dist/` + `node_modules` de produção,
   rodando como usuário não-root (`node`), com `NODE_ENV=production`.

`NODE_ENV=production` é o que faz o servidor servir `dist/` em vez de subir o
middleware de dev do Vite — que nem existe na imagem final.

## 5. Teste local antes de subir

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://xxxx.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="eyJ..." \
  -t ats-fiesc .

docker run --rm -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  -e GEMINI_API_KEY="..." \
  ats-fiesc
```

Depois: `curl localhost:3000/api/health`.
