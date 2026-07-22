-- ============================================================
-- ATS Sistema FIESC — corrige recursão de RLS (candidatos ↔ candidaturas)
-- ============================================================
-- As policies de `candidatos` e `candidaturas` referenciavam uma à outra,
-- causando "infinite recursion detected in policy". Movemos as verificações
-- cruzadas para funções SECURITY DEFINER (que operam acima da RLS das tabelas
-- referenciadas), quebrando o ciclo. Também tira `consentimentos` do ciclo.

create or replace function is_owner_candidato(cand uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from candidatos c where c.id = cand and c.user_id = auth.uid());
$$;

create or replace function pode_ver_candidato(cand uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from candidaturas c
    join vagas v on v.id = c.vaga_id
    where c.candidato_id = cand and can_manage_entidade(v.entidade)
  );
$$;

create or replace function pode_gerir_vaga(v uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from vagas vg where vg.id = v and can_manage_entidade(vg.entidade)
  );
$$;

-- ── candidatos ──────────────────────────────────────────────
drop policy if exists "candidatos_read" on candidatos;
create policy "candidatos_read" on candidatos
  for select using (user_id = auth.uid() or pode_ver_candidato(id));

-- ── candidaturas ────────────────────────────────────────────
drop policy if exists "candidaturas_read" on candidaturas;
create policy "candidaturas_read" on candidaturas
  for select using (
    is_admin() or is_owner_candidato(candidato_id) or pode_gerir_vaga(vaga_id)
  );

drop policy if exists "candidaturas_insert" on candidaturas;
create policy "candidaturas_insert" on candidaturas
  for insert with check (
    is_owner_candidato(candidato_id) or auth_role() in ('recrutador', 'admin')
  );

drop policy if exists "candidaturas_update_manager" on candidaturas;
create policy "candidaturas_update_manager" on candidaturas
  for update using (is_admin() or pode_gerir_vaga(vaga_id));

-- ── consentimentos (referenciavam candidatos) ───────────────
drop policy if exists "consentimentos_read" on consentimentos;
create policy "consentimentos_read" on consentimentos
  for select using (
    user_id = auth.uid() or is_admin() or is_owner_candidato(candidato_id)
  );

drop policy if exists "consentimentos_insert" on consentimentos;
create policy "consentimentos_insert" on consentimentos
  for insert with check (
    user_id = auth.uid()
    or is_owner_candidato(candidato_id)
    or auth_role() in ('recrutador', 'admin')
  );
