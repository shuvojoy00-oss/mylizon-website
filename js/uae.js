document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-ae-guide-link]")];
  const sections=[...document.querySelectorAll("[data-ae-section]")];
  const guideSheet=document.querySelector("#ae-guide-sheet");
  const searchSheet=document.querySelector("#ae-searae-sheet");
  const guideLabel=document.querySelector("[data-ae-guide-label]");
  const searchInput=document.querySelector("#ae-page-searae-input");
  const searchResults=document.querySelector("#ae-page-searae-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".ae-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>searchInput?.focus({preventScroll:true}),120);
  };

  document.querySelectorAll("[data-ae-guide-toggle],[data-ae-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-ae-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-ae-searae-toggle],[data-ae-searae-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-ae-searae-close]").forEach(el=>el.addEventListener("click",closeSearch));
  guideLinks.forEach(a=>a.addEventListener("click",closeGuide));

  if("IntersectionObserver" in window){
    const obs=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      const id=visible.target.id;
      guideLinks.forEach(a=>a.classList.toggle("is-active",a.getAttribute("href")==="#"+id));
      const active=guideLinks.find(a=>a.getAttribute("href")==="#"+id);
      if(active&&guideLabel)guideLabel.textContent=active.textContent.trim();
    },{rootMargin:"-28% 0px -58% 0px",threshold:[0,.2,.5]});
    sections.forEach(s=>obs.observe(s));
  }

  const filters=[...document.querySelectorAll("[data-provider-filter]")];
  const providerCards=[...document.querySelectorAll("[data-provider-card]")];
  filters.forEach(btn=>btn.addEventListener("click",()=>{
    filters.forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const filter=btn.dataset.providerFilter;
    providerCards.forEach(card=>{
      const tags=(card.dataset.tags||"").split(" ");
      card.hidden=filter!=="all"&&!tags.includes(filter);
    });
  }));

  const normalize=v=>v.toLowerCase().replace(/[^a-z0-9₹$\s]/g," ").replace(/\s+/g," ").trim();
  const aliases={
    "student visa":"student residence permit university sponsor",
    "residence":"student residence permit university sponsor",
    "emirates id":"student residence permit emirates id",
    "work":"student work permit",
    "part time":"student work permit",
    "mohre":"student work permit",
    "golden":"golden residence outstanding students",
    "green":"green residence skilled worker",
    "post study":"after graduation",
    "jobseeker":"after graduation",
    "spouse":"family residence",
    "dependent":"family residence",
    "family":"family residence",
    "dubai":"cities",
    "abu dhabi":"cities",
    "sharjah":"cities",
    "ras al khaimah":"cities",
    "english":"language requirements",
    "ielts":"language requirements",
    "scholarship":"scholarships"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .ae-card,main .ae-fact,main .ae-price-box,main .ae-time,main .ae-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section?.querySelector(".ae-eyebrow")?.textContent.trim()||"UAE Guide";
    if(!node.id)node.id="uae-search-target-"+(i+1);
    items.push({node,title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?.textContent.trim()||text.slice(0,90)),text:text.toLowerCase(),section:label});
  });

  const score=(item,q)=>{
    const alias=aliases[q]||q;
    const title=item.title.toLowerCase();
    if(title===alias)return 1000;
    if(title.startsWith(alias))return 920;
    if(title.includes(alias))return 840;
    if(item.text.includes(alias))return 700;
    const words=alias.split(" ").filter(Boolean);
    return words.length>1&&words.every(w=>item.text.includes(w))?620:0;
  };

  const jump=item=>{
    closeSearch();
    const details=item.node.closest("details");
    if(details)details.open=true;
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="ae-search-empty">Try <strong>TR YÖS</strong>, <strong>Türkiye Scholarships</strong>, <strong>Mosaic Visa</strong>, <strong>residence permit</strong>, <strong>part time work</strong> or <strong>after graduation</strong>.</div>';
      return;
    }
    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);
    if(!results.length){
      searchResults.innerHTML='<div class="ae-search-empty"><strong>No exact match found.</strong><br>Try TR YÖS, scholarship, student visa, residence permit, work, family, tuition or a city.</div>';
      return;
    }
    results.forEach(({item})=>{
      const b=document.createElement("button");
      b.className="ae-search-result";
      b.type="button";
      b.innerHTML='<span class="ae-search-result__section">'+item.section+'</span><span class="ae-search-result__title">'+item.title+'</span><span class="ae-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
      b.onclick=()=>jump(item);
      searchResults.appendChild(b);
    });
  };

  searchInput?.addEventListener("input",()=>render(searchInput.value));
  searchInput?.addEventListener("keydown",e=>{if(e.key==="Escape")closeSearch();});
  render("");
});