document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-us-guide-link]")];
  const sections=[...document.querySelectorAll("[data-us-section]")];
  const guideSheet=document.querySelector("#us-guide-sheet");
  const searchSheet=document.querySelector("#us-search-sheet");
  const guideLabel=document.querySelector("[data-us-guide-label]");
  const searchInput=document.querySelector("#us-page-search-input");
  const searchResults=document.querySelector("#us-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".us-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-us-guide-toggle],[data-us-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-us-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-us-search-toggle],[data-us-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-us-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "i20":"form i 20",
    "i-20":"form i 20",
    "sevis":"sevis i 901",
    "i901":"sevis i 901",
    "f1":"f 1 student visa",
    "f-1":"f 1 student visa",
    "f2":"f 2 spouse children",
    "f-2":"f 2 spouse children",
    "cpt":"curricular practical training",
    "opt":"optional practical training",
    "stem opt":"stem opt",
    "stem":"stem opt",
    "ds160":"ds 160",
    "ds-160":"ds 160",
    "d/s":"duration of status",
    "duration":"duration of status",
    "spouse":"f 2 spouse children",
    "partner":"f 2 spouse children",
    "family":"f 2 spouse children",
    "community college":"community college",
    "2+2":"community college",
    "assistantship":"scholarships assistantships",
    "scholarship":"scholarships assistantships",
    "funds":"money i 20 funding",
    "bank":"financial evidence",
    "sponsor":"financial evidence",
    "visa fee":"visa costs",
    "h1b":"h 1b long term employment",
    "h-1b":"h 1b long term employment",
    "green card":"h 1b long term employment",
    "ielts":"english",
    "toefl":"english",
    "pte":"english",
    "sat":"english",
    "gre":"english",
    "gmat":"english",
    "hsc":"bangladesh eligibility",
    "cgpa":"bangladesh eligibility",
    "gap":"study gap",
    "police":"police clearance"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .us-card,main .us-fact,main .us-price-box,main .us-time,main .us-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".us-eyebrow")?section.querySelector(".us-eyebrow").textContent.trim():"USA Guide";
    if(!node.id)node.id="us-search-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"I-20",terms:["i20","i-20","form i 20"],query:"i20"},
    {label:"SEVIS I-901",terms:["sevis","i901","sevis fee"],query:"sevis"},
    {label:"F-1 visa",terms:["f1","f-1","student visa"],query:"f1"},
    {label:"F-2 spouse & children",terms:["f2","spouse","family"],query:"f2"},
    {label:"CPT",terms:["cpt","curricular practical training"],query:"cpt"},
    {label:"OPT",terms:["opt","optional practical training"],query:"opt"},
    {label:"STEM OPT",terms:["stem","stem opt"],query:"stem opt"},
    {label:"Community college 2+2",terms:["community college","2+2","transfer"],query:"community college"},
    {label:"Funding & sponsors",terms:["funds","bank","sponsor","financial"],query:"funds"},
    {label:"Scholarships & assistantships",terms:["scholarship","assistantship","funding"],query:"assistantship"},
    {label:"H-1B / long-term work",terms:["h1b","h-1b","green card","employment"],query:"h1b"},
    {label:"Bangladesh entry",terms:["hsc","cgpa","bangladesh"],query:"hsc"}
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
    item.node.classList.add("us-page-search-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("us-page-search-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="us-search-empty">Try <strong>I-20</strong>, <strong>SEVIS</strong>, <strong>CPT</strong>, <strong>OPT</strong>, <strong>F-2</strong> or <strong>funding</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="us-search-empty";
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
      b.className="us-search-result";
      b.type="button";
      b.innerHTML='<span class="us-search-result__section">'+item.section+'</span><span class="us-search-result__title">'+item.title+'</span><span class="us-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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