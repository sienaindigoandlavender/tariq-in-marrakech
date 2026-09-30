-- Retention rules promised in the privacy policy (/privacy, "How long we keep it").
-- 1. Booking notes (may hold allergy or health details) are cleared 90 days after the service date.
-- 2. Concierge questions are deleted after 24 months.
create or replace function purge_personal_data() returns void
language sql security definer set search_path = public as $$
  update bookings set notes = null where notes is not null and date < current_date - interval '90 days';
  delete from concierge_log where created_at < now() - interval '24 months';
$$;

revoke all on function purge_personal_data() from public, anon, authenticated;

-- Run it daily. Requires the pg_cron extension: Supabase → Database → Extensions → enable "pg_cron",
-- then run this statement once:
--   select cron.schedule('tariq-purge-personal-data', '15 3 * * *', 'select purge_personal_data()');
