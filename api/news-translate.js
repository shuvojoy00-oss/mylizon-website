const { adminToken } = require("./_content");

function htmlToChunks(html, max = 2800) {
  const parts = String(html || "").split(/(<[^>]+>)/g);
  const chunks = [];
  let current = "";
  for (const part of parts) {
    if (current.length + part.length > max && current) {
      chunks.push(current);
      current = "";
    }
    current += part;
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(text, target) {
  const source = target === "bn" ? "en" : "bn";
  const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(source) + "&tl=" + encodeURIComponent(target) +
    "&dt=t&q=" + encodeURIComponent(text);
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 LizOn-News-Desk" } });
  if (!r.ok) throw new Error("Translation service unavailable");
  const data = await r.json();
  return (data?.[0] || []).map(x => x?.[0] || "").join("");
}

module.exports = async (req, res) => {
  if (adminToken(req) !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const target = body.target === "en" ? "en" : "bn";
    const format = body.format === "html" ? "html" : "text";
    const text = String(body.text || "").trim();
    if (!text) return res.json({ ok: true, translation: "" });
    if (text.length > 30000) return res.status(413).json({ ok: false, error: "Text is too long to translate at once" });
    const chunks = format === "html" ? htmlToChunks(text) : text.match(/[\s\S]{1,2800}/g) || [];
    const out = [];
    for (const chunk of chunks) out.push(await translateChunk(chunk, target));
    return res.json({ ok: true, translation: out.join("") });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e?.message || e) });
  }
};