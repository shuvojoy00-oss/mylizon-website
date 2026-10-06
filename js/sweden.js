document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-se-guide-link]")];
  const sections=[...document.querySelectorAll("[data-se-section]")];
  const guideSheet=document.querySelector("#se-guide-sheet");
  const searchSheet=document.querySelector("#se-searse-sheet");
  const guideLabel=document.querySelector("[data-se-guide-label]");
  const searchInput=document.querySelector("#se-page-searse-input");
  const searchResults=document.querySelector("#se-page-searse-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{
    if(!searchSheet)return;
    searchSheet.classList.add("is-open");
    document.body.style.overflow="hidden";
    const panel=searchSheet.querySelector(".se-sheet__panel");
    if(panel)panel.scrollTop=0;
    setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);
  };

  document.querySelectorAll("[data-se-guide-toggle],[data-se-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-se-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-se-searse-toggle],[data-se-searse-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-se-searse-close]").forEach(el=>el.addEventListener("click",closeSearch));
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
    "alim":"bangladesh eligibility",
    "math":"bangladesh eligibility",
    "3 year bachelor":"bangladesh eligibility",
    "4 year bachelor":"bangladesh eligibility",
    "university admissions":"universityadmissions se",
    "application fee":"universityadmissions se",
    "900":"universityadmissions se",
    "tuition":"tuition",
    "fees":"tuition",
    "10656":"money maintenance",
    "maintenance":"money maintenance",
    "funds":"money maintenance",
    "bank":"financial evidence",
    "sponsor":"financial evidence",
    "residence permit":"residence permit higher education",
    "visa":"residence permit higher education",
    "permit":"residence permit higher education",
    "15 hours":"work while studying 2026 rules",
    "work":"work while studying 2026 rules",
    "summer work":"work while studying 2026 rules",
    "family":"spouse family",
    "spouse":"spouse family",
    "insurance":"healthcare insurance",
    "health insurance":"healthcare insurance",
    "job search":"after study",
    "post study":"after study",
    "1 year":"after study",
    "doctoral":"after study",
    "work permit":"from student to work permit",
    "si scholarship":"scholarships",
    "scholarship":"scholarships",
    "ielts":"english",
    "toefl":"english",
    "stockholm":"cities",
    "gothenburg":"cities",
    "lund":"cities",
    "uppsala":"cities",
    "umea":"cities",
    "linkoping":"cities"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .se-card,main .se-fact,main .se-price-box,main .se-time,main .se-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".se-eyebrow")?section.querySelector(".se-eyebrow").textContent.trim():"Sweden Guide";
    if(!node.id)node.id="se-searse-target-"+(i+1);
    items.push({
      node,
      title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),
      text:text.toLowerCase(),
      section:label
    });
  });

  const topicSuggestions=[
    {label:"Bangladesh HSC",terms:["hsc","alim","math","bangladesh"],query:"hsc"},
    {label:"Master’s degree length",terms:["3 year bachelor","4 year bachelor","masters"],query:"4 year bachelor"},
    {label:"UniversityAdmissions.se",terms:["university admissions","application fee","900"],query:"university admissions"},
    {label:"SEK 10,656 maintenance",terms:["10656","maintenance","funds"],query:"10656"},
    {label:"Residence permit",terms:["residence permit","visa","permit"],query:"residence permit"},
    {label:"15-hour work rule",terms:["15 hours","work","student job"],query:"15 hours"},
    {label:"Spouse & family",terms:["spouse","family","children"],query:"spouse"},
    {label:"Health insurance",terms:["insurance","health insurance","healthcare"],query:"insurance"},
    {label:"Post-study job search",terms:["post study","job search","1 year"],query:"job search"},
    {label:"Work permit after study",terms:["work permit","employment","job"],query:"work permit"},
    {label:"SI Scholarship",terms:["si scholarship","scholarship","global professionals"],query:"si scholarship"},
    {label:"Cities",terms:["stockholm","gothenburg","lund","uppsala","umea","linkoping"],query:"stockholm"}
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
    item.node.classList.add("se-page-searse-hit");
    window.scrollTo({top:item.node.getBoundingClientRect().top+window.scrollY-145,behavior:"smooth"});
    setTimeout(()=>item.node.classList.remove("se-page-searse-hit"),2200);
  };

  const render=value=>{
    if(!searchResults)return;
    const q=normalize(value);
    searchResults.innerHTML="";
    if(!q){
      searchResults.innerHTML='<div class="se-searse-empty">Try <strong>Stamp 1G</strong>, <strong>€10,000</strong>, <strong>TrustEd Sweden</strong>, <strong>Visa D</strong>, <strong>spouse</strong> or <strong>Critical Skills</strong>.</div>';
      return;
    }

    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);

    if(!results.length){
      const wrap=document.createElement("div");
      wrap.className="se-searse-empty";
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
      b.className="se-searse-result";
      b.type="button";
      b.innerHTML='<span class="se-searse-result__section">'+item.section+'</span><span class="se-searse-result__title">'+item.title+'</span><span class="se-searse-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';
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