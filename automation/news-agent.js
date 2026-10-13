#!/usr/bin/env node

const BASE_URL = process.env.LIZON_BASE_URL || "https://www.mylizon.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SECRET = process.env.NEWS_AUTOMATION_SECRET;
const RUN_ID = process.env.GITHUB_RUN_ID ? `gh-${process.env.GITHUB_RUN_ID}` : `local-${Date.now()}`;
const MODEL_PRIMARY = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.8-flash";
const MODEL_FALLBACK = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.7-flash";

if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");
if (!SECRET) throw new Error("NEWS_AUTOMATION_SECRET is missing");

const SOURCES = [
  {category:"study-abroad", name:"Australia Department of Home Affairs", url:"https://immi.homeaffairs.gov.au/news-media/archive"},
  {category:"study-abroad", name:"Immigration New Zealand", url:"https://www.immigration.govt.nz/about-us/news-centre/"},
  {category:"study-abroad", name:"IRCC Canada", url:"https://www.canada.ca/en/immigration-refugees-citizenship/news.html"},
  {category:"study-abroad", name:"UK Visas and Immigration", url:"https://www.gov.uk/government/organisations/uk-visas-and-immigration"},
  {category:"study-abroad", name:"US Department of State Visa News", url:"https://travel.state.gov/content/travel/en/News/visas-news.html"},
  {category:"study-abroad", name:"USCIS News", url:"https://www.uscis.gov/newsroom/all-news"},
  {category:"study-abroad", name:"Irish Immigration", url:"https://www.irishimmigration.ie/category/news-and-updates/"},
  {category:"study-abroad", name:"Netherlands IND", url:"https://ind.nl/en/news"},
  {category:"study-abroad", name:"Finland Immigration Service", url:"https://migri.fi/en/news"},
  {category:"study-abroad", name:"Swedish Migration Agency", url:"https://www.migrationsverket.se/English/About-the-Migration-Agency/News-archive.html"},
  {category:"study-abroad", name:"Norway UDI", url:"https://www.udi.no/en/important-messages/"},
  {category:"study-abroad", name:"European Education Area", url:"https://education.ec.europa.eu/news"},
  {category:"ielts", name:"IELTS", url:"https://ielts.org/news-and-insights"},
  {category:"ielts", name:"British Council IELTS", url:"https://takeielts.britishcouncil.org/take-ielts/prepare"},
  {category:"ielts", name:"IDP IELTS", url:"https://ielts.idp.com/about/news-and-articles"},
  {category:"ielts", name:"Cambridge English", url:"https://www.cambridgeenglish.org/news/"},
  {category:"pte", name:"Pearson PTE", url:"https://www.pearsonpte.com/news"},
  {category:"pte", name:"Pearson PTE Preparation", url:"https://www.pearsonpte.com/preparation"}
];

const ALLOWED_SOURCE_HOSTS = [
  "immi.homeaffairs.gov.au","homeaffairs.gov.au","immigration.govt.nz","canada.ca","gov.uk",
  "state.gov","uscis.gov","irishimmigration.ie","ind.nl","migri.fi","migrationsverket.se","udi.no",
  "education.ec.europa.eu","europa.eu","ielts.org","britishcouncil.org","idp.com","ielts.idp.com",
  "cambridgeenglish.org","pearsonpte.com","pearson.com"
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

function decodeEntities(s){
  return String(s||"")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">");
}

function htmlToText(html){
  return decodeEntities(String(html||"")
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," "))
    .trim();
}

function extractLinks(html, baseUrl){
  const links=[];
  const re=/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while((m=re.exec(String(html||""))) && links.length<60){
    try{
      const url=new URL(m[1],baseUrl).toString();
      if(!/^https:\/\//i.test(url) || !hostAllowed(url)) continue;
      const label=htmlToText(m[2]).slice(0,180);
      if(label.length<4) continue;
      if(!links.some(x=>x.url===url)) links.push({label,url});
    }catch{}
  }
  return links;
}

async function gemini(model, prompt){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const body = {
    contents:[{role:"user",parts:[{text:prompt}]}],
    generationConfig:{temperature:0.15,responseMimeType:"application/json"}
  };
  const r = await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const txt = await r.text();
  if(!r.ok) throw new Error(`Gemini ${model} failed ${r.status}: ${txt.slice(0,500)}`);
  const data = JSON.parse(txt);
  const raw = stripFence(pickText(data));
  if(!raw) throw new Error(`Gemini ${model} returned no text`);
  return JSON.parse(raw);
}

async function geminiWithFallback(prompt){
  try{
    return await gemini(MODEL_PRIMARY,prompt);
  }catch(e){
    console.warn("Primary Gemini model failed, trying fallback:",e.message);
    return await gemini(MODEL_FALLBACK,prompt);
  }
}

async function fetchExisting(){
  const r = await fetch(`${BASE_URL}/api/content?limit=100`,{headers:{"accept":"application/json"}});
  if(!r.ok) throw new Error(`Cannot read current news library: ${r.status}`);
  const j = await r.json();
  return j.posts || [];
}

async function fetchSource(source){
  try{
    const r = await fetch(source.url,{
      method:"GET",
      redirect:"follow",
      headers:{
        "user-agent":"Mozilla/5.0 (compatible; LizOnNewsBot/1.0; +https://www.mylizon.com/news.html)",
        "accept":"text/html,application/xhtml+xml"
      },
      signal:AbortSignal.timeout(18000)
    });
    if(!r.ok) return null;
    const html=(await r.text()).slice(0,700000);
    const text=htmlToText(html).slice(0,7000);
    if(text.length<250) return null;
    return {
      category:source.category,
      source_name:source.name,
      source_url:r.url || source.url,
      text,
      links:extractLinks(html,r.url || source.url).slice(0,30)
    };
  }catch(e){
    console.warn("Source fetch failed:",source.name,e.message);
    return null;
  }
}

async function buildCorpus(){
  const chunks=[];
  for(let i=0;i<SOURCES.length;i+=6){
    const batch=await Promise.all(SOURCES.slice(i,i+6).map(fetchSource));
    chunks.push(...batch.filter(Boolean));
    await sleep(300);
  }
  return chunks;
}

async function sourceReachable(url){
  try{
    const r = await fetch(url,{
      method:"GET",
      redirect:"follow",
      headers:{"user-agent":"Mozilla/5.0 LizOnNewsBot/1.0"},
      signal:AbortSignal.timeout(15000)
    });
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
Research all three verticals: Study Abroad, IELTS and PTE using ONLY the official-source extracts supplied below.
Publish only material that changes what a Bangladeshi student should know, decide, prepare, spend, avoid, practise or do next.
Never invent dates, policies, reported questions, score rules or source URLs.
Policy status must be distinguished as Proposed, Announced, Confirmed or Effective where relevant.
Recently reported questions must never be invented. Only use them if an official supplied source explicitly supports them.
Prediction or Outlook must be clearly labelled and never presented as confirmed.
Reject competitor seminar promotions, agency marketing, rumors and filler.
When there is no genuinely new breaking development, it is acceptable to create a useful current exam-intelligence, problem-solution or guide article grounded in an official current source. Never falsely call evergreen guidance today's news.
Write natural Bangla first, retaining English official terms where useful, plus a complete English version.
Article structure where relevant: what happened or current rule; why it matters; who is affected; what happens next; what a Bangladeshi student should do now.
Return JSON only.
`;

async function research(existing, corpus){
  const recent = existing.slice(0,50).map(p=>({
    title_en:p.title_en,title_bn:p.title_bn,category:p.category,
    source_url:p.source_url,published_at:p.published_at
  }));

  const compactCorpus = corpus.map(s=>({
    category:s.category,
    source_name:s.source_name,
    source_url:s.source_url,
    text:s.text,
    links:s.links
  }));

  const prompt = CORE_RULES + `
Official source extracts:
${JSON.stringify(compactCorpus)}

Recent LizOn library to avoid duplicating:
${JSON.stringify(recent)}

Return {"candidates":[...]} with 1 to 5 candidates total.
Each candidate:
{
 "category":"study-abroad|ielts|pte",
 "content_type":"news|guide|problem-solution|exam-intelligence|opportunity|outlook|announcement",
 "country":"",
 "importance":"critical|important|useful|general",
 "source_name":"",
 "source_url":"an exact HTTPS URL present in the supplied source_url or links data",
 "source_verified":true,
 "reason":"",
 "facts":["fact directly supported by supplied source extract"]
}
Aim for editorial variety. Prefer truly recent official developments. If none are available, prefer one useful current official guidance article rather than weak filler.
`;

  return await geminiWithFallback(prompt);
}

async function writeArticles(candidates, existing){
  const clean=[];
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
Using ONLY the candidate facts and source URLs below, write publishable articles. Do not add unsupported factual claims.
Candidates:
${JSON.stringify(clean)}

Return {"articles":[...]}.
Each article must contain:
slug, title_bn, title_en, excerpt_bn, excerpt_en, body_bn, body_en, category, content_type, country, keywords, source_name, source_url, source_verified, importance, featured, ai_confidence.
body_bn and body_en must use only these safe HTML tags: p,h2,h3,strong,ul,ol,li,blockquote.
Do not place external links inside body HTML.
Set source_verified=true.
Set ai_confidence between 0.80 and 0.98.
Only one article may have featured=true, and only if clearly important.
Do not describe a guide or exam-intelligence article as breaking news.
`;

  const result = await geminiWithFallback(prompt);
  return (result.articles || []).slice(0,3);
}

async function main(){
  let published=0,rejected=0;
  await logRun("started",{researched:{study_abroad:false,ielts:false,pte:false}});

  try{
    const existing=await fetchExisting();
    const corpus=await buildCorpus();

    const coverage={
      study_abroad:corpus.filter(x=>x.category==="study-abroad").length,
      ielts:corpus.filter(x=>x.category==="ielts").length,
      pte:corpus.filter(x=>x.category==="pte").length
    };

    console.log("Official sources fetched:",coverage);
    if(corpus.length<4) throw new Error("Too few official sources were reachable to research safely");

    const researchResult=await research(existing,corpus);
    const candidates=researchResult.candidates || [];

    const researched={
      study_abroad:coverage.study_abroad>0,
      ielts:coverage.ielts>0,
      pte:coverage.pte>0
    };

    const articles=await writeArticles(candidates,existing);

    for(const article of articles){
      if(!article.source_verified || !hostAllowed(article.source_url)){ rejected++; continue; }
      if(existing.some(p=>similar(p.title_en||p.title_bn,article.title_en||article.title_bn)>0.82)){ rejected++; continue; }

      const result=await ingest(article);
      if(result.duplicate){
        rejected++;
        console.log("Duplicate skipped:",article.title_en);
      }else{
        published++;
        console.log("Published:",result.post?.slug || article.title_en);
      }
      await sleep(800);
    }

    if(!published) console.log("No article passed all publication checks today.");

    await logRun("completed",{
      researched,
      published_count:published,
      rejected_count:rejected,
      message:published ? `Published ${published} article(s)` : "No candidate passed all checks"
    });
  }catch(e){
    await logRun("failed",{published_count:published,rejected_count:rejected,message:e.message});
    throw e;
  }
}

main().catch(e=>{
  console.error(e);
  process.exit(1);
});
