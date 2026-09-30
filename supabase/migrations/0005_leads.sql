-- "Plan my trip" requests. Safe to run more than once.
create table if not exists leads (
  ref text primary key,                    -- 'PLN-XXXXX'
  city text not null default 'marrakech',
  arrival date,
  departure date,
  adults int not null default 2 check (adults between 1 and 30),
  children int not null default 0 check (children between 0 and 20),
  style text,
  needs text[] not null default '{}',
  budget text,
  package_id text,
  lead_name text not null,
  phone text not null,
  email text,
  notes text,
  status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  partner_code text,
  source text not null default 'web',      -- 'web' | 'concierge' | 'riad_qr'
  created_at timestamptz not null default now()
);
create index if not exists leads_city_created_idx on leads (city, created_at desc);

-- No public access at all: writes go through /api/leads with the service role, reads through /dispatch.
alter table leads enable row level security;

-- Retention (privacy policy): requests that never became a booking are deleted after 12 months.
create or replace function purge_personal_data() returns void
language sql security definer set search_path = public as $$
  update bookings set notes = null where notes is not null and date < current_date - interval '90 days';
  delete from concierge_log where created_at < now() - interval '24 months';
  delete from leads where status <> 'won' and created_at < now() - interval '12 months';
$$;
revoke all on function purge_personal_data() from public, anon, authenticated;
