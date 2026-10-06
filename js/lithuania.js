document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-lt-guide-link]")];
  const sections=[...document.querySelectorAll("[data-lt-section]")];
  const guideSheet=document.querySelector("#lt-guide-sheet");
  const searchSheet=document.querySelector("#lt-searlt-sheet");
  const guideLabel=document.querySelector("[data-lt-guide-label]");
  const searchInput=document.querySelector("#lt-page-searlt-input");
  const searchResults=document.querySelector("#lt-page-searlt-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".lt-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-lt-guide-toggle],[data-lt-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-lt-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-lt-searlt-toggle],[data-lt-searlt-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-lt-searlt-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "skvc":"bangladesh eligibility",
    "hsc":"bangladesh eligibility",
    "ssc":"bangladesh eligibility",
    "recognition":"bangladesh eligibility",
    "university":"university vs college",
    "college":"university vs college",
    "kolegija":"university vs college",
    "576.50":"money sufficient means",
    "6918":"money sufficient means",
    "1153":"money sufficient means",
    "funds":"money sufficient means",
    "tuition":"tuition",
    "scholarship":"scholarships",
    "migris":"migris temporary residence permit",
    "trp":"migris temporary residence permit",
    "residence permit":"migris temporary residence permit",
    "80":"residence permit cost",
    "vfs":"migris temporary residence permit",
    "india":"migris temporary residence permit",
    "new delhi":"migris temporary residence permit",
    "20 hours":"work while studying 2026 change",
    "40 hours":"work while studying 2026 change",
    "master":"work while studying 2026 change",
    "family":"spouse family 2026 rules",
    "spouse":"spouse family 2026 rules",
    "15 months":"after study",
    "12 months":"after study",
    "3 months":"after study",
    "job search":"after study",
    "self employment":"after study",
    "health insurance":"health insurance",
    "vilnius":"cities",
    "kaunas":"cities",
    "klaipeda":"cities",
    "blue card":"work long term stay"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .lt-card,main .lt-fact,main .lt-price-box,main .lt-time,main .lt-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".lt-eyebrow")?section.querySelector(".lt-eyebrow").textContent.trim():"Lithuania Guide";
    if(!node.id)node.id="lt-searlt-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"SKVC / Bangladesh HSC",terms:["skvc","hsc","ssc","recognition"],query:"skvc"},
    {label:"University vs college",terms:["university","college","kolegija"],query:"college"},
    {label:"€576.50 finances",terms:["576.50","6918","1153","funds"],query:"576.50"},
    {label:"MIGRIS residence permit",terms:["migris","trp","residence permit"],query:"migris"},
    {label:"€80 student permit fee",terms:["80","permit fee","state fee"],query:"80"},
    {label:"Bangladesh / New Delhi route",terms:["vfs","india","new delhi","bangladesh"],query:"new delhi"},
    {label:"20-hour Bachelor rule",terms:["20 hours","bachelor year 1","bachelor year 2"],query:"20 hours"},
    {label:"40-hour higher-level rule",terms:["40 hours","master","phd"],query:"40 hours"},
    {label:"Spouse & family",terms:["spouse","family","family reunification"],query:"spouse"},
    {label:"15-month graduate route",terms:["15 months","12 months","3 months","job search"],query:"15 months"},
    {label:"Tuition & scholarships",terms:["tuition","scholarship","fees"],query:"tuition"},
    {label:"Cities",terms:["vilnius","kaunas","klaipeda"],query:"vilnius"}
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
    item.node.classList.add("lt-page-searlt-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("lt-page-searlt-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="lt-searlt-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Lithuania</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="lt-searlt-empty";
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
      b.className="lt-searlt-result";
      b.type="button";
      b.innerHTML='<span class="lt-searlt-result__section">'+item.section+'</span><span class="lt-searlt-result__title">'+item.title+'</span><span class="lt-searlt-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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