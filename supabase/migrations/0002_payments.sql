-- Online payment (PayPal) alongside pay-on-arrival ("Reserve now, pay later").
-- Safe to run more than once.

alter table bookings
  add column if not exists payment_method text not null default 'on_arrival' check (payment_method in ('on_arrival','paypal')),
  add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded','failed')),
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists paid_eur numeric(10,2) not null default 0,
  add column if not exists paid_at timestamptz,
  add column if not exists refunded_at timestamptz;

-- A PayPal booking waits in 'pending_payment' until the capture succeeds.
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending_payment','confirmed','reminded','picked','paid','noshow','cancelled'));

create unique index if not exists bookings_paypal_order_idx on bookings (paypal_order_id) where paypal_order_id is not null;
