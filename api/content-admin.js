const { getPool } = require("./_db");
const { ensureContentSchema, slugify, cleanHtml, adminToken } = require("./_content");

function allowed(v, list, fallback) { return list.includes(v) ? v : fallback; }

module.exports = async (req, res) => {
  if (adminToken(req) !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok:false, error:"Unauthorized" });
  }

  try {
    await ensureContentSchema();
    const pool = getPool();

    if (req.method === "GET") {
      const id = Number(req.query?.id || 0);
      if (id) {
        const r = await pool.query(`
          select id, slug, title_bn, title_en, excerpt_bn, excerpt_en, body_bn, body_en,
                 category, content_type, status, featured, source_name, source_url,
                 source_verified, importance, ai_generated, ai_confidence,
                 published_at, created_at, updated_at
          from public.content_posts
          where id=$1 limit 1
        `, [id]);
        if (!r.rows[0]) return res.status(404).json({ ok:false, error:"Post not found" });
        return res.json({ ok:true, post:r.rows[0] });
      }

      const r = await pool.query(`
        select id, slug, title_bn, title_en, category, content_type, status, featured,
               source_name, source_url, source_verified, importance, ai_generated,
               ai_confidence, published_at, created_at, updated_at
        from public.content_posts
        order by created_at desc limit 300
      `);
      return res.json({ ok:true, posts:r.rows });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    if (req.method === "POST") {
      const titleBn = String(body.title_bn || "").trim();
      const bodyBn = cleanHtml(body.body_bn);
      if (!titleBn || !bodyBn) return res.status(400).json({ ok:false, error:"Bangla title and article are required" });

      const status = allowed(body.status, ["draft","review","published","archived"], "draft");
      const category = allowed(body.category, ["study-abroad","ielts","pte"], "study-abroad");
      const type = allowed(body.content_type, ["news","guide","suggestion","prediction","announcement"], "news");
      const importance = allowed(body.importance, ["critical","important","useful","general"], "useful");
      let slug = slugify(body.slug || body.title_en || titleBn);
      const exists = await pool.query("select 1 from public.content_posts where slug=$1", [slug]);
      if (exists.rowCount) slug += "-" + Date.now().toString().slice(-6);

      const r = await pool.query(`
        insert into public.content_posts
        (slug,title_bn,title_en,excerpt_bn,excerpt_en,body_bn,body_en,category,content_type,status,featured,
         source_url,source_name,source_verified,importance,ai_generated,ai_confidence,published_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,false,null,
                case when $10='published' then now() else null end,now())
        returning id,slug,status
      `, [
        slug, titleBn, body.title_en || null, body.excerpt_bn || null, body.excerpt_en || null,
        bodyBn, cleanHtml(body.body_en) || null, category, type, status, !!body.featured,
        body.source_url || null, body.source_name || null, !!body.source_verified, importance
      ]);
      return res.status(201).json({ ok:true, post:r.rows[0] });
    }

    if (req.method === "PATCH") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ ok:false, error:"Missing id" });
      const titleBn = String(body.title_bn || "").trim();
      const bodyBn = cleanHtml(body.body_bn);
      if (!titleBn || !bodyBn) return res.status(400).json({ ok:false, error:"Bangla title and article are required" });

      const status = allowed(body.status, ["draft","review","published","archived"], "draft");
      const r = await pool.query(`
        update public.content_posts set
          title_bn=$1,title_en=$2,excerpt_bn=$3,excerpt_en=$4,body_bn=$5,body_en=$6,
          category=$7,content_type=$8,status=$9,featured=$10,source_url=$11,source_name=$12,
          source_verified=$13,importance=$14,
          published_at=case
            when $9='published' and published_at is null then now()
            when $9<>'published' then null
            else published_at end,
          updated_at=now()
        where id=$15 returning id,slug,status
      `, [
        titleBn, body.title_en || null, body.excerpt_bn || null,
        body.excerpt_en || null, bodyBn, cleanHtml(body.body_en) || null,
        allowed(body.category, ["study-abroad","ielts","pte"], "study-abroad"),
        allowed(body.content_type, ["news","guide","suggestion","prediction","announcement"], "news"),
        status, !!body.featured, body.source_url || null, body.source_name || null,
        !!body.source_verified, allowed(body.importance, ["critical","important","useful","general"], "useful"), id
      ]);
      return res.json({ ok:true, post:r.rows[0] });
    }

    if (req.method === "DELETE") {
      const id = Number(body.id);
      if (!id) return res.status(400).json({ ok:false, error:"Missing id" });
      await pool.query("delete from public.content_posts where id=$1", [id]);
      return res.json({ ok:true });
    }

    return res.status(405).json({ ok:false, error:"Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e?.message || e) });
  }
};