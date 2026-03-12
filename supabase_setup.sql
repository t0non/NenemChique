-- Neném Chique - Supabase Setup Script (v2 - Robust)
-- Este script foi atualizado para não dar erro caso as tabelas já existam.

-- Tabela de Produtos
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  promo_price numeric,
  category text,
  images text[] default '{}',
  is_upsell boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Categorias
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Configurações
create table if not exists settings (
  id int primary key default 1,
  marquee_items text[] default '{}',
  promotion_text text,
  promotion_countdown text,
  hero_title text,
  hero_description text,
  hero_image_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 1)
);

-- Tabela de Leads (Captura de Clientes)
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  whatsapp text unique, -- Identificador único do cliente
  source text, 
  data jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Pedidos (Orders)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_code text unique not null, -- Ex: NC-1234
  customer_id uuid references leads(id),
  customer_name text,
  customer_whatsapp text,
  items jsonb not null, -- Itens do carrinho
  total numeric not null,
  status text check (status in ('cart_open', 'pending_payment', 'completed', 'abandoned')) default 'cart_open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Cupons
create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adiciona coluna de validade se não existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'expires_at'
    ) THEN
      ALTER TABLE coupons ADD COLUMN expires_at timestamp with time zone;
    END IF;
  END IF;
END
$$;

-- Habilitar RLS (Row Level Security) em todas as tabelas
alter table products enable row level security;
alter table categories enable row level security;
alter table settings enable row level security;
alter table leads enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;

-- Políticas de Segurança (Checks if they already exist before creating)
do $$
begin
  -- Produtos
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura pública' and tablename = 'products') then
    create policy "Permitir leitura pública" on products for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir escrita total' and tablename = 'products') then
    create policy "Permitir escrita total" on products for all using (true);
  end if;

  -- Categorias
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura pública' and tablename = 'categories') then
    create policy "Permitir leitura pública" on categories for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir escrita total' and tablename = 'categories') then
    create policy "Permitir escrita total" on categories for all using (true);
  end if;

  -- Configurações
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura pública' and tablename = 'settings') then
    create policy "Permitir leitura pública" on settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir escrita total' and tablename = 'settings') then
    create policy "Permitir escrita total" on settings for all using (true);
  end if;

  -- Leads
  if not exists (select 1 from pg_policies where policyname = 'Permitir inserção pública' and tablename = 'leads') then
    create policy "Permitir inserção pública" on leads for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura admin' and tablename = 'leads') then
    create policy "Permitir leitura admin" on leads for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir update público por whatsapp' and tablename = 'leads') then
    create policy "Permitir update público por whatsapp" on leads for update using (true);
  end if;

  -- Pedidos (Orders)
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura admin total' and tablename = 'orders') then
    create policy "Permitir leitura admin total" on orders for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir inserção pública' and tablename = 'orders') then
    create policy "Permitir inserção pública" on orders for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir update público' and tablename = 'orders') then
    create policy "Permitir update público" on orders for update using (true);
  end if;

  -- Cupons
  if not exists (select 1 from pg_policies where policyname = 'Permitir leitura pública' and tablename = 'coupons') then
    create policy "Permitir leitura pública" on coupons for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Permitir escrita admin' and tablename = 'coupons') then
    create policy "Permitir escrita admin" on coupons for all using (true);
  end if;
end
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'gender'
    ) THEN
      ALTER TABLE products ADD COLUMN gender text DEFAULT 'unisex';
    END IF;
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'colors'
    ) THEN
      ALTER TABLE products ADD COLUMN colors text[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'sizes'
    ) THEN
      ALTER TABLE products ADD COLUMN sizes text[] DEFAULT '{}';
    END IF;
  END IF;
END
$$;
