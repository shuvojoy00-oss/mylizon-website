document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-it-guide-link]")];
  const sections=[...document.querySelectorAll("[data-it-section]")];
  const guideSheet=document.querySelector("#it-guide-sheet");
  const searchSheet=document.querySelector("#it-searit-sheet");
  const guideLabel=document.querySelector("[data-it-guide-label]");
  const searchInput=document.querySelector("#it-page-searit-input");
  const searchResults=document.querySelector("#it-page-searit-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".it-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-it-guide-toggle],[data-it-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-it-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-it-searit-toggle],[data-it-searit-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-it-searit-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "universitaly":"universitaly pre enrolment",
    "pre enrolment":"universitaly pre enrolment",
    "pre-enrolment":"universitaly pre enrolment",
    "cimea":"bangladesh eligibility",
    "declaration of value":"bangladesh eligibility",
    "dov":"bangladesh eligibility",
    "apostille":"bangladesh eligibility",
    "hsc":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "ielts 6":"language",
    "ielts":"language",
    "b2":"language",
    "10179.85":"money financial means",
    "848.25":"money financial means",
    "bank statement":"money financial means",
    "sponsor":"sponsor bangladesh",
    "12 months":"money financial means",
    "maeci":"scholarships",
    "dsu":"scholarships",
    "scholarship":"scholarships",
    "visa":"d type study visa dhaka",
    "student visa":"d type study visa dhaka",
    "vfs":"d type study visa dhaka",
    "50":"visa residence costs",
    "permesso":"arrival",
    "permesso di soggiorno":"arrival",
    "20 hours":"work while studying",
    "1040":"work while studying",
    "1040 hours":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "health insurance":"health insurance ssn",
    "ssn":"health insurance ssn",
    "attesa occupazione":"after study",
    "12 month job search":"after study",
    "blue card":"work long term stay",
    "milan":"cities",
    "bologna":"cities",
    "rome":"cities",
    "turin":"cities",
    "padua":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .it-card,main .it-fact,main .it-price-box,main .it-time,main .it-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".it-eyebrow")?section.querySelector(".it-eyebrow").textContent.trim():"Italy Guide";
    if(!node.id)node.id="it-searit-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Universitaly pre-enrolment",terms:["universitaly","pre enrolment","pre-enrolment"],query:"universitaly"},
    {label:"CIMEA / Declaration of Value",terms:["cimea","declaration of value","dov"],query:"cimea"},
    {label:"Bangladesh HSC / Bachelor",terms:["hsc","bachelor","12 years"],query:"hsc"},
    {label:"IELTS 6 / B2",terms:["ielts 6","ielts","b2","language"],query:"ielts 6"},
    {label:"€10,179.85 finances",terms:["10179.85","848.25","funds","bank statement"],query:"10179.85"},
    {label:"Sponsor rules",terms:["sponsor","parents","siblings","cousins"],query:"sponsor"},
    {label:"MAECI / DSU scholarships",terms:["maeci","dsu","scholarship"],query:"maeci"},
    {label:"Study visa / VFS Dhaka",terms:["student visa","visa","vfs","dhaka"],query:"vfs"},
    {label:"20-hour / 1,040-hour work",terms:["20 hours","1040","1040 hours","student work"],query:"1040"},
    {label:"Permesso di soggiorno",terms:["permesso","permesso di soggiorno","residence permit"],query:"permesso"},
    {label:"12-month graduate route",terms:["attesa occupazione","12 month job search","graduate"],query:"attesa occupazione"},
    {label:"Cities",terms:["milan","bologna","rome","turin","padua"],query:"milan"}
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
    item.node.classList.add("it-page-searit-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("it-page-searit-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="it-searit-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Italy</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="it-searit-empty";
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
      b.className="it-searit-result";
      b.type="button";
      b.innerHTML='<span class="it-searit-result__section">'+item.section+'</span><span class="it-searit-result__title">'+item.title+'</span><span class="it-searit-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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