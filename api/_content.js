const { getPool } = require("./_db");

let ready = false;

async function ensureContentSchema() {
  if (ready) return;
  const pool = getPool();
  await pool.query(`
    create table if not exists public.content_posts (
      id bigserial primary key,
      slug text unique not null,
      title_bn text not null,
      title_en text,
      excerpt_bn text,
      excerpt_en text,
      body_bn text not null,
      body_en text,
      category text not null check (category in ('study-abroad','ielts','pte')),
      content_type text not null default 'news' check (content_type in ('news','guide','suggestion','prediction','announcement')),
      status text not null default 'draft' check (status in ('draft','review','published','archived')),
      featured boolean not null default false,
      source_url text,
      source_name text,
      source_verified boolean not null default false,
      importance text default 'useful' check (importance in ('critical','important','useful','general')),
      ai_generated boolean not null default false,
      ai_confidence numeric(4,3),
      published_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists content_posts_status_published_idx
      on public.content_posts(status, published_at desc);
    create index if not exists content_posts_category_idx
      on public.content_posts(category, published_at desc);
  `);
  ready = true;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90) || ("post-" + Date.now());
}

function cleanHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

function adminToken(req) {
  const h = req.headers || {};
  const token = h["x-admin-token"] || (h.authorization || "").replace(/^Bearer\s+/i, "");
  return token || "";
}

module.exports = { ensureContentSchema, slugify, cleanHtml, adminToken };
