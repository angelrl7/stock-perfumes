-- ============================================
-- STOCK PERFUMES - Schema para Supabase
-- Pegá todo esto en: SQL Editor -> New query -> Run
-- ============================================

create table if not exists perfumes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text not null default '',
  precio_compra numeric not null default 0,
  margen numeric not null default 80,          -- % de ganancia para el precio sugerido
  precio_manual numeric,                        -- si se carga, pisa al precio calculado
  stock integer not null default 0,
  stock_minimo integer not null default 2,      -- debajo de esto se marca en rojo
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists movimientos (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid references perfumes(id) on delete set null,
  perfume_nombre text not null,
  tipo text not null check (tipo in ('entrada', 'venta', 'ajuste')),
  cantidad integer not null,
  usuario text not null,
  creado_en timestamptz not null default now()
);

-- Mantener actualizado_en al día
create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_perfumes_actualizado on perfumes;
create trigger trg_perfumes_actualizado
  before update on perfumes
  for each row execute function set_actualizado_en();

-- ============================================
-- Seguridad (RLS): solo usuarios logueados
-- ============================================
alter table perfumes enable row level security;
alter table movimientos enable row level security;

create policy "acceso total autenticados" on perfumes
  for all to authenticated using (true) with check (true);

create policy "acceso total autenticados mov" on movimientos
  for all to authenticated using (true) with check (true);

-- ============================================
-- VENTAS con cliente y pagos (cuotas)
-- Si ya corriste el bloque de arriba, podés pegar
-- SOLO desde acá hasta el final.
-- ============================================

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid references perfumes(id) on delete set null,
  perfume_nombre text not null,
  cliente text not null,
  cantidad integer not null default 1,
  total numeric not null default 0,
  tipo_pago text not null default 'contado' check (tipo_pago in ('contado', 'semanal', 'mensual')),
  usuario text not null,
  creado_en timestamptz not null default now()
);

create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  monto numeric not null,
  fecha date not null default current_date,
  usuario text not null,
  creado_en timestamptz not null default now()
);

alter table ventas enable row level security;
alter table pagos enable row level security;

drop policy if exists "acceso total autenticados ventas" on ventas;
create policy "acceso total autenticados ventas" on ventas
  for all to authenticated using (true) with check (true);

drop policy if exists "acceso total autenticados pagos" on pagos;
create policy "acceso total autenticados pagos" on pagos
  for all to authenticated using (true) with check (true);

-- ============================================
-- FOTOS de productos (Supabase Storage)
-- Si ya corriste los bloques de arriba, podés
-- pegar SOLO desde acá hasta el final.
-- ============================================

alter table perfumes add column if not exists foto_url text;

-- Bucket público (lectura sin login, escritura solo autenticados)
insert into storage.buckets (id, name, public)
values ('perfumes', 'perfumes', true)
on conflict (id) do nothing;

drop policy if exists "fotos perfumes lectura" on storage.objects;
create policy "fotos perfumes lectura" on storage.objects
  for select using (bucket_id = 'perfumes');

drop policy if exists "fotos perfumes subida" on storage.objects;
create policy "fotos perfumes subida" on storage.objects
  for insert to authenticated with check (bucket_id = 'perfumes');

drop policy if exists "fotos perfumes borrado" on storage.objects;
create policy "fotos perfumes borrado" on storage.objects
  for delete to authenticated using (bucket_id = 'perfumes');

-- ============================================
-- QUIÉN CARGÓ cada producto
-- Si ya corriste los bloques de arriba, podés
-- pegar SOLO desde acá hasta el final.
-- ============================================

alter table perfumes add column if not exists creado_por text;
