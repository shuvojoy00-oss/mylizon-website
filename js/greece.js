document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-gr-guide-link]")];
  const sections=[...document.querySelectorAll("[data-gr-section]")];
  const guideSheet=document.querySelector("#gr-guide-sheet");
  const searchSheet=document.querySelector("#gr-seargr-sheet");
  const guideLabel=document.querySelector("[data-gr-guide-label]");
  const searchInput=document.querySelector("#gr-page-seargr-input");
  const searchResults=document.querySelector("#gr-page-seargr-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".gr-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-gr-guide-toggle],[data-gr-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-gr-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-gr-seargr-toggle],[data-gr-seargr-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-gr-seargr-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "doatap":"bangladesh eligibility",
    "english bachelor":"bangladesh eligibility",
    "greek bachelor":"bangladesh eligibility",
    "b2":"language",
    "ielts":"language",
    "650":"money sufficient resources",
    "7800":"money sufficient resources",
    "funds":"money sufficient resources",
    "tuition":"tuition",
    "scholarship":"scholarships",
    "iky":"scholarships",
    "visa":"d type student visa bangladesh",
    "student visa":"d type student visa bangladesh",
    "gvcw":"d type student visa bangladesh",
    "dhaka":"d type student visa bangladesh",
    "90":"visa residence costs",
    "150":"visa residence costs",
    "16":"visa residence costs",
    "residence permit":"arrival",
    "20 hours":"work while studying 2026 law",
    "student work":"work while studying 2026 law",
    "family":"spouse family",
    "spouse":"spouse family",
    "amka":"health insurance amka",
    "insurance":"health insurance amka",
    "h11":"after study",
    "h.11":"after study",
    "1 year":"after study",
    "job search":"after study",
    "business":"after study",
    "blue card":"work long term stay",
    "athens":"cities",
    "thessaloniki":"cities",
    "patras":"cities",
    "crete":"cities",
    "ioannina":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .gr-card,main .gr-fact,main .gr-price-box,main .gr-time,main .gr-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".gr-eyebrow")?section.querySelector(".gr-eyebrow").textContent.trim():"Greece Guide";
    if(!node.id)node.id="gr-seargr-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh HSC / Bachelor",terms:["hsc","english bachelor","greek bachelor","bangladesh"],query:"hsc"},
    {label:"DOATAP / Master recognition",terms:["doatap","masters","recognition"],query:"doatap"},
    {label:"€650 living funds",terms:["650","7800","funds","resources"],query:"650"},
    {label:"Student visa / GVCW Dhaka",terms:["student visa","visa","gvcw","dhaka"],query:"gvcw"},
    {label:"€90 visa / €150 permit",terms:["90","150","visa fee","permit fee"],query:"90"},
    {label:"20-hour work rule",terms:["20 hours","student work","part time"],query:"20 hours"},
    {label:"Spouse & family",terms:["spouse","family","dependant"],query:"spouse"},
    {label:"AMKA / health insurance",terms:["amka","insurance","healthcare"],query:"amka"},
    {label:"H.11 one-year graduate route",terms:["h11","h.11","1 year","job search","business"],query:"h.11"},
    {label:"Tuition",terms:["tuition","fees","medicine"],query:"tuition"},
    {label:"Scholarships",terms:["scholarship","iky","erasmus"],query:"iky"},
    {label:"Cities",terms:["athens","thessaloniki","patras","crete","ioannina"],query:"athens"}
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
    item.node.classList.add("gr-page-seargr-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("gr-page-seargr-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="gr-seargr-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Greece</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="gr-seargr-empty";
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
      b.className="gr-seargr-result";
      b.type="button";
      b.innerHTML='<span class="gr-seargr-result__section">'+item.section+'</span><span class="gr-seargr-result__title">'+item.title+'</span><span class="gr-seargr-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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