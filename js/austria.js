document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-at-guide-link]")];
  const sections=[...document.querySelectorAll("[data-at-section]")];
  const guideSheet=document.querySelector("#at-guide-sheet");
  const searchSheet=document.querySelector("#at-searat-sheet");
  const guideLabel=document.querySelector("[data-at-guide-label]");
  const searchInput=document.querySelector("#at-page-searat-input");
  const searchResults=document.querySelector("#at-page-searat-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".at-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-at-guide-toggle],[data-at-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-at-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-at-searat-toggle],[data-at-searat-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-at-searat-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "fachhochschule":"university vs fachhochschule",
    "fh":"university vs fachhochschule",
    "uas":"university vs fachhochschule",
    "bachelor":"bangladesh eligibility",
    "masters":"bangladesh eligibility",
    "german":"language",
    "ielts":"language",
    "722.58":"money 2026 age based rule",
    "1308.39":"money 2026 age based rule",
    "8670.96":"money 2026 age based rule",
    "15700.68":"money 2026 age based rule",
    "386.43":"money 2026 age based rule",
    "2064.12":"money 2026 age based rule",
    "funds":"money 2026 age based rule",
    "tuition":"tuition 2026",
    "726.72":"tuition 2026",
    "26.20":"tuition 2026",
    "scholarship":"scholarships",
    "residence permit":"residence permit student bangladesh",
    "student permit":"residence permit student bangladesh",
    "new delhi":"residence permit student bangladesh",
    "vfs":"residence permit student bangladesh",
    "218":"residence visa costs 2026",
    "20 hours":"work while studying",
    "ams":"work while studying",
    "family":"spouse family",
    "spouse":"spouse family",
    "78.84":"health insurance",
    "insurance":"health insurance",
    "12 months":"after study",
    "red white red":"red white red card long term stay",
    "rwr":"red white red card long term stay",
    "blue card":"red white red card long term stay",
    "vienna":"cities",
    "graz":"cities",
    "innsbruck":"cities",
    "linz":"cities",
    "salzburg":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .at-card,main .at-fact,main .at-price-box,main .at-time,main .at-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".at-eyebrow")?section.querySelector(".at-eyebrow").textContent.trim():"Austria Guide";
    if(!node.id)node.id="at-searat-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh admission",terms:["hsc","bachelor","masters"],query:"hsc"},
    {label:"University vs Fachhochschule",terms:["fachhochschule","fh","uas"],query:"fachhochschule"},
    {label:"Under-24 funds €722.58",terms:["722.58","8670.96","under 24"],query:"722.58"},
    {label:"Age 24+ funds €1,308.39",terms:["1308.39","15700.68","24+"],query:"1308.39"},
    {label:"Residence Permit Student",terms:["residence permit","student permit","new delhi","vfs"],query:"residence permit"},
    {label:"€218 residence fee",terms:["218","residence fee","permit fee"],query:"218"},
    {label:"20-hour work / AMS",terms:["20 hours","ams","student work"],query:"20 hours"},
    {label:"Spouse & family",terms:["spouse","family","family community"],query:"spouse"},
    {label:"ÖGK student insurance",terms:["78.84","insurance","oegk"],query:"78.84"},
    {label:"12-month graduate route",terms:["12 months","job search","business"],query:"12 months"},
    {label:"Red-White-Red Card",terms:["red white red","rwr","blue card"],query:"red white red"},
    {label:"Cities",terms:["vienna","graz","innsbruck","linz","salzburg"],query:"vienna"}
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
    item.node.classList.add("at-page-searat-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("at-page-searat-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="at-searat-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Austria</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="at-searat-empty";
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
      b.className="at-searat-result";
      b.type="button";
      b.innerHTML='<span class="at-searat-result__section">'+item.section+'</span><span class="at-searat-result__title">'+item.title+'</span><span class="at-searat-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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