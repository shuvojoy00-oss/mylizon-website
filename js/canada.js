document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-ca-guide-link]")];
  const sections=[...document.querySelectorAll("[data-ca-section]")];
  const guideSheet=document.querySelector("#ca-guide-sheet");
  const searchSheet=document.querySelector("#ca-search-sheet");
  const guideLabel=document.querySelector("[data-ca-guide-label]");
  const searchInput=document.querySelector("#ca-page-search-input");
  const searchResults=document.querySelector("#ca-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".ca-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-ca-guide-toggle],[data-ca-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-ca-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-ca-search-toggle],[data-ca-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-ca-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
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

  const earnings=document.querySelector("#ca-earnings-calculator");
  if(earnings){
    const wage=earnings.querySelector("[name=wage]");
    const hours=earnings.querySelector("[name=hours]");
    const weekly=earnings.querySelector("[data-weekly]");
    const monthly=earnings.querySelector("[data-monthly]");
    const update=()=>{
      const w=Math.max(0,Number(wage.value)||0);
      const h=Math.min(24,Math.max(0,Number(hours.value)||0));
      const wk=w*h;
      weekly.textContent="CAD "+wk.toFixed(2);
      monthly.textContent="CAD "+(wk*52/12).toFixed(2);
    };
    [wage,hours].forEach(el=>el.addEventListener("input",update));
    update();
  }

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
    "dli":"designated learning institution",
    "pgwp":"post graduation work permit",
    "post study":"post graduation work permit",
    "pal":"provincial attestation letter",
    "tal":"territorial attestation letter",
    "caq":"quebec",
    "quebec":"quebec",
    "spouse":"spouse family",
    "partner":"spouse family",
    "family":"spouse family",
    "open work permit":"spouse family",
    "sowp":"spouse family",
    "funds":"money proof of funds",
    "bank":"financial sponsor",
    "gic":"financial sponsor",
    "medical":"medical",
    "ime":"medical",
    "police":"police clearance",
    "pcc":"police clearance",
    "study plan":"documents study plan",
    "sop":"documents study plan",
    "hsc":"bangladesh eligibility",
    "cgpa":"bangladesh eligibility",
    "gap":"study gap",
    "ielts":"english",
    "pte":"english",
    "clb":"english pgwp",
    "cip":"field of study",
    "field of study":"field of study",
    "express entry":"permanent residence reality",
    "cec":"canadian experience class",
    "pnp":"provincial nominee programs",
    "sin":"work while studying",
    "co op":"work while studying",
    "coop":"work while studying",
    "tuition":"money proof of funds"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .ca-card,main .ca-fact,main .ca-price-box,main .ca-time,main .ca-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".ca-eyebrow")?section.querySelector(".ca-eyebrow").textContent.trim():"Canada Guide";
    if(!node.id)node.id="ca-search-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"DLI & PGWP",terms:["dli","pgwp","program eligibility"],query:"dli"},
    {label:"PAL / TAL",terms:["pal","tal","attestation"],query:"pal"},
    {label:"Proof of funds",terms:["funds","bank","gic","money"],query:"funds"},
    {label:"Spouse work permit",terms:["spouse","partner","open work permit"],query:"spouse"},
    {label:"Study permit",terms:["study permit","visa"],query:"visa"},
    {label:"Medical",terms:["medical","ime","panel physician"],query:"medical"},
    {label:"Police clearance",terms:["police","pcc","clearance"],query:"police"},
    {label:"PGWP",terms:["pgwp","post study","graduate work"],query:"pgwp"},
    {label:"Field of study / CIP",terms:["cip","field of study","eligible field"],query:"cip"},
    {label:"Work while studying",terms:["work","24 hours","sin","co-op"],query:"work"},
    {label:"Express Entry / PR",terms:["express entry","cec","pnp","pr"],query:"express entry"},
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
    item.node.classList.add("ca-page-search-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("ca-page-search-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="ca-search-empty">Try <strong>DLI</strong>, <strong>PGWP</strong>, <strong>PAL</strong>, <strong>spouse</strong>, <strong>medical</strong> or <strong>proof of funds</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="ca-search-empty";
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
      b.className="ca-search-result";
      b.type="button";
      b.innerHTML='<span class="ca-search-result__section">'+item.section+'</span><span class="ca-search-result__title">'+item.title+'</span><span class="ca-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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