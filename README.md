# ATS Sistema FIESC — Copiloto de Recrutamento

Copiloto inteligente de recrutamento e seleção para o **Sistema FIESC** (FIESC, SESI, SENAI, IEL).
Cobre triagem de candidatos por IA, geração e correção de provas/cases, auditoria ética de
vagas (antidiscriminação), portal público de vagas e portal do candidato — com foco em
**LGPD, não-discriminação e transparência**.

> Status: em evolução de protótipo para produto real. Consulte
> [`ANALISE_E_MELHORIAS.md`](./ANALISE_E_MELHORIAS.md) (diagnóstico) e o plano de implantação
> (banco/auth via **Supabase**, LGPD real e integração Benner).

## Stack

| Camada | Tecnologia |
|---|---|
| Front | React 19, React Router 7, Vite 6, Tailwind CSS v4, TypeScript |
| Back | Express 4 (`server.ts`) como camada de IA/BFF |
| IA | Google Gemini via `@google/genai` |
| Dados/Auth (em implantação) | Supabase (Postgres + Auth + RLS) |

## Como rodar

Pré-requisitos: Node.js 20+.

```bash
npm install
cp .env.example .env   # e preencha as variáveis (ver abaixo)
npm run dev            # sobe Express + Vite (middleware) em http://localhost:3000
```

Scripts:

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (`tsx server.ts`), porta 3000 |
| `npm run build` | Build do front (Vite) + bundle do servidor (esbuild) em `dist/` |
| `npm run start` | Executa o build de produção (`node dist/server.cjs`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |

## Variáveis de ambiente

Definidas em `.env` (veja `.env.example` para a lista completa e comentários):

- `GEMINI_API_KEY` — chave do Google Gemini. **Sem ela, os endpoints de IA usam um
  fallback local (mock)** e a aplicação continua utilizável para demonstração.
- `GEMINI_MODEL` — id do modelo (padrão `gemini-2.5-flash`; centralizado em
  [`server/ai/model.ts`](./server/ai/model.ts)). Confirme o nome no catálogo atual do Google.
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase no front (públicas).
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase no servidor. A `service_role`
  **nunca** deve ir para o bundle do front.
- `EMAIL_*`, `BENNER_*` — envio real de e-mail e integração Benner (fases posteriores).

## Arquitetura

```
Front (React/Vite)  ──Auth/CRUD──▶  Supabase (Postgres + RLS + Auth)
        │
        └──Bearer JWT──▶  Express (server.ts) — camada de IA/BFF
                          - verifica JWT do Supabase
                          - mascara PII antes de chamar o Gemini (LGPD)
                          - grava avaliações/auditoria (service-role)
```

- **Supabase** cuida de dados, autenticação e isolamento por papel/entidade (RLS).
- **Express** orquestra a IA (6 endpoints), autenticado, com mascaramento de PII e auditoria.
- O score de aderência é **determinístico** (`computeWeightedScore` no servidor); a IA gera
  apenas a devolutiva textual.

## Estrutura

```
server.ts              # Express + endpoints de IA (evaluate, assessments/*, etc.)
server/                # módulos do servidor (ai/model, supabaseAdmin, authMiddleware, lib/*)
src/
  App.tsx              # rotas
  components/          # UI (Kanban, listas, visualizadores, landing, microsite)
  pages/               # páginas roteadas (console, processos, triagem, estúdio, ...)
  portal/              # estado compartilhado (Outlet context + usePortal)
  lib/entityTheme.ts   # fonte única de cores/rótulos das entidades
  data/seedData.ts     # dados de exemplo (migrarão para o Supabase)
  types.ts             # tipos de domínio
supabase/migrations/   # schema, RLS e seed (em implantação)
```

## Princípios de conformidade

1. **LGPD** — PII mascarada nas análises e antes de qualquer chamada à IA.
2. **Não-discriminação** — avaliação isenta de gênero, idade, estado civil, credo, etnia.
3. **Transparência** — toda classificação acompanha devolutiva técnica objetiva.
4. **Isolamento** — dados isolados entre entidades/processos (via RLS).
5. **Decisão humana** — a IA sugere score e ranking; a decisão final é do recrutador.
