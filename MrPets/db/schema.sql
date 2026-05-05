-- ============================================================
-- MrPets - Esquema simplificado (estilo MyStore)
-- Sin auth.users | Sin auth.uid() | Acceso abierto con anon key
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists pgcrypto;

-- ============================================================
-- TABLA: clientes
-- ============================================================
create table if not exists public.clientes (
  id          text primary key,
  nombre      text not null,
  correo      text not null unique,
  password    text not null,
  rol         text not null default 'cliente' check (rol in ('admin', 'cliente')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABLA: categorias
-- ============================================================
create table if not exists public.categorias (
  id          text primary key,
  nombre      text not null unique,
  descripcion text not null,
  icono       text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABLA: productos
-- ============================================================
create table if not exists public.productos (
  id           text primary key,
  nombre       text not null,
  descripcion  text not null,
  precio       numeric not null check (precio > 0),
  stock        integer not null default 0 check (stock >= 0),
  categoria_id text not null references public.categorias(id) on delete restrict,
  imagen_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_productos_categoria on public.productos(categoria_id);

-- ============================================================
-- TABLA: pedidos (encabezado)
-- ============================================================
create table if not exists public.pedidos (
  id           text primary key,
  cliente_id   text not null references public.clientes(id) on delete restrict,
  estado       text not null default 'pendiente'
                 check (estado in ('carrito', 'pendiente', 'pagado', 'cancelado')),
  subtotal     numeric not null check (subtotal >= 0),
  impuesto     numeric not null check (impuesto >= 0),
  total        numeric not null check (total >= 0),
  created_at   timestamptz not null default now()
);

create index if not exists idx_pedidos_cliente on public.pedidos(cliente_id);

-- ============================================================
-- TABLA: pedidos_detalle
-- ============================================================
create table if not exists public.pedidos_detalle (
  id          text primary key,
  pedido_id   text not null references public.pedidos(id) on delete cascade,
  producto_id text not null references public.productos(id) on delete restrict,
  cantidad    integer not null check (cantidad > 0),
  precio      numeric not null check (precio > 0),
  created_at  timestamptz not null default now()
);

create index if not exists idx_detalle_pedido   on public.pedidos_detalle(pedido_id);
create index if not exists idx_detalle_producto on public.pedidos_detalle(producto_id);

-- ============================================================
-- TRIGGER: updated_at en productos
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_productos_updated_at on public.productos;
create trigger trg_productos_updated_at
before update on public.productos
for each row execute procedure public.set_updated_at();

-- ============================================================
-- RLS - Habilitado pero con acceso TOTAL (modo desarrollo)
-- ============================================================
alter table public.clientes        enable row level security;
alter table public.categorias      enable row level security;
alter table public.productos       enable row level security;
alter table public.pedidos         enable row level security;
alter table public.pedidos_detalle enable row level security;

-- Clientes
drop policy if exists "open_all_clientes" on public.clientes;
create policy "open_all_clientes" on public.clientes
  for all to anon, authenticated using (true) with check (true);

-- Categorias
drop policy if exists "open_all_categorias" on public.categorias;
create policy "open_all_categorias" on public.categorias
  for all to anon, authenticated using (true) with check (true);

-- Productos
drop policy if exists "open_all_productos" on public.productos;
create policy "open_all_productos" on public.productos
  for all to anon, authenticated using (true) with check (true);

-- Pedidos
drop policy if exists "open_all_pedidos" on public.pedidos;
create policy "open_all_pedidos" on public.pedidos
  for all to anon, authenticated using (true) with check (true);

-- Pedidos detalle
drop policy if exists "open_all_pedidos_detalle" on public.pedidos_detalle;
create policy "open_all_pedidos_detalle" on public.pedidos_detalle
  for all to anon, authenticated using (true) with check (true);

-- ============================================================
-- DATOS DE PRUEBA: categorias
-- ============================================================
insert into public.categorias (id, nombre, descripcion, icono) values
  ('cat01', 'Comida',       'Alimentos para mascotas de todas las edades.', 'restaurant-outline'),
  ('cat02', 'Juguetes',     'Juguetes para entretenimiento y estimulo.',    'football-outline'),
  ('cat03', 'Accesorios',   'Camas, collares, correas y mas.',              'gift-outline'),
  ('cat04', 'Medicamentos', 'Productos de salud y bienestar.',              'medkit-outline')
on conflict (id) do nothing;

-- ============================================================
-- DATOS DE PRUEBA: productos
-- ============================================================
insert into public.productos (id, nombre, descripcion, precio, stock, categoria_id) values
  ('prod01', 'Royal Canin Adulto 3kg',  'Alimento seco para perros adultos.',         45000, 30, 'cat01'),
  ('prod02', 'Whiskas Pollo 1kg',       'Alimento para gatos sabor pollo.',            18000, 50, 'cat01'),
  ('prod03', 'Pelota Kong Roja',        'Pelota resistente para perros activos.',      22000, 20, 'cat02'),
  ('prod04', 'Raton de peluche',        'Juguete suave para gatos.',                   9000, 35, 'cat02'),
  ('prod05', 'Collar ajustable M',      'Collar de nylon para perros medianos.',       14000, 25, 'cat03'),
  ('prod06', 'Cama circular L',         'Cama suave y calida para mascotas.',          55000, 10, 'cat03'),
  ('prod07', 'Antipulgas Frontline',    'Proteccion mensual contra pulgas y garras.', 38000, 40, 'cat04'),
  ('prod08', 'Vitaminas para perros',   'Suplemento multivitaminico diario.',          27000,  60, 'cat04')
on conflict (id) do nothing;

-- ============================================================
-- DATOS DE PRUEBA: usuario admin
-- ============================================================
insert into public.clientes (id, nombre, correo, password, rol)
values ('admin01', 'Sebastian', 'admin@gmail.com', '123456', 'admin')
on conflict (id) do nothing;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
select 'clientes'        as tabla, count(*) as filas from public.clientes
union all
select 'categorias',       count(*) from public.categorias
union all
select 'productos',        count(*) from public.productos
union all
select 'pedidos',          count(*) from public.pedidos
union all
select 'pedidos_detalle',  count(*) from public.pedidos_detalle;