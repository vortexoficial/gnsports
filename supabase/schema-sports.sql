-- GN Sports - schema e seed inicial
-- Use em um projeto Supabase novo da GN Sports.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'admin' check (role in ('admin')),
  created_at timestamp with time zone default now()
);

create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'GN Sports',
  whatsapp_number text not null default '5522992846915',
  logo_url text default '/logo.png',
  instagram_url text default '',
  default_message text default 'Olá! Quero saber mais sobre os produtos esportivos disponíveis.',
  promo_title text default 'Camisas em destaque',
  promo_text text default 'Fale no WhatsApp e confira produtos, tamanhos e ofertas disponíveis hoje.',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.home_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Banner da home',
  desktop_image_url text not null,
  mobile_image_url text not null,
  desktop_position text default 'center center',
  mobile_position text default 'center center',
  display_order integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.home_category_banners (
  id uuid primary key default gen_random_uuid(),
  slot integer not null unique check (slot between 1 and 4),
  name text not null default '',
  image_url text default '',
  link_to text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null check (type in ('suplemento', 'vestuario', 'acessorio', 'outro')),
  category_id uuid references public.categories(id) on delete set null,
  subcategory text default '',
  description text default '',
  brand text default '',
  price numeric(12,2) not null default 0,
  promo_price numeric(12,2),
  stock integer default 0,
  image_url text,
  gallery_urls jsonb default '[]'::jsonb,
  is_active boolean default true,
  is_featured boolean default false,
  objective_tags text[] default '{}'::text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  variant_type text,
  name text,
  stock integer default 0,
  price_adjustment numeric(12,2) default 0,
  created_at timestamp with time zone default now(),
  unique (product_id, variant_type, name)
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text default '',
  cover_url text,
  published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  page text,
  created_at timestamp with time zone default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_store_settings_updated_at on public.store_settings;
create trigger set_store_settings_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_home_banners_updated_at on public.home_banners;
create trigger set_home_banners_updated_at
before update on public.home_banners
for each row execute function public.set_updated_at();

drop trigger if exists set_home_category_banners_updated_at on public.home_category_banners;
create trigger set_home_category_banners_updated_at
before update on public.home_category_banners
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;
alter table public.home_banners enable row level security;
alter table public.home_category_banners enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.blog_posts enable row level security;
alter table public.page_views enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
on public.store_settings for select
to public
using (true);

drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings"
on public.store_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active home banners" on public.home_banners;
create policy "Public can read active home banners"
on public.home_banners for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage home banners" on public.home_banners;
create policy "Admins manage home banners"
on public.home_banners for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read home category banners" on public.home_category_banners;
create policy "Public can read home category banners"
on public.home_category_banners for select
to public
using (true);

drop policy if exists "Admins manage home category banners" on public.home_category_banners;
create policy "Admins manage home category banners"
on public.home_category_banners for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to public
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants for select
to public
using (
  exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and (products.is_active = true or public.is_admin())
  )
);

drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Admins manage variants"
on public.product_variants for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts for select
to public
using (published = true or public.is_admin());

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts"
on public.blog_posts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can insert page views" on public.page_views;
create policy "Public can insert page views"
on public.page_views for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read page views" on public.page_views;
create policy "Admins can read page views"
on public.page_views for select
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

insert into public.store_settings (
  store_name,
  whatsapp_number,
  logo_url,
  default_message,
  promo_title,
  promo_text,
  updated_at
)
values (
  'GN Sports',
  '5522992846915',
  '/logo.png',
  'Olá! Quero saber mais sobre os produtos esportivos disponíveis.',
  'Camisas em destaque',
  'Fale no WhatsApp e confira produtos, tamanhos e ofertas disponíveis hoje.',
  now()
);

insert into public.categories (name, slug, type, is_active)
values
  ('Camisas de clubes', 'camisas-de-clubes', 'suplemento', true),
  ('Camisas de seleções', 'camisas-de-selecoes', 'suplemento', true),
  ('Camisas retrô', 'camisas-retro', 'suplemento', true),
  ('Camisas de goleiro', 'camisas-de-goleiro', 'suplemento', true),
  ('Camisas de treino', 'camisas-de-treino', 'suplemento', true),
  ('Bolas', 'bolas', 'acessorio', true),
  ('Acessórios esportivos', 'acessorios-esportivos', 'acessorio', true),
  ('Treino e casual', 'treino-e-casual', 'vestuario', true)
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    is_active = excluded.is_active;

insert into public.home_category_banners (slot, name, image_url, link_to)
values
  (1, 'Novidades', '/demo-shirts/camisa-rubro-negra-demo.png', '/produtos'),
  (2, 'Seleções', '/demo-shirts/camisa-brasil-amarela-demo.png', '/categoria/camisas-de-selecoes'),
  (3, 'Itens', '/demo-sports-items/bola-campo-gold-demo.png', '/categoria/acessorios-esportivos'),
  (4, 'Ofertas', '/demo-shirts/camisa-branca-dourada-demo.png', '/ofertas?sort=promocoes')
on conflict (slot) do update
set name = excluded.name,
    image_url = excluded.image_url,
    link_to = excluded.link_to,
    updated_at = now();

update public.products
set is_active = false,
    updated_at = now()
where slug in (
  'camisa-brasil-i-torcedor-2026',
  'camisa-argentina-home-torcedor',
  'camisa-flamengo-rubro-negra',
  'camisa-corinthians-preta',
  'camisa-retro-italia-1994',
  'short-de-treino-performance',
  'bola-campo-pro-training',
  'garrafa-sport-700ml'
);

insert into public.products (
  name, slug, type, category_id, subcategory,
  description, brand, price, promo_price, stock,
  image_url, gallery_urls, objective_tags,
  is_active, is_featured, created_at, updated_at
)
values
(
  'Camisa Brasil Amarela Torcedor',
  'camisa-brasil-amarela-torcedor',
  'suplemento', (select id from public.categories where slug = 'camisas-de-selecoes'), 'Seleção',
  'Camisa amarela com detalhes verdes, tecido leve e visual de jogo para torcedores.',
  'GN Sports', 189.90, 159.90, 24,
  '/demo-shirts/camisa-brasil-amarela-demo.png', '[]'::jsonb, array['torcedor','presente'],
  true, true, now(), now()
),
(
  'Camisa Argentina Listrada Torcedor',
  'camisa-argentina-listrada-torcedor',
  'suplemento', (select id from public.categories where slug = 'camisas-de-selecoes'), 'Seleção',
  'Camisa listrada em azul claro e branco, com caimento confortável para uso casual ou torcida.',
  'GN Sports', 189.90, null, 18,
  '/demo-shirts/camisa-argentina-listrada-demo.png', '[]'::jsonb, array['torcedor'],
  true, true, now(), now()
),
(
  'Camisa Rubro-Negra Listrada',
  'camisa-rubro-negra-listrada',
  'suplemento', (select id from public.categories where slug = 'camisas-de-clubes'), 'Clube',
  'Camisa rubro-negra com listras horizontais, tecido esportivo e acabamento premium.',
  'GN Sports', 179.90, 149.90, 30,
  '/demo-shirts/camisa-rubro-negra-demo.png', '[]'::jsonb, array['torcedor','presente'],
  true, true, now(), now()
),
(
  'Camisa Alvinegra Clássica',
  'camisa-alvinegra-classica',
  'suplemento', (select id from public.categories where slug = 'camisas-de-clubes'), 'Clube',
  'Camisa preta e branca de estilo clássico para torcedores que preferem visual tradicional.',
  'GN Sports', 179.90, null, 20,
  '/demo-shirts/camisa-preta-branca-demo.png', '[]'::jsonb, array['torcedor'],
  true, true, now(), now()
),
(
  'Camisa Azul Retro 1994',
  'camisa-azul-retro-1994',
  'suplemento', (select id from public.categories where slug = 'camisas-retro'), 'Retro',
  'Camisa azul inspirada em modelos clássicos para colecionadores e apaixonados por futebol.',
  'GN Sports', 219.90, 199.90, 12,
  '/demo-shirts/camisa-azul-retro-demo.png', '[]'::jsonb, array['colecao','presente'],
  true, true, now(), now()
),
(
  'Camisa Branca Gold Edition',
  'camisa-branca-gold-edition',
  'suplemento', (select id from public.categories where slug = 'camisas-de-clubes'), 'Edição especial',
  'Camisa branca com detalhes dourados, ideal para uma linha premium da loja.',
  'GN Sports', 229.90, 209.90, 16,
  '/demo-shirts/camisa-branca-dourada-demo.png', '[]'::jsonb, array['colecao','presente'],
  true, true, now(), now()
),
(
  'Camisa Goleiro Verde Pro',
  'camisa-goleiro-verde-pro',
  'suplemento', (select id from public.categories where slug = 'camisas-de-goleiro'), 'Goleiro',
  'Camisa verde de goleiro com visual moderno, boa presença em campo e tecido respirável.',
  'GN Sports', 199.90, null, 14,
  '/demo-shirts/camisa-goleiro-verde-demo.png', '[]'::jsonb, array['treino'],
  true, true, now(), now()
),
(
  'Camisa Treino Marinho Gold',
  'camisa-treino-marinho-gold',
  'suplemento', (select id from public.categories where slug = 'camisas-de-treino'), 'Treino',
  'Camisa marinho com detalhes dourados, pensada para treino, viagem e uso esportivo casual.',
  'GN Sports', 149.90, 129.90, 28,
  '/demo-shirts/camisa-treino-marinho-demo.png', '[]'::jsonb, array['treino'],
  true, true, now(), now()
),
(
  'Bola Campo Gold Pro',
  'bola-campo-gold-pro',
  'acessorio', (select id from public.categories where slug = 'bolas'), 'Campo',
  'Bola de campo branca com detalhes pretos e dourados para treinos e partidas.',
  'GN Sports', 129.90, 109.90, 22,
  '/demo-sports-items/bola-campo-gold-demo.png', '[]'::jsonb, array['treino','presente'],
  true, true, now(), now()
),
(
  'Bola Futsal Black Gold',
  'bola-futsal-black-gold',
  'acessorio', (select id from public.categories where slug = 'bolas'), 'Futsal',
  'Bola de futsal com acabamento preto e dourado para jogos em quadra.',
  'GN Sports', 119.90, null, 18,
  '/demo-sports-items/bola-futsal-black-gold-demo.png', '[]'::jsonb, array['treino'],
  true, true, now(), now()
),
(
  'Luva Goleiro Gold Grip',
  'luva-goleiro-gold-grip',
  'acessorio', (select id from public.categories where slug = 'acessorios-esportivos'), 'Luvas',
  'Par de luvas de goleiro branca com detalhes dourados e visual premium.',
  'GN Sports', 149.90, 129.90, 15,
  '/demo-sports-items/luva-goleiro-gold-demo.png', '[]'::jsonb, array['treino','presente'],
  true, true, now(), now()
),
(
  'Short Treino Black Gold',
  'short-treino-black-gold',
  'vestuario', (select id from public.categories where slug = 'treino-e-casual'), 'Short',
  'Short preto com detalhes dourados para treino, jogo e uso casual esportivo.',
  'GN Sports', 89.90, 69.90, 32,
  '/demo-sports-items/short-treino-gold-demo.png', '[]'::jsonb, array['treino'],
  true, true, now(), now()
),
(
  'Meião Branco Gold',
  'meiao-branco-gold',
  'vestuario', (select id from public.categories where slug = 'treino-e-casual'), 'Meião',
  'Meião branco com faixas douradas para completar o uniforme.',
  'GN Sports', 49.90, null, 40,
  '/demo-sports-items/meiao-branco-gold-demo.png', '[]'::jsonb, array['treino'],
  true, true, now(), now()
),
(
  'Garrafa Sport Black Gold',
  'garrafa-sport-black-gold',
  'acessorio', (select id from public.categories where slug = 'acessorios-esportivos'), 'Garrafa',
  'Garrafa esportiva preta com detalhe dourado para treino, jogo e rotina.',
  'GN Sports', 39.90, 29.90, 50,
  '/demo-sports-items/garrafa-sport-gold-demo.png', '[]'::jsonb, array['treino','presente'],
  true, true, now(), now()
)
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    category_id = excluded.category_id,
    subcategory = excluded.subcategory,
    description = excluded.description,
    brand = excluded.brand,
    price = excluded.price,
    promo_price = excluded.promo_price,
    stock = excluded.stock,
    image_url = excluded.image_url,
    gallery_urls = excluded.gallery_urls,
    objective_tags = excluded.objective_tags,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured,
    updated_at = now();

insert into public.product_variants (product_id, variant_type, name, stock, price_adjustment)
select id, 'tamanho', size_name, size_stock, 0
from public.products
cross join (
  values ('P', 4), ('M', 8), ('G', 8), ('GG', 4)
) as sizes(size_name, size_stock)
where type in ('suplemento', 'vestuario')
on conflict (product_id, variant_type, name) do update
set stock = excluded.stock,
    price_adjustment = excluded.price_adjustment;

insert into public.blog_posts (title, slug, excerpt, content, cover_url, published, published_at)
values
(
  'Como escolher o tamanho da sua camisa',
  'como-escolher-tamanho-camisa',
  'Confira medidas, caimento e dicas para comprar camisa de time com mais segurança.',
  $$<p>Antes de pedir sua camisa, compare as medidas com uma peça que você já usa bem. Veja largura, comprimento e tipo de caimento.</p><p>Se estiver entre dois tamanhos, fale com a equipe pelo WhatsApp para conferir disponibilidade e orientação.</p>$$,
  '/demo-shirts/camisa-brasil-amarela-demo.png',
  true,
  now()
),
(
  'Camisa de clube, seleção ou retrô: qual escolher?',
  'camisa-clube-selecao-retro-qual-escolher',
  'Ideias rápidas para escolher presente, item de coleção ou camisa para usar no dia a dia.',
  $$<p>Camisas de clubes combinam com a rotina do torcedor. Modelos de seleções funcionam muito bem para presente, enquanto camisas retrô agradam colecionadores.</p><p>O melhor modelo depende do uso: jogo, arquibancada, treino, passeio ou coleção.</p>$$,
  '/demo-shirts/camisa-azul-retro-demo.png',
  true,
  now()
)
on conflict (slug) do update
set title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    cover_url = excluded.cover_url,
    published = excluded.published,
    published_at = excluded.published_at,
    updated_at = now();
