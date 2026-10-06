document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-pl-guide-link]")];
  const sections=[...document.querySelectorAll("[data-pl-section]")];
  const guideSheet=document.querySelector("#pl-guide-sheet");
  const searchSheet=document.querySelector("#pl-searpl-sheet");
  const guideLabel=document.querySelector("[data-pl-guide-label]");
  const searchInput=document.querySelector("#pl-page-searpl-input");
  const searchResults=document.querySelector("#pl-page-searpl-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".pl-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-pl-guide-toggle],[data-pl-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-pl-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-pl-searpl-toggle],[data-pl-searpl-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-pl-searpl-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "nawa":"bangladesh eligibility",
    "syrena":"bangladesh eligibility",
    "recognition":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "1010":"money financial means",
    "823":"money financial means",
    "2500":"money financial means",
    "funds":"money financial means",
    "tuition":"tuition",
    "banach":"scholarships",
    "scholarship":"scholarships",
    "visa d":"d type national study visa",
    "e konsulat":"d type national study visa",
    "vfs":"d type national study visa",
    "mos":"mos temporary residence",
    "residence permit":"mos temporary residence",
    "work permit":"work while studying",
    "student work":"work while studying",
    "full time":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "nfz":"health insurance",
    "insurance":"health insurance",
    "9 months":"after study",
    "graduate":"after study",
    "job search":"after study",
    "blue card":"long term work residence",
    "warsaw":"cities",
    "krakow":"cities",
    "wroclaw":"cities",
    "gdansk":"cities",
    "poznan":"cities",
    "lodz":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .pl-card,main .pl-fact,main .pl-price-box,main .pl-time,main .pl-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".pl-eyebrow")?section.querySelector(".pl-eyebrow").textContent.trim():"Poland Guide";
    if(!node.id)node.id="pl-searpl-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"HSC / NAWA recognition",terms:["hsc","nawa","syrena","recognition"],query:"nawa"},
    {label:"PLN 1,010 finances",terms:["1010","823","2500","funds"],query:"1010"},
    {label:"D-type study visa",terms:["visa d","e konsulat","vfs","student visa"],query:"visa d"},
    {label:"MOS residence permit",terms:["mos","residence permit","temporary residence"],query:"mos"},
    {label:"Work without work permit",terms:["work permit","student work","full time"],query:"work permit"},
    {label:"Spouse & family",terms:["spouse","family","family reunification"],query:"spouse"},
    {label:"NFZ / health insurance",terms:["nfz","insurance","health"],query:"nfz"},
    {label:"9-month graduate permit",terms:["9 months","graduate","job search"],query:"9 months"},
    {label:"Tuition",terms:["tuition","fees","mba"],query:"tuition"},
    {label:"Scholarships",terms:["banach","scholarship","doctoral"],query:"banach"},
    {label:"Long-term work",terms:["blue card","work permit","long term"],query:"blue card"},
    {label:"Cities",terms:["warsaw","krakow","wroclaw","gdansk","poznan","lodz"],query:"warsaw"}
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
    item.node.classList.add("pl-page-searpl-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("pl-page-searpl-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="pl-searpl-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Poland</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="pl-searpl-empty";
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
      b.className="pl-searpl-result";
      b.type="button";
      b.innerHTML='<span class="pl-searpl-result__section">'+item.section+'</span><span class="pl-searpl-result__title">'+item.title+'</span><span class="pl-searpl-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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