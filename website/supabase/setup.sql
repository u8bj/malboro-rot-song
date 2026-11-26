-- ════════════════════════════════════════════════════════════════════
--  Warteliste „Kostenloses Musikvideo“ – Supabase-Einrichtung
--  Einmal komplett im Supabase SQL-Editor ausführen (Run).
--  Danach unten in der letzten Zeile DEINE E-Mail als Admin eintragen.
-- ════════════════════════════════════════════════════════════════════

-- 1) Tabellen ---------------------------------------------------------
create table if not exists public.submissions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  username         text not null check (char_length(username) between 1 and 80),
  contact_platform text not null check (contact_platform in ('Instagram', 'Snapchat', 'TikTok')),
  contact_handle   text not null check (char_length(contact_handle) between 1 and 80),
  tiktok           text not null check (char_length(tiktok) between 1 and 80),
  song_title       text check (char_length(song_title) <= 200),
  song_path        text not null check (song_path like 'uploads/%'),
  lyrics           text not null check (char_length(lyrics) between 1 and 20000),
  wishes           text check (char_length(wishes) <= 3000),
  is_16_plus       boolean,
  rights_ok        boolean,
  privacy_ok       boolean,
  status           text not null default 'neu' check (status in ('neu', 'wartet', 'in_arbeit', 'fertig', 'abgelehnt')),
  notes            text
);
create index if not exists submissions_created_idx on public.submissions (created_at);

create table if not exists public.admins (
  email text primary key
);

create table if not exists public.settings (
  id      int primary key default 1 check (id = 1),
  open    boolean not null default true,
  message text
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- 2) Sicherheit (Row Level Security) ---------------------------------
alter table public.submissions enable row level security;
alter table public.admins      enable row level security;
alter table public.settings    enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Besucher dürfen sich NUR eintragen (nicht lesen, ändern, löschen) – und nur, wenn die Anmeldung offen ist.
drop policy if exists "public insert" on public.submissions;
create policy "public insert" on public.submissions for insert to anon, authenticated
  with check (status = 'neu' and notes is null and (select open from public.settings where id = 1));

drop policy if exists "admin all" on public.submissions;
create policy "admin all" on public.submissions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);

drop policy if exists "admin update settings" on public.settings;
create policy "admin update settings" on public.settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read admins" on public.admins;
create policy "admin read admins" on public.admins for select to authenticated using (public.is_admin());

-- 3) Wartelisten-Platz für die Bestätigung (verrät nur eine Zahl) -----
create or replace function public.waitlist_position(sub_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select case
    when not exists (select 1 from public.submissions where id = sub_id) then null
    else (select count(*)::int from public.submissions s
          where s.status in ('neu', 'wartet', 'in_arbeit')
            and s.created_at <= (select created_at from public.submissions where id = sub_id))
  end;
$$;
grant execute on function public.waitlist_position(uuid) to anon, authenticated;

-- 4) Speicher für Songs (privat, max. 10 MB, nur Audio) ---------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('songs', 'songs', false, 10485760,
        array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-flac'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public upload songs" on storage.objects;
create policy "public upload songs" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'songs' and (storage.foldername(name))[1] = 'uploads');

drop policy if exists "admin read songs" on storage.objects;
create policy "admin read songs" on storage.objects for select to authenticated
  using (bucket_id = 'songs' and public.is_admin());

drop policy if exists "admin delete songs" on storage.objects;
create policy "admin delete songs" on storage.objects for delete to authenticated
  using (bucket_id = 'songs' and public.is_admin());

-- 5) DICH als Admin eintragen – E-Mail anpassen! ----------------------
insert into public.admins (email) values ('DEINE-EMAIL@BEISPIEL.DE') on conflict do nothing;
