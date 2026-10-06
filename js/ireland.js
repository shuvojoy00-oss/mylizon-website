document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-ie-guide-link]")];
  const sections=[...document.querySelectorAll("[data-ie-section]")];
  const guideSheet=document.querySelector("#ie-guide-sheet");
  const searchSheet=document.querySelector("#ie-search-sheet");
  const guideLabel=document.querySelector("[data-ie-guide-label]");
  const searchInput=document.querySelector("#ie-page-search-input");
  const searchResults=document.querySelector("#ie-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".ie-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-ie-guide-toggle],[data-ie-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-ie-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-ie-search-toggle],[data-ie-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-ie-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "trusted":"trusted ireland",
    "trusted ireland":"trusted ireland",
    "ilep":"trusted ireland",
    "stamp 2":"work while studying stamp 2",
    "stamp2":"work while studying stamp 2",
    "stamp 1g":"third level graduate programme",
    "stamp1g":"third level graduate programme",
    "graduate visa":"third level graduate programme",
    "psw":"third level graduate programme",
    "10000":"money student finance",
    "€10000":"money student finance",
    "funds":"money student finance",
    "bank":"financial evidence",
    "sponsor":"financial evidence",
    "visa d":"long stay d study visa",
    "avats":"apply through avats",
    "visa fee":"visa registration costs",
    "registration":"immigration registration",
    "irp":"immigration registration",
    "20 hours":"work while studying stamp 2",
    "40 hours":"work while studying stamp 2",
    "spouse":"spouse family",
    "family":"spouse family",
    "phd spouse":"spouse family",
    "insurance":"health insurance",
    "medical insurance":"health insurance",
    "critical skills":"employment permits",
    "csep":"employment permits",
    "general employment permit":"employment permits",
    "gep":"employment permits",
    "pps":"arrival",
    "scholarship":"scholarships",
    "goi":"scholarships",
    "goi ies":"scholarships",
    "hsc":"bangladesh eligibility",
    "cgpa":"bangladesh eligibility",
    "gap":"study gap",
    "ielts":"english",
    "pte":"english",
    "tuition":"tuition",
    "dublin":"cities",
    "cork":"cities",
    "galway":"cities",
    "limerick":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .ie-card,main .ie-fact,main .ie-price-box,main .ie-time,main .ie-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".ie-eyebrow")?section.querySelector(".ie-eyebrow").textContent.trim():"Ireland Guide";
    if(!node.id)node.id="ie-search-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"TrustEd Ireland / ILEP",terms:["trusted","trusted ireland","ilep","provider"],query:"trusted"},
    {label:"€10,000 finance rule",terms:["10000","funds","finance","bank"],query:"10000"},
    {label:"Stamp 2 work",terms:["stamp 2","20 hours","40 hours","student work"],query:"stamp 2"},
    {label:"Stamp 1G",terms:["stamp 1g","graduate","post study","psw"],query:"stamp 1g"},
    {label:"Visa D / AVATS",terms:["visa d","avats","student visa"],query:"visa d"},
    {label:"IRP registration",terms:["irp","registration","300"],query:"irp"},
    {label:"Health insurance",terms:["insurance","medical insurance"],query:"insurance"},
    {label:"Spouse & family",terms:["spouse","family","phd"],query:"spouse"},
    {label:"Critical Skills permit",terms:["critical skills","csep","employment permit"],query:"critical skills"},
    {label:"General Employment Permit",terms:["general employment","gep"],query:"general employment permit"},
    {label:"Scholarships",terms:["scholarship","goi","goi ies"],query:"scholarship"},
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
    item.node.classList.add("ie-page-search-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("ie-page-search-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="ie-search-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Ireland</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="ie-search-empty";
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
      b.className="ie-search-result";
      b.type="button";
      b.innerHTML='<span class="ie-search-result__section">'+item.section+'</span><span class="ie-search-result__title">'+item.title+'</span><span class="ie-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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