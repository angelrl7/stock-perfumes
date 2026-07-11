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
