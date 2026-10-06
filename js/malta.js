document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-mt-guide-link]")];
  const sections=[...document.querySelectorAll("[data-mt-section]")];
  const guideSheet=document.querySelector("#mt-guide-sheet");
  const searchSheet=document.querySelector("#mt-searmt-sheet");
  const guideLabel=document.querySelector("[data-mt-guide-label]");
  const searchInput=document.querySelector("#mt-page-searmt-input");
  const searchResults=document.querySelector("#mt-page-searmt-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".mt-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-mt-guide-toggle],[data-mt-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-mt-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-mt-searmt-toggle],[data-mt-searmt-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-mt-searmt-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "mqric":"bangladesh eligibility",
    "mqf":"bangladesh eligibility",
    "mqf 5":"bangladesh eligibility",
    "hsc":"bangladesh eligibility",
    "recognition":"bangladesh eligibility",
    "mcast":"maltese higher education",
    "university of malta":"maltese higher education",
    "its":"maltese higher education",
    "vfs":"student d visa vfs dhaka",
    "dhaka":"student d visa vfs dhaka",
    "d visa":"student d visa vfs dhaka",
    "105 days":"student d visa vfs dhaka",
    "financial evidence":"money financial evidence",
    "60%":"money financial evidence",
    "20 hours":"work while studying",
    "jobsplus":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "2 years":"spouse family",
    "insurance":"health insurance screening",
    "9 months":"after study",
    "job search":"after study",
    "single permit":"work long term stay",
    "50":"visa residence costs",
    "100":"visa residence costs",
    "150":"visa residence costs",
    "msida":"places to live",
    "sliema":"places to live",
    "st julians":"places to live",
    "valletta":"places to live"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .mt-card,main .mt-fact,main .mt-price-box,main .mt-time,main .mt-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".mt-eyebrow")?section.querySelector(".mt-eyebrow").textContent.trim():"Malta Guide";
    if(!node.id)node.id="mt-searmt-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"MQRIC / MQF Level 5",terms:["mqric","mqf","mqf 5","recognition"],query:"mqric"},
    {label:"Bangladesh HSC",terms:["hsc","bangladesh","bachelor"],query:"hsc"},
    {label:"VFS Dhaka / D visa",terms:["vfs","dhaka","d visa","105 days"],query:"vfs"},
    {label:"Financial evidence",terms:["financial evidence","60%","funds","bank"],query:"financial evidence"},
    {label:"20-hour work rule",terms:["20 hours","student work","jobsplus"],query:"20 hours"},
    {label:"Spouse & family",terms:["spouse","family","2 years"],query:"spouse"},
    {label:"Health insurance",terms:["insurance","screening","health"],query:"insurance"},
    {label:"9-month graduate route",terms:["9 months","job search","graduate"],query:"9 months"},
    {label:"Single Permit",terms:["single permit","work permit","employment"],query:"single permit"},
    {label:"Visa / residence fees",terms:["50","100","150","visa fee","residence fee"],query:"50"},
    {label:"University of Malta / MCAST",terms:["university of malta","mcast","its"],query:"mcast"},
    {label:"Places to live",terms:["msida","sliema","st julians","valletta"],query:"msida"}
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
    item.node.classList.add("mt-page-searmt-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("mt-page-searmt-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="mt-searmt-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Malta</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="mt-searmt-empty";
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
      b.className="mt-searmt-result";
      b.type="button";
      b.innerHTML='<span class="mt-searmt-result__section">'+item.section+'</span><span class="mt-searmt-result__title">'+item.title+'</span><span class="mt-searmt-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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