// /portal/assets/supabase.js
// Supabase JS via CDN (no build step)

export const SUPABASE_URL = "https://zbybysxllsjmhrbozgsx.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_B3r57C5bcVvIT22u13OBjA_N0LEfkz9";

export function assertSupabaseConfigured() {
  if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_KEY.includes("PASTE_")) {
    throw new Error("Supabase not configured. Paste SUPABASE_URL and SUPABASE_ANON_KEY in /portal/assets/supabase.js");
  }
}

export function createClient() {
  assertSupabaseConfigured();
  // global `supabase` comes from CDN script loaded in HTML
  return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

