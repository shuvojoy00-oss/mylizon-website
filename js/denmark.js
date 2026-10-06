document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-dk-guide-link]")];
  const sections=[...document.querySelectorAll("[data-dk-section]")];
  const guideSheet=document.querySelector("#dk-guide-sheet");
  const searchSheet=document.querySelector("#dk-seardk-sheet");
  const guideLabel=document.querySelector("[data-dk-guide-label]");
  const searchInput=document.querySelector("#dk-page-seardk-input");
  const searchResults=document.querySelector("#dk-page-seardk-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".dk-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-dk-guide-toggle],[data-dk-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-dk-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-dk-seardk-toggle],[data-dk-seardk-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-dk-seardk-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "quota 2":"bangladesh eligibility",
    "university copenhagen":"institution explorer",
    "aarhus":"institution explorer",
    "dtu":"institution explorer",
    "aalborg":"institution explorer",
    "sdu":"institution explorer",
    "cbs":"institution explorer",
    "state approved":"denmark s higher education system",
    "non state approved":"denmark s higher education system",
    "english b":"english",
    "ielts":"english",
    "toefl":"english",
    "7426":"money self support",
    "self support":"money self support",
    "funds":"money self support",
    "tuition":"tuition",
    "scholarship":"scholarships",
    "st1":"siri student residence permit",
    "siri":"siri student residence permit",
    "study permit":"siri student residence permit",
    "3060":"permit costs",
    "family":"spouse family new 2026 rule",
    "spouse":"spouse family new 2026 rule",
    "90 hours":"work while studying",
    "student work":"work while studying",
    "full time summer":"work while studying",
    "cpr":"cpr healthcare",
    "yellow card":"cpr healthcare",
    "healthcare":"cpr healthcare",
    "job seeking":"after study job seeking",
    "1 october":"after study job seeking",
    "positive list":"work permits after study",
    "pay limit":"work permits after study",
    "copenhagen":"cities",
    "odense":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .dk-card,main .dk-fact,main .dk-price-box,main .dk-time,main .dk-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".dk-eyebrow")?section.querySelector(".dk-eyebrow").textContent.trim():"Denmark Guide";
    if(!node.id)node.id="dk-seardk-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh eligibility",terms:["hsc","quota 2","bangladesh"],query:"hsc"},
    {label:"State-approved programmes",terms:["state approved","non state approved","programme"],query:"state approved"},
    {label:"DKK 7,426 self-support",terms:["7426","self support","funds"],query:"7426"},
    {label:"ST1 / SIRI permit",terms:["st1","siri","study permit"],query:"st1"},
    {label:"90-hour work rule",terms:["90 hours","student work","summer"],query:"90 hours"},
    {label:"Family rule from 1 Oct 2026",terms:["family","spouse","1 october"],query:"family"},
    {label:"CPR & healthcare",terms:["cpr","yellow card","healthcare"],query:"cpr"},
    {label:"Post-study job seeking",terms:["job seeking","1 year","3 years"],query:"job seeking"},
    {label:"Positive List",terms:["positive list","shortage occupation"],query:"positive list"},
    {label:"Pay Limit Scheme",terms:["pay limit","552000","446000"],query:"pay limit"},
    {label:"Scholarships",terms:["scholarship","tuition waiver","government scholarship"],query:"scholarship"},
    {label:"Universities",terms:["copenhagen","aarhus","dtu","aalborg","sdu","cbs"],query:"dtu"}
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
    item.node.classList.add("dk-page-seardk-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("dk-page-seardk-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="dk-seardk-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Denmark</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="dk-seardk-empty";
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
      b.className="dk-seardk-result";
      b.type="button";
      b.innerHTML='<span class="dk-seardk-result__section">'+item.section+'</span><span class="dk-seardk-result__title">'+item.title+'</span><span class="dk-seardk-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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