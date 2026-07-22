-- ============================================================
-- ATS Sistema FIESC — Fase 1: gatilhos de auth e config padrão
-- ============================================================

-- ── Criar profile ao registrar usuário ──────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''), 'candidato')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Impedir que não-admins alterem o próprio role/entidade ──
create or replace function protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.entidade is distinct from old.entidade)
     and not is_admin() then
    raise exception 'Somente administradores podem alterar role/entidade.';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect before update on profiles
  for each row execute function protect_profile_privileges();

-- ── Config padrão (pesos e templates) ───────────────────────
insert into config (chave, valor) values
  ('pesos_padrao', jsonb_build_object(
      'peso_obrigatorio_base', 5,
      'peso_desejavel_base', 4,
      'multiplicador_obrigatorio', 2,
      'limiar_avancar', 75,
      'limiar_nao_recomendado', 45
   )),
  ('templates_mensagem', jsonb_build_object(
      'avancar', 'Parabéns! Seu perfil avançou para a próxima etapa.',
      'revisar_manual', 'Seu perfil está em análise detalhada.',
      'nao_recomendado', 'Agradecemos sua participação no processo seletivo.'
   ))
on conflict (chave) do nothing;
