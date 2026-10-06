document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-hr-guide-link]")];
  const sections=[...document.querySelectorAll("[data-hr-section]")];
  const guideSheet=document.querySelector("#hr-guide-sheet");
  const searchSheet=document.querySelector("#hr-searhr-sheet");
  const guideLabel=document.querySelector("[data-hr-guide-label]");
  const searchInput=document.querySelector("#hr-page-searhr-input");
  const searchResults=document.querySelector("#hr-page-searhr-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".hr-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-hr-guide-toggle],[data-hr-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-hr-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-hr-searhr-toggle],[data-hr-searhr-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-hr-searhr-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "recognition":"bangladesh eligibility",
    "postani student":"bangladesh eligibility",
    "azvo":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "university":"croatian higher education",
    "polytechnic":"croatian higher education",
    "veleuciliste":"croatian higher education",
    "362.25":"money 2026 formula",
    "4347":"money 2026 formula",
    "869.40":"money 2026 formula",
    "funds":"money 2026 formula",
    "tuition":"tuition",
    "scholarship":"scholarships",
    "temporary residence":"temporary residence for study",
    "student residence":"temporary residence for study",
    "vfs":"temporary residence for study",
    "dhaka":"temporary residence for study",
    "new delhi":"temporary residence for study",
    "46.45":"residence visa costs",
    "31.85":"residence visa costs",
    "93":"residence visa costs",
    "25 hours":"work while studying 2026 amendment",
    "student service":"work while studying 2026 amendment",
    "6.56":"work while studying 2026 amendment",
    "family":"spouse family",
    "spouse":"spouse family",
    "health insurance":"health insurance",
    "hzzo":"health insurance",
    "1 year":"after study",
    "job search":"after study",
    "company":"after study",
    "trade":"after study",
    "blue card":"work long term stay",
    "zagreb":"cities",
    "split":"cities",
    "rijeka":"cities",
    "osijek":"cities",
    "dubrovnik":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .hr-card,main .hr-fact,main .hr-price-box,main .hr-time,main .hr-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".hr-eyebrow")?section.querySelector(".hr-eyebrow").textContent.trim():"Croatia Guide";
    if(!node.id)node.id="hr-searhr-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"HSC / recognition",terms:["hsc","recognition","azvo","postani student"],query:"recognition"},
    {label:"University vs polytechnic",terms:["university","polytechnic","veleuciliste"],query:"polytechnic"},
    {label:"€362.25 monthly funds",terms:["362.25","4347","869.40","funds"],query:"362.25"},
    {label:"Temporary residence for study",terms:["temporary residence","student residence","study permit"],query:"temporary residence"},
    {label:"Bangladesh / VFS Dhaka",terms:["vfs","dhaka","new delhi","bangladesh"],query:"vfs"},
    {label:"€93 Visa D",terms:["93","visa d","long stay visa"],query:"93"},
    {label:"25-hour work rule",terms:["25 hours","student work","student service"],query:"25 hours"},
    {label:"€6.56 minimum student rate",terms:["6.56","minimum student rate","student service"],query:"6.56"},
    {label:"Spouse & family",terms:["spouse","family","family reunification"],query:"spouse"},
    {label:"HZZO / health insurance",terms:["hzzo","health insurance","insurance"],query:"hzzo"},
    {label:"1-year graduate route",terms:["1 year","job search","company","trade"],query:"1 year"},
    {label:"Cities",terms:["zagreb","split","rijeka","osijek","dubrovnik"],query:"zagreb"}
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
    item.node.classList.add("hr-page-searhr-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("hr-page-searhr-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="hr-searhr-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Croatia</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="hr-searhr-empty";
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
      b.className="hr-searhr-result";
      b.type="button";
      b.innerHTML='<span class="hr-searhr-result__section">'+item.section+'</span><span class="hr-searhr-result__title">'+item.title+'</span><span class="hr-searhr-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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