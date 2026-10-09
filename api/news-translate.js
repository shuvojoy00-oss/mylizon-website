const { adminToken } = require("./_content");

async function translateChunk(text, target) {
  const source = target === "bn" ? "en" : "bn";
  const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(source) + "&tl=" + encodeURIComponent(target) +
    "&dt=t&q=" + encodeURIComponent(text);
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 LizOn-News-Desk" },
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error("Translation service unavailable");
  const data = await r.json();
  return (data?.[0] || []).map(x => x?.[0] || "").join("");
}

function splitText(text, max = 700) {
  const value = String(text || "");
  if (value.length <= max) return value ? [value] : [];
  const chunks = [];
  let rest = value;
  while (rest.length) {
    if (rest.length <= max) {
      chunks.push(rest);
      break;
    }
    let cut = Math.max(
      rest.lastIndexOf(". ", max),
      rest.lastIndexOf("? ", max),
      rest.lastIndexOf("! ", max),
      rest.lastIndexOf("। ", max),
      rest.lastIndexOf("\n", max),
      rest.lastIndexOf(" ", max)
    );
    if (cut < Math.floor(max * .55)) cut = max;
    else cut += 1;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return chunks;
}

async function mapLimited(items, limit, worker) {
  const out = new Array(items.length);
  let index = 0;
  async function run() {
    while (true) {
      const i = index++;
      if (i >= items.length) return;
      out[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

async function translatePlain(text, target) {
  const chunks = splitText(text, 700);
  if (!chunks.length) return "";
  const out = await mapLimited(chunks, 5, chunk => translateChunk(chunk, target));
  return out.join("");
}

async function translateHtml(html, target) {
  const parts = String(html || "").split(/(<[^>]+>)/g);
  const textIndexes = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] && !/^<[^>]+>$/.test(parts[i]) && parts[i].trim()) textIndexes.push(i);
  }
  await mapLimited(textIndexes, 5, async i => {
    parts[i] = await translatePlain(parts[i], target);
  });
  return parts.join("");
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
    if (text.length > 60000) {
      return res.status(413).json({ ok: false, error: "Article is too long to translate at once" });
    }

    const translation = format === "html"
      ? await translateHtml(text, target)
      : await translatePlain(text, target);

    return res.json({ ok: true, translation });
  } catch (e) {
    const message = e?.name === "TimeoutError"
      ? "Full article translation timed out. Please try again."
      : String(e?.message || e);
    return res.status(502).json({ ok: false, error: message });
  }
};