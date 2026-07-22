-- ============================================================
-- Usuários de teste — ATS Sistema FIESC
-- ============================================================
-- Cria 3 usuários no Supabase (GoTrue) e define seus papéis.
--   admin@fiesc.dev              -> admin
--   recrutador.senai@fiesc.dev   -> recrutador (SENAI)
--   candidato@fiesc.dev          -> candidato
-- Senha de todos: FiescDev!2026
--
-- Rode no SQL Editor. Requer a extensão pgcrypto (habilitada na migration 0001).
-- Idempotente: se o e-mail já existir, apenas reaplica o papel.
-- Obs.: a migration 0005 continua sendo necessária para o app funcionar (RLS).

do $$
declare
  u jsonb;
  v_id uuid;
  users jsonb := '[
    {"email":"admin@fiesc.dev","nome":"Admin FIESC","role":"admin","entidade":null},
    {"email":"recrutador.senai@fiesc.dev","nome":"Recrutador SENAI","role":"recrutador","entidade":"SENAI"},
    {"email":"candidato@fiesc.dev","nome":"Candidato Teste","role":"candidato","entidade":null}
  ]'::jsonb;
begin
  for u in select * from jsonb_array_elements(users) loop
    select id into v_id from auth.users where email = u->>'email';

    if v_id is null then
      v_id := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
        u->>'email', crypt('FiescDev!2026', gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nome', u->>'nome'),
        '', '', '', ''
      );

      insert into auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_id,
        jsonb_build_object('sub', v_id::text, 'email', u->>'email', 'email_verified', true),
        'email', v_id::text,
        now(), now(), now()
      );
    end if;

    -- Define o papel via delete+insert (insert não dispara o gatilho BEFORE UPDATE).
    delete from public.profiles where id = v_id;
    insert into public.profiles (id, nome, role, entidade)
    values (v_id, u->>'nome', (u->>'role')::app_role, (u->>'entidade')::entidade);
  end loop;
end $$;
