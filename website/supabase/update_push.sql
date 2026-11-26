-- ════════════════════════════════════════════════════════════════════
--  Update: Push-Mitteilungen aufs Handy
--  Einmal komplett im Supabase SQL-Editor ausführen (Run).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.push_subs (
  id            bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  endpoint      text not null unique check (endpoint like 'https://%' and char_length(endpoint) <= 1000),
  created_at    timestamptz not null default now()
);
create index if not exists push_subs_sub_idx on public.push_subs (submission_id);
alter table public.push_subs enable row level security;
drop policy if exists "admin all push" on public.push_subs;
create policy "admin all push" on public.push_subs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Handy für Mitteilungen anmelden (nur mit gültigem Code)
create or replace function public.portal_push_subscribe(p_code text, p_endpoint text) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; v_n int;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  if p_endpoint is null or p_endpoint not like 'https://%' or char_length(p_endpoint) > 1000 then return json_build_object('error', 'endpoint'); end if;
  select count(*) into v_n from public.push_subs where submission_id = v_sid;
  if v_n >= 10 then delete from public.push_subs where id = (select id from public.push_subs where submission_id = v_sid order by id limit 1); end if;
  insert into public.push_subs (submission_id, endpoint) values (v_sid, p_endpoint)
  on conflict (endpoint) do update set submission_id = excluded.submission_id;
  return json_build_object('ok', true);
end $$;
grant execute on function public.portal_push_subscribe(text, text) to anon, authenticated;

-- Handy wieder abmelden
create or replace function public.portal_push_unsubscribe(p_code text, p_endpoint text) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  delete from public.push_subs where submission_id = v_sid and endpoint = p_endpoint;
  return json_build_object('ok', true);
end $$;
grant execute on function public.portal_push_unsubscribe(text, text) to anon, authenticated;
