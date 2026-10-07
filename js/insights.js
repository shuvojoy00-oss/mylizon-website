(() => {
  const feed=document.getElementById("feed"), featuredWrap=document.getElementById("featured-wrap"), featured=document.getElementById("featured"), search=document.getElementById("search-input");
  let category="all",timer;
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const label=c=>c==="study-abroad"?"Study Abroad":String(c||"").toUpperCase();
  const isNew=d=>d&&Date.now()-new Date(d).getTime()<7*86400000;
  const date=d=>d?new Intl.DateTimeFormat("bn-BD",{day:"numeric",month:"short",year:"numeric"}).format(new Date(d)):"";

  function card(p,feature=false){
    return `<a class="${feature?"featured-card":"post-card"}" href="article.html?slug=${encodeURIComponent(p.slug)}">
      <div class="post-meta"><span>${esc(label(p.category))}</span><span>•</span><span>${esc(date(p.published_at))}</span>${isNew(p.published_at)?'<span class="new-pill">NEW</span>':''}</div>
      <h2>${esc(p.title_bn)}</h2>${p.excerpt_bn?`<p>${esc(p.excerpt_bn)}</p>`:""}
    </a>`;
  }

  async function getManual(params){
    try{const r=await fetch("/api/content?"+params);const d=await r.json();return d.ok?(d.posts||[]):[]}catch{return[]}
  }
  async function getAuto(){
    try{const r=await fetch("/data/insights-auto.json",{cache:"no-store"});const d=await r.json();return Array.isArray(d.posts)?d.posts:[]}catch{return[]}
  }

  async function load(){
    feed.innerHTML='<p class="loading">আপডেট লোড হচ্ছে...</p>';
    const q=search.value.trim().toLowerCase(), params=new URLSearchParams({category,limit:"50"});if(q)params.set("q",q);
    const [manual,autoRaw]=await Promise.all([getManual(params),getAuto()]);
    const auto=autoRaw.filter(p=>{
      const cat=category==="all"||p.category===category;
      const hay=[p.title_bn,p.title_en,p.excerpt_bn,p.excerpt_en].join(" ").toLowerCase();
      return cat&&(!q||hay.includes(q));
    });
    const seen=new Set(),posts=[...manual,...auto].filter(p=>{
      const key=p.source_url||p.slug;if(seen.has(key))return false;seen.add(key);return true;
    }).sort((a,b)=>(Number(b.featured)-Number(a.featured))||(new Date(b.published_at||0)-new Date(a.published_at||0)));
    const f=posts.find(p=>p.featured);
    if(f&&!q){featuredWrap.hidden=false;featured.innerHTML=card(f,true)}else featuredWrap.hidden=true;
    const rest=f&&!q?posts.filter(p=>p.slug!==f.slug):posts;
    feed.innerHTML=rest.length?rest.map(p=>card(p)).join(""):'<p class="loading">এই মুহূর্তে কোনো পোস্ট পাওয়া যায়নি.</p>';
  }

  document.getElementById("category-chips").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===b));load()});
  search.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(load,250)});load();
})();