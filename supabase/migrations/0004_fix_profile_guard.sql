-- ============================================================
-- ATS Sistema FIESC — correção do guarda de privilégios de profiles
-- ============================================================
-- O gatilho original (0003) bloqueava QUALQUER mudança de role/entidade quando
-- auth.uid() era nulo — o que impedia a service_role e o SQL Editor de definir
-- o primeiro admin (chicken-and-egg). Aqui só bloqueamos quando um usuário
-- LOGADO e NÃO-admin tenta escalar o próprio privilégio. Service-role/postgres
-- (auth.uid() nulo) e admins continuam podendo gerir papéis.

create or replace function protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.entidade is distinct from old.entidade)
     and auth.uid() is not null
     and not is_admin() then
    raise exception 'Somente administradores podem alterar role/entidade.';
  end if;
  return new;
end;
$$;
