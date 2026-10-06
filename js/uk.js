document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-uk-guide-link]")];
  const sections=[...document.querySelectorAll("[data-uk-section]")];
  const guideSheet=document.querySelector("#uk-guide-sheet");
  const searchSheet=document.querySelector("#uk-search-sheet");
  const guideLabel=document.querySelector("[data-uk-guide-label]");
  const searchInput=document.querySelector("#uk-page-search-input");
  const searchResults=document.querySelector("#uk-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".uk-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-uk-guide-toggle],[data-uk-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-uk-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-uk-search-toggle],[data-uk-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-uk-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "cas":"confirmation of acceptance for studies",
    "confirmation":"confirmation of acceptance for studies",
    "tb":"tb test tuberculosis",
    "tuberculosis":"tb test tuberculosis",
    "ihs":"immigration health surcharge",
    "health surcharge":"immigration health surcharge",
    "spouse":"dependants",
    "partner":"dependants",
    "dependant":"dependants",
    "dependent":"dependants",
    "psw":"graduate route",
    "graduate visa":"graduate route",
    "post study":"graduate route",
    "graduate route":"graduate route",
    "skilled":"skilled worker",
    "work visa":"skilled worker",
    "settlement":"skilled worker settlement",
    "ilr":"indefinite leave to remain",
    "atas":"atas",
    "bank":"financial evidence",
    "maintenance":"money maintenance",
    "funds":"money maintenance",
    "28 days":"financial evidence",
    "hsc":"bangladesh eligibility",
    "cgpa":"bangladesh eligibility",
    "gap":"study gap",
    "ielts":"english",
    "pte":"english",
    "selt":"english",
    "sop":"documents credibility",
    "police":"police clearance",
    "pcc":"police clearance",
    "london":"london outside london",
    "visa fee":"visa costs",
    "scholarship":"scholarships",
    "chevening":"scholarships"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .uk-card,main .uk-fact,main .uk-price-box,main .uk-time,main .uk-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".uk-eyebrow")?section.querySelector(".uk-eyebrow").textContent.trim():"UK Guide";
    if(!node.id)node.id="uk-search-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"CAS",terms:["cas","confirmation of acceptance for studies"],query:"cas"},
    {label:"Student visa",terms:["visa","student visa"],query:"visa"},
    {label:"Maintenance funds",terms:["maintenance","funds","bank","28 days"],query:"maintenance"},
    {label:"TB test",terms:["tb","tuberculosis","medical"],query:"tb"},
    {label:"Dependants",terms:["dependant","dependent","spouse","partner","family"],query:"dependant"},
    {label:"Graduate Route",terms:["graduate","psw","post study"],query:"graduate route"},
    {label:"Skilled Worker",terms:["skilled worker","work visa","settlement"],query:"skilled worker"},
    {label:"IHS",terms:["ihs","health surcharge","healthcare"],query:"ihs"},
    {label:"ATAS",terms:["atas","technology approval"],query:"atas"},
    {label:"English",terms:["ielts","pte","selt","english"],query:"ielts"},
    {label:"Bangladesh entry",terms:["hsc","cgpa","foundation","bangladesh"],query:"hsc"},
    {label:"Scholarships",terms:["scholarship","chevening","commonwealth"],query:"scholarship"}
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
    item.node.classList.add("uk-page-search-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("uk-page-search-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="uk-search-empty">Try <strong>CAS</strong>, <strong>TB test</strong>, <strong>dependant</strong>, <strong>Graduate Route</strong>, <strong>IHS</strong> or <strong>maintenance</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="uk-search-empty";
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
      b.className="uk-search-result";
      b.type="button";
      b.innerHTML='<span class="uk-search-result__section">'+item.section+'</span><span class="uk-search-result__title">'+item.title+'</span><span class="uk-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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