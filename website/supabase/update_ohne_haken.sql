-- Einmal im Supabase SQL-Editor ausführen (Run), nachdem die Häkchen von der Seite entfernt wurden.
alter table public.submissions
  drop constraint if exists submissions_rights_ok_check,
  drop constraint if exists submissions_privacy_ok_check,
  alter column rights_ok drop not null,
  alter column privacy_ok drop not null,
  alter column is_16_plus drop not null;
