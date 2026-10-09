module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const pass = String(body.password || "");

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN) {
      return res.status(500).json({ ok: false, error: "Admin environment is not configured" });
    }

    if (pass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ ok: false, error: "Wrong password" });
    }

    const cookie = [
      "lizon_admin=" + encodeURIComponent(process.env.ADMIN_TOKEN),
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Strict",
      "Max-Age=28800"
    ].join("; ");

    res.setHeader("Set-Cookie", cookie);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};