const { getPool } = require("./_db");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // minimal safety checks
    if (!body?.target_score || !body?.exam_timeline || !body?.taken_ielts_before) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }
    if (!body?.writing_text || !body?.stage || !body?.recommended_path) {
      return res.status(400).json({ ok: false, error: "Missing result fields" });
    }

    const pool = getPool();

    const q = `
      insert into public.ielts_placement_attempts (
        full_name, phone, email, city_country,
        target_score, exam_timeline, taken_ielts_before, last_overall_band,
        grammar_score, urgency_score, target_pressure, speaking_risk,
        speaking_comfort, speaking_issues,
        writing_text, wrote_without_translate, writing_word_count,
        stage, recommended_path, result_summary,
        status
      )
      values (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,$12,
        $13,$14,
        $15,$16,$17,
        $18,$19,$20,
        $21
      )
      returning id;
    `;

    const vals = [
      body.full_name || null,
      body.phone || null,
      body.email || null,
      body.city_country || null,

      body.target_score,
      body.exam_timeline,
      body.taken_ielts_before,
      body.last_overall_band || null,

      Number(body.grammar_score || 0),
      Number(body.urgency_score || 0),
      Number(body.target_pressure || 0),
      Number(body.speaking_risk || 0),

      Number(body.speaking_comfort || 1),
      JSON.stringify(body.speaking_issues || []),

      String(body.writing_text || ""),
      Boolean(body.wrote_without_translate),
      Number(body.writing_word_count || 0),

      String(body.stage),
      String(body.recommended_path),
      String(body.result_summary),

      String(body.status || "NEW")
    ];

    const r = await pool.query(q, vals);
    return res.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};
