const fs = require("fs");
const path = require("path");

const PROOF_SLUG = "australia-student-visa-rules-october-2026";

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
    .replace(/<li>/gi, ". ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<h[1-6][^>]*>/gi, ". ")
    .replace(/<\/h[1-6]>/gi, ". ")
    .replace(/<p[^>]*>/gi, " ")
    .replace(/<\/p>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?।])/g, "$1")
    .trim();
}

function pronunciationMarkup(text) {
  let safe = escapeXml(text);
  const replacements = [
    [/Department of Home Affairs/gi, '<sub alias="ডিপার্টমেন্ট অফ হোম অ্যাফেয়ার্স">$&</sub>'],
    [/Student Guardian/gi, '<sub alias="স্টুডেন্ট গার্ডিয়ান">$&</sub>'],
    [/Student Visa/gi, '<sub alias="স্টুডেন্ট ভিসা">$&</sub>'],
    [/subclass 590/gi, '<sub alias="সাবক্লাস পাঁচশ নব্বই">$&</sub>'],
    [/subclass 500/gi, '<sub alias="সাবক্লাস পাঁচশ">$&</sub>'],
    [/Australia/gi, '<sub alias="অস্ট্রেলিয়া">$&</sub>'],
    [/IELTS/gi, '<sub alias="আইইএলটিএস">$&</sub>'],
    [/PTE/gi, '<sub alias="পিটিই">$&</sub>']
  ];
  for (const [pattern, replacement] of replacements) safe = safe.replace(pattern, replacement);
  return safe;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const slug = String(req.query?.slug || "");
  if (slug !== PROOF_SLUG) return res.status(404).json({ ok: false, error: "Audio proof not available for this article yet" });

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ ok: false, error: "Azure Speech is not configured" });
  }

  try {
    const filePath = path.join(process.cwd(), "data", "insights-auto.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const post = (data.posts || []).find(item => item.slug === slug);
    if (!post) return res.status(404).json({ ok: false, error: "Article not found" });

    const text = stripHtml((post.title_bn || "") + ". " + (post.body_bn || ""));
    const spoken = pronunciationMarkup(text);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="bn-BD"><voice name="bn-BD-PradeepNeural"><prosody rate="+4%">${spoken}</prosody></voice></speak>`;

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
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("CDN-Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("News audio error", error);
    return res.status(500).json({ ok: false, error: "Audio generation error" });
  }
};
