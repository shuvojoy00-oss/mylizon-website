document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-cy-guide-link]")];
  const sections=[...document.querySelectorAll("[data-cy-section]")];
  const guideSheet=document.querySelector("#cy-guide-sheet");
  const searchSheet=document.querySelector("#cy-searcy-sheet");
  const guideLabel=document.querySelector("[data-cy-guide-label]");
  const searchInput=document.querySelector("#cy-page-searcy-input");
  const searchResults=document.querySelector("#cy-page-searcy-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".cy-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-cy-guide-toggle],[data-cy-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-cy-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-cy-searcy-toggle],[data-cy-searcy-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-cy-searcy-close]").forEach(el=>el.addEventListener("click",closeSearch));
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

  const normalize=v=>v.toLowerCase().replace(/[^a-z0-9£\s]/g," ").replace(/\s+/g," ").trim();

  const levenshtein=(a,b)=>{
    const m=a.length,n=b.length;
    if(!m)return n;if(!n)return m;
    const prev=Array.from({length:n+1},(_,i)=>i),curr=new Array(n+1);
    for(let i=1;i<=m;i++){
      curr[0]=i;
      for(let j=1;j<=n;j++){
        const cost=a[i-1]===b[j-1]?0:1;
        curr[j]=Math.min(curr[j-1]+1,prev[j]+1,prev[j-1]+cost);
      }
      for(let j=0;j<=n;j++)prev[j]=curr[j];
    }
    return prev[n];
  };

  const aliases={
    "hsc":"bangladesh eligibility",
    "cyqaa":"bangladesh eligibility",
    "recognition":"bangladesh eligibility",
    "public university":"higher education system",
    "private university":"higher education system",
    "7000":"money financial evidence",
    "3000":"money financial evidence",
    "2000":"arrival",
    "funds":"money financial evidence",
    "entry permit":"entry permit temporary residence",
    "temporary residence":"entry permit temporary residence",
    "blue slip":"entry permit temporary residence",
    "dhaka":"entry permit temporary residence",
    "india":"entry permit temporary residence",
    "70":"entry residence costs",
    "140":"entry residence costs",
    "55":"entry residence costs",
    "20 hours":"work while studying",
    "38 hours":"work while studying",
    "district labour office":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "insurance":"health insurance",
    "12 months":"after study",
    "master":"after study",
    "eqf 7":"after study",
    "job search":"after study",
    "nicosia":"cities",
    "limassol":"cities",
    "larnaca":"cities",
    "paphos":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .cy-card,main .cy-fact,main .cy-price-box,main .cy-time,main .cy-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".cy-eyebrow")?section.querySelector(".cy-eyebrow").textContent.trim():"Cyprus Guide";
    if(!node.id)node.id="cy-searcy-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh HSC / CYQAA",terms:["hsc","cyqaa","recognition"],query:"cyqaa"},
    {label:"Public vs private university",terms:["public university","private university","university"],query:"public university"},
    {label:"€7,000 finance example",terms:["7000","3000","funds","bank"],query:"7000"},
    {label:"€2,000 airport cash · UCY",terms:["2000","airport cash","ucy"],query:"2000"},
    {label:"Entry permit / residence",terms:["entry permit","temporary residence","blue slip"],query:"entry permit"},
    {label:"Bangladesh consular route",terms:["dhaka","india","honorary consulate"],query:"dhaka"},
    {label:"€70 / €140 student fees",terms:["70","140","55","permit fee"],query:"70"},
    {label:"20-hour / 38-hour work",terms:["20 hours","38 hours","student work"],query:"20 hours"},
    {label:"Spouse & family",terms:["spouse","family","family reunification"],query:"spouse"},
    {label:"12-month Master+ graduate route",terms:["12 months","master","eqf 7","job search"],query:"12 months"},
    {label:"Health insurance",terms:["insurance","medical","health"],query:"insurance"},
    {label:"Cities",terms:["nicosia","limassol","larnaca","paphos"],query:"nicosia"}
  ];

  const score=(item,q)=>{
    const alias=aliases[q]||q;
    const title=item.title.toLowerCase();
    if(title===alias)return 1000;
    if(title.startsWith(alias))return 920;
    if(title.includes(alias))return 840;
    if(item.text.includes(alias))return 700;
    const words=alias.split(" ").filter(Boolean);
    if(words.length>1&&words.every(w=>item.text.includes(w)))return 620;
    return 0;
  };

  const suggested=q=>{
    const ranked=topicSuggestions.map(topic=>{
      const distance=Math.min(...topic.terms.map(term=>{
        const a=normalize(q),b=normalize(term);
        return levenshtein(a,b)/Math.max(a.length,b.length,1);
      }));
      return {topic,distance};
    }).sort((a,b)=>a.distance-b.distance);
    const close=ranked.filter(x=>x.distance<=.46).slice(0,4).map(x=>x.topic);
    return close.length?close:topicSuggestions.slice(0,4);
  };

  const jump=item=>{
    closeSearch();
    const details=item.node.closest("details");
    if(details)details.open=true;
    item.node.classList.add("cy-page-searcy-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("cy-page-searcy-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="cy-searcy-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Cyprus</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="cy-searcy-empty";
      wrap.innerHTML='<strong>No exact match found.</strong><br>Maybe you meant:';
      const row=document.createElement("div");
      row.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px";
      suggested(q).forEach(topic=>{
        const b=document.createElement("button");
        b.type="button";
        b.textContent=topic.label;
        b.style.cssText="border:1px solid #d7e4dd;border-radius:999px;background:#fff;padding:8px 11px;color:#1f3149;font-weight:800";
        b.onclick=()=>{searchInput.value=topic.query;render(topic.query);};
        row.appendChild(b);
      });
      searchResults.append(wrap,row);
      return;
    }

    results.forEach(({item})=>{
      const b=document.createElement("button");
      b.className="cy-searcy-result";
      b.type="button";
      b.innerHTML='<span class="cy-searcy-result__section">'+item.section+'</span><span class="cy-searcy-result__title">'+item.title+'</span><span class="cy-searcy-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
      b.onclick=()=>jump(item);
      searchResults.appendChild(b);
    });
  };

  if(searchInput){
    searchInput.addEventListener("input",()=>render(searchInput.value));
    searchInput.addEventListener("keydown",e=>{if(e.key==="Escape")closeSearch();});
    render("");
  }
});