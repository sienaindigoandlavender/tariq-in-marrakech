-- Customer accounts (synced wishlist) and per-product booking rules. Safe to run more than once.

-- Booking rules. Defaults keep every existing product as it was: bookable from tomorrow,
-- pay online or on the day, free cancellation.
alter table products add column if not exists lead_days int not null default 1 check (lead_days between 1 and 60);
alter table products add column if not exists prepay_only boolean not null default false;
alter table products add column if not exists refundable boolean not null default true;

-- Wishlist: one row per saved product per customer (Supabase Auth user).
create table if not exists wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table wishlists enable row level security;

drop policy if exists "customer reads own wishlist" on wishlists;
create policy "customer reads own wishlist" on wishlists
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "customer adds to own wishlist" on wishlists;
create policy "customer adds to own wishlist" on wishlists
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "customer updates own wishlist" on wishlists;
create policy "customer updates own wishlist" on wishlists
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "customer removes from own wishlist" on wishlists;
create policy "customer removes from own wishlist" on wishlists
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on wishlists to authenticated;
