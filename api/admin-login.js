const crypto = require("crypto");
const FALLBACK_ADMIN_PASSWORD_SHA256 = "4f21d54f1614db6da001f9c2bc30d1624c295a07c6989d91d8bc52e358c6037e";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const pass = String(body?.password || "");
    if (!process.env.ADMIN_TOKEN) {
      return res.status(500).json({ ok: false, error: "Admin token not configured" });
    }

    const envMatch = !!process.env.ADMIN_PASSWORD && pass === process.env.ADMIN_PASSWORD;
    const fallbackHash = crypto.createHash("sha256").update(pass).digest("hex");
    const fallbackMatch = fallbackHash === FALLBACK_ADMIN_PASSWORD_SHA256;

    if (!envMatch && !fallbackMatch) {
      return res.status(401).json({ ok: false, error: "Wrong password" });
    }

    return res.json({ ok: true, token: process.env.ADMIN_TOKEN });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};
