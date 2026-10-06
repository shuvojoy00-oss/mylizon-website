document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-de-guide-link]")];
  const sections=[...document.querySelectorAll("[data-de-section]")];
  const guideSheet=document.querySelector("#de-guide-sheet");
  const searchSheet=document.querySelector("#de-searde-sheet");
  const guideLabel=document.querySelector("[data-de-guide-label]");
  const searchInput=document.querySelector("#de-page-searde-input");
  const searchResults=document.querySelector("#de-page-searde-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".de-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-de-guide-toggle],[data-de-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-de-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-de-searde-toggle],[data-de-searde-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-de-searde-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "studienkolleg":"studienkolleg",
    "fsp":"studienkolleg",
    "feststellungsprufung":"studienkolleg",
    "feststellungsprüfung":"studienkolleg",
    "1 year bachelor":"bangladesh eligibility",
    "one year university":"bangladesh eligibility",
    "daad":"bangladesh eligibility",
    "anabin":"bangladesh eligibility",
    "aps":"bangladesh eligibility",
    "uni assist":"uni assist vpd",
    "uni-assist":"uni assist vpd",
    "vpd":"uni assist vpd",
    "75":"uni assist vpd",
    "30":"uni assist vpd",
    "11904":"money blocked account",
    "992":"money blocked account",
    "blocked account":"money blocked account",
    "sperrkonto":"money blocked account",
    "tuition":"tuition",
    "1500":"tuition",
    "tum":"tuition",
    "visa":"national student visa dhaka",
    "student visa":"national student visa dhaka",
    "28000":"visa costs",
    "140 days":"work while studying",
    "280 half":"work while studying",
    "20 hours":"work while studying",
    "student work":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "health insurance":"health insurance",
    "insurance":"health insurance",
    "18 months":"after study",
    "job search":"after study",
    "blue card":"skilled work settlement",
    "settlement":"skilled work settlement",
    "2 years":"skilled work settlement",
    "berlin":"cities",
    "munich":"cities",
    "aachen":"cities",
    "stuttgart":"cities",
    "hamburg":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .de-card,main .de-fact,main .de-price-box,main .de-time,main .de-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".de-eyebrow")?section.querySelector(".de-eyebrow").textContent.trim():"Germany Guide";
    if(!node.id)node.id="de-searde-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"HSC / Studienkolleg",terms:["hsc","studienkolleg","fsp","feststellungsprufung"],query:"studienkolleg"},
    {label:"1 year university route",terms:["1 year bachelor","one year university","direct admission"],query:"1 year bachelor"},
    {label:"DAAD / anabin",terms:["daad","anabin","recognition"],query:"daad"},
    {label:"uni-assist / VPD",terms:["uni assist","uni-assist","vpd","75","30"],query:"uni-assist"},
    {label:"€11,904 blocked account",terms:["11904","992","blocked account","sperrkonto"],query:"11904"},
    {label:"Student visa Dhaka",terms:["visa","student visa","dhaka"],query:"student visa"},
    {label:"140-day work rule",terms:["140 days","280 half","20 hours","student work"],query:"140 days"},
    {label:"Spouse & family",terms:["spouse","family","family reunion"],query:"spouse"},
    {label:"Health insurance",terms:["health insurance","insurance"],query:"health insurance"},
    {label:"18-month graduate route",terms:["18 months","job search","graduate"],query:"18 months"},
    {label:"Blue Card / settlement",terms:["blue card","settlement","2 years"],query:"blue card"},
    {label:"Cities",terms:["berlin","munich","aachen","stuttgart","hamburg"],query:"berlin"}
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
    item.node.classList.add("de-page-searde-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("de-page-searde-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="de-searde-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Germany</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="de-searde-empty";
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
      b.className="de-searde-result";
      b.type="button";
      b.innerHTML='<span class="de-searde-result__section">'+item.section+'</span><span class="de-searde-result__title">'+item.title+'</span><span class="de-searde-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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