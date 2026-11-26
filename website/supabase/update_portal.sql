-- ════════════════════════════════════════════════════════════════════
--  Update: Status-Code, Chat und fertige Videos
--  Einmal komplett im Supabase SQL-Editor ausführen (Run). Kann gefahrlos mehrmals ausgeführt werden.
-- ════════════════════════════════════════════════════════════════════

-- 1) Neue Spalten für Code und Video ----------------------------------
alter table public.submissions add column if not exists code text;
alter table public.submissions add column if not exists video_key text;
alter table public.submissions add column if not exists video_name text;
alter table public.submissions add column if not exists video_at timestamptz;

-- 6-stelliger Code ohne verwechselbare Zeichen (kein 0/O, 1/I/L), aus sicherem Zufall
create or replace function public.gen_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  a constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  b bytea; c text; i int;
begin
  loop
    b := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    c := '';
    for i in 0..5 loop c := c || substr(a, 1 + (get_byte(b, i) % length(a)), 1); end loop;
    exit when not exists (select 1 from public.submissions where code = c);
  end loop;
  return c;
end $$;

update public.submissions set code = public.gen_code() where code is null;
alter table public.submissions alter column code set default public.gen_code();
create unique index if not exists submissions_code_idx on public.submissions (code);

-- 2) Chat-Nachrichten --------------------------------------------------
create table if not exists public.messages (
  id            bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  created_at    timestamptz not null default now(),
  sender        text not null check (sender in ('user', 'admin')),
  body          text not null check (char_length(body) between 1 and 2000),
  read_by_admin boolean not null default false,
  read_by_user  boolean not null default false
);
create index if not exists messages_sub_idx on public.messages (submission_id, id);
alter table public.messages enable row level security;
drop policy if exists "admin all messages" on public.messages;
create policy "admin all messages" on public.messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 3) Schutz gegen Durchprobieren von Codes -----------------------------
create table if not exists public.code_attempts (ip text not null, at timestamptz not null default now());
create index if not exists code_attempts_idx on public.code_attempts (ip, at);
alter table public.code_attempts enable row level security; -- keine Policies: nur interne Funktionen

create or replace function public._client_ip() returns text
language sql stable as $$
  select coalesce(nullif(trim(split_part(coalesce(
    current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
    current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1)), ''), 'unknown');
$$;

create or replace function public._find_code(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_ip text := public._client_ip(); v_fails int; v_sid uuid; v_code text;
begin
  select count(*) into v_fails from public.code_attempts where ip = v_ip and at > now() - interval '15 minutes';
  if v_fails >= 15 then raise exception 'too_many_attempts'; end if;
  v_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  select id into v_sid from public.submissions where code = v_code;
  if v_sid is null then insert into public.code_attempts (ip) values (v_ip); end if;
  delete from public.code_attempts where at < now() - interval '1 day';
  return v_sid;
end $$;
revoke execute on function public._find_code(text) from public, anon, authenticated;

-- 4) Eintragen (liefert den Code zurück) ------------------------------
create or replace function public.submit_entry(p jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare v_code text; v_pos int; v_created timestamptz;
begin
  if not coalesce((select open from public.settings where id = 1), false) then
    return json_build_object('error', 'closed');
  end if;
  insert into public.submissions (id, username, contact_platform, contact_handle, tiktok, song_title, song_path, lyrics, wishes)
  values ((p ->> 'id')::uuid, p ->> 'username', p ->> 'contact_platform', p ->> 'contact_handle', p ->> 'tiktok',
          nullif(p ->> 'song_title', ''), p ->> 'song_path', p ->> 'lyrics', nullif(p ->> 'wishes', ''))
  returning code, created_at into v_code, v_created;
  select count(*) into v_pos from public.submissions s
   where s.status in ('neu', 'wartet', 'in_arbeit') and s.created_at <= v_created;
  return json_build_object('code', v_code, 'position', v_pos);
end $$;
grant execute on function public.submit_entry(jsonb) to anon, authenticated;

-- 5) Status-Seite: Status, Video und Chat nur mit gültigem Code -------
create or replace function public.portal_status(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; r public.submissions; v_pos int; v_unread int;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  select * into r from public.submissions where id = v_sid;
  select count(*) into v_pos from public.submissions s
   where s.status in ('neu', 'wartet', 'in_arbeit') and s.created_at <= r.created_at;
  select count(*) into v_unread from public.messages m where m.submission_id = v_sid and m.sender = 'admin' and not m.read_by_user;
  return json_build_object(
    'username', r.username, 'song_title', r.song_title, 'status', r.status, 'created_at', r.created_at,
    'position', case when r.status in ('neu', 'wartet', 'in_arbeit') then v_pos end,
    'video_key', r.video_key, 'video_name', r.video_name, 'video_at', r.video_at, 'unread', v_unread);
end $$;
grant execute on function public.portal_status(text) to anon, authenticated;

create or replace function public.portal_messages(p_code text, p_after bigint default 0) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; v_out json;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  select coalesce(json_agg(json_build_object('id', m.id, 'created_at', m.created_at, 'sender', m.sender, 'body', m.body) order by m.id), '[]'::json)
    into v_out from public.messages m where m.submission_id = v_sid and m.id > coalesce(p_after, 0);
  update public.messages set read_by_user = true where submission_id = v_sid and sender = 'admin' and not read_by_user;
  return json_build_object('messages', v_out);
end $$;
grant execute on function public.portal_messages(text, bigint) to anon, authenticated;

create or replace function public.portal_send(p_code text, p_body text) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; v_recent int; v_id bigint; v_body text := trim(coalesce(p_body, ''));
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  if char_length(v_body) = 0 or char_length(v_body) > 2000 then return json_build_object('error', 'length'); end if;
  select count(*) into v_recent from public.messages where submission_id = v_sid and sender = 'user' and created_at > now() - interval '10 minutes';
  if v_recent >= 30 then return json_build_object('error', 'rate'); end if;
  insert into public.messages (submission_id, sender, body) values (v_sid, 'user', v_body) returning id into v_id;
  return json_build_object('id', v_id);
end $$;
grant execute on function public.portal_send(text, text) to anon, authenticated;

-- Admin-Prüfung auch für den Video-Upload-Dienst abrufbar
grant execute on function public.is_admin() to authenticated;
