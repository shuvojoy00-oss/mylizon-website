module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const pass = String(body?.password || "");

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN) {
      return res.status(500).json({ ok: false, error: "Admin env not configured" });
    }

    if (pass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ ok: false, error: "Wrong password" });
    }

    return res.json({ ok: true, token: process.env.ADMIN_TOKEN });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};
