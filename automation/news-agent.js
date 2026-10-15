#!/usr/bin/env node

const BASE_URL = process.env.LIZON_BASE_URL || "https://www.mylizon.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SECRET = process.env.NEWS_AUTOMATION_SECRET;
const RUN_ID = process.env.GITHUB_RUN_ID ? `gh-${process.env.GITHUB_RUN_ID}` : `local-${Date.now()}`;
const MODEL_PRIMARY = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.1-flash-lite";
const MODEL_FALLBACK = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash";

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

const TRUSTED_GUIDE_HOSTS = new Set();
const ALLOWED_SOURCE_HOSTS = [
  "immi.homeaffairs.gov.au","homeaffairs.gov.au","immigration.govt.nz","canada.ca","gov.uk",
  "state.gov","uscis.gov","irishimmigration.ie","ind.nl","migri.fi","migrationsverket.se","udi.no",
  "education.ec.europa.eu","europa.eu","ielts.org","britishcouncil.org","idp.com","ielts.idp.com",
  "cambridgeenglish.org","pearsonpte.com","pearson.com"
];

const COUNTRY_IDS = {
  "australia":"australia","new zealand":"newzealand","newzealand":"newzealand","united kingdom":"uk","uk":"uk",
  "canada":"canada","united states":"usa","united states of america":"usa","usa":"usa","ireland":"ireland",
  "belgium":"belgium","switzerland":"switzerland","denmark":"denmark","finland":"finland","netherlands":"netherlands",
  "norway":"norway","sweden":"sweden","france":"france","poland":"poland","spain":"spain","austria":"austria",
  "croatia":"croatia","germany":"germany","greece":"greece","italy":"italy","lithuania":"lithuania","estonia":"estonia",
  "hungary":"hungary","malta":"malta","india":"india","china":"china","turkey":"turkey","türkiye":"turkey",
  "united arab emirates":"uae","uae":"uae","latvia":"latvia","romania":"romania","czech republic":"czech","czechia":"czech",
  "portugal":"portugal","slovenia":"slovenia","serbia":"serbia","slovakia":"slovakia","bulgaria":"bulgaria",
  "singapore":"singapore","qatar":"qatar","saudi arabia":"saudi-arabia","thailand":"thailand","japan":"japan",
  "south korea":"southkorea","korea":"southkorea"
};
function canonicalCountry(value){
  const key=String(value||"").trim().toLowerCase();
  return COUNTRY_IDS[key] || (Object.values(COUNTRY_IDS).includes(key)?key:"");
}

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
    return TRUSTED_GUIDE_HOSTS.has(h) || ALLOWED_SOURCE_HOSTS.some(x => h === x || h.endsWith("." + x));
  }catch{return false}
}

function stripFence(text){
  return String(text||"").replace(/^\s*```(?:json)?/i,"").replace(/```\s*$/,"").trim();
}

function pickText(data){
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "";
}

const CANDIDATE_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    candidates:{
      type:"array",
      maxItems:8,
      items:{
        type:"object",
        additionalProperties:false,
        properties:{
          category:{type:"string",enum:["study-abroad","ielts","pte"]},
          content_type:{type:"string",enum:["news","guide","problem-solution","exam-intelligence","opportunity","outlook","announcement"]},
          country:{type:"string"},
          importance:{type:"string",enum:["critical","important","useful","general"]},
          source_name:{type:"string"},
          source_url:{type:"string"},
          source_verified:{type:"boolean"},
          reason:{type:"string"},
          facts:{type:"array",items:{type:"string"},maxItems:8}
        },
        required:["category","content_type","country","importance","source_name","source_url","source_verified","reason","facts"]
      }
    }
  },
  required:["candidates"]
};

const ARTICLE_SCHEMA = {
  type:"object",
  additionalProperties:false,
  properties:{
    articles:{
      type:"array",
      maxItems:5,
      items:{
        type:"object",
        additionalProperties:false,
        properties:{
          slug:{type:"string"},
          title_bn:{type:"string"},
          title_en:{type:"string"},
          excerpt_bn:{type:"string"},
          excerpt_en:{type:"string"},
          body_bn:{type:"string"},
          body_en:{type:"string"},
          category:{type:"string",enum:["study-abroad","ielts","pte"]},
          content_type:{type:"string",enum:["news","guide","problem-solution","exam-intelligence","opportunity","outlook","announcement"]},
          country:{type:"string"},
          keywords:{type:"string"},
          source_name:{type:"string"},
          source_url:{type:"string"},
          source_verified:{type:"boolean"},
          importance:{type:"string",enum:["critical","important","useful","general"]},
          featured:{type:"boolean"},
          ai_confidence:{type:"number",minimum:0.8,maximum:0.98}
        },
        required:["slug","title_bn","title_en","excerpt_bn","excerpt_en","body_bn","body_en","category","content_type","country","keywords","source_name","source_url","source_verified","importance","featured","ai_confidence"]
      }
    }
  },
  required:["articles"]
};

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

async function gemini(model, prompt, schema){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  let lastError;

  for(let attempt=1;attempt<=2;attempt++){
    try{
      const body = {
        contents:[{role:"user",parts:[{text:prompt}]}],
        generationConfig:{
          temperature:0.1,
          responseFormat:{
            text:{
              mimeType:"APPLICATION_JSON",
              schema
            }
          }
        }
      };

      const r = await fetch(url,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(body),
        signal:AbortSignal.timeout(180000)
      });
      const txt = await r.text();

      if(!r.ok){
        const err=new Error(`Gemini ${model} failed ${r.status}: ${txt.slice(0,700)}`);
        if([429,500,502,503,504].includes(r.status) && attempt<2){
          console.warn(`Gemini ${model} temporary error on attempt ${attempt}; retrying...`);
          await sleep(8000);
          continue;
        }
        throw err;
      }

      const data=JSON.parse(txt);
      const raw=stripFence(pickText(data));
      if(!raw) throw new Error(`Gemini ${model} returned no text`);

      try{
        return JSON.parse(raw);
      }catch(parseError){
        if(attempt<2){
          console.warn(`Gemini ${model} returned invalid JSON on attempt ${attempt}; retrying...`);
          await sleep(3000);
          continue;
        }
        throw parseError;
      }
    }catch(e){
      lastError=e;
      if(attempt<2 && /timeout|aborted/i.test(String(e.message||e))){
        await sleep(5000);
        continue;
      }
      if(attempt>=2) break;
    }
  }

  throw lastError || new Error(`Gemini ${model} failed`);
}

async function geminiWithFallback(prompt, schema){
  try{
    return await gemini(MODEL_PRIMARY,prompt,schema);
  }catch(e){
    console.warn("Primary Gemini model failed, trying fallback:",e.message);
    return await gemini(MODEL_FALLBACK,prompt,schema);
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
      country:source.country || "",
      source_name:source.name,
      source_url:r.url || source.url,
      text: source.compact ? text.slice(0,1800) : text,
      links:extractLinks(html,r.url || source.url).slice(0,30)
    };
  }catch(e){
    console.warn("Source fetch failed:",source.name,e.message);
    return null;
  }
}

async function discoverCountrySources(){
  const out=[];
  try{
    const r=await fetch(`${BASE_URL}/data/studyabroad-countries.json`,{headers:{"accept":"application/json"},signal:AbortSignal.timeout(15000)});
    if(!r.ok) return out;
    const countries=await r.json();
    for(let i=0;i<countries.length;i+=6){
      const batch=await Promise.all(countries.slice(i,i+6).map(async country=>{
        try{
          const pageUrl=new URL(country.page,BASE_URL).toString();
          const pr=await fetch(pageUrl,{headers:{"user-agent":"Mozilla/5.0 LizOnNewsBot/1.0"},signal:AbortSignal.timeout(12000)});
          if(!pr.ok)return [];
          const html=await pr.text();
          const sourceStart=Math.max(html.search(/id=["']sources["']/i),html.search(/SOURCE CENTRE|OFFICIAL SOURCES/i));
          const sourceHtml=sourceStart>=0?html.slice(sourceStart,sourceStart+24000):html.slice(-26000);
          const links=extractLinks(sourceHtml,pageUrl)
            .filter(x=>{
              try{
                const h=new URL(x.url).hostname.toLowerCase().replace(/^www\./,"");
                return !/mylizon\.com|wa\.me|facebook\.com|youtube\.com|instagram\.com|tiktok\.com/i.test(h);
              }catch{return false}
            })
            .slice(0,2);
          links.forEach(x=>{try{TRUSTED_GUIDE_HOSTS.add(new URL(x.url).hostname.toLowerCase().replace(/^www\./,""))}catch{}});
          return links.map((x,index)=>({
            category:"study-abroad",
            country:country.id,
            name:`${country.name} official source ${index+1}`,
            url:x.url,
            compact:true
          }));
        }catch{return []}
      }));
      out.push(...batch.flat());
      await sleep(180);
    }
  }catch(e){console.warn("Country source discovery failed:",e.message)}
  return out;
}

async function buildCorpus(){
  const chunks=[];
  const countrySources=await discoverCountrySources();
  const all=[...SOURCES,...countrySources].slice(0,48);
  for(let i=0;i<all.length;i+=6){
    const batch=await Promise.all(all.slice(i,i+6).map(fetchSource));
    chunks.push(...batch.filter(Boolean));
    await sleep(250);
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

const TODAY = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
function dhakaDate(date){
  if(!date || Number.isNaN(new Date(date).getTime())) return "";
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(date));
}

const CORE_RULES = `
You are the LizOn Education News Desk for Bangladeshi students.
Today is ${TODAY}.
Research all three verticals: Study Abroad, IELTS and PTE using ONLY the official-source extracts supplied below.
Publish only material that changes what a Bangladeshi student should know, decide, prepare, spend, avoid, practise or do next. For a country-specific Study Abroad item, set country to the canonical LizOn destination id such as australia, newzealand, uk, canada, germany, qatar, saudi-arabia, thailand, japan or southkorea. Use an empty country only when the item is genuinely multi-country or global.
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
    country:s.country || "",
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

  return await geminiWithFallback(prompt,CANDIDATE_SCHEMA);
}

async function writeArticles(candidates, existing){
  const clean=[];
  for(const c of candidates || []){
    if(!c || !["study-abroad","ielts","pte"].includes(c.category)) continue;
    if(!c.source_url || !hostAllowed(c.source_url)) continue;
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

  const result = await geminiWithFallback(prompt,ARTICLE_SCHEMA);
  return (result.articles || []).slice(0,3);
}

async function main(){
  let published=0,rejected=0;
  await logRun("started",{researched:{study_abroad:false,ielts:false,pte:false}});

  try{
    const existing=await fetchExisting();
    const todayPublished=existing.filter(p=>p.ai_generated===true && dhakaDate(p.published_at)===TODAY);
    if(todayPublished.length){
      console.log(`Daily AI news already published for ${TODAY} Asia/Dhaka: ${todayPublished.length}; skipping retry.`);
      await logRun("completed",{published_count:todayPublished.length,message:"Already published today; scheduled retry skipped"});
      return;
    }
    const corpus=await buildCorpus();

    const coverage={
      study_abroad:corpus.filter(x=>x.category==="study-abroad").length,
      ielts:corpus.filter(x=>x.category==="ielts").length,
      pte:corpus.filter(x=>x.category==="pte").length
    };

    console.log("Official sources fetched:",coverage);
    if(corpus.length<2) throw new Error("Too few official sources were reachable to research safely");

    const researchResult=await research(existing,corpus);
    const candidates=researchResult.candidates || [];

    const researched={
      study_abroad:coverage.study_abroad>0,
      ielts:coverage.ielts>0,
      pte:coverage.pte>0
    };

    const articles=await writeArticles(candidates,existing);

    for(const article of articles){
      if(article.category==="study-abroad") article.country=canonicalCountry(article.country);
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

    if(!published) throw new Error("No article published for today: all candidates rejected, duplicate, or unavailable. Retry required.");

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
