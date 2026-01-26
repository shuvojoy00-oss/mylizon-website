import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export function qs(id){ return document.getElementById(id); }
export function openNew(url){
  if(!url) return alert("Link not set yet.");
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function getSessionOrRedirect(){
  const { data } = await sb.auth.getSession();
  if(!data.session){
    location.href = "./login.html";
    return null;
  }
  return data.session;
}

export async function getMyProfileOrLogout(){
  const session = await getSessionOrRedirect();
  if(!session) return null;

  const user = session.user;

  // Try by id (preferred)
  let res = await sb.from("profiles").select("full_name,role,status,email").eq("id", user.id).maybeSingle();
  let profile = (!res.error && res.data) ? res.data : null;

  // fallback by email
  if(!profile){
    res = await sb.from("profiles").select("full_name,role,status,email").eq("email", user.email).maybeSingle();
    profile = (!res.error && res.data) ? res.data : null;
  }

  if(!profile || profile.status !== "active"){
    await sb.auth.signOut();
    location.href = "./login.html";
    return null;
  }

  return { user, profile };
}

export function requireRole(profileRole, allowed){
  if(!allowed.includes(profileRole)){
    location.href = "./index.html";
    return false;
  }
  return true;
}

export async function logout(){
  await sb.auth.signOut();
  location.href = "./login.html";
}
