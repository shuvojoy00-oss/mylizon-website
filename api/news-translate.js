const { adminToken } = require("./_content");

function parseGoogle(data) {
  if (!data) return "";
  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      return data[0].map(x => Array.isArray(x) ? (x[0] || "") : "").join("");
    }
    if (typeof data[0] === "string") return data[0];
  }
  if (Array.isArray(data.sentences)) {
    return data.sentences.map(x => x?.trans || "").join("");
  }
  return "";
}

async function requestJson(url, options = {}) {
  const r = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

async function translateChunk(text, target) {
  const source = target === "bn" ? "en" : "bn";
  const q = encodeURIComponent(text);
  const attempts = [
    {
      name: "google-clients5",
      url: "https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=" + source + "&tl=" + target + "&q=" + q
    },
    {
      name: "google-web",
      url: "https://translate.google.com/translate_a/single?client=gtx&sl=" + source + "&tl=" + target + "&dt=t&dj=1&q=" + q
    },
    {
      name: "google-api",
      url: "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + source + "&tl=" + target + "&dt=t&dj=1&q=" + q
    }
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const data = await requestJson(attempt.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
          "Accept": "application/json,text/plain,*/*",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      const translated = parseGoogle(data);
      if (translated) return { text: translated, provider: attempt.name };
      lastError = new Error("Empty translation from " + attempt.name);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Translation service unavailable");
}

function splitText(text, max = 650) {
  const value = String(text || "");
  if (!value) return [];
  if (value.length <= max) return [value];
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
    if (cut < Math.floor(max * 0.55)) cut = max;
    else cut += 1;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return chunks;
}

async function translatePlain(text, target) {
  const chunks = splitText(text);
  const translated = [];
  let provider = "";
  for (const chunk of chunks) {
    const result = await translateChunk(chunk, target);
    translated.push(result.text);
    provider ||= result.provider;
  }
  return { text: translated.join(""), provider };
}

async function translateHtml(html, target) {
  const parts = String(html || "").split(/(<[^>]+>)/g);
  let provider = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part || /^<[^>]+>$/.test(part) || !part.trim()) continue;
    const result = await translatePlain(part, target);
    parts[i] = result.text;
    provider ||= result.provider;
  }
  return { text: parts.join(""), provider };
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

    const result = format === "html"
      ? await translateHtml(text, target)
      : await translatePlain(text, target);

    return res.json({ ok: true, translation: result.text, provider: result.provider });
  } catch (e) {
    const message = e?.name === "TimeoutError"
      ? "Translation timed out. Please try again."
      : "Translation service failed. Please try again.";
    return res.status(502).json({ ok: false, error: message });
  }
};