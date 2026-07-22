-- ============================================================
-- ATS Sistema FIESC — Fase 1: Row Level Security
-- ============================================================
-- Isolamento por papel (admin/recrutador/candidato) e por entidade.
-- Os helpers são SECURITY DEFINER para não recursar na RLS de profiles.

-- ── Helpers ─────────────────────────────────────────────────
create or replace function auth_role()
returns app_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function auth_entidade()
returns entidade language sql stable security definer set search_path = public as $$
  select entidade from profiles where id = auth.uid();
$$;

-- É admin, ou recrutador da entidade alvo?
create or replace function can_manage_entidade(target entidade)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or (p.role = 'recrutador' and p.entidade = target))
  );
$$;

-- ── Habilitar RLS ───────────────────────────────────────────
alter table profiles       enable row level security;
alter table vagas          enable row level security;
alter table candidatos     enable row level security;
alter table candidaturas   enable row level security;
alter table avaliacoes     enable row level security;
alter table provas         enable row level security;
alter table correcoes      enable row level security;
alter table integridade    enable row level security;
alter table config         enable row level security;
alter table consentimentos enable row level security;
alter table audit_logs     enable row level security;

-- ── profiles ────────────────────────────────────────────────
create policy "profiles_read_self_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());
-- (escalonamento de role/entidade é bloqueado por gatilho em 0003)

-- ── vagas ───────────────────────────────────────────────────
create policy "vagas_read" on vagas
  for select using (
    is_admin()
    or (auth_role() = 'recrutador' and entidade = auth_entidade())
    or (auth_role() = 'candidato' and status <> 'Encerrada')
  );
create policy "vagas_write" on vagas
  for all using (can_manage_entidade(entidade))
  with check (can_manage_entidade(entidade));

-- ── candidatos ──────────────────────────────────────────────
-- Recrutador só vê candidatos que se inscreveram em vaga da sua entidade.
create policy "candidatos_read" on candidatos
  for select using (
    user_id = auth.uid()
    or is_admin()
    or exists (
      select 1 from candidaturas c
      join vagas v on v.id = c.vaga_id
      where c.candidato_id = candidatos.id and can_manage_entidade(v.entidade)
    )
  );
create policy "candidatos_insert" on candidatos
  for insert with check (user_id = auth.uid() or auth_role() in ('recrutador', 'admin'));
create policy "candidatos_update" on candidatos
  for update using (user_id = auth.uid() or is_admin());
create policy "candidatos_delete_admin" on candidatos
  for delete using (is_admin());

-- ── candidaturas ────────────────────────────────────────────
create policy "candidaturas_read" on candidaturas
  for select using (
    is_admin()
    or exists (select 1 from candidatos c where c.id = candidaturas.candidato_id and c.user_id = auth.uid())
    or exists (select 1 from vagas v where v.id = candidaturas.vaga_id and can_manage_entidade(v.entidade))
  );
create policy "candidaturas_insert" on candidaturas
  for insert with check (
    exists (select 1 from candidatos c where c.id = candidato_id and c.user_id = auth.uid())
    or auth_role() in ('recrutador', 'admin')
  );
create policy "candidaturas_update_manager" on candidaturas
  for update using (
    is_admin()
    or exists (select 1 from vagas v where v.id = candidaturas.vaga_id and can_manage_entidade(v.entidade))
  );
create policy "candidaturas_delete_admin" on candidaturas
  for delete using (is_admin());

-- ── avaliacoes (recrutador da entidade da vaga + admin) ─────
create policy "avaliacoes_manager" on avaliacoes
  for all using (
    is_admin()
    or exists (select 1 from vagas v where v.id = avaliacoes.vaga_id and can_manage_entidade(v.entidade))
  )
  with check (
    is_admin()
    or exists (select 1 from vagas v where v.id = avaliacoes.vaga_id and can_manage_entidade(v.entidade))
  );

-- ── provas / correcoes / integridade ───────────────────────
create policy "provas_manager" on provas
  for all using (
    is_admin()
    or (vaga_id is not null and exists (select 1 from vagas v where v.id = provas.vaga_id and can_manage_entidade(v.entidade)))
    or (entidade is not null and can_manage_entidade(entidade))
  )
  with check (
    is_admin()
    or (vaga_id is not null and exists (select 1 from vagas v where v.id = provas.vaga_id and can_manage_entidade(v.entidade)))
    or (entidade is not null and can_manage_entidade(entidade))
  );

create policy "correcoes_manager" on correcoes
  for all using (
    is_admin()
    or exists (
      select 1 from provas p
      where p.id = correcoes.prova_id
        and (
          (p.vaga_id is not null and exists (select 1 from vagas v where v.id = p.vaga_id and can_manage_entidade(v.entidade)))
          or (p.entidade is not null and can_manage_entidade(p.entidade))
        )
    )
  )
  with check (auth_role() in ('recrutador', 'admin'));

create policy "integridade_manager" on integridade
  for all using (
    is_admin()
    or exists (
      select 1 from provas p
      where p.id = integridade.prova_id
        and (
          (p.vaga_id is not null and exists (select 1 from vagas v where v.id = p.vaga_id and can_manage_entidade(v.entidade)))
          or (p.entidade is not null and can_manage_entidade(p.entidade))
        )
    )
  )
  with check (auth_role() in ('recrutador', 'admin'));

-- ── config (leitura recrutador/admin; escrita admin) ────────
create policy "config_read" on config
  for select using (auth_role() in ('recrutador', 'admin'));
create policy "config_write_admin" on config
  for all using (is_admin()) with check (is_admin());

-- ── consentimentos (dono candidato + admin) ─────────────────
create policy "consentimentos_read" on consentimentos
  for select using (
    user_id = auth.uid()
    or is_admin()
    or exists (select 1 from candidatos c where c.id = consentimentos.candidato_id and c.user_id = auth.uid())
  );
create policy "consentimentos_insert" on consentimentos
  for insert with check (
    user_id = auth.uid()
    or exists (select 1 from candidatos c where c.id = candidato_id and c.user_id = auth.uid())
    or auth_role() in ('recrutador', 'admin')
  );

-- ── audit_logs (somente leitura admin; escrita via service-role) ─
create policy "audit_read_admin" on audit_logs
  for select using (is_admin());
-- Sem policy de INSERT: gravação só pelo servidor com a service_role (bypassa RLS).
