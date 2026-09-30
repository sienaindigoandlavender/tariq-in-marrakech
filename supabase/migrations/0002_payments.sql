-- Online payment (PayPal) alongside pay-on-arrival ("Reserve now, pay later").

alter table bookings
  add column payment_method text not null default 'on_arrival' check (payment_method in ('on_arrival','paypal')),
  add column payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded','failed')),
  add column paypal_order_id text,
  add column paypal_capture_id text,
  add column paid_eur numeric(10,2) not null default 0,
  add column paid_at timestamptz,
  add column refunded_at timestamptz;

-- A PayPal booking waits in 'pending_payment' until the capture succeeds.
alter table bookings drop constraint bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending_payment','confirmed','reminded','picked','paid','noshow','cancelled'));

create unique index bookings_paypal_order_idx on bookings (paypal_order_id) where paypal_order_id is not null;
