const { getPool } = require("./_db");
const { ensureContentSchema, slugify, cleanHtml, adminToken } = require("./_content");

function extractText(data) {
  if (data.output_text) return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const c of item.content || []) if (c.text) chunks.push(c.text);
  }
  return chunks.join("\n");
}

function authorized(req) {
  const cron = process.env.CRON_SECRET;
  const auth = req.headers?.authorization || "";
  if (cron && auth === "Bearer " + cron) return true;
  return adminToken(req) && adminToken(req) === process.env.ADMIN_TOKEN;
}

function trustedOfficialUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    const exact = [
      "gov.uk","canada.ca","homeaffairs.gov.au","immi.homeaffairs.gov.au",
      "immigration.govt.nz","education.govt.nz","uscis.gov","travel.state.gov",
      "state.gov","europa.eu","service-public.fr","make-it-in-germany.com",
      "migrationsverket.se","nyidanmark.dk","migri.fi","gov.pl","esteri.it",
      "exteriores.gob.es","gov.ie","sem.admin.ch","ind.nl","udi.no",
      "gov.mt","moi.gov.cy","gov.cy","gov.sg","ica.gov.sg","mom.gov.sg",
      "gov.qa","edu.gov.qa","gov.sa","moe.gov.sa","gov.ae","u.ae",
      "gov.cn","studyinkorea.go.kr","moj.go.jp","mofa.go.jp","gov.tr",
      "ielts.org","britishcouncil.org","idp.com","pearsonpte.com",
      "pearson.com","cambridgeenglish.org","cambridge.org"
    ];
    if (exact.some(d => host === d || host.endsWith("." + d))) return true;
    if (/(^|\.)gov(\.|$)/.test(host) || /(^|\.)govt(\.|$)/.test(host)) return true;
    if (/(^|\.)gouv(\.|$)/.test(host)) return true;
    if (/\.edu\.[a-z]{2,}$/i.test(host) || /\.ac\.[a-z]{2,}$/i.test(host) || /\.edu$/i.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (!["GET","POST"].includes(req.method)) return res.status(405).json({ ok:false, error:"Method not allowed" });
  if (!authorized(req)) return res.status(401).json({ ok:false, error:"Unauthorized" });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ ok:false, error:"OPENAI_API_KEY is not configured" });

  try {
    await ensureContentSchema();
    const pool = getPool();

    const existing = await pool.query(`
      select title_en, title_bn, source_url from public.content_posts
      where created_at > now() - interval '14 days'
      order by created_at desc limit 100
    `);

    const prompt = `
You are the editorial research engine for LizOn Education in Bangladesh.
Find the most important VERIFIED developments from the last 48 hours for Bangladeshi students in ONLY these categories:
1) Study Abroad: student visas, immigration rules, work rights, post-study work, funds, scholarships, university policy, intakes.
2) IELTS: official IELTS, British Council, IDP, Cambridge testing or policy updates.
3) PTE: official Pearson PTE testing, scoring, format, policy or test-centre updates.

PRIMARY SOURCE RULE:
Use official government, immigration, university, IELTS/IDP/British Council/Cambridge, or Pearson sources for the core fact.
Do not publish claims based only on agents, social media, blogs, forums or secondary news.
Prefer a primary source published or updated in the last 48 hours.
If an item is uncertain, mark source_verified false.
Avoid duplicates of these recent items:
${JSON.stringify(existing.rows)}

Return ONLY a JSON array, maximum 4 objects. Each object must contain:
title_bn, title_en, excerpt_bn, excerpt_en, body_bn_html, body_en_html,
category (study-abroad|ielts|pte), importance (critical|important|useful|general),
source_url, source_name, source_verified (boolean), confidence (0 to 1), effective_date (string or null).

Writing rules:
Bangla is the primary version, natural Bangla with necessary English terms.
Explain what changed, who is affected, effective date when known, and what a Bangladeshi student should do.
No hype. No invented fees, dates, rules or quotes. Keep each article concise but useful.
HTML may only use p,h2,h3,strong,ul,ol,li,a,blockquote.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + process.env.OPENAI_API_KEY },
      body:JSON.stringify({
        model: process.env.OPENAI_NEWS_MODEL || "gpt-6-luna",
        tools:[{ type:"web_search" }],
        input: prompt
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "OpenAI request failed");

    let raw = extractText(data).trim().replace(/^\`\`\`json\s*/i,"").replace(/\`\`\`$/,"");
    const items = JSON.parse(raw);
    const saved = [];

    for (const item of Array.isArray(items) ? items : []) {
      if (!item?.title_bn || !item?.body_bn_html || !item?.source_url) continue;
      const dupe = await pool.query("select id from public.content_posts where source_url=$1 limit 1", [item.source_url]);
      if (dupe.rowCount) continue;

      const sourceTrusted = trustedOfficialUrl(item.source_url);
      const verified = sourceTrusted && item.source_verified === true && Number(item.confidence || 0) >= 0.94;
      const status = verified ? "published" : "review";
      let slug = slugify(item.title_en || item.title_bn);
      const s = await pool.query("select 1 from public.content_posts where slug=$1", [slug]);
      if (s.rowCount) slug += "-" + Date.now().toString().slice(-6);

      const r = await pool.query(`
        insert into public.content_posts
        (slug,title_bn,title_en,excerpt_bn,excerpt_en,body_bn,body_en,category,content_type,status,
         source_url,source_name,source_verified,importance,ai_generated,ai_confidence,published_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,'news',$9,$10,$11,$12,$13,true,$14,
                case when $9='published' then now() else null end,now())
        returning id,slug,status,title_bn
      `, [
        slug, item.title_bn, item.title_en || null, item.excerpt_bn || null, item.excerpt_en || null,
        cleanHtml(item.body_bn_html), cleanHtml(item.body_en_html || ""),
        ["study-abroad","ielts","pte"].includes(item.category) ? item.category : "study-abroad",
        status, item.source_url, item.source_name || null, sourceTrusted && !!item.source_verified,
        ["critical","important","useful","general"].includes(item.importance) ? item.importance : "useful",
        Math.max(0, Math.min(1, Number(item.confidence || 0)))
      ]);
      saved.push({...r.rows[0], source_trusted:sourceTrusted});
    }

    return res.json({ ok:true, found:Array.isArray(items)?items.length:0, saved });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e?.message || e) });
  }
};