-- ════════════════════════════════════════════════════════════════════
--  Update: Bilder und Sprachnachrichten im Chat
--  Einmal komplett im Supabase SQL-Editor ausführen (Run).
-- ════════════════════════════════════════════════════════════════════

-- 1) Nachrichten können jetzt Text, Bild oder Sprachnachricht sein
alter table public.messages add column if not exists kind text not null default 'text';
alter table public.messages add column if not exists attachment_key text;
alter table public.messages add column if not exists attachment_type text;
alter table public.messages drop constraint if exists messages_body_check;
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (
  kind in ('text', 'image', 'audio') and char_length(body) <= 2000 and
  (case when kind = 'text' then char_length(body) >= 1 and attachment_key is null
        else attachment_key is not null and attachment_key like 'a/%' end));

-- 2) Geheimer Schlüssel für Upload-Tickets (nur Server-intern lesbar)
create table if not exists public.private_config (k text primary key, v text not null);
alter table public.private_config enable row level security; -- keine Policies: nur interne Funktionen
insert into public.private_config (k, v) values ('ticket_secret', '__SECRET__')
on conflict (k) do update set v = excluded.v;

-- 3) Upload-Ticket: erlaubt der Webseite 10 Minuten lang, eine Datei für DIESEN Eintrag hochzuladen
create or replace function public.portal_upload_ticket(p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_sid uuid; v_exp bigint; v_sig text; v_recent int;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  select count(*) into v_recent from public.messages where submission_id = v_sid and sender = 'user' and kind <> 'text' and created_at > now() - interval '10 minutes';
  if v_recent >= 15 then return json_build_object('error', 'rate'); end if;
  v_exp := extract(epoch from now() + interval '10 minutes')::bigint;
  v_sig := encode(extensions.hmac(v_sid::text || '.' || v_exp::text, (select v from public.private_config where k = 'ticket_secret'), 'sha256'), 'hex');
  return json_build_object('ticket', v_sid::text || '.' || v_exp::text || '.' || v_sig);
end $$;
grant execute on function public.portal_upload_ticket(text) to anon, authenticated;

-- 4) Senden: Text oder Anhang (der Anhang muss zu diesem Eintrag gehören)
drop function if exists public.portal_send(text, text);
create or replace function public.portal_send(p_code text, p_body text, p_kind text default 'text', p_key text default null, p_type text default null) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; v_recent int; v_id bigint; v_body text := trim(coalesce(p_body, '')); v_kind text := coalesce(p_kind, 'text');
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  if v_kind not in ('text', 'image', 'audio') then return json_build_object('error', 'kind'); end if;
  if v_kind = 'text' and (char_length(v_body) = 0 or char_length(v_body) > 2000) then return json_build_object('error', 'length'); end if;
  if v_kind <> 'text' and (p_key is null or p_key not like 'a/' || v_sid::text || '/%') then return json_build_object('error', 'key'); end if;
  select count(*) into v_recent from public.messages where submission_id = v_sid and sender = 'user' and created_at > now() - interval '10 minutes';
  if v_recent >= 30 then return json_build_object('error', 'rate'); end if;
  insert into public.messages (submission_id, sender, body, kind, attachment_key, attachment_type)
  values (v_sid, 'user', left(v_body, 2000), v_kind, case when v_kind = 'text' then null else p_key end, case when v_kind = 'text' then null else left(p_type, 100) end)
  returning id into v_id;
  return json_build_object('id', v_id);
end $$;
grant execute on function public.portal_send(text, text, text, text, text) to anon, authenticated;

-- 5) Nachrichten inkl. Anhängen abrufen
create or replace function public.portal_messages(p_code text, p_after bigint default 0) returns json
language plpgsql security definer set search_path = public as $$
declare v_sid uuid; v_out json;
begin
  v_sid := public._find_code(p_code);
  if v_sid is null then return json_build_object('error', 'invalid'); end if;
  select coalesce(json_agg(json_build_object('id', m.id, 'created_at', m.created_at, 'sender', m.sender, 'body', m.body,
           'kind', m.kind, 'attachment_key', m.attachment_key, 'attachment_type', m.attachment_type) order by m.id), '[]'::json)
    into v_out from public.messages m where m.submission_id = v_sid and m.id > coalesce(p_after, 0);
  update public.messages set read_by_user = true where submission_id = v_sid and sender = 'admin' and not read_by_user;
  return json_build_object('messages', v_out);
end $$;
grant execute on function public.portal_messages(text, bigint) to anon, authenticated;
