document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-jp-guide-link]")];
  const sections=[...document.querySelectorAll("[data-jp-section]")];
  const guideSheet=document.querySelector("#jp-guide-sheet");
  const searchSheet=document.querySelector("#jp-searjp-sheet");
  const guideLabel=document.querySelector("[data-jp-guide-label]");
  const searchInput=document.querySelector("#jp-page-searjp-input");
  const searchResults=document.querySelector("#jp-page-searjp-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".jp-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-jp-guide-toggle],[data-jp-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-jp-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-jp-searjp-toggle],[data-jp-searjp-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-jp-searjp-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "coe":"coe student visa bangladesh",
    "certificate of eligibility":"coe student visa bangladesh",
    "vfs":"coe student visa bangladesh",
    "dhaka":"coe student visa bangladesh",
    "mext":"mext jasso bangladesh",
    "jasso":"mext jasso bangladesh",
    "hsc":"bangladesh eligibility",
    "ssc":"bangladesh eligibility",
    "12 years":"bangladesh eligibility",
    "16 years":"bangladesh eligibility",
    "jlpt":"language",
    "eju":"language",
    "ielts":"language",
    "105000":"realistic living cost",
    "41000":"realistic living cost",
    "57000":"realistic living cost",
    "820000":"tuition",
    "1300000":"tuition",
    "610000":"tuition",
    "1900000":"tuition",
    "28 hours":"work while studying",
    "8 hours":"work while studying",
    "part time":"work while studying",
    "part-time":"work while studying",
    "dependent":"spouse family",
    "family":"spouse family",
    "spouse":"spouse family",
    "nhi":"national health insurance",
    "insurance":"national health insurance",
    "designated activities":"after study designated activities",
    "1 year":"after study designated activities",
    "6 months":"after study designated activities",
    "job hunting":"after study designated activities",
    "engineer specialist":"work long term stay",
    "specified skilled worker":"work long term stay",
    "tokyo":"cities",
    "osaka":"cities",
    "kyoto":"cities",
    "fukuoka":"cities",
    "sendai":"cities",
    "nagoya":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .jp-card,main .jp-fact,main .jp-price-box,main .jp-time,main .jp-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".jp-eyebrow")?section.querySelector(".jp-eyebrow").textContent.trim():"Japan Guide";
    if(!node.id)node.id="jp-searjp-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"COE / Student visa",terms:["coe","certificate of eligibility","student visa"],query:"coe"},
    {label:"VFS Dhaka",terms:["vfs","dhaka","visa centre"],query:"vfs"},
    {label:"MEXT / JASSO",terms:["mext","jasso","scholarship"],query:"mext"},
    {label:"12-year admission rule",terms:["12 years","hsc","ssc","bangladesh"],query:"12 years"},
    {label:"JLPT / EJU",terms:["jlpt","eju","japanese"],query:"jlpt"},
    {label:"¥105,000 living cost",terms:["105000","41000","57000","living cost"],query:"105000"},
    {label:"Tuition",terms:["820000","1300000","610000","1900000","tuition"],query:"820000"},
    {label:"28-hour work rule",terms:["28 hours","8 hours","part time","part-time"],query:"28 hours"},
    {label:"Dependent family",terms:["dependent","spouse","family"],query:"dependent"},
    {label:"National Health Insurance",terms:["nhi","insurance","health"],query:"nhi"},
    {label:"1-year job hunting",terms:["designated activities","1 year","6 months","job hunting"],query:"designated activities"},
    {label:"Cities",terms:["tokyo","osaka","kyoto","fukuoka","sendai","nagoya"],query:"tokyo"}
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
    item.node.classList.add("jp-page-searjp-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("jp-page-searjp-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="jp-searjp-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Japan</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="jp-searjp-empty";
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
      b.className="jp-searjp-result";
      b.type="button";
      b.innerHTML='<span class="jp-searjp-result__section">'+item.section+'</span><span class="jp-searjp-result__title">'+item.title+'</span><span class="jp-searjp-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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