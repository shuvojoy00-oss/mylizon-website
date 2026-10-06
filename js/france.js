document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-fr-guide-link]")];
  const sections=[...document.querySelectorAll("[data-fr-section]")];
  const guideSheet=document.querySelector("#fr-guide-sheet");
  const searchSheet=document.querySelector("#fr-searfr-sheet");
  const guideLabel=document.querySelector("[data-fr-guide-label]");
  const searchInput=document.querySelector("#fr-page-searfr-input");
  const searchResults=document.querySelector("#fr-page-searfr-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".fr-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-fr-guide-toggle],[data-fr-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-fr-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-fr-searfr-toggle],[data-fr-searfr-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-fr-searfr-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "etudes en france":"etudes en france 2026 change",
    "études en france":"etudes en france 2026 change",
    "eef":"etudes en france 2026 change",
    "dap":"bangladesh eligibility",
    "hsc":"bangladesh eligibility",
    "2 years bachelor":"bangladesh eligibility",
    "ssc":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "tcf":"language",
    "delf":"language",
    "dalf":"language",
    "ielts":"language",
    "615":"money resources",
    "7380":"money resources",
    "tuition":"tuition 2026 27",
    "2902":"tuition 2026 27",
    "3950":"tuition 2026 27",
    "398":"tuition 2026 27",
    "cvec":"cvec",
    "105":"cvec",
    "vls ts":"vls ts student visa bangladesh",
    "vls-ts":"vls ts student visa bangladesh",
    "student visa":"vls ts student visa bangladesh",
    "campus france":"etudes en france 2026 change",
    "50":"visa residence costs",
    "75":"visa residence costs",
    "964":"work while studying",
    "964 hours":"work while studying",
    "student work":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "18 months":"spouse family",
    "healthcare":"healthcare social security",
    "social security":"healthcare social security",
    "job search":"after study",
    "recherche emploi":"after study",
    "1 year":"after study",
    "2800.53":"after study",
    "blue card":"work long term stay",
    "paris":"cities",
    "lyon":"cities",
    "toulouse":"cities",
    "grenoble":"cities",
    "strasbourg":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .fr-card,main .fr-fact,main .fr-price-box,main .fr-time,main .fr-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".fr-eyebrow")?section.querySelector(".fr-eyebrow").textContent.trim():"France Guide";
    if(!node.id)node.id="fr-searfr-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Études en France",terms:["etudes en france","études en france","eef","campus france"],query:"etudes en france"},
    {label:"Bangladesh Bachelor eligibility",terms:["hsc","ssc","2 years bachelor","dap"],query:"hsc"},
    {label:"€615 living resources",terms:["615","7380","funds","resources"],query:"615"},
    {label:"2026/27 tuition",terms:["tuition","2902","3950","398"],query:"tuition"},
    {label:"CVEC €105",terms:["cvec","105","campus fee"],query:"cvec"},
    {label:"VLS-TS student visa",terms:["vls ts","vls-ts","student visa"],query:"vls-ts"},
    {label:"964-hour work rule",terms:["964","964 hours","student work"],query:"964 hours"},
    {label:"Spouse & family",terms:["spouse","family","18 months"],query:"spouse"},
    {label:"Healthcare",terms:["healthcare","social security","assurance maladie"],query:"healthcare"},
    {label:"1-year graduate route",terms:["job search","recherche emploi","1 year","2800.53"],query:"job search"},
    {label:"EU Blue Card / Talent",terms:["blue card","talent","work permit"],query:"blue card"},
    {label:"Cities",terms:["paris","lyon","toulouse","grenoble","strasbourg"],query:"paris"}
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
    item.node.classList.add("fr-page-searfr-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("fr-page-searfr-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="fr-searfr-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd France</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="fr-searfr-empty";
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
      b.className="fr-searfr-result";
      b.type="button";
      b.innerHTML='<span class="fr-searfr-result__section">'+item.section+'</span><span class="fr-searfr-result__title">'+item.title+'</span><span class="fr-searfr-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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