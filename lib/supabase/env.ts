export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the Tariq Supabase project is configured. Until then the catalogue is served from data/catalogue.json. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
