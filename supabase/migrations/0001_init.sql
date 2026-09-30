-- Tariq: initial schema. One Supabase project per city deployment; `city` is kept on every row.

create table products (
  id text primary key,                 -- slug, e.g. 'sahara3'
  city text not null default 'marrakech',
  category text not null check (category in ('exc','des','act','trf','svc','kit')),
  role text not null check (role in ('lead','core','cow','gap')),
  title text not null,
  subtitle text not null,              -- 'Day trip', 'Transfer', 'At your riad', 'Kit', 'Baby'
  blurb text not null,                 -- one sentence for cards
  timing text not null,                -- 'Pickup 8:30'
  duration text not null,              -- key facts row
  km int not null default 0,
  drive_time text not null default '',
  price_eur numeric(10,2) not null,
  was_eur numeric(10,2),               -- strike-through price, optional
  per text not null check (per in ('pp','car','flat')),
  cap int,                             -- guests per car when per='car'
  private_per_car numeric(10,2),
  badge text,                          -- 'Best seller', 'Most booked', 'Signature'
  scene text not null,                 -- poster scene key
  image_url text,                      -- real photo; replaces the painted scene when set
  highlights text[] not null default '{}',
  includes text[] not null default '{}',
  excludes text[] not null default '{}',
  know_before text[] not null default '{}',
  sort int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table product_addons (
  id text not null,
  product_id text not null references products(id) on delete cascade,
  label text not null,
  eur numeric(10,2) not null,
  per text not null check (per in ('pp','car','unit')),
  popular boolean not null default false,
  sort int not null default 100,
  primary key (product_id, id)
);

create table bookings (
  ref text primary key,                -- 'TRQ-XXXXX', unambiguous alphabet, no 0/O/1/I
  city text not null default 'marrakech',
  product_id text not null references products(id),
  product_title text not null,         -- snapshot at booking time
  role text not null,
  date date not null,
  guests int not null check (guests between 1 and 14),
  mode text not null default 'shared' check (mode in ('shared','private')),
  addons jsonb not null default '[]',  -- [{id,label,eur,qty,line_eur}]
  pickup text not null,
  lead_name text not null,
  phone text not null,
  notes text,
  base_eur numeric(10,2) not null,
  extra_eur numeric(10,2) not null,
  total_eur numeric(10,2) not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','reminded','picked','paid','noshow','cancelled')),
  source text not null default 'web',  -- 'web' | 'concierge' | 'riad_qr' | 'whatsapp'
  partner_code text,                   -- riad QR code
  created_at timestamptz not null default now()
);
create index on bookings (city, date);
create index on bookings (status);
create index on bookings (partner_code);

create table partners (               -- riads distributing QR cards
  code text primary key,              -- e.g. 'RDS01'
  city text not null default 'marrakech',
  name text not null,
  commission_pct numeric(5,2) not null default 10,
  active boolean not null default true
);

create table concierge_log (          -- demand research: every question asked
  id bigint generated always as identity primary key,
  city text not null default 'marrakech',
  question text not null,
  suggested text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table operators (              -- allow-list for /dispatch
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Row Level Security --------------------------------------------------------
alter table products        enable row level security;
alter table product_addons  enable row level security;
alter table bookings        enable row level security;
alter table partners        enable row level security;
alter table concierge_log   enable row level security;
alter table operators       enable row level security;

-- Catalogue: public read of active rows only. No public writes.
create policy "public read active products" on products
  for select to anon, authenticated using (active = true);
create policy "public read addons of active products" on product_addons
  for select to anon, authenticated
  using (exists (select 1 from products p where p.id = product_id and p.active));

-- Operators can see their own allow-list row (lets the client confirm access).
create policy "operator reads own row" on operators
  for select to authenticated using (user_id = auth.uid());

-- Bookings: nothing for anon. Signed-in operators may read (needed for Realtime).
-- All writes go through server route handlers with the service role key.
create policy "operators read bookings" on bookings
  for select to authenticated
  using (exists (select 1 from operators o where o.user_id = auth.uid()));

-- partners, concierge_log: no policies => no access except the service role.

-- Realtime for the dispatch board.
alter publication supabase_realtime add table bookings;
