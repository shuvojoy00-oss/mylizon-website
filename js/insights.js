(() => {
  const feed = document.getElementById("feed");
  const featuredWrap = document.getElementById("featured-wrap");
  const featured = document.getElementById("featured");
  const search = document.getElementById("search-input");
  let category = "all";
  let timer;

  const esc = s => String(s || "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const label = c => c === "study-abroad" ? "Study Abroad" : c.toUpperCase();
  const isNew = d => d && Date.now() - new Date(d).getTime() < 7*86400000;
  const date = d => d ? new Intl.DateTimeFormat("bn-BD",{day:"numeric",month:"short",year:"numeric"}).format(new Date(d)) : "";

  function card(p, feature=false) {
    const cls = feature ? "featured-card" : "post-card";
    return `<a class="${cls}" href="article.html?slug=${encodeURIComponent(p.slug)}">
      <div class="post-meta"><span>${esc(label(p.category))}</span><span>•</span><span>${esc(date(p.published_at))}</span>${isNew(p.published_at)?'<span class="new-pill">NEW</span>':''}</div>
      <h2>${esc(p.title_bn)}</h2>
      ${p.excerpt_bn ? `<p>${esc(p.excerpt_bn)}</p>` : ""}
    </a>`;
  }

  async function load() {
    feed.innerHTML = '<p class="loading">আপডেট লোড হচ্ছে...</p>';
    const q = search.value.trim();
    const params = new URLSearchParams({category,limit:"50"});
    if (q) params.set("q",q);
    try {
      const r = await fetch("/api/content?" + params);
      const data = await r.json();
      if (!data.ok) throw new Error(data.error || "Could not load");
      const posts = data.posts || [];
      const f = posts.find(p => p.featured);
      if (f && !q) {
        featuredWrap.hidden = false;
        featured.innerHTML = card(f,true);
      } else featuredWrap.hidden = true;
      const rest = f && !q ? posts.filter(p => p.id !== f.id) : posts;
      feed.innerHTML = rest.length ? rest.map(p => card(p)).join("") : '<p class="loading">এই মুহূর্তে কোনো পোস্ট পাওয়া যায়নি.</p>';
    } catch(e) {
      feed.innerHTML = '<p class="loading">কনটেন্ট লোড করা যায়নি. কিছুক্ষণ পর আবার চেষ্টা করুন.</p>';
    }
  }

  document.getElementById("category-chips").addEventListener("click", e => {
    const b = e.target.closest("[data-category]");
    if (!b) return;
    category = b.dataset.category;
    document.querySelectorAll(".chip").forEach(x => x.classList.toggle("active",x===b));
    load();
  });
  search.addEventListener("input",()=>{ clearTimeout(timer); timer=setTimeout(load,250); });
  load();
})();