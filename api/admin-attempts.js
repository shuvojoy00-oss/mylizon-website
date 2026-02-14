const { getPool } = require("./_db");

function deny(res) {
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

module.exports = async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return deny(res);

  const pool = getPool();

  try {
    if (req.method === "GET") {
      const r = await pool.query(`
        select id, created_at, full_name, phone, target_score, exam_timeline, stage, status
        from public.ielts_placement_attempts
        order by created_at desc
        limit 300;
      `);
      return res.json({ ok: true, rows: r.rows });
    }

    if (req.method === "PATCH") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const id = Number(body?.id);
      if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

      const r = await pool.query(
        `
        update public.ielts_placement_attempts
        set full_name=$1, phone=$2, target_score=$3, exam_timeline=$4, stage=$5, status=$6
        where id=$7
        returning id;
        `,
        [
          body.full_name || null,
          body.phone || null,
          body.target_score || null,
          body.exam_timeline || null,
          body.stage || null,
          body.status || null,
          id
        ]
      );

      return res.json({ ok: true, id: r.rows[0]?.id || id });
    }

    if (req.method === "DELETE") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const id = Number(body?.id);
      if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

      await pool.query(`delete from public.ielts_placement_attempts where id=$1`, [id]);
      return res.json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};
