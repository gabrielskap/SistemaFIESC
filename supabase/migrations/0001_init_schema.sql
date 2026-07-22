-- ============================================================
-- ATS Sistema FIESC — Fase 1: schema base
-- ============================================================
-- Aplicar no projeto Supabase (SQL Editor ou `supabase db push`).
-- RLS é habilitada em 0002; gatilhos/seed de config em 0003.

create extension if not exists pgcrypto; -- gen_random_uuid(), crypt() (Fase 5)

-- ── Enums de domínio ────────────────────────────────────────
create type entidade as enum ('FIESC', 'SESI', 'SENAI', 'IEL');
create type app_role as enum ('admin', 'recrutador', 'candidato');
create type vaga_status as enum ('Aberta', 'Em Seleção', 'Encerrada');
create type etapa_candidatura as enum (
  'Inscritos', 'Triagem', 'Teste', 'Entrevista', 'Aprovados', 'Reprovados'
);
create type recomendacao as enum ('avancar', 'revisar_manual', 'nao_recomendado');

-- ── Helper: manutenção de updated_at ────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles (1:1 com auth.users) ───────────────────────────
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null default '',
  role       app_role not null default 'candidato',
  entidade   entidade,                    -- preenchido p/ recrutadores
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ── vagas ───────────────────────────────────────────────────
-- requisitos_*: jsonb array de { "criterio": text, "peso": int, "eliminatorio": bool }
create table vagas (
  id            uuid primary key default gen_random_uuid(),
  external_ref  text unique,             -- chave estável p/ seed e sync Benner
  titulo        text not null,
  entidade      entidade not null,
  regional      text not null,
  descricao     text not null default '',
  requisitos_obrigatorios jsonb not null default '[]',
  requisitos_desejaveis   jsonb not null default '[]',
  status        vaga_status not null default 'Aberta',
  created_by    uuid references auth.users(id) on delete set null,
  data_criacao  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_vagas_entidade on vagas(entidade);
create index idx_vagas_status on vagas(status);
create trigger trg_vagas_updated before update on vagas
  for each row execute function set_updated_at();

-- ── candidatos ──────────────────────────────────────────────
create table candidatos (
  id            uuid primary key default gen_random_uuid(),
  external_ref  text unique,             -- chave estável p/ seed e sync Benner
  user_id       uuid references auth.users(id) on delete set null, -- autoatendimento
  nome          text not null,
  experiencia   text not null default '',
  formacao      text not null default '',
  habilidades   jsonb not null default '[]',   -- string[]
  certificacoes jsonb not null default '[]',   -- string[]
  -- PII mascarada por padrão. O valor completo (quando existir) é cifrado na Fase 5.
  cpf_mascarado     text not null default '',
  contato_mascarado text not null default '',
  anonimizado   boolean not null default false, -- direito ao esquecimento (LGPD)
  data_candidatura date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_candidatos_user on candidatos(user_id);
create trigger trg_candidatos_updated before update on candidatos
  for each row execute function set_updated_at();

-- ── candidaturas (vaga × candidato) ─────────────────────────
create table candidaturas (
  id           uuid primary key default gen_random_uuid(),
  vaga_id      uuid not null references vagas(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  etapa        etapa_candidatura not null default 'Inscritos',
  status       text not null default 'Inscrição efetuada',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (vaga_id, candidato_id)
);
create index idx_candidaturas_vaga on candidaturas(vaga_id);
create index idx_candidaturas_candidato on candidaturas(candidato_id);
create trigger trg_candidaturas_updated before update on candidaturas
  for each row execute function set_updated_at();

-- ── avaliacoes (resultado de triagem) ───────────────────────
create table avaliacoes (
  id            uuid primary key default gen_random_uuid(),
  candidato_id  uuid not null references candidatos(id) on delete cascade,
  vaga_id       uuid not null references vagas(id) on delete cascade,
  score_aderencia int not null,
  atende_requisitos_obrigatorios boolean not null,
  requisitos_atendidos     jsonb not null default '[]',
  requisitos_nao_atendidos jsonb not null default '[]',
  devolutiva    text not null default '',
  recomendacao  recomendacao not null,
  possivel_alerta_discriminacao boolean not null default false,
  alerta_detalhes text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index idx_avaliacoes_vaga on avaliacoes(vaga_id);
create index idx_avaliacoes_candidato on avaliacoes(candidato_id);

-- ── provas / correcoes / integridade (Estúdio de Avaliações) ─
create table provas (
  id           uuid primary key default gen_random_uuid(),
  prova_ref    text not null,            -- id textual gerado pela IA (prova_...)
  vaga_id      uuid references vagas(id) on delete set null,
  candidato_id uuid references candidatos(id) on delete set null,
  cargo        text,
  entidade     entidade,
  questoes     jsonb not null default '[]',
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table correcoes (
  id            uuid primary key default gen_random_uuid(),
  prova_id      uuid references provas(id) on delete cascade,
  questao_id    text not null,
  candidato_id  uuid references candidatos(id) on delete set null,
  pontuacao_obtida numeric not null,
  pontuacao_maxima numeric not null,
  detalhamento  jsonb not null default '[]',
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table integridade (
  id            uuid primary key default gen_random_uuid(),
  prova_id      uuid references provas(id) on delete cascade,
  questao_id    text not null,
  candidato_id  uuid references candidatos(id) on delete set null,
  suspeita_integridade int not null,
  indicadores   jsonb not null default '[]',
  acao          text not null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ── config (pesos padrão, templates de mensagem) ────────────
create table config (
  chave      text primary key,
  valor      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create trigger trg_config_updated before update on config
  for each row execute function set_updated_at();

-- ── consentimentos (LGPD) ───────────────────────────────────
create table consentimentos (
  id           uuid primary key default gen_random_uuid(),
  candidato_id uuid references candidatos(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  finalidade   text not null,
  concedido    boolean not null default true,
  base_legal   text,
  created_at   timestamptz not null default now()
);

-- ── audit_logs (trilha de auditoria real) ───────────────────
create table audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  text,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_audit_created on audit_logs(created_at desc);
