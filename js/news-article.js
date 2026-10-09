(()=>{
const root=document.getElementById("news-article"),params=new URLSearchParams(location.search),slug=params.get("slug"),previewId=params.get("admin_preview");let post,lang="bn",countries=[],allPosts=[],audioPlayer=null,audioObjectUrl=null;
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const topicLinks=[["IELTS Writing","ielts.html"],["IELTS Speaking","ielts.html"],["IELTS Reading","ielts.html"],["IELTS Listening","ielts.html"],["IELTS","ielts.html"],["PTE Reading","pte.html"],["PTE Speaking","pte.html"],["PTE Writing","pte.html"],["PTE Listening","pte.html"],["PTE","pte.html"],["Study Abroad","studyabroad.html"],["Check Eligibility","assessment.html"],["eligibility","assessment.html"],["এলিজিবিলিটি","assessment.html"],["ATAS","uk.html"],["CAS","uk.html"],["Graduate Route","uk.html"],["CoE","australia.html"],["OSHC","australia.html"],["GS requirement","australia.html"],["Student Visa 500","australia.html"],["study permit","canada.html"],["F-1","usa.html"],["Student Pass","singapore.html"]];
const countryBn={australia:"অস্ট্রেলিয়া",newzealand:"নিউজিল্যান্ড",uk:"যুক্তরাজ্য",canada:"কানাডা",usa:"আমেরিকা",ireland:"আয়ারল্যান্ড",belgium:"বেলজিয়াম",switzerland:"সুইজারল্যান্ড",denmark:"ডেনমার্ক",finland:"ফিনল্যান্ড",netherlands:"নেদারল্যান্ডস",norway:"নরওয়ে",sweden:"সুইডেন",france:"ফ্রান্স",poland:"পোল্যান্ড",spain:"স্পেন",austria:"অস্ট্রিয়া",croatia:"ক্রোয়েশিয়া",germany:"জার্মানি",greece:"গ্রিস",italy:"ইতালি",lithuania:"লিথুয়ানিয়া",estonia:"এস্তোনিয়া",hungary:"হাঙ্গেরি",malta:"মাল্টা",india:"ভারত",china:"চীন",turkey:"তুরস্ক",uae:"আমিরাত",latvia:"লাটভিয়া",romania:"রোমানিয়া",czech:"চেক রিপাবলিক",portugal:"পর্তুগাল",slovenia:"স্লোভেনিয়া",serbia:"সার্বিয়া",slovakia:"স্লোভাকিয়া",bulgaria:"বুলগেরিয়া",singapore:"সিঙ্গাপুর",qatar:"কাতার","saudi-arabia":"সৌদি আরব",thailand:"থাইল্যান্ড",japan:"জাপান",southkorea:"দক্ষিণ কোরিয়া"};
function linkBody(el){
 let used=0;const linked=new Set(),links=[...topicLinks];countries.forEach(c=>{links.push([c.name,c.page]);if(countryBn[c.id])links.push([countryBn[c.id],c.page])});
 links.sort((a,b)=>b[0].length-a[0].length);
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 for(const n of nodes){if(used>=10)break;if(n.parentElement.closest("a,script,style"))continue;for(const [term,url] of links){const key=term.toLowerCase();if(linked.has(key))continue;const i=n.nodeValue.toLowerCase().indexOf(key);if(i<0)continue;const f=document.createDocumentFragment(),before=n.nodeValue.slice(0,i),match=n.nodeValue.slice(i,i+term.length),after=n.nodeValue.slice(i+term.length);if(before)f.append(before);const a=document.createElement("a");a.href=url;a.textContent=match;a.className="article-inline-link";f.append(a);if(after)f.append(after);n.replaceWith(f);linked.add(key);used++;break}}
}
function getVoicesReady(){
 return new Promise(resolve=>{
   let tries=0;
   const finish=()=>{
     const voices=speechSynthesis.getVoices();
     if(voices.length||tries++>12)return resolve(voices);
     setTimeout(finish,120);
   };
   finish();
 });
}
function pickEnglishVoice(voices){
 return voices.find(v=>/^en(-|_)/i.test(v.lang)&&/female|samantha|zira|victoria|ava|serena|google uk english female/i.test(v.name))||
        voices.find(v=>/^en(-|_)/i.test(v.lang))||null;
}
function setListenStatus(message){
 const b=document.getElementById("listen");
 if(b)b.textContent=message;
}
function speakBangla(title,body){
 const u=new SpeechSynthesisUtterance(title+". "+body);
 u.lang="bn-BD";
 u.rate=1.05;
 u.pitch=1;
 u.onend=()=>setListenStatus("▶ শুনুন");
 u.onerror=()=>setListenStatus("▶ শুনুন");
 setListenStatus("■ থামান");
 speechSynthesis.speak(u);
}
async function playGeneratedBangla(title,body){
 if(audioPlayer&&!audioPlayer.paused){
   audioPlayer.pause();
   audioPlayer.currentTime=0;
   setListenStatus("▶ শুনুন");
   return true;
 }
 if(!slug)return false;
 try{
   setListenStatus("লোড হচ্ছে...");
   const response=await fetch("/api/news-audio?slug="+encodeURIComponent(slug),{cache:"default"});
   if(!response.ok)return false;
   const blob=await response.blob();
   if(audioObjectUrl)URL.revokeObjectURL(audioObjectUrl);
   audioObjectUrl=URL.createObjectURL(blob);
   audioPlayer=new Audio(audioObjectUrl);
   audioPlayer.preload="auto";
   audioPlayer.onplay=()=>setListenStatus("■ থামান");
   audioPlayer.onended=()=>setListenStatus("▶ শুনুন");
   audioPlayer.onerror=()=>setListenStatus("▶ শুনুন");
   await audioPlayer.play();
   return true;
 }catch(_){
   return false;
 }
}
async function speakEnglish(title,body){
 const voices=await getVoicesReady();
 const voice=pickEnglishVoice(voices);
 const u=new SpeechSynthesisUtterance(title+". "+body);
 u.lang=voice?.lang||"en-US";
 if(voice)u.voice=voice;
 u.rate=.95;
 u.onend=()=>setListenStatus("▶ Listen");
 u.onerror=()=>setListenStatus("▶ Listen");
 setListenStatus("■ Stop");
 speechSynthesis.speak(u);
}
async function speakCurrent(title,body){
 if(lang==="bn"){
   if(audioPlayer&&!audioPlayer.paused){
     audioPlayer.pause();
     audioPlayer.currentTime=0;
     setListenStatus("▶ শুনুন");
     return;
   }
   const generated=await playGeneratedBangla(title,body);
   if(generated)return;
   if(!("speechSynthesis" in window))return;
   if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();setListenStatus("▶ শুনুন");return}
   speakBangla(title,body);
   return;
 }
 if(!("speechSynthesis" in window))return;
 if(audioPlayer&&!audioPlayer.paused){audioPlayer.pause();audioPlayer.currentTime=0}
 if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();setListenStatus("▶ Listen");return}
 await speakEnglish(title,body);
}
function plain(value){const d=document.createElement("div");d.innerHTML=String(value||"");return d.textContent||d.innerText||""}
function articleText(){return [post?.title_bn,post?.title_en,post?.excerpt_bn,post?.excerpt_en,plain(post?.body_bn),plain(post?.body_en),post?.keywords].filter(Boolean).join(" ").toLowerCase()}
function currentCountryIds(){return String(post?.country||"").split(",").map(x=>x.trim()).filter(Boolean)}
function detectLearningIntent(){
 const text=articleText();
 const modules=["reading","listening","writing","speaking","grammar"];
 const module=modules.find(x=>text.includes(x))||"";
 const topics=[
  ["mcq","MCQ"],["multiple choice","MCQ"],["fill in the blanks","Fill in the Blanks"],["fib","Fill in the Blanks"],
  ["re-order","Re Order Sentences"],["reorder","Re Order Sentences"],["read aloud","Read Aloud"],["repeat sentence","Repeat Sentence"],
  ["describe image","Describe Image"],["write from dictation","Write From Dictation"],["wfd","Write From Dictation"],
  ["cue card","Cue Card"],["task 1","Writing Task 1"],["task 2","Writing Task 2"],["heading","Heading Matching"],
  ["true false not given","True False Not Given"],["tfng","True False Not Given"]
 ];
 const topic=(topics.find(([k])=>text.includes(k))||[])[1]||"";
 return{module,topic};
}
function resourceCard(type,title,desc,url,visual){
 return{kind:"resource",type,title,desc,url,visual:visual||type};
}
function buildResources(){
 const resources=[],ids=currentCountryIds(),intent=detectLearningIntent();
 if(post.category==="study-abroad"){
   ids.slice(0,2).forEach(id=>{
     const c=countries.find(x=>x.id===id);
     if(c)resources.push(resourceCard("Country Guide",`Explore ${c.name}`,c.line||"Admission, costs, visa, work and life after study.",c.page,c.code||c.name.slice(0,2).toUpperCase()));
   });
   if(!ids.length)resources.push(resourceCard("Country Guide","Explore Study Abroad","Compare destinations and understand your options before deciding.","studyabroad.html","GLOBAL"));
   resources.push(resourceCard("Eligibility","Check Your Eligibility","Turn this information into a decision based on your own academic profile, budget and plans.","assessment.html","FIT"));
 }
 if(post.category==="ielts"){
   const specific=[intent.module,intent.topic].filter(Boolean).join(" ");
   resources.push(resourceCard("Free Class",specific?`Free IELTS ${specific} Class`:"Free IELTS Classes","Continue from this article into LizOn's free IELTS teaching inside the website.","ieltsclass.html#mainGrid","IELTS"));
   resources.push(resourceCard("Course","IELTS Courses","Choose the preparation route that fits your level and target score.","ielts.html","IELTS"));
 }
 if(post.category==="pte"){
   const specific=[intent.module,intent.topic].filter(Boolean).join(" ");
   resources.push(resourceCard("Free Class",specific?`Free PTE ${specific} Class`:"Free PTE Classes","Continue from this article into LizOn's free PTE question type classes.","pteclass.html#pte-classes","PTE"));
   resources.push(resourceCard("Course","PTE Courses","See LizOn's score focused PTE preparation options.","pte.html","PTE"));
 }
 return resources;
}
function relatedScore(p){
 if(!p||p.slug===post.slug)return-1;
 let score=0;
 const currentCountries=currentCountryIds(),otherCountries=String(p.country||"").split(",").map(x=>x.trim()).filter(Boolean);
 const overlap=currentCountries.filter(x=>otherCountries.includes(x)).length;
 score+=overlap*12;
 if(p.category===post.category)score+=6;
 if(p.content_type===post.content_type)score+=2;
 const a=new Set(String(post.keywords||"").toLowerCase().split(/[,\s]+/).filter(x=>x.length>3));
 const b=new Set(String(p.keywords||"").toLowerCase().split(/[,\s]+/).filter(x=>x.length>3));
 for(const x of a)if(b.has(x))score+=1;
 if(p.importance==="critical")score+=2;else if(p.importance==="important")score+=1;
 if(p.featured)score+=1;
 return score;
}
function getRelatedNews(limit=5){
 return allPosts.filter(p=>p.slug!==post.slug).map(p=>({p,score:relatedScore(p)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||new Date(b.p.published_at||0)-new Date(a.p.published_at||0)).slice(0,limit).map(x=>x.p);
}
function recVisual(item){
 if(item.kind==="news"&&item.image_url)return`<img src="${esc(item.image_url)}" alt="">`;
 return`<span>${esc(item.visual||item.type||"LIZON")}</span>`;
}
function recMarkup(item,compact=false){
 if(item.kind==="news"){
  const title=item.title_bn||item.title_en||"Read more";
  return`<a class="journey-card ${compact?"journey-card--compact":""}" href="news-article.html?slug=${encodeURIComponent(item.slug)}"><div class="journey-card__visual">${recVisual(item)}</div><div><span class="journey-card__type">News</span><strong>${esc(title)}</strong><small>${esc(item.excerpt_bn||item.excerpt_en||"Related update")}</small></div></a>`;
 }
 return`<a class="journey-card ${compact?"journey-card--compact":""}" href="${esc(item.url)}"><div class="journey-card__visual journey-card__visual--resource">${recVisual(item)}</div><div><span class="journey-card__type">${esc(item.type)}</span><strong>${esc(item.title)}</strong><small>${esc(item.desc)}</small></div></a>`;
}
function renderRecommendations(){
 const rail=document.getElementById("article-context-rail"),discovery=document.getElementById("article-discovery");
 if(!rail||!discovery)return;
 const resources=buildResources(),related=getRelatedNews(6);
 const railItems=[...resources.slice(0,2),...related.slice(0,2).map(p=>({...p,kind:"news"}))].slice(0,4);
 rail.innerHTML=`<div class="journey-rail__head"><span>YOUR NEXT STEP</span><h2>Keep exploring what matters.</h2></div>${railItems.map(x=>recMarkup(x,true)).join("")}`;
 const bottomItems=[...resources,...related.slice(0,4).map(p=>({...p,kind:"news"}))].slice(0,5);
 discovery.innerHTML=`<div class="article-discovery__head"><div><span>CONTINUE FROM HERE</span><h2>More useful for this journey</h2></div><a href="news.html">Explore all News →</a></div><div class="article-discovery__grid">${bottomItems.map(x=>recMarkup(x)).join("")}</div>`;
 const primary=resources[0]||related[0]&&({...related[0],kind:"news"});
 if(primary){
   const body=document.getElementById("body");
   const blocks=body?[...body.children].filter(x=>/^(P|H2|H3|UL|OL|DIV)$/.test(x.tagName)):[];
   if(blocks.length){
     const box=document.createElement("div");
     box.className="article-inline-pick";
     box.innerHTML=`<span class="article-inline-pick__label">Useful next step</span>${recMarkup(primary,true)}`;
     const target=blocks[Math.min(3,blocks.length-1)];
     target.insertAdjacentElement("afterend",box);
   }
 }
}
function render(){
 const title=lang==="bn"?post.title_bn:(post.title_en||post.title_bn),excerpt=lang==="bn"?post.excerpt_bn:(post.excerpt_en||post.excerpt_bn),body=lang==="bn"?post.body_bn:(post.body_en||post.body_bn),countryIds=String(post.country||"").split(",").map(x=>x.trim()).filter(Boolean),countryNames=countryIds.map(id=>(countries.find(c=>c.id===id)||{}).name||id);
 document.title=title+" | LizOn News";
 root.innerHTML=`<header class="article-head"><div class="meta"><span>${post.category==="study-abroad"?"Study Abroad":String(post.category).toUpperCase()}</span>${countryNames.length?`<span>• ${esc(countryNames.join(", "))}</span>`:""}${post.source_verified?'<span>• VERIFIED SOURCE</span>':""}</div><h1>${esc(title)}</h1>${excerpt?`<p class="article-dek">${esc(excerpt)}</p>`:""}<div class="article-actions"><button id="listen">▶ ${lang==="bn"?"শুনুন":"Listen"}</button><button data-lang="bn" class="${lang==="bn"?"active":""}">বাংলা</button><button data-lang="en" class="${lang==="en"?"active":""}">English</button></div></header>${post.image_url?`<img class="article-cover" src="${esc(post.image_url)}" alt="${esc(post.image_alt||"")}"><div class="article-caption">${esc(post.image_caption||"")}${post.image_credit?" · "+esc(post.image_credit):""}</div>`:""}<div class="article-body" id="body">${body}</div>${post.source_url?`<div class="article-source"><strong>${post.source_verified?"Official Source":"Source"}</strong><br><a href="${esc(post.source_url)}" target="_blank" rel="noopener">${esc(post.source_name||post.source_url)}</a></div>`:""}<div class="article-next" id="next"></div>`;
 linkBody(document.getElementById("body"));
 const next=document.getElementById("next"),selected=countryIds.map(id=>countries.find(c=>c.id===id)).filter(Boolean);
 if(post.category==="study-abroad"&&selected.length)next.innerHTML=`<strong>এই ${selected.length>1?"দেশগুলো":"দেশটি"} নিয়ে আরও জানতে চান?</strong><br>${selected.map(c=>`<a href="${c.page}">${esc(c.name)} guide →</a>`).join(" · ")}`;
 else if(post.category==="ielts")next.innerHTML='<strong>IELTS এ এই সমস্যাটি আপনারও হচ্ছে?</strong><br><a href="ieltsclass.html">Free IELTS classes দেখুন →</a> · <a href="ielts.html">IELTS Courses →</a>';
 else if(post.category==="pte")next.innerHTML='<strong>PTE preparation এ সাহায্য দরকার?</strong><br><a href="pteclass.html">Free PTE classes দেখুন →</a> · <a href="pte.html">PTE Courses →</a>';
 root.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{if("speechSynthesis" in window)speechSynthesis.cancel();if(audioPlayer&&!audioPlayer.paused){audioPlayer.pause();audioPlayer.currentTime=0}lang=b.dataset.lang;render()});
 document.getElementById("listen").onclick=()=>speakCurrent(title,document.getElementById("body").innerText);
 renderRecommendations();
}
async function load(){
 if(!slug&&!previewId)throw 0;
 try{countries=await fetch("/data/studyabroad-countries.json").then(r=>r.json())}catch{countries=[]}
 if(previewId){
   try{
     const d=await fetch("/api/content-admin?id="+encodeURIComponent(previewId),{credentials:"same-origin"}).then(r=>r.json());
     if(d.ok){
       post=d.post;
       const banner=document.createElement("div");
       banner.className="preview-banner";
       banner.textContent="ADMIN PREVIEW · "+String(post.status||"draft").toUpperCase();
       root.before(banner);
       render();
       return;
     }
   }catch{}
   throw 0;
 }
 try{const d=await fetch("/api/content?slug="+encodeURIComponent(slug)).then(r=>r.json());if(d.ok){post=d.post;try{const [manual,seed]=await Promise.all([fetch("/api/content?limit=100",{cache:"no-store"}).then(r=>r.json()),fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]}))]);const seen=new Set();allPosts=[...(manual.posts||[]),...(seed.posts||[])].filter(p=>p&&p.slug&&!seen.has(p.slug)&&seen.add(p.slug))}catch{allPosts=[]}render();return}}catch{}
 const d=await fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json());post=(d.posts||[]).find(p=>p.slug===slug);if(!post)throw 0;allPosts=(d.posts||[]);render()
}
if("speechSynthesis" in window)speechSynthesis.onvoiceschanged=()=>{};
load().catch(()=>root.innerHTML='<p class="news-loading">Article পাওয়া যায়নি.</p>');
})();