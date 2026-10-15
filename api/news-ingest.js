const crypto = require("crypto");
const { getPool } = require("./_db");
const { ensureContentSchema, slugify, cleanHtml } = require("./_content");

const CATEGORIES = new Set(["study-abroad", "ielts", "pte"]);
const TYPES = new Set(["news", "guide", "suggestion", "prediction", "announcement", "problem-solution", "recent-questions", "exam-intelligence", "opportunity", "outlook"]);
const IMPORTANCE = new Set(["critical", "important", "useful", "general"]);

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function automationToken(req) {
  const h = req.headers || {};
  return h["x-news-automation-secret"] || String(h.authorization || "").replace(/^Bearer\s+/i, "");
}

function trim(value, max = 10000) {
  return String(value || "").trim().slice(0, max);
}

function safeArticleHtml(value) {
  const cleaned = cleanHtml(trim(value, 50000));
  return cleaned
    .replace(/<\/?(?!p\b|h2\b|h3\b|strong\b|ul\b|ol\b|li\b|blockquote\b)[a-z][^>]*>/gi, "")
    .replace(/<(p|h2|h3|strong|ul|ol|li|blockquote)\b[^>]*>/gi, "<$1>");
}

async function ensureAutomationSchema(pool) {
  await pool.query(`
    create table if not exists public.news_automation_runs(
      id bigserial primary key,
      run_id text unique not null,
      status text not null default 'started',
      researched jsonb,
      published_count integer not null default 0,
      rejected_count integer not null default 0,
      message text,
      started_at timestamptz not null default now(),
      finished_at timestamptz
    );
    create index if not exists news_automation_runs_started_idx
      on public.news_automation_runs(started_at desc);
  `);
}

async function writeRun(pool, body) {
  const runId = trim(body.run_id, 120);
  if (!runId) throw new Error("Missing run_id");
  const status = ["started", "completed", "failed"].includes(body.status) ? body.status : "started";
  const researched = body.researched && typeof body.researched === "object" ? body.researched : {};
  const published = Math.max(0, Number(body.published_count || 0));
  const rejected = Math.max(0, Number(body.rejected_count || 0));
  const message = trim(body.message, 2000) || null;
  const r = await pool.query(`
    insert into public.news_automation_runs(run_id,status,researched,published_count,rejected_count,message,finished_at)
    values($1,$2,$3::jsonb,$4,$5,$6,case when $2 in ('completed','failed') then now() else null end)
    on conflict(run_id) do update set
      status=excluded.status,
      researched=excluded.researched,
      published_count=excluded.published_count,
      rejected_count=excluded.rejected_count,
      message=excluded.message,
      finished_at=case when excluded.status in ('completed','failed') then now() else news_automation_runs.finished_at end
    returning run_id,status,published_count,rejected_count,started_at,finished_at
  `, [runId, status, JSON.stringify(researched), published, rejected, message]);
  return r.rows[0];
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  if (!process.env.NEWS_AUTOMATION_SECRET) return res.status(503).json({ ok: false, error: "Automation secret is not configured" });
  if (!safeEqual(automationToken(req), process.env.NEWS_AUTOMATION_SECRET)) return res.status(401).json({ ok: false, error: "Unauthorized" });

  try {
    await ensureContentSchema();
    const pool = getPool();
    await ensureAutomationSchema(pool);
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    if (body.action === "run-log") {
      const run = await writeRun(pool, body);
      return res.json({ ok: true, run });
    }

    const titleBn = trim(body.title_bn, 500);
    const titleEn = trim(body.title_en, 500);
    const bodyBn = safeArticleHtml(body.body_bn);
    const bodyEn = safeArticleHtml(body.body_en);
    const category = trim(body.category, 40);
    const contentType = trim(body.content_type, 40) || "news";
    const sourceUrl = trim(body.source_url, 2000);
    const sourceName = trim(body.source_name, 300);

    if (!titleBn || !titleEn || !bodyBn || !bodyEn) return res.status(400).json({ ok: false, error: "Both Bangla and English title/body are required" });
    if (!CATEGORIES.has(category)) return res.status(400).json({ ok: false, error: "Invalid category" });
    if (!TYPES.has(contentType)) return res.status(400).json({ ok: false, error: "Invalid content type" });
    if (!sourceUrl || !/^https:\/\//i.test(sourceUrl)) return res.status(400).json({ ok: false, error: "A verified HTTPS source_url is required" });
    if (!sourceName) return res.status(400).json({ ok: false, error: "source_name is required" });
    if (body.source_verified !== true) return res.status(400).json({ ok: false, error: "Automation may publish only source_verified=true content" });

    let slug = slugify(body.slug || titleEn || titleBn);
    const duplicate = await pool.query(
      `select id,slug,title_en,source_url from public.content_posts
       where lower(slug)=lower($1)
          or lower(coalesce(title_en,''))=lower($2)
       limit 1`,
      [slug, titleEn]
    );
    if (duplicate.rows[0]) return res.status(409).json({ ok: false, duplicate: true, post: duplicate.rows[0] });

    const importance = IMPORTANCE.has(body.importance) ? body.importance : "useful";
    const countries = trim(body.country, 300).split(",").map(x => x.trim()).filter(Boolean).slice(0, 3).join(",") || null;

    const r = await pool.query(`
      insert into public.content_posts(
        slug,title_bn,title_en,excerpt_bn,excerpt_en,body_bn,body_en,
        category,content_type,country,keywords,status,featured,
        source_name,source_url,source_verified,importance,
        ai_generated,ai_confidence,published_at,updated_at
      ) values(
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,'published',$12,
        $13,$14,true,$15,
        true,$16,now(),now()
      )
      returning id,slug,title_bn,title_en,category,content_type,published_at
    `, [
      slug, titleBn, titleEn, trim(body.excerpt_bn, 1200) || null, trim(body.excerpt_en, 1200) || null,
      bodyBn, bodyEn, category, contentType, countries, trim(body.keywords, 1200) || null,
      !!body.featured, sourceName, sourceUrl, importance,
      Math.min(0.999, Math.max(0, Number(body.ai_confidence || 0.9)))
    ]);

    return res.status(201).json({ ok: true, post: r.rows[0] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};
