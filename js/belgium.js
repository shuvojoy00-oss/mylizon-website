document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-be-guide-link]")];
  const sections=[...document.querySelectorAll("[data-be-section]")];
  const guideSheet=document.querySelector("#be-guide-sheet");
  const searchSheet=document.querySelector("#be-search-sheet");
  const guideLabel=document.querySelector("[data-be-guide-label]");
  const searchInput=document.querySelector("#be-page-search-input");
  const searchResults=document.querySelector("#be-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".be-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-be-guide-toggle],[data-be-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-be-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-be-search-toggle],[data-be-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-be-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "flanders":"flanders",
    "wallonia":"french speaking belgium",
    "wallonie":"french speaking belgium",
    "french":"french speaking belgium",
    "brussels":"brussels",
    "blocked account":"blocked account",
    "block account":"blocked account",
    "solvency":"money solvency tuition",
    "1062":"money solvency tuition",
    "annex 32":"annex 32 sponsor documents",
    "annex32":"annex 32 sponsor documents",
    "sponsor":"annex 32 sponsor documents",
    "visa d":"visa d student",
    "visa":"visa d student",
    "vfs":"book vfs dhaka",
    "medical":"medical certificate",
    "police":"police certificate",
    "pcc":"police certificate",
    "health insurance":"health insurance",
    "insurance":"health insurance",
    "work":"work while studying",
    "20 hours":"work while studying",
    "orientation year":"orientation year",
    "search year":"orientation year",
    "12 months":"orientation year",
    "single permit":"work long term stay",
    "blue card":"work long term stay",
    "spouse":"spouse family",
    "family":"spouse family",
    "master mind":"scholarships",
    "ares":"scholarships",
    "wbi":"scholarships",
    "hsc":"bangladesh eligibility",
    "cgpa":"bangladesh eligibility",
    "gap":"study gap",
    "ielts":"language",
    "french language":"language",
    "dutch":"language",
    "tuition":"tuition",
    "living cost":"living",
    "leuven":"cities",
    "ghent":"cities",
    "antwerp":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .be-card,main .be-fact,main .be-price-box,main .be-time,main .be-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".be-eyebrow")?section.querySelector(".be-eyebrow").textContent.trim():"Belgium Guide";
    if(!node.id)node.id="be-search-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Flanders vs French-speaking Belgium",terms:["flanders","wallonia","french","brussels"],query:"flanders"},
    {label:"Blocked account / solvency",terms:["blocked account","solvency","1062","funds"],query:"solvency"},
    {label:"Annex 32 sponsor",terms:["annex 32","annex32","sponsor"],query:"annex 32"},
    {label:"Visa D",terms:["visa d","student visa","visa"],query:"visa d"},
    {label:"VFS Dhaka",terms:["vfs","dhaka","visa centre"],query:"vfs"},
    {label:"Medical certificate",terms:["medical","doctor","certificate"],query:"medical"},
    {label:"Work while studying",terms:["work","20 hours","student job"],query:"work"},
    {label:"Orientation year",terms:["orientation year","search year","12 months"],query:"orientation year"},
    {label:"Spouse & family",terms:["spouse","family","family reunion"],query:"spouse"},
    {label:"Scholarships",terms:["master mind","ares","wbi","scholarship"],query:"scholarship"},
    {label:"Health insurance",terms:["insurance","health insurance","mutuality"],query:"insurance"},
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
    item.node.classList.add("be-page-search-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("be-page-search-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="be-search-empty">Try <strong>blocked account</strong>, <strong>Annex 32</strong>, <strong>Visa D</strong>, <strong>Flanders</strong>, <strong>orientation year</strong> or <strong>spouse</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="be-search-empty";
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
      b.className="be-search-result";
      b.type="button";
      b.innerHTML='<span class="be-search-result__section">'+item.section+'</span><span class="be-search-result__title">'+item.title+'</span><span class="be-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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