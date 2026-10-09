(()=>{
const root=document.getElementById("news-article"),slug=new URLSearchParams(location.search).get("slug");let post,lang="bn",countries=[];
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const topicLinks=[["IELTS Writing","ielts.html"],["IELTS Speaking","ielts.html"],["IELTS Reading","ielts.html"],["IELTS Listening","ielts.html"],["IELTS","ielts.html"],["PTE Reading","pte.html"],["PTE Speaking","pte.html"],["PTE Writing","pte.html"],["PTE Listening","pte.html"],["PTE","pte.html"],["Study Abroad","studyabroad.html"],["Check Eligibility","assessment.html"],["eligibility","assessment.html"],["এলিজিবিলিটি","assessment.html"]];
const countryBn={australia:"অস্ট্রেলিয়া",newzealand:"নিউজিল্যান্ড",uk:"যুক্তরাজ্য",canada:"কানাডা",usa:"আমেরিকা",ireland:"আয়ারল্যান্ড",belgium:"বেলজিয়াম",switzerland:"সুইজারল্যান্ড",denmark:"ডেনমার্ক",finland:"ফিনল্যান্ড",netherlands:"নেদারল্যান্ডস",norway:"নরওয়ে",sweden:"সুইডেন",france:"ফ্রান্স",poland:"পোল্যান্ড",spain:"স্পেন",austria:"অস্ট্রিয়া",croatia:"ক্রোয়েশিয়া",germany:"জার্মানি",greece:"গ্রিস",italy:"ইতালি",lithuania:"লিথুয়ানিয়া",estonia:"এস্তোনিয়া",hungary:"হাঙ্গেরি",malta:"মাল্টা",india:"ভারত",china:"চীন",turkey:"তুরস্ক",uae:"আমিরাত",latvia:"লাটভিয়া",romania:"রোমানিয়া",czech:"চেক রিপাবলিক",portugal:"পর্তুগাল",slovenia:"স্লোভেনিয়া",serbia:"সার্বিয়া",slovakia:"স্লোভাকিয়া",bulgaria:"বুলগেরিয়া",singapore:"সিঙ্গাপুর",qatar:"কাতার","saudi-arabia":"সৌদি আরব",thailand:"থাইল্যান্ড",japan:"জাপান",southkorea:"দক্ষিণ কোরিয়া"};
function linkBody(el){
 let used=0;const links=[...topicLinks];countries.forEach(c=>{links.push([c.name,c.page]);if(countryBn[c.id])links.push([countryBn[c.id],c.page])});
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 for(const n of nodes){if(used>=6)break;if(n.parentElement.closest("a,script,style"))continue;for(const [term,url] of links){const i=n.nodeValue.toLowerCase().indexOf(term.toLowerCase());if(i<0)continue;const f=document.createDocumentFragment(),before=n.nodeValue.slice(0,i),match=n.nodeValue.slice(i,i+term.length),after=n.nodeValue.slice(i+term.length);if(before)f.append(before);const a=document.createElement("a");a.href=url;a.textContent=match;f.append(a);if(after)f.append(after);n.replaceWith(f);used++;break}}
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
function pickBanglaVoice(voices){
 const exact=voices.find(v=>/^bn-BD$/i.test(v.lang));
 if(exact)return exact;
 const india=voices.find(v=>/^bn-IN$/i.test(v.lang));
 if(india)return india;
 return voices.find(v=>/^bn(?:-|_)/i.test(v.lang)||/bangla|bengali/i.test(v.name))||null;
}
function pickEnglishVoice(voices){
 return voices.find(v=>/^en(-|_)/i.test(v.lang)&&/female|samantha|zira|victoria|ava|serena|google uk english female/i.test(v.name))||
        voices.find(v=>/^en(-|_)/i.test(v.lang))||null;
}
function splitSentences(text){
 return String(text||"").replace(/\s+/g," ").match(/[^.!?।]+[.!?।]?/g)?.map(s=>s.trim()).filter(Boolean)||[];
}
function splitScripts(text){
 const out=[];let buf="",kind=null;
 const flush=()=>{if(buf.trim())out.push({text:buf.trim(),kind});buf=""};
 for(const ch of String(text||"")){
   const next=/[\u0980-\u09FF]/.test(ch)?"bn":/[A-Za-z0-9]/.test(ch)?"en":"neutral";
   if(next==="neutral"){buf+=ch;continue}
   if(kind&&next!==kind){flush()}
   if(!kind||next!==kind)kind=next;
   buf+=ch;
 }
 flush();
 return out;
}
function setListenStatus(message,isError=false){
 const b=document.getElementById("listen");
 if(!b)return;
 b.textContent=message;
 b.classList.toggle("audio-error",!!isError);
}
async function speakBanglaMixed(title,body){
 const voices=await getVoicesReady();
 const bnVoice=pickBanglaVoice(voices);
 const enVoice=pickEnglishVoice(voices);
 if(!bnVoice){
   setListenStatus("বাংলা voice এই device এ পাওয়া যায়নি",true);
   return;
 }
 const full=title+". "+body;
 const sentences=splitSentences(full);
 const queue=[];
 for(const sentence of sentences){
   const question=/\?$/.test(sentence);
   const pieces=splitScripts(sentence);
   for(const piece of pieces){
     if(!piece.text)continue;
     queue.push({text:piece.text,kind:piece.kind,question});
   }
 }
 if(!queue.length)return;
 let index=0;
 const next=()=>{
   if(index>=queue.length){setListenStatus("▶ শুনুন");return}
   const part=queue[index++];
   const u=new SpeechSynthesisUtterance(part.text);
   if(part.kind==="bn"){
     u.lang=bnVoice.lang||"bn-BD";
     u.voice=bnVoice;
     u.rate=1.08;
     u.pitch=part.question?1.12:1;
   }else{
     u.lang=enVoice?.lang||"en-US";
     if(enVoice)u.voice=enVoice;
     u.rate=.92;
     u.pitch=1;
   }
   u.onend=()=>setTimeout(next,part.question?90:20);
   u.onerror=()=>{setListenStatus("বাংলা audio চালানো যায়নি",true)};
   speechSynthesis.speak(u);
 };
 setListenStatus("■ থামান");
 next();
}
async function speakEnglish(title,body){
 const voices=await getVoicesReady();
 const u=new SpeechSynthesisUtterance(title+". "+body);
 const voice=pickEnglishVoice(voices);
 u.lang=voice?.lang||"en-US";
 if(voice)u.voice=voice;
 u.rate=.95;
 u.onend=()=>setListenStatus("▶ Listen");
 u.onerror=()=>setListenStatus("Audio unavailable",true);
 setListenStatus("■ Stop");
 speechSynthesis.speak(u);
}
async function speakCurrent(title,body){
 if(!("speechSynthesis" in window)){setListenStatus(lang==="bn"?"এই browser এ audio support নেই":"Audio unavailable",true);return}
 if(speechSynthesis.speaking||speechSynthesis.pending){
   speechSynthesis.cancel();
   setListenStatus(lang==="bn"?"▶ শুনুন":"▶ Listen");
   return;
 }
 if(lang==="bn")await speakBanglaMixed(title,body);
 else await speakEnglish(title,body);
}
function render(){
 const title=lang==="bn"?post.title_bn:(post.title_en||post.title_bn),excerpt=lang==="bn"?post.excerpt_bn:(post.excerpt_en||post.excerpt_bn),body=lang==="bn"?post.body_bn:(post.body_en||post.body_bn);
 document.title=title+" | LizOn News";
 root.innerHTML=`<header class="article-head"><div class="meta"><span>${post.category==="study-abroad"?"Study Abroad":String(post.category).toUpperCase()}</span>${post.country?`<span>• ${esc((countries.find(c=>c.id===post.country)||{}).name||post.country)}</span>`:""}${post.source_verified?'<span>• VERIFIED SOURCE</span>':""}</div><h1>${esc(title)}</h1>${excerpt?`<p class="article-dek">${esc(excerpt)}</p>`:""}<div class="article-actions"><button id="listen">▶ ${lang==="bn"?"শুনুন":"Listen"}</button><button data-lang="bn" class="${lang==="bn"?"active":""}">বাংলা</button><button data-lang="en" class="${lang==="en"?"active":""}">English</button></div></header>${post.image_url?`<img class="article-cover" src="${esc(post.image_url)}" alt="${esc(post.image_alt||"")}"><div class="article-caption">${esc(post.image_caption||"")}${post.image_credit?" · "+esc(post.image_credit):""}</div>`:""}<div class="article-body" id="body">${body}</div>${post.source_url?`<div class="article-source"><strong>${post.source_verified?"Official Source":"Source"}</strong><br><a href="${esc(post.source_url)}" target="_blank" rel="noopener">${esc(post.source_name||post.source_url)}</a></div>`:""}<div class="article-next" id="next"></div>`;
 linkBody(document.getElementById("body"));
 const next=document.getElementById("next"),country=countries.find(c=>c.id===post.country);
 if(post.category==="study-abroad"&&country)next.innerHTML=`<strong>এই দেশটি নিয়ে আরও জানতে চান?</strong><br><a href="${country.page}">Complete country guide →</a>`;
 else if(post.category==="ielts")next.innerHTML='<strong>IELTS এ এই সমস্যাটি আপনারও হচ্ছে?</strong><br><a href="ieltsclass.html">Free IELTS classes দেখুন →</a> · <a href="ielts.html">IELTS Courses →</a>';
 else if(post.category==="pte")next.innerHTML='<strong>PTE preparation এ সাহায্য দরকার?</strong><br><a href="pteclass.html">Free PTE classes দেখুন →</a> · <a href="pte.html">PTE Courses →</a>';
 root.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{speechSynthesis.cancel();lang=b.dataset.lang;render()});
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