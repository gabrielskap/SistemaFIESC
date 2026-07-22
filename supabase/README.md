# Supabase — banco, RLS e seed (Fase 1)

Este diretório contém o **desenho do banco** do ATS FIESC para revisão e aplicação.
O projeto Supabase ainda **não existe** — os passos abaixo criam e populam o ambiente.

## Migrations

| Arquivo | Conteúdo |
|---|---|
| `migrations/0001_init_schema.sql` | Extensões, enums e tabelas (profiles, vagas, candidatos, candidaturas, avaliacoes, provas, correcoes, integridade, config, consentimentos, audit_logs). |
| `migrations/0002_rls_policies.sql` | Helpers de papel + **RLS** (isolamento por papel e por entidade). |
| `migrations/0003_triggers_and_config.sql` | Cria `profiles` no signup, bloqueia escalonamento de privilégio, e config padrão. |

Decisões de modelagem relevantes:
- **Requisitos de vaga** viram `jsonb` de `{ criterio, peso, eliminatorio }` — corrige o
  `eliminatorio: true` fixo do código atual e permite marcar quais critérios são de fato eliminatórios.
- **`external_ref`** em `vagas`/`candidatos`: chave estável usada pelo seed e, depois, pelo **sync Benner**.
- **PII** guardada mascarada por padrão; valor completo será cifrado na Fase 5.

## Passo 1 — Criar o projeto

1. Em https://supabase.com → **New project** (escolha região São Paulo/South America se disponível).
2. Copie as chaves em **Project Settings → API** e preencha o `.env` (ver `.env.example`):
   - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (públicas, front)
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (servidor — **não** exponha no front)

## Passo 2 — Aplicar as migrations

**Opção CLI (recomendada):**
```bash
npm i -g supabase          # ou use npx
supabase login
supabase link --project-ref <ref-do-projeto>
supabase db push           # aplica supabase/migrations/*.sql em ordem
```

**Opção manual:** abra o **SQL Editor** no painel e cole o conteúdo de cada arquivo
`migrations/000X_*.sql` **na ordem** (0001 → 0002 → 0003), executando um por vez.

## Passo 3 — Popular com dados de exemplo

```bash
npm run db:seed
```
Lê `src/data/seedData.ts`, transforma os requisitos para o formato `jsonb` e insere
vagas, candidatos e candidaturas iniciais (idempotente via `external_ref`).

## Passo 4 — Criar usuários de teste

Crie usuários em **Authentication → Users** (ou por signup no app na Fase 2). Para promover
alguém a recrutador/admin, ajuste o `profiles` (via SQL Editor, com a service role):
```sql
update profiles set role = 'admin' where id = '<uuid-do-usuario>';
update profiles set role = 'recrutador', entidade = 'SENAI' where id = '<uuid>';
```

> Critério de saída da Fase 1: tabelas criadas, RLS ativa, seed carregado e leitura via
> `supabase-js` funcionando para cada papel. A validação ponta a ponta acontece quando o
> projeto existir e as chaves estiverem no `.env`.
