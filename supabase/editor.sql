-- Execute uma vez no SQL Editor do seu projeto. Nenhum acesso público é concedido.
create table if not exists public.editor_archive (
  id integer primary key check (id = 1),
  archive jsonb not null,
  published_sha text not null,
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);
create table if not exists public.editor_history (
  revision uuid primary key,
  archive jsonb not null,
  saved_at timestamptz not null default now()
);
create table if not exists public.editor_assets (
  path text primary key,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.editor_archive enable row level security;
alter table public.editor_history enable row level security;
alter table public.editor_assets enable row level security;
revoke all on public.editor_archive, public.editor_history, public.editor_assets from anon, authenticated;
grant all on public.editor_archive, public.editor_history, public.editor_assets to service_role;

create or replace function public.save_editor_archive(payload jsonb, expected_revision uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row public.editor_archive; next_revision uuid := gen_random_uuid();
begin
  select * into current_row from public.editor_archive where id = 1 for update;
  if not found or current_row.revision is distinct from expected_revision then
    raise exception 'revision_conflict';
  end if;
  insert into public.editor_history(revision, archive) values(current_row.revision, current_row.archive)
    on conflict do nothing;
  update public.editor_archive set archive = payload, revision = next_revision, updated_at = now() where id = 1;
  return jsonb_build_object('revision', next_revision, 'backup', current_row.revision);
end; $$;
revoke all on function public.save_editor_archive(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.save_editor_archive(jsonb, uuid) to service_role;
