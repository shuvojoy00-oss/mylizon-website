#!/usr/bin/env node

const BASE_URL = process.env.LIZON_BASE_URL || "https://www.mylizon.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SECRET = process.env.NEWS_AUTOMATION_SECRET;
const RUN_ID = process.env.GITHUB_RUN_ID ? `gh-${process.env.GITHUB_RUN_ID}` : `local-${Date.now()}`;
const MODEL_SEARCH = process.env.GEMINI_SEARCH_MODEL || "gemini-2.5-flash";
const MODEL_FALLBACK = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");
if (!SECRET) throw new Error("NEWS_AUTOMATION_SECRET is missing");

const SOURCE_PAGES = [
  "https://immi.homeaffairs.gov.au/news-media/archive",
  "https://www.immigration.govt.nz/about-us/news-centre/",
  "https://www.canada.ca/en/immigration-refugees-citizenship/news.html",
  "https://www.gov.uk/government/organisations/uk-visas-and-immigration",
  "https://travel.state.gov/content/travel/en/News/visas-news.html",
  "https://education.ec.europa.eu/news",
  "https://ielts.org/news-and-insights",
  "https://takeielts.britishcouncil.org/take-ielts/prepare",
  "https://ielts.idp.com/about/news-and-articles",
  "https://www.cambridgeenglish.org/news/",
  "https://www.pearsonpte.com/news"
];

const ALLOWED_SOURCE_HOSTS = [
  "immi.homeaffairs.gov.au","homeaffairs.gov.au","immigration.govt.nz","canada.ca","gov.uk",
  "state.gov","uscis.gov","ice.gov","studyinthestates.dhs.gov","education.ec.europa.eu",
  "europa.eu","ielts.org","britishcouncil.org","idp.com","ielts.idp.com","cambridgeenglish.org",
  "pearsonpte.com","pearson.com"
];

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g," ").trim(); }
function similar(a,b){
  const A = new Set(norm(a).split(/\s+/).filter(Boolean));
  const B = new Set(norm(b).split(/\s+/).filter(Boolean));
  if(!A.size || !B.size) return 0;
  let same=0; for(const x of A) if(B.has(x)) same++;
  return same / Math.max(A.size,B.size);
}
function hostAllowed(url){
  try{
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./,"");
    return ALLOWED_SOURCE_HOSTS.some(x => h === x || h.endsWith("." + x));
  }catch{return false}
}
function stripFence(text){
  return String(text||"").replace(/^\s*```(?:json)?/i,"").replace(/```\s*$/,"").trim();
}
function pickText(data){
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "";
}
async function gemini(model, prompt, tools){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const body = {
    contents:[{role:"user",parts:[{text:prompt}]}],
    generationConfig:{temperature:0.2,responseMimeType:"application/json"}
  };
  if(tools?.length) body.tools = tools;
  const r = await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const txt = await r.text();
  if(!r.ok) throw new Error(`Gemini ${model} failed ${r.status}: ${txt.slice(0,500)}`);
  const data = JSON.parse(txt);
  const raw = stripFence(pickText(data));
  if(!raw) throw new Error(`Gemini ${model} returned no text`);
  return JSON.parse(raw);
}
async function fetchExisting(){
  const r = await fetch(`${BASE_URL}/api/content?limit=100`,{headers:{"accept":"application/json"}});
  if(!r.ok) throw new Error(`Cannot read current news library: ${r.status}`);
  const j = await r.json();
  return j.posts || [];
}
async function sourceReachable(url){
  try{
    const r = await fetch(url,{method:"GET",redirect:"follow",headers:{"user-agent":"Mozilla/5.0 LizOnNewsBot/1.0"},signal:AbortSignal.timeout(15000)});
    return (r.ok || [401,403,405].includes(r.status)) && /^https?:/i.test(r.url);
  }catch{return false}
}
async function ingest(post){
  const r = await fetch(`${BASE_URL}/api/news-ingest`,{
    method:"POST",
    headers:{"content-type":"application/json","x-news-automation-secret":SECRET},
    body:JSON.stringify(post)
  });
  const text = await r.text();
  let data={}; try{data=JSON.parse(text)}catch{}
  if(r.status===409 && data.duplicate) return {duplicate:true,post:data.post};
  if(!r.ok) throw new Error(`Ingest failed ${r.status}: ${text.slice(0,800)}`);
  return data;
}
async function logRun(status, details={}){
  try{
    await fetch(`${BASE_URL}/api/news-ingest`,{
      method:"POST",
      headers:{"content-type":"application/json","x-news-automation-secret":SECRET},
      body:JSON.stringify({action:"run-log",run_id:RUN_ID,status,...details})
    });
  }catch(e){ console.warn("Run log failed:",e.message); }
}

const TODAY = new Date().toISOString().slice(0,10);
const CORE_RULES = `
You are the LizOn Education News Desk for Bangladeshi students.
Today is ${TODAY}.
Research all three verticals: Study Abroad, IELTS and PTE.
Publish only material that changes what a Bangladeshi student should know, decide, prepare, spend, avoid, practise or do next.
Primary official sources must be preferred. Never invent dates, policies, reported questions or scoring changes.
Policy status must be distinguished as Proposed, Announced, Confirmed or Effective where relevant.
Recently reported questions must be labelled Recently Reported and never Official unless an official provider published them.
Prediction/Outlook must be clearly labelled and never presented as confirmed.
Reject competitor seminar promotions, agency marketing, rumors and filler.
When there is no genuinely new breaking development, it is acceptable to create one useful current exam-intelligence/problem-solution/guide article grounded in an official current source, but never falsely call it today's news.
Write natural Bangla first, retaining English official terms where useful, plus a complete English version.
Article structure where relevant: what happened/current rule; why it matters; who is affected; what happens next; what a Bangladeshi student should do now.
Return JSON only.
`;

async function research(existing){
  const recent = existing.slice(0,40).map(p=>({title_en:p.title_en,title_bn:p.title_bn,category:p.category,source_url:p.source_url,published_at:p.published_at}));
  const schema = `
Return {"candidates":[...]} with 1 to 5 candidates total. Each candidate:
{
 "category":"study-abroad|ielts|pte",
 "content_type":"news|guide|problem-solution|recent-questions|exam-intelligence|opportunity|outlook|announcement",
 "country":"",
 "importance":"critical|important|useful|general",
 "source_name":"",
 "source_url":"direct official https URL",
 "source_verified":true,
 "reason":"",
 "facts":["..."]
}
Aim for editorial variety. At most 3 candidates should ultimately be publishable.
Existing recent library to avoid duplicating:
${JSON.stringify(recent)}
`;

  try{
    return await gemini(MODEL_SEARCH, CORE_RULES + schema + "\nUse Google Search grounding and verify direct primary sources.", [{google_search:{}}]);
  }catch(e){
    console.warn("Search-grounded model unavailable, using free URL-context fallback:", e.message);
    const urls = SOURCE_PAGES.join("\n");
    const fallbackPrompt = CORE_RULES + schema + `
You do not have search. Inspect only the official source pages below using URL context. Do not infer a new policy unless the page actually supports it. If these pages contain no fresh news, choose a useful current official guidance topic rather than fabricating news.
Official source pages:
${urls}`;
    return await gemini(MODEL_FALLBACK, fallbackPrompt, [{url_context:{}}]);
  }
}

async function writeArticles(candidates, existing){
  const clean = [];
  for(const c of candidates || []){
    if(!c || !["study-abroad","ielts","pte"].includes(c.category)) continue;
    if(!c.source_url || !hostAllowed(c.source_url)) continue;
    if(existing.some(p => p.source_url && String(p.source_url).toLowerCase()===String(c.source_url).toLowerCase())) continue;
    if(existing.some(p => similar(p.title_en||p.title_bn,c.reason||"")>0.8)) continue;
    if(!(await sourceReachable(c.source_url))) continue;
    clean.push(c);
    if(clean.length>=3) break;
  }
  if(!clean.length) return [];

  const prompt = CORE_RULES + `
Using only the candidate facts and source URLs below, write publishable articles. Do not add unsupported factual claims.
Candidates:
${JSON.stringify(clean)}

Return {"articles":[...]}.
Each article must contain:
slug, title_bn, title_en, excerpt_bn, excerpt_en, body_bn, body_en, category, content_type, country, keywords, source_name, source_url, source_verified, importance, featured, ai_confidence.
body_bn and body_en must use only safe concise HTML tags: p,h2,h3,strong,ul,ol,li,blockquote.
Do not place external links inside body HTML.
Set source_verified true only because the candidate already passed official-source validation.
Set ai_confidence between 0.80 and 0.98.
Only one article may have featured=true, and only if clearly important.
`;
  const result = await gemini(MODEL_FALLBACK, prompt, []);
  return (result.articles || []).slice(0,3);
}

async function main(){
  let published=0,rejected=0;
  await logRun("started",{researched:{study_abroad:false,ielts:false,pte:false}});
  try{
    const existing = await fetchExisting();
    const researchResult = await research(existing);
    const candidates = researchResult.candidates || [];
    const researched = {
      study_abroad:candidates.some(x=>x.category==="study-abroad"),
      ielts:candidates.some(x=>x.category==="ielts"),
      pte:candidates.some(x=>x.category==="pte")
    };
    const articles = await writeArticles(candidates, existing);

    for(const article of articles){
      if(!article.source_verified || !hostAllowed(article.source_url)){ rejected++; continue; }
      if(existing.some(p=>similar(p.title_en||p.title_bn,article.title_en||article.title_bn)>0.82)){ rejected++; continue; }
      const result = await ingest(article);
      if(result.duplicate){ rejected++; console.log("Duplicate skipped:", article.title_en); }
      else { published++; console.log("Published:", result.post?.slug || article.title_en); }
      await sleep(800);
    }

    if(!published) console.log("No article passed all publication checks today.");
    await logRun("completed",{researched,published_count:published,rejected_count:rejected,message:published ? `Published ${published} article(s)` : "No candidate passed all checks"});
  }catch(e){
    await logRun("failed",{published_count:published,rejected_count:rejected,message:e.message});
    throw e;
  }
}

main().catch(e=>{console.error(e);process.exit(1)});
