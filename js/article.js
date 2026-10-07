(() => {
  const root=document.getElementById("article"),slug=new URLSearchParams(location.search).get("slug");
  let post,lang="bn",utterance;
  const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const date=d=>d?new Intl.DateTimeFormat(lang==="bn"?"bn-BD":"en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(d)):"";

  function render(){
    const title=lang==="bn"?post.title_bn:(post.title_en||post.title_bn),excerpt=lang==="bn"?post.excerpt_bn:(post.excerpt_en||post.excerpt_bn),body=lang==="bn"?post.body_bn:(post.body_en||post.body_bn);
    document.documentElement.lang=lang==="bn"?"bn":"en";document.title=title+" | LizOn Education";
    root.innerHTML=`<div class="article-top"><div class="post-meta"><span>${esc(post.category==="study-abroad"?"Study Abroad":String(post.category).toUpperCase())}</span><span>•</span><span>${esc(date(post.published_at))}</span>${post.source_verified?'<span>• VERIFIED SOURCE</span>':''}</div><h1>${esc(title)}</h1>${excerpt?`<p class="dek">${esc(excerpt)}</p>`:""}<div class="article-controls"><button class="listen-btn" id="listen-btn">▶ ${lang==="bn"?"শুনুন":"Listen"}</button><button class="lang-btn ${lang==="bn"?"active":""}" data-lang="bn">বাংলা</button><button class="lang-btn ${lang==="en"?"active":""}" data-lang="en">English</button></div></div><div class="article-body" id="article-body">${body}</div>${post.source_url?`<div class="source-box"><strong>Official source</strong><br><a href="${esc(post.source_url)}" target="_blank" rel="noopener noreferrer">${esc(post.source_name||post.source_url)}</a></div>`:""}`;
    root.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{speechSynthesis.cancel();lang=b.dataset.lang;render()}));
    document.getElementById("listen-btn").addEventListener("click",()=>{const btn=document.getElementById("listen-btn");if(speechSynthesis.speaking){speechSynthesis.cancel();btn.textContent="▶ "+(lang==="bn"?"শুনুন":"Listen");return}const text=[title,document.getElementById("article-body").innerText].join(". ");utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang==="bn"?"bn-BD":"en-US";utterance.rate=.95;utterance.onend=()=>btn.textContent="▶ "+(lang==="bn"?"শুনুন":"Listen");btn.textContent="■ "+(lang==="bn"?"বন্ধ করুন":"Stop");speechSynthesis.speak(utterance)});
  }

  async function load(){
    if(!slug)throw new Error();
    try{const r=await fetch("/api/content?slug="+encodeURIComponent(slug));const d=await r.json();if(d.ok){post=d.post;render();return}}catch{}
    const r=await fetch("/data/insights-auto.json",{cache:"no-store"}),d=await r.json();post=(d.posts||[]).find(p=>p.slug===slug);if(!post)throw new Error();render();
  }
  load().catch(()=>root.innerHTML='<p class="loading">Article পাওয়া যায়নি বা এখনও প্রকাশিত হয়নি.</p>');
})();