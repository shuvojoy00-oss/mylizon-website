(()=>{
const $=s=>document.querySelector(s);
const feed=$("#news-feed"),lead=$("#desktop-lead"),search=$("#news-search"),guide=$("#guide-result"),count=$("#result-count");
let category=new URLSearchParams(location.search).get("category")||"all",posts=[],countries=[];
const countryAliases={
australia:"Australia অস্ট্রেলিয়া austrlia austrelia australia",newzealand:"New Zealand নিউজিল্যান্ড NZ newzeland newzealnd",uk:"United Kingdom UK Britain যুক্তরাজ্য ইংল্যান্ড",canada:"Canada কানাডা caneda",usa:"United States USA US America আমেরিকা",ireland:"Ireland আয়ারল্যান্ড",belgium:"Belgium বেলজিয়াম",switzerland:"Switzerland সুইজারল্যান্ড",denmark:"Denmark ডেনমার্ক",finland:"Finland ফিনল্যান্ড",netherlands:"Netherlands Holland নেদারল্যান্ডস হল্যান্ড",norway:"Norway নরওয়ে",sweden:"Sweden সুইডেন",france:"France ফ্রান্স",poland:"Poland পোল্যান্ড",spain:"Spain স্পেন",austria:"Austria অস্ট্রিয়া",croatia:"Croatia ক্রোয়েশিয়া",germany:"Germany জার্মানি",greece:"Greece গ্রিস",italy:"Italy ইতালি",lithuania:"Lithuania লিথুয়ানিয়া",estonia:"Estonia এস্তোনিয়া",hungary:"Hungary হাঙ্গেরি",malta:"Malta মাল্টা",india:"India ভারত ইন্ডিয়া",china:"China চীন",turkey:"Türkiye Turkey তুরস্ক",uae:"United Arab Emirates UAE Dubai দুবাই আমিরাত",latvia:"Latvia লাটভিয়া",romania:"Romania রোমানিয়া romaniya",czech:"Czech Republic Czechia চেক রিপাবলিক",portugal:"Portugal পর্তুগাল",slovenia:"Slovenia স্লোভেনিয়া",serbia:"Serbia সার্বিয়া",slovakia:"Slovakia স্লোভাকিয়া",bulgaria:"Bulgaria বুলগেরিয়া",singapore:"Singapore সিঙ্গাপুর",qatar:"Qatar কাতার", "saudi-arabia":"Saudi Arabia সৌদি আরব Saudi",thailand:"Thailand থাইল্যান্ড",japan:"Japan জাপান",southkorea:"South Korea Korea দক্ষিণ কোরিয়া কোরিয়া"
};
const topicAliases={
ielts:"IELTS আইইএলটিএস writing speaking reading listening task 1 task 2 cue card band",
pte:"PTE Pearson পিটিই read aloud describe image repeat sentence reading writing speaking listening",
"study-abroad":"study abroad higher study বিদেশে পড়াশোনা visa ভিসা scholarship স্কলারশিপ university বিশ্ববিদ্যালয়"
};
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const norm=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\u0980-\u09ff ]/g," ").replace(/\s+/g," ").trim();
const dist=(a,b)=>{a=norm(a);b=norm(b);const d=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
const tokens=s=>norm(s).split(" ").filter(Boolean);
function aliases(c){return [c.name,c.id,c.code,countryAliases[c.id]||""].join(" ")}
function score(p,q){
 if(!q)return 1;
 const hay=norm([p.title_bn,p.title_en,p.excerpt_bn,p.excerpt_en,p.country,p.keywords,p.category,p.content_type,topicAliases[p.category]||""].join(" "));
 if(hay.includes(q))return 120;
 const qs=tokens(q),hs=tokens(hay);let total=0,matched=0;
 for(const qt of qs){let best=0;for(const ht of hs){if(ht.includes(qt)||qt.includes(ht))best=Math.max(best,35);else{const d=dist(ht,qt),limit=Math.max(1,Math.floor(qt.length*.28));if(d<=limit)best=Math.max(best,28-d*5)}}if(best){matched++;total+=best}}
 if(matched===qs.length&&matched)total+=35;
 for(const c of countries){const ca=norm(aliases(c)),ct=tokens(ca);let countryHit=false;for(const qt of qs){for(const at of ct){const d=dist(at,qt);if(at===qt||at.includes(qt)||qt.includes(at)||(qt.length>=4&&d<=2)){countryHit=true;break}}if(countryHit)break}if(countryHit&&(p.country===c.id||hay.includes(norm(c.name))))total=Math.max(total,105)}
 return total;
}
const dateText=p=>p.published_at?new Intl.DateTimeFormat("bn-BD",{day:"numeric",month:"short",year:"numeric"}).format(new Date(p.published_at)):"";
const meta=p=>`<div class="meta"><span>${p.category==="study-abroad"?"Study Abroad":String(p.category).toUpperCase()}</span>${p.country?`<span>• ${esc((countries.find(c=>c.id===p.country)||{}).name||p.country)}</span>`:""}<span class="date-number">• ${dateText(p)}</span>${p.published_at&&Date.now()-new Date(p.published_at)<604800000?'<span class="new-tag">NEW</span>':""}</div>`;
const card=p=>`<a class="news-card ${p.image_url?"":"no-image"}" href="news-article.html?slug=${encodeURIComponent(p.slug)}"><div>${meta(p)}<h3>${esc(p.title_bn)}</h3>${p.excerpt_bn?`<p>${esc(p.excerpt_bn)}</p>`:""}</div>${p.image_url?`<img class="news-thumb" src="${esc(p.image_url)}" alt="${esc(p.image_alt||"")}">`:""}</a>`;
const shelfCard=p=>`<a class="news-shelf__card" href="news-article.html?slug=${encodeURIComponent(p.slug)}">${meta(p)}<h3>${esc(p.title_bn)}</h3></a>`;
function renderShelf(id,title,desc,filter){
 const el=$("#"+id);if(!el)return;const selected=posts.filter(filter).sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,6);
 el.hidden=!selected.length;if(!selected.length)return;
 el.innerHTML=`<div class="news-shelf__head"><h2>${title}</h2><p>${desc}</p></div><div class="news-shelf__grid">${selected.map(shelfCard).join("")}</div>`;
}
function renderShelves(show){
 const wrap=$("#news-shelves");if(wrap)wrap.hidden=!show;if(!show)return;
 renderShelf("students-facing","Students are facing","IELTS ও PTE preparation এ students যে সমস্যাগুলো এখন বেশি face করছে.",p=>p.content_type==="problem-solution");
 renderShelf("question-watch","Question Watch","Question type, recently reported pattern এবং high frequency practice focus. Guarantee নয়.",p=>p.content_type==="recent-questions"||p.content_type==="exam-intelligence");
 renderShelf("opportunities","Opportunities","Scholarship, intake, funding এবং application opportunity.",p=>p.content_type==="opportunity");
 renderShelf("outlook","Outlook","Confirmed fact থেকে আলাদা করে সম্ভাব্য পরিবর্তন ও planning signal.",p=>p.content_type==="outlook"||p.content_type==="prediction");
}
function render(){
 const q=norm(search.value),filtered=posts.map(p=>({...p,_score:score(p,q)})).filter(p=>(category==="all"||p.category===category)&&(!q||p._score>0)).sort((a,b)=>q?b._score-a._score:(Number(b.featured)-Number(a.featured)||new Date(b.published_at||0)-new Date(a.published_at||0)));
 count.textContent=`${filtered.length} টি`;
 const top=filtered.slice(0,3);
 lead.innerHTML=top.length?`<a class="lead-main" href="news-article.html?slug=${encodeURIComponent(top[0].slug)}">${top[0].image_url?`<img class="lead-image" src="${esc(top[0].image_url)}" alt="">`:""}${meta(top[0])}<h2>${esc(top[0].title_bn)}</h2><p>${esc(top[0].excerpt_bn||"")}</p></a><div class="lead-stack">${top.slice(1).map(p=>`<a class="lead-small" href="news-article.html?slug=${encodeURIComponent(p.slug)}">${meta(p)}<h3>${esc(p.title_bn)}</h3></a>`).join("")}</div>`:"";
 const rest=filtered.slice(3,q?50:15);
 feed.innerHTML=rest.map(card).join("")||(!top.length?'<p class="news-loading">কোনো মিল পাওয়া যায়নি. বানান একটু ভুল হলেও আমরা কাছাকাছি result খুঁজছি, অন্য একটি শব্দও চেষ্টা করতে পারেন.</p>':"");
 renderGuide(q);renderShelves(!q&&category==="all");
}
function renderGuide(q){
 guide.hidden=true;const s=$("#search-suggestion");s.hidden=true;if(!q)return;
 let hit=null,best=99;for(const c of countries){for(const a of tokens(aliases(c))){const d=dist(a,q);if(a===q||a.includes(q)||q.includes(a)||(q.length>=4&&d<=2)){if(d<best){best=d;hit=c}}}}
 if(hit){guide.hidden=false;guide.innerHTML=`<a href="${hit.page}"><div><small>COUNTRY GUIDE</small><br><strong>${esc(hit.name)} নিয়ে পূর্ণ গাইড</strong><div>Admission, cost, visa, work rights এবং post study planning.</div></div><b>Explore →</b></a>`;if(norm(hit.name)!==q){s.hidden=false;s.textContent=`আপনি কি ${hit.name} খুঁজছেন? কাছাকাছি ফলাফল দেখানো হচ্ছে.`}}
}
async function load(){
 const [a,b,c]=await Promise.all([fetch("/api/content?limit=100").then(r=>r.json()).catch(()=>({posts:[]})),fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]})),fetch("/data/studyabroad-countries.json").then(r=>r.json()).catch(()=>[])]);
 countries=Array.isArray(c)?c:[];const seen=new Set();posts=[...(a.posts||[]),...(b.posts||[])].filter(p=>{const k=p.source_url&&p.content_type==="news"?p.source_url:p.slug;if(seen.has(k))return false;seen.add(k);return true});render()
}
$("#news-chips").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;history.replaceState(null,"",category==="all"?"news.html":"news.html?category="+encodeURIComponent(category));document.querySelectorAll("#news-chips button").forEach(x=>x.classList.toggle("active",x===b));render()});
search.addEventListener("input",()=>{clearTimeout(search._t);search._t=setTimeout(render,90)});
$("#clear-search").addEventListener("click",()=>{search.value="";render()});
document.querySelectorAll("#news-chips button").forEach(x=>x.classList.toggle("active",x.dataset.category===category));
load();
})();