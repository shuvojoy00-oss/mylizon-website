document.addEventListener("DOMContentLoaded", () => {
  const guideLinks=[...document.querySelectorAll("[data-uk-guide-link]")];
  const sections=[...document.querySelectorAll("[data-uk-section]")];
  const guideSheet=document.querySelector("#uk-guide-sheet");
  const searchSheet=document.querySelector("#uk-search-sheet");
  const guideLabel=document.querySelector("[data-uk-guide-label]");
  const searchInput=document.querySelector("#uk-page-search-input");
  const searchResults=document.querySelector("#uk-page-search-results");

  const closeGuide=()=>{if(guideSheet){guideSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openGuide=()=>{if(guideSheet){guideSheet.classList.add("is-open");document.body.style.overflow="hidden";}};
  const closeSearch=()=>{if(searchSheet){searchSheet.classList.remove("is-open");document.body.style.overflow="";}};
  const openSearch=()=>{if(searchSheet){searchSheet.classList.add("is-open");document.body.style.overflow="hidden";const p=searchSheet.querySelector(".uk-sheet__panel");if(p)p.scrollTop=0;setTimeout(()=>{if(searchInput){searchInput.focus({preventScroll:true});searchInput.scrollIntoView({block:"start",behavior:"auto"});}},140);}};

  document.querySelectorAll("[data-uk-guide-toggle],[data-uk-guide-toggle-hero]").forEach(el=>el.addEventListener("click",openGuide));
  document.querySelectorAll("[data-uk-guide-close]").forEach(el=>el.addEventListener("click",closeGuide));
  document.querySelectorAll("[data-uk-search-toggle],[data-uk-search-toggle-hero]").forEach(el=>el.addEventListener("click",openSearch));
  document.querySelectorAll("[data-uk-search-close]").forEach(el=>el.addEventListener("click",closeSearch));
  guideLinks.forEach(a=>a.addEventListener("click",closeGuide));

  if("IntersectionObserver" in window){
    const obs=new IntersectionObserver(entries=>{
      const v=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!v)return;
      const id=v.target.id;
      guideLinks.forEach(a=>a.classList.toggle("is-active",a.getAttribute("href")==="#"+id));
      const active=guideLinks.find(a=>a.getAttribute("href")==="#"+id);
      if(active&&guideLabel)guideLabel.textContent=active.textContent.trim();
    },{rootMargin:"-28% 0px -58% 0px",threshold:[0,.2,.5]});
    sections.forEach(s=>obs.observe(s));
  }

  const filters=[...document.querySelectorAll("[data-provider-filter]")];
  const cards=[...document.querySelectorAll("[data-provider-card]")];
  filters.forEach(btn=>btn.addEventListener("click",()=>{
    filters.forEach(b=>b.classList.remove("is-active"));btn.classList.add("is-active");
    const f=btn.dataset.providerFilter;
    cards.forEach(card=>{const tags=(card.dataset.tags||"").split(" ");card.hidden=f!=="all"&&!tags.includes(f);});
  }));

  const calc=document.querySelector("#uk-earnings-calculator");
  if(calc){
    const wage=calc.querySelector("[name=wage]"),hours=calc.querySelector("[name=hours]");
    const weekly=calc.querySelector("[data-weekly]"),monthly=calc.querySelector("[data-monthly]");
    const update=()=>{const w=Math.max(0,Number(wage.value)||0);const h=Math.min(25,Math.max(0,Number(hours.value)||0));const wk=w*h;weekly.textContent="UKD "+wk.toFixed(2);monthly.textContent="UKD "+(wk*52/12).toFixed(2);};
    [wage,hours].forEach(x=>x.addEventListener("input",update));update();
  }

  const normalize=v=>v.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  const lev=(a,b)=>{const m=a.length,n=b.length;if(!m)return n;if(!n)return m;const p=Array.from({length:n+1},(_,i)=>i),c=new Array(n+1);for(let i=1;i<=m;i++){c[0]=i;for(let j=1;j<=n;j++){const cost=a[i-1]===b[j-1]?0:1;c[j]=Math.min(c[j-1]+1,p[j]+1,p[j-1]+cost);}for(let j=0;j<=n;j++)p[j]=c[j];}return p[n];};

  const aliases={
    "psw":"graduate visa","graduate":"graduate visa","post study":"graduate visa","short term":"graduate route",
    "stgwv":"graduate route","spouse":"partner children","partner":"partner children","child":"partner children",
    "nzqf":"nzqcf levels","nzqcf":"nzqcf levels","skilled worker":"skilled worker residence","settlement":"skilled migrant category",
    "skilled worker":"accredited employer work visa","tax":"tax tax","tax":"tax tax","police":"police clearance","pcc":"police clearance",
    "bank":"financial sponsor","sponsor":"financial sponsor","hsc":"bangladesh eligibility","alim":"bangladesh eligibility",
    "ielts":"english","pte":"english","fees":"money costs","tuition":"money costs","rent":"living costs accommodation"
  };

  const items=[];
  [...document.querySelectorAll("main h2,main h3,main summary,main .uk-card,main .uk-fact,main .uk-price-box,main .uk-time,main .uk-visa-step")].forEach((node,i)=>{
    const text=(node.textContent||"").replace(/\s+/g," ").trim();
    if(text.length<3)return;
    const section=node.closest("section[id]");
    const label=section&&section.querySelector(".uk-eyebrow")?section.querySelector(".uk-eyebrow").textContent.trim():"UK Guide";
    if(!node.id)node.id="uk-search-target-"+(i+1);
    items.push({node,title:node.matches("h2,h3,summary")?text:(node.querySelector("h3")?node.querySelector("h3").textContent.trim():text.slice(0,90)),text:text.toLowerCase(),section:label});
  });

  const topicSuggestions=[
    {label:"Student visa",terms:["visa","student visa"],query:"visa"},
    {label:"Documents & police clearance",terms:["documents","document","police","clearance","pcc"],query:"police"},
    {label:"Money & sponsor",terms:["money","funds","bank","sponsor","finance"],query:"sponsor"},
    {label:"Partner & children",terms:["partner","spouse","child","family"],query:"partner"},
    {label:"UKQCF levels",terms:["nzqcf","nzqf","level","qualification"],query:"nzqcf"},
    {label:"Post-Study Work Visa",terms:["graduate","psw","post study","graduate work"],query:"graduate"},
    {label:"Short-Term Graduate Work Visa",terms:["short term","6 month","graduate"],query:"short term"},
    {label:"Green List",terms:["skilled worker","residence","tier 1","tier 2"],query:"skilled worker"},
    {label:"SMC residence",terms:["settlement","points","skilled migrant"],query:"settlement"},
    {label:"Work & minimum wage",terms:["work","job","wage","salary"],query:"work"},
    {label:"Universities & providers",terms:["university","provider","college","polytechnic"],query:"university"}
  ];

  const score=(item,q)=>{
    const a=aliases[q]||q,t=item.title.toLowerCase();
    if(t===a)return 1000;if(t.startsWith(a))return 920;if(t.includes(a))return 840;if(item.text.includes(a))return 700;
    const words=a.split(" ").filter(Boolean);if(words.length>1&&words.every(w=>item.text.includes(w)))return 620;return 0;
  };
  const suggested=q=>{
    const ranked=topicSuggestions.map(topic=>({topic,d:Math.min(...topic.terms.map(term=>lev(normalize(q),normalize(term))/Math.max(normalize(q).length,normalize(term).length,1)))})).sort((a,b)=>a.d-b.d);
    const close=ranked.filter(x=>x.d<=.46).slice(0,4).map(x=>x.topic);
    return close.length?close:topicSuggestions.slice(0,4);
  };
  const jump=item=>{closeSearch();const d=item.node.closest("details");if(d)d.open=true;item.node.classList.add("uk-page-search-hit");window.scrollTo({top:item.node.getBoundingClientRect().top+scrollY-145,behavior:"smooth"});setTimeout(()=>item.node.classList.remove("uk-page-search-hit"),2200);};

  const render=qraw=>{
    if(!searchResults)return;searchResults.innerHTML="";const q=normalize(qraw);
    if(!q){searchResults.innerHTML='<div class="uk-search-empty">Try <strong>PSWV</strong>, <strong>spouse</strong>, <strong>UKQCF</strong>, <strong>police clearance</strong>, <strong>Green List</strong> or <strong>HSC</strong>.</div>';return;}
    const results=items.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=620).sort((a,b)=>b.s-a.s).slice(0,10);
    if(!results.length){
      const wrap=document.createElement("div");wrap.className="uk-search-empty";wrap.innerHTML='<strong>No exact match found.</strong><br>Maybe you meant:';
      const row=document.createElement("div");row.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px";
      suggested(q).forEach(topic=>{const b=document.createElement("button");b.type="button";b.textContent=topic.label;b.style.cssText="border:1px solid #d7e4dd;border-radius:999px;background:#fff;padding:8px 11px;color:#174438;font-weight:800";b.onclick=()=>{searchInput.value=topic.query;render(topic.query);};row.appendChild(b);});
      searchResults.append(wrap,row);return;
    }
    results.forEach(({item})=>{const b=document.createElement("button");b.className="uk-search-result";b.type="button";b.innerHTML='<span class="uk-search-result__section">'+item.section+'</span><span class="uk-search-result__title">'+item.title+'</span><span class="uk-search-result__context">'+item.text.slice(0,135)+(item.text.length>135?"…":"")+'</span>';b.onclick=()=>jump(item);searchResults.appendChild(b);});
  };
  if(searchInput){searchInput.addEventListener("input",()=>render(searchInput.value));render("");}
});