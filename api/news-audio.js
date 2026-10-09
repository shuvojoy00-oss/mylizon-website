const fs = require("fs");
const path = require("path");
const { getPool } = require("./_db");
const { ensureContentSchema } = require("./_content");

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<li[^>]*>/gi, ". ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<h[1-6][^>]*>/gi, ". ")
    .replace(/<\/h[1-6]>/gi, ". ")
    .replace(/<p[^>]*>/gi, " ")
    .replace(/<\/p>/gi, ". ")
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?।])/g, "$1")
    .trim();
}

const bnDigits = {0:"০",1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯"};
const monthsBn = {
  1:"জানুয়ারি",2:"ফেব্রুয়ারি",3:"মার্চ",4:"এপ্রিল",5:"মে",6:"জুন",
  7:"জুলাই",8:"আগস্ট",9:"সেপ্টেম্বর",10:"অক্টোবর",11:"নভেম্বর",12:"ডিসেম্বর"
};
function toBnDigits(v){return String(v).replace(/[0-9]/g,d=>bnDigits[d])}
function normalizeBanglaSpeech(text) {
  let s = String(text || "");

  s = s.replace(/\b(20\d{2})[\/-](\d{1,2})[\/-](\d{1,2})\b/g, (_,y,m,d) => {
    const month = monthsBn[Number(m)] || toBnDigits(m);
    return `${toBnDigits(Number(d))} ${month} ${toBnDigits(y)}`;
  });
  s = s.replace(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/g, (_,d,m,y) => {
    const month = monthsBn[Number(m)] || toBnDigits(m);
    return `${toBnDigits(Number(d))} ${month} ${toBnDigits(y)}`;
  });
  s = s.replace(/\b(20\d{2})\b/g, y => toBnDigits(y));
  s = s.replace(/(\d+(?:\.\d+)?)\s*%/g, (_,n) => `${toBnDigits(n)} শতাংশ`);
  s = s.replace(/£\s*(\d[\d,.]*)/g, (_,n) => `${toBnDigits(n)} পাউন্ড`);
  s = s.replace(/\$\s*(\d[\d,.]*)/g, (_,n) => `${toBnDigits(n)} ডলার`);
  s = s.replace(/€\s*(\d[\d,.]*)/g, (_,n) => `${toBnDigits(n)} ইউরো`);
  s = s.replace(/\bBDT\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} টাকা`);
  s = s.replace(/\bGBP\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} পাউন্ড`);
  s = s.replace(/\bUSD\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} ডলার`);
  s = s.replace(/\bAUD\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} অস্ট্রেলিয়ান ডলার`);
  s = s.replace(/\bCAD\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} কানাডিয়ান ডলার`);
  s = s.replace(/\bNZD\s*(\d[\d,.]*)/gi, (_,n) => `${toBnDigits(n)} নিউজিল্যান্ড ডলার`);
  s = s.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (_,a,b) => `${toBnDigits(a)} এর মধ্যে ${toBnDigits(b)}`);
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, n => toBnDigits(n));

  s = s.replace(/\bIELTS\b/gi, "আইইএলটিএস")
       .replace(/\bPTE\b/gi, "পিটিই")
       .replace(/\bATAS\b/gi, "এটাস")
       .replace(/\bCAS\b/gi, "ক্যাস")
       .replace(/\bCoE\b/gi, "সিওই")
       .replace(/\bOSHC\b/gi, "ওএসএইচসি")
       .replace(/\bUKVI\b/gi, "ইউকেভিআই")
       .replace(/\bUK\b/gi, "ইউকে")
       .replace(/\bUSA\b/gi, "ইউএসএ");

  return s.replace(/\s+/g," ").trim();
}

function pronunciationMarkup(text) {
  let safe = escapeXml(normalizeBanglaSpeech(text));
  const replacements = [
    [/Department of Home Affairs/gi, '<sub alias="ডিপার্টমেন্ট অফ হোম অ্যাফেয়ার্স">$&</sub>'],
    [/Student Guardian/gi, '<sub alias="স্টুডেন্ট গার্ডিয়ান">$&</sub>'],
    [/Student Visa/gi, '<sub alias="স্টুডেন্ট ভিসা">$&</sub>'],
    [/subclass 590/gi, '<sub alias="সাবক্লাস পাঁচশ নব্বই">$&</sub>'],
    [/subclass 500/gi, '<sub alias="সাবক্লাস পাঁচশ">$&</sub>'],
    [/Australia/gi, '<sub alias="অস্ট্রেলিয়া">$&</sub>'],
    [/New Zealand/gi, '<sub alias="নিউজিল্যান্ড">$&</sub>'],
    [/Canada/gi, '<sub alias="কানাডা">$&</sub>'],
    [/United Kingdom/gi, '<sub alias="ইউনাইটেড কিংডম">$&</sub>']
  ];
  for (const [pattern, replacement] of replacements) safe = safe.replace(pattern, replacement);
  return safe.replace(/\?/g, '?<break time="220ms"/>').replace(/।/g, '।<break time="150ms"/>');
}

async function getPost(slug) {
  await ensureContentSchema();
  const pool = getPool();
  await pool.query("update public.content_posts set status='published',updated_at=now() where status='scheduled' and published_at is not null and published_at<=now()");
  const r = await pool.query("select slug,title_bn,body_bn from public.content_posts where slug=$1 and status='published' limit 1",[slug]);
  if (r.rows[0]) return r.rows[0];

  try {
    const filePath = path.join(process.cwd(), "data", "insights-auto.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return (data.posts || []).find(item => item.slug === slug) || null;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const slug = String(req.query?.slug || "").trim();
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ ok: false, error: "Azure Speech is not configured" });
  }

  try {
    const post = await getPost(slug);
    if (!post) return res.status(404).json({ ok: false, error: "Published article not found" });

    const text = stripHtml((post.title_bn || "") + ". " + (post.body_bn || ""));
    if (!text) return res.status(400).json({ ok: false, error: "Bangla article text is empty" });

    const spoken = pronunciationMarkup(text);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="bn-BD"><voice name="bn-BD-PradeepNeural"><prosody rate="+7%" pitch="+0%">${spoken}</prosody></voice></speak>`;

    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "LizOn-News"
      },
      body: ssml
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Azure Speech error", response.status, detail.slice(0, 500));
      return res.status(502).json({ ok: false, error: "Speech generation failed" });
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("CDN-Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("News audio error", error);
    return res.status(500).json({ ok: false, error: "Audio generation error" });
  }
};