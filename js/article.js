(() => {
  const root = document.getElementById("article");
  const slug = new URLSearchParams(location.search).get("slug");
  let post, lang="bn", utterance;

  const esc = s => String(s || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const date = d => d ? new Intl.DateTimeFormat(lang==="bn"?"bn-BD":"en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(d)) : "";

  function render(){
    if (!post) return;
    const title = lang==="bn" ? post.title_bn : (post.title_en || post.title_bn);
    const excerpt = lang==="bn" ? post.excerpt_bn : (post.excerpt_en || post.excerpt_bn);
    const body = lang==="bn" ? post.body_bn : (post.body_en || post.body_bn);
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    document.title = title + " | LizOn Education";
    root.innerHTML = `
      <div class="article-top">
        <div class="post-meta"><span>${esc(post.category==="study-abroad"?"Study Abroad":post.category.toUpperCase())}</span><span>•</span><span>${esc(date(post.published_at))}</span>${post.source_verified?'<span>• VERIFIED SOURCE</span>':''}</div>
        <h1>${esc(title)}</h1>
        ${excerpt?`<p class="dek">${esc(excerpt)}</p>`:""}
        <div class="article-controls">
          <button class="listen-btn" id="listen-btn">▶ ${lang==="bn"?"শুনুন":"Listen"}</button>
          <button class="lang-btn ${lang==="bn"?"active":""}" data-lang="bn">বাংলা</button>
          <button class="lang-btn ${lang==="en"?"active":""}" data-lang="en">English</button>
        </div>
      </div>
      <div class="article-body" id="article-body">${body}</div>
      ${post.source_url?`<div class="source-box"><strong>${lang==="bn"?"Official source":"Official source"}</strong><br><a href="${esc(post.source_url)}" target="_blank" rel="noopener noreferrer">${esc(post.source_name || post.source_url)}</a></div>`:""}`;
    bind();
  }

  function bind(){
    root.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{ speechSynthesis.cancel(); lang=b.dataset.lang; render(); }));
    document.getElementById("listen-btn").addEventListener("click",()=>{
      const btn=document.getElementById("listen-btn");
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); btn.textContent="▶ "+(lang==="bn"?"শুনুন":"Listen"); return; }
      const text = [lang==="bn"?post.title_bn:(post.title_en||post.title_bn), document.getElementById("article-body").innerText].join(". ");
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang==="bn" ? "bn-BD" : "en-US";
      utterance.rate = .95;
      utterance.onend=()=>btn.textContent="▶ "+(lang==="bn"?"শুনুন":"Listen");
      btn.textContent="■ "+(lang==="bn"?"বন্ধ করুন":"Stop");
      speechSynthesis.speak(utterance);
    });
  }

  if (!slug) { root.innerHTML='<p class="loading">Article পাওয়া যায়নি.</p>'; return; }
  fetch("/api/content?slug="+encodeURIComponent(slug)).then(r=>r.json()).then(d=>{
    if(!d.ok) throw new Error(); post=d.post; render();
  }).catch(()=>root.innerHTML='<p class="loading">Article পাওয়া যায়নি বা এখনও প্রকাশিত হয়নি.</p>');
})();