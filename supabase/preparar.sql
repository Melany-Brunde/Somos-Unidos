-- Pegar TODO esto en Supabase > SQL Editor > New query > Run (una sola vez)

create table if not exists public.sitio (
  clave text primary key,
  valor jsonb not null,
  actualizado timestamptz default now()
);

alter table public.sitio enable row level security;

-- Todo el mundo puede LEER los datos de la página
create policy "publico lee" on public.sitio for select using (true);

-- Solo un usuario con sesión iniciada puede ESCRIBIR
create policy "admin escribe" on public.sitio for all to authenticated using (true) with check (true);

-- Para que los cambios lleguen en tiempo real
alter publication supabase_realtime add table public.sitio;

-- Carpeta pública para las fotos
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;
create policy "fotos publicas" on storage.objects for select using (bucket_id = 'fotos');
create policy "admin sube fotos" on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "admin borra fotos" on storage.objects for delete to authenticated using (bucket_id = 'fotos');
