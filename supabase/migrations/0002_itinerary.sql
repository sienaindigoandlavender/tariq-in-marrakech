-- Product page timeline: [{ "t": "08:30", "s": "Pickup at your riad or hotel" }, ...]
alter table products add column if not exists itinerary jsonb not null default '[]'::jsonb;
