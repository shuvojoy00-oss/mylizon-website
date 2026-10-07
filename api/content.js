const { getPool } = require("./_db");
const { ensureContentSchema } = require("./_content");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ ok:false, error:"Method not allowed" });
  try {
    await ensureContentSchema();
    const pool = getPool();
    const slug = String(req.query?.slug || "").trim();

    if (slug) {
      const r = await pool.query(`
        select id, slug, title_bn, title_en, excerpt_bn, excerpt_en, body_bn, body_en,
               category, content_type, featured, source_url, source_name, source_verified,
               importance, published_at, updated_at
        from public.content_posts
        where slug=$1 and status='published'
        limit 1
      `, [slug]);
      if (!r.rows[0]) return res.status(404).json({ ok:false, error:"Not found" });
      return res.json({ ok:true, post:r.rows[0] });
    }

    const category = String(req.query?.category || "all");
    const q = String(req.query?.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query?.limit || 30), 1), 100);
    const values = [];
    const where = ["status='published'"];

    if (["study-abroad","ielts","pte"].includes(category)) {
      values.push(category);
      where.push(`category=$${values.length}`);
    }
    if (q) {
      values.push("%" + q + "%");
      where.push(`(title_bn ilike $${values.length} or title_en ilike $${values.length} or excerpt_bn ilike $${values.length} or excerpt_en ilike $${values.length})`);
    }
    values.push(limit);

    const r = await pool.query(`
      select id, slug, title_bn, title_en, excerpt_bn, excerpt_en, category, content_type,
             featured, source_verified, importance, published_at, updated_at
      from public.content_posts
      where ${where.join(" and ")}
      order by featured desc, published_at desc nulls last, created_at desc
      limit $${values.length}
    `, values);

    return res.json({ ok:true, posts:r.rows });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e?.message || e) });
  }
};
