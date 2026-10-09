(()=>{
const root=document.getElementById("news-article"),slug=new URLSearchParams(location.search).get("slug");let post,lang="bn",countries=[],audioPlayer=null,audioObjectUrl=null;
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
 if(slug!=="australia-student-visa-rules-october-2026")return false;
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
}
async function load(){
 if(!slug)throw 0;
 try{countries=await fetch("/data/studyabroad-countries.json").then(r=>r.json())}catch{countries=[]}
 try{const d=await fetch("/api/content?slug="+encodeURIComponent(slug)).then(r=>r.json());if(d.ok){post=d.post;render();return}}catch{}
 const d=await fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json());post=(d.posts||[]).find(p=>p.slug===slug);if(!post)throw 0;render()
}
if("speechSynthesis" in window)speechSynthesis.onvoiceschanged=()=>{};
load().catch(()=>root.innerHTML='<p class="news-loading">Article পাওয়া যায়নি.</p>');
})();