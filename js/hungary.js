document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-hu-guide-link]")];
  const sections=[...document.querySelectorAll("[data-hu-section]")];
  const guideSheet=document.querySelector("#hu-guide-sheet");
  const searchSheet=document.querySelector("#hu-searhu-sheet");
  const guideLabel=document.querySelector("[data-hu-guide-label]");
  const searchInput=document.querySelector("#hu-page-searhu-input");
  const searchResults=document.querySelector("#hu-page-searhu-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".hu-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-hu-guide-toggle],[data-hu-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-hu-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-hu-searhu-toggle],[data-hu-searhu-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-hu-searhu-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "recognition":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "stipendium":"stipendium hungaricum bangladesh",
    "stipendium hungaricum":"stipendium hungaricum bangladesh",
    "43700":"stipendium hungaricum bangladesh",
    "40000":"stipendium hungaricum bangladesh",
    "dhaka":"residence permit for studies bangladesh",
    "d visa":"residence permit for studies bangladesh",
    "residence permit":"residence permit for studies bangladesh",
    "30 hours":"work while studying",
    "90 days":"work while studying",
    "family":"spouse family important restriction",
    "spouse":"spouse family important restriction",
    "9 months":"after study",
    "job search":"after study",
    "business":"after study",
    "hungarian card":"work long term stay",
    "blue card":"work long term stay",
    "tuition":"tuition",
    "debrecen":"cities",
    "budapest":"cities",
    "szeged":"cities",
    "pecs":"cities",
    "gyor":"cities",
    "insurance":"health insurance"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .hu-card,main .hu-fact,main .hu-price-box,main .hu-time,main .hu-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".hu-eyebrow")?section.querySelector(".hu-eyebrow").textContent.trim():"Hungary Guide";
    if(!node.id)node.id="hu-searhu-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh admission",terms:["hsc","recognition","masters"],query:"hsc"},
    {label:"Stipendium Hungaricum",terms:["stipendium","stipendium hungaricum","43700","40000"],query:"stipendium"},
    {label:"Dhaka D-visa / study residence",terms:["dhaka","d visa","residence permit","student visa"],query:"dhaka"},
    {label:"30-hour work rule",terms:["30 hours","student work","90 days"],query:"30 hours"},
    {label:"Family restriction",terms:["spouse","family","dependant"],query:"spouse"},
    {label:"9-month graduate route",terms:["9 months","job search","business"],query:"9 months"},
    {label:"Hungarian Card / Blue Card",terms:["hungarian card","blue card","work"],query:"hungarian card"},
    {label:"Tuition",terms:["tuition","fees","medicine"],query:"tuition"},
    {label:"Health insurance",terms:["insurance","healthcare"],query:"insurance"},
    {label:"Budapest",terms:["budapest","capital"],query:"budapest"},
    {label:"Regional cities",terms:["debrecen","szeged","pecs","gyor"],query:"debrecen"}
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
    item.node.classList.add("hu-page-searhu-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("hu-page-searhu-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="hu-searhu-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Hungary</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="hu-searhu-empty";
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
      b.className="hu-searhu-result";
      b.type="button";
      b.innerHTML='<span class="hu-searhu-result__section">'+item.section+'</span><span class="hu-searhu-result__title">'+item.title+'</span><span class="hu-searhu-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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