import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export async function getSessionUser() {
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
}

export async function getMyProfile(user) {
  // primary: id match (recommended)
  let res = await sb.from("profiles").select("id,email,full_name,role,status").eq("id", user.id).maybeSingle();
  if (!res.error && res.data) return res.data;

  // fallback: email match (for migration / mismatch)
  res = await sb.from("profiles").select("id,email,full_name,role,status").eq("email", user.email).maybeSingle();
  if (!res.error && res.data) return res.data;

  return null;
}

export async function requireActiveProfile() {
  const user = await getSessionUser();
  if (!user) {
    location.href = "./login.html";
    return null;
  }

  const profile = await getMyProfile(user);
  if (!profile || profile.status !== "active") {
    alert("Your portal access is not active yet. Contact LizOn admin.");
    await sb.auth.signOut();
    location.href = "./login.html";
    return null;
  }

  return { user, profile };
}

export async function logout() {
  await sb.auth.signOut();
  location.href = "./login.html";
}
