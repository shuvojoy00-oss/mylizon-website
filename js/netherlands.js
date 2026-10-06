document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-nl-guide-link]")];
  const sections=[...document.querySelectorAll("[data-nl-section]")];
  const guideSheet=document.querySelector("#nl-guide-sheet");
  const searchSheet=document.querySelector("#nl-searnl-sheet");
  const guideLabel=document.querySelector("[data-nl-guide-label]");
  const searchInput=document.querySelector("#nl-page-searnl-input");
  const searchResults=document.querySelector("#nl-page-searnl-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".nl-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-nl-guide-toggle],[data-nl-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-nl-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-nl-searnl-toggle],[data-nl-searnl-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-nl-searnl-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "hbo":"wo vs hbo",
    "wo":"wo vs hbo",
    "research university":"wo vs hbo",
    "applied sciences":"wo vs hbo",
    "nuffic":"bangladesh eligibility",
    "1130.77":"money study norm",
    "1130":"money study norm",
    "funds":"money study norm",
    "study norm":"money study norm",
    "254":"immigration costs",
    "mvv":"mvv student residence permit",
    "residence permit":"mvv student residence permit",
    "recognised sponsor":"mvv student residence permit",
    "recognized sponsor":"mvv student residence permit",
    "16 hours":"work while studying",
    "twv":"work while studying",
    "summer work":"work while studying",
    "self employed":"work while studying",
    "50 percent":"study progress matters",
    "50%":"study progress matters",
    "orientation year":"after study",
    "zoekjaar":"after study",
    "3122":"highly skilled migrant",
    "highly skilled migrant":"highly skilled migrant",
    "spouse":"spouse family",
    "family":"spouse family",
    "insurance":"health insurance",
    "housing":"housing",
    "scholarship":"scholarships",
    "nl scholarship":"scholarships",
    "amsterdam":"cities",
    "rotterdam":"cities",
    "delft":"cities",
    "eindhoven":"cities",
    "groningen":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .nl-card,main .nl-fact,main .nl-price-box,main .nl-time,main .nl-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".nl-eyebrow")?section.querySelector(".nl-eyebrow").textContent.trim():"Netherlands Guide";
    if(!node.id)node.id="nl-searnl-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh HSC / Nuffic",terms:["hsc","nuffic","bangladesh"],query:"hsc"},
    {label:"WO vs HBO",terms:["wo","hbo","research university","applied sciences"],query:"hbo"},
    {label:"€1,130.77 study norm",terms:["1130.77","study norm","funds"],query:"1130.77"},
    {label:"Recognised sponsor / MVV",terms:["recognised sponsor","recognized sponsor","mvv","residence permit"],query:"mvv"},
    {label:"16-hour work / TWV",terms:["16 hours","twv","student work"],query:"16 hours"},
    {label:"50% study progress",terms:["50 percent","50%","credits"],query:"50%"},
    {label:"Spouse & family",terms:["spouse","family","partner"],query:"spouse"},
    {label:"Health insurance",terms:["insurance","healthcare"],query:"insurance"},
    {label:"Housing shortage",terms:["housing","room","accommodation"],query:"housing"},
    {label:"Orientation year",terms:["orientation year","zoekjaar","post study"],query:"orientation year"},
    {label:"Highly skilled migrant",terms:["highly skilled migrant","3122","salary"],query:"3122"},
    {label:"NL Scholarship",terms:["nl scholarship","scholarship","5000"],query:"nl scholarship"}
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
    item.node.classList.add("nl-page-searnl-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("nl-page-searnl-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="nl-searnl-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Netherlands</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="nl-searnl-empty";
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
      b.className="nl-searnl-result";
      b.type="button";
      b.innerHTML='<span class="nl-searnl-result__section">'+item.section+'</span><span class="nl-searnl-result__title">'+item.title+'</span><span class="nl-searnl-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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