(() => {
  const ready = fn => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn, {once:true}) : fn();
  const norm = value => String(value || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  const lev = (a,b) => {
    const m=a.length,n=b.length;if(!m)return n;if(!n)return m;
    const p=Array.from({length:n+1},(_,i)=>i),c=new Array(n+1);
    for(let i=1;i<=m;i++){c[0]=i;for(let j=1;j<=n;j++){const cost=a[i-1]===b[j-1]?0:1;c[j]=Math.min(c[j-1]+1,p[j]+1,p[j-1]+cost)}for(let j=0;j<=n;j++)p[j]=c[j]}
    return p[n];
  };
  const fuzzyWord=(q,text)=>{
    if(q.length<4)return false;
    return norm(text).split(" ").some(w=>Math.abs(w.length-q.length)<=2 && lev(q,w)<= (q.length>=8?2:1));
  };
  const countryName=()=>{
    const kicker=document.querySelector('main [class*="-kicker"]');
    const title=(document.querySelector("main h1")?.textContent||"").replace(/Study in|from Bangladesh|\s+/gi," ").trim();
    return title || (kicker?.textContent||"Country").split("·")[0].trim();
  };
  const compactGlobalNavigation=()=>{
    const panel=document.querySelector("#study-abroad-menu");
    if(panel){
      panel.innerHTML='<span class="nav-dropdown__eyebrow">STUDY ABROAD</span><a class="nav-feature" href="studyabroad.html#countries"><strong>Explore Countries</strong><span>All destinations in one place.</span></a><a href="assessment.html">Check Your Eligibility <span>↗</span></a><a href="#country-updates">Country Updates <span>↗</span></a><a href="news.html?category=study-abroad">Study Abroad News & Updates <span>↗</span></a><a href="https://wa.me/8801608881545" target="_blank" rel="noopener noreferrer">Talk to an Expert <span>↗</span></a>';
    }
    document.querySelectorAll(".desktop-nav__link").forEach(a=>{
      const href=(a.getAttribute("href")||"").toLowerCase();
      const text=norm(a.textContent);
      if(href.startsWith("#") && (text==="universities" || text==="university" || text==="visa")) a.remove();
    });
    document.querySelectorAll(".mobile-nav__sub").forEach(sub=>{
      const parent=sub.closest("details");
      if(parent && /study abroad/i.test(parent.querySelector("summary")?.textContent||"")){
        sub.innerHTML='<a href="studyabroad.html#countries">Explore Countries</a><a href="assessment.html">Check Your Eligibility</a><a href="#country-updates">Country Updates</a><a href="news.html?category=study-abroad">Study Abroad News & Updates</a><a href="https://wa.me/8801608881545">Talk to an Expert</a>';
      }
    });
    document.querySelectorAll("footer details.footer-group").forEach(group=>{
      if(/study abroad/i.test(group.querySelector("summary")?.textContent||"")){
        group.dataset.lizonStudyFooter="true";
        const box=group.querySelector("div");
        if(box) box.innerHTML='<a href="studyabroad.html#countries">Explore Countries</a><a href="assessment.html">Check Your Eligibility</a><a href="studyabroad.html#radar">Country Updates</a><a href="https://wa.me/8801608881545">Talk to an Expert</a>';
        group.removeAttribute("open");
      }
    });
  };
  const findGuideRail=()=>document.querySelector('div[class*="guide-sticky"]');
  const findGuideSheet=()=>[...document.querySelectorAll('[id$="guide-sheet"],[class*="sheet"]')].find(x=>!/search/i.test(x.id||"") && /guide/i.test(x.id||x.className||""));
  const findSearchSheet=()=>document.querySelector('[id$="search-sheet"],[class*="search-sheet"]');
  const openSheet=sheet=>{if(!sheet)return;sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");document.body.classList.add("menu-open")};
  const closeSheet=sheet=>{if(!sheet)return;sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true");document.body.classList.remove("menu-open")};

  const unifyGuide=()=>{
    const rail=findGuideRail(); if(!rail)return;
    rail.classList.add("lizon-country-guide-rail");
    const inner=rail.firstElementChild || rail;
    inner.classList.add("lizon-country-guide-rail-inner");
    const originalActions=inner.querySelector('[class*="guide-mobile-actions"]');
    if(originalActions) originalActions.classList.add("lizon-original-mobile-actions");
    let nav=inner.querySelector('nav[class*="guide__links"],div[class*="guide__links"]');
    if(!nav){
      nav=document.createElement("nav");
      inner.prepend(nav);
    }
    nav.classList.add("lizon-country-guide-nav");
    const main=document.querySelector("main");
    const uni=main?.querySelector("#universities,#providers,#institutions");
    if(uni && ![...nav.querySelectorAll("a")].some(a=>/universit|provider|institution/i.test(a.textContent))){
      const a=document.createElement("a");a.href="#"+uni.id;a.textContent=uni.id==="universities"?"Universities":"Study Options";nav.appendChild(a);
    } else if(!uni) {
      const studyLink=[...nav.querySelectorAll("a")].find(a=>(a.getAttribute("href")||"")==="#study");
      if(studyLink && !/universit/i.test(studyLink.textContent)) studyLink.textContent="Study & Universities";
    }
    if(!inner.querySelector(".lizon-country-guide-name")){
      const label=document.createElement("span");label.className="lizon-country-guide-name";label.textContent=countryName()+" Guide";inner.insertBefore(label,nav);
    }
    let actions=inner.querySelector(".lizon-country-guide-actions");
    if(!actions){
      actions=document.createElement("div");actions.className="lizon-country-guide-actions";
      actions.innerHTML='<button class="lizon-guide-button" type="button">Guide</button><button class="lizon-search-button" type="button">Search</button>';
      inner.appendChild(actions);
    }
    actions.querySelector(".lizon-guide-button")?.addEventListener("click",()=>openSheet(findGuideSheet()));
    actions.querySelector(".lizon-search-button")?.addEventListener("click",()=>{
      const sheet=findSearchSheet();openSheet(sheet);setTimeout(()=>sheet?.querySelector('input[type="search"]')?.focus(),80);
    });
    if(![...nav.querySelectorAll("a")].some(a=>(a.getAttribute("href")||"")==="#country-updates")){const u=document.createElement("a");u.href="#country-updates";u.textContent="Country Updates";nav.appendChild(u)}
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{}));
  };

  const genericClose=()=>{
    document.addEventListener("click",e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      if(t.matches('[class*="sheet__backdrop"],[class*="sheet__close"]')){
        const sheet=t.closest('[class*="sheet"]'); closeSheet(sheet);
      }
    },true);
  };

  const aliases={
    "uni":"university","unis":"university","univercity":"university","unversity":"university","universitys":"university",
    "scholership":"scholarship","scolarship":"scholarship","scholarhips":"scholarship",
    "spouce":"spouse","dependant":"family","dependent":"family","wife":"spouse","husband":"spouse",
    "visa requirment":"visa requirement","visaa":"visa","student vis":"student visa",
    "post stady":"post study","poststudy":"post study","graduate visa":"after graduation",
    "bank statment":"bank statement","funds":"financial","proof fund":"financial",
    "ielts score":"english","pte score":"english","english test":"english",
    "fees":"tuition","fee":"tuition","costs":"money","cost":"money",
    "job":"work","parttime":"part time","part time job":"work",
    "intake":"intakes","deadline":"intakes"
  };
  const buildSearch=()=>{
    const input=document.querySelector('[id$="page-search-input"],input[class*="page-search"]');
    const results=document.querySelector('[class*="page-search__results"]');
    if(!input||!results)return;
    const candidates=[];
    const seen=new Set();
    document.querySelectorAll('main h2,main h3,main summary,main article,main [class*="-card"],main [class*="-fact"],main [class*="-price-box"],main [class*="-time"],main [class*="-visa-step"],main [class*="-uni"],main [class*="-source"]').forEach((node,i)=>{
      if(seen.has(node))return;seen.add(node);
      const text=(node.textContent||"").replace(/\s+/g," ").trim();if(text.length<3)return;
      if(!node.id)node.id="lizon-search-target-"+(i+1);
      const sec=node.closest("section[id]");
      const title=node.matches("h2,h3,summary")?text:(node.querySelector("h3")?.textContent||text.slice(0,95)).trim();
      candidates.push({node,title,text:norm(text),section:(sec?.querySelector('[class*="-eyebrow"]')?.textContent||sec?.id||countryName()+" Guide").trim()});
    });
    const score=(item,raw)=>{
      let q=norm(raw);q=aliases[q]||q;if(!q)return 0;
      const title=norm(item.title);
      if(title===q)return 1000;if(title.startsWith(q))return 940;if(title.includes(q))return 880;if(item.text.includes(q))return 760;
      const words=q.split(" ").filter(Boolean);
      let matched=0;
      for(const w of words){if(item.text.includes(w)||fuzzyWord(w,item.text))matched++}
      if(words.length && matched===words.length)return 680+matched*10;
      if(words.length===1&&fuzzyWord(words[0],item.text))return 640;
      return 0;
    };
    const jump=item=>{
      const d=item.node.closest("details");if(d)d.open=true;
      closeSheet(findSearchSheet());
      item.node.classList.add("lizon-search-hit");
      window.scrollTo({top:item.node.getBoundingClientRect().top+scrollY-135,behavior:"smooth"});
      setTimeout(()=>item.node.classList.remove("lizon-search-hit"),2200);
    };
    const render=()=>{
      const q=input.value;results.innerHTML="";
      if(!norm(q)){results.innerHTML='<div class="lizon-search-empty">Search anything in this guide. Try visa, scholarship, spouse, tuition, university, work, intake or post study.</div>';return}
      const ranked=candidates.map(item=>({item,s:score(item,q)})).filter(x=>x.s>=640).sort((a,b)=>b.s-a.s).slice(0,12);
      if(!ranked.length){
        const fallback=[
          {label:"Eligibility",q:"eligibility"},{label:"Universities",q:"university"},{label:"Money",q:"money"},
          {label:"Visa",q:"visa"},{label:"Family",q:"family"},{label:"Work",q:"work"},
          {label:"After Study",q:"after study"},{label:"Arrival",q:"arrival"}
        ];
        results.innerHTML='<div class="lizon-search-empty"><strong>No exact wording found.</strong><br>Here are the closest useful sections in this guide.</div>';
        fallback.forEach(item=>{
          const best=candidates.map(c=>({c,s:score(c,item.q)})).sort((a,b)=>b.s-a.s)[0];
          if(!best?.c)return;
          const b=document.createElement("button");b.type="button";b.className="lizon-search-result lizon-search-result--fallback";
          b.innerHTML='<small>Suggested section</small><strong>'+item.label+'</strong><span>'+best.c.title.replace(/[<>&]/g,"")+'</span>';
          b.addEventListener("click",()=>jump(best.c));results.appendChild(b);
        });
        return
      }
      ranked.forEach(({item})=>{
        const b=document.createElement("button");b.type="button";b.className="lizon-search-result";
        b.innerHTML='<small>'+item.section.replace(/[<>&]/g,"")+'</small><strong>'+item.title.replace(/[<>&]/g,"")+'</strong><span>'+item.node.textContent.replace(/\s+/g," ").trim().slice(0,150).replace(/[<>&]/g,"")+'</span>';
        b.addEventListener("click",()=>jump(item));results.appendChild(b);
      });
    };
    input.addEventListener("input",e=>{e.stopImmediatePropagation();render()},true);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();render()}},true);
    render();
  };


  const countryMetaFromPage=async()=>{
    try{
      const list=await fetch("/data/studyabroad-countries.json",{cache:"no-store"}).then(r=>r.json());
      const page=(location.pathname.split("/").pop()||"").toLowerCase();
      return (Array.isArray(list)?list:[]).find(c=>String(c.page||"").toLowerCase()===page)||null;
    }catch{return null}
  };

  const flagUrl=code=>{
    const map={UK:"gb"};
    const iso=(map[String(code||"").toUpperCase()]||String(code||"")).toLowerCase();
    return iso ? `https://flagcdn.com/w160/${iso}.png` : "";
  };

  const COUNTRY_VISUALS={
    australia:["Sydney","Opera House"],newzealand:["Auckland","Sky Tower"],uk:["London","Big Ben"],canada:["Toronto","CN Tower"],usa:["New York","City skyline"],
    ireland:["Dublin","Trinity College"],belgium:["Brussels","Grand Place"],switzerland:["Zurich","Alpine city"],denmark:["Copenhagen","Harbour"],finland:["Helsinki","Nordic waterfront"],
    netherlands:["Amsterdam","Canal city"],norway:["Oslo","Fjord city"],sweden:["Stockholm","Waterfront"],france:["Paris","Eiffel Tower"],poland:["Warsaw","Palace of Culture"],
    spain:["Barcelona","Mediterranean city"],austria:["Vienna","Historic centre"],croatia:["Zagreb","European city"],germany:["Berlin","Brandenburg Gate"],greece:["Athens","Acropolis"],
    italy:["Milan","Italian city"],lithuania:["Vilnius","Old Town"],estonia:["Tallinn","Old Town"],hungary:["Budapest","Danube skyline"],malta:["Valletta","Harbour"],
    india:["New Delhi","Capital city"],china:["Shanghai","Modern skyline"],turkey:["Istanbul","Bosphorus"],uae:["Dubai","Modern skyline"],latvia:["Riga","Old Town"],
    romania:["Bucharest","European capital"],czech:["Prague","Charles Bridge"],portugal:["Lisbon","Riverside city"],slovenia:["Ljubljana","Green capital"],serbia:["Belgrade","River city"],
    slovakia:["Bratislava","Danube city"],bulgaria:["Sofia","Mountain capital"],singapore:["Singapore","Marina skyline"],qatar:["Doha","West Bay"],"saudi-arabia":["Riyadh","Modern capital"],
    thailand:["Bangkok","City skyline"],japan:["Tokyo","Urban skyline"],southkorea:["Seoul","City skyline"]
  };

  const sceneSvg=(type,meta)=>{
    const [city,landmark]=COUNTRY_VISUALS[meta.id]||[meta.name,"Student city"];
    const label=escape(meta.name),place=escape(city),mark=escape(landmark);
    const common=`<svg viewBox="0 0 560 330" role="img" aria-label="Bangladeshi student planning for ${label}">
      <defs>
        <linearGradient id="g-${meta.id}" x1="0" x2="1"><stop stop-color="#e9f4ee"/><stop offset="1" stop-color="#dceae3"/></linearGradient>
        <linearGradient id="sky-${meta.id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eaf4f0"/><stop offset="1" stop-color="#f9fbf9"/></linearGradient>
      </defs>
      <rect width="560" height="330" rx="28" fill="url(#sky-${meta.id})"/>
      <circle cx="463" cy="68" r="56" fill="#d8eadf"/>
      <path d="M0 228 L64 203 L116 220 L168 184 L212 220 L258 198 L305 224 L352 180 L400 214 L448 190 L500 214 L560 184 L560 330 L0 330Z" fill="#bdd7ca"/>
      <path d="M0 252 L55 229 L106 244 L162 218 L207 244 L260 226 L308 251 L360 220 L410 247 L460 222 L515 244 L560 221 L560 330 L0 330Z" fill="#8fb7a5" opacity=".9"/>
      <rect x="28" y="24" width="178" height="56" rx="16" fill="#fff" opacity=".92"/>
      <text x="48" y="48" font-size="13" font-family="Arial" font-weight="700" fill="#174438">BANGLADESH TO</text>
      <text x="48" y="69" font-size="22" font-family="Arial" font-weight="800" fill="#173d31">${label}</text>
      <text x="386" y="290" font-size="12" font-family="Arial" font-weight="700" fill="#173d31" opacity=".75">${place} · ${mark}</text>`;
    const student=`<g transform="translate(68 98)">
      <circle cx="72" cy="42" r="27" fill="#9c6246"/>
      <path d="M48 36q24-37 50 0v14H48Z" fill="#1b2c27"/>
      <rect x="54" y="68" width="56" height="86" rx="25" fill="#f4efe6"/>
      <path d="M48 89c-27 17-34 61-19 94" stroke="#9c6246" stroke-width="15" stroke-linecap="round"/>
      <path d="M111 88c28 13 41 43 36 76" stroke="#9c6246" stroke-width="15" stroke-linecap="round"/>
      <rect x="44" y="147" width="25" height="78" rx="12" fill="#273d34"/><rect x="88" y="147" width="25" height="78" rx="12" fill="#273d34"/>
      <rect x="24" y="92" width="24" height="72" rx="12" fill="#173d31" opacity=".88"/>
    </g>`;
    let prop="";
    if(type==="visa") prop=`<g transform="translate(270 92)"><rect width="150" height="176" rx="20" fill="#fff"/><rect x="26" y="26" width="56" height="78" rx="5" fill="#1f6a4d"/><circle cx="54" cy="53" r="12" fill="#d7b34a"/><text x="98" y="45" font-size="14" font-family="Arial" font-weight="800" fill="#173d31">VISA</text><line x1="98" y1="64" x2="126" y2="64" stroke="#8aa397" stroke-width="6"/><line x1="98" y1="82" x2="126" y2="82" stroke="#8aa397" stroke-width="6"/><path d="M45 128 C85 110 112 118 133 147" fill="none" stroke="#174438" stroke-width="4"/><path d="M128 136l11 12-15 6" fill="none" stroke="#174438" stroke-width="4"/></g>`;
    else if(type==="money") prop=`<g transform="translate(280 106)"><rect width="148" height="128" rx="20" fill="#fff"/><text x="24" y="38" font-size="16" font-family="Arial" font-weight="800" fill="#173d31">FIRST YEAR</text><text x="24" y="72" font-size="28" font-family="Arial" font-weight="900" fill="#174438">৳  BUDGET</text><circle cx="112" cy="97" r="24" fill="#d6b24b"/><circle cx="84" cy="105" r="18" fill="#e6ca78"/></g>`;
    else if(type==="work") prop=`<g transform="translate(264 118)"><rect width="180" height="102" rx="18" fill="#fff"/><rect x="26" y="18" width="128" height="66" rx="8" fill="#dcebe4"/><rect x="74" y="85" width="34" height="7" rx="3" fill="#173d31"/><circle cx="144" cy="90" r="19" fill="#c8915b"/><path d="M137 90h14" stroke="#fff" stroke-width="4"/></g>`;
    else if(type==="after") prop=`<g transform="translate(278 96)"><path d="M76 0 0 35l76 35 76-35Z" fill="#173d31"/><rect x="29" y="82" width="100" height="72" rx="16" fill="#fff"/><rect x="50" y="60" width="58" height="34" rx="8" fill="#8fb7a5"/><path d="M76 37v48" stroke="#d6b24b" stroke-width="6"/></g>`;
    else if(type==="arrival") prop=`<g transform="translate(278 92)"><rect x="16" y="74" width="82" height="112" rx="16" fill="#fff"/><rect x="42" y="48" width="31" height="28" rx="8" fill="none" stroke="#173d31" stroke-width="6"/><circle cx="38" cy="192" r="8" fill="#173d31"/><circle cx="77" cy="192" r="8" fill="#173d31"/><path d="M110 35c45 10 72 24 103 56-47-5-82 1-118 21l15-30-30-19Z" fill="#174438"/></g>`;
    else if(type==="study") prop=`<g transform="translate(262 104)"><rect width="190" height="130" rx="20" fill="#fff"/><path d="M28 50 95 16l67 34-67 34Z" fill="#173d31"/><rect x="44" y="84" width="102" height="28" rx="7" fill="#8fb7a5"/><rect x="58" y="112" width="12" height="18" fill="#173d31"/><rect x="89" y="112" width="12" height="18" fill="#173d31"/><rect x="120" y="112" width="12" height="18" fill="#173d31"/></g>`;
    else if(type==="cities") prop=`<g transform="translate(272 104)"><rect width="35" height="112" rx="5" fill="#fff"/><rect x="48" y="36" width="44" height="76" rx="5" fill="#dfece6"/><rect x="107" y="14" width="30" height="98" rx="5" fill="#fff"/><rect x="151" y="52" width="30" height="60" rx="5" fill="#dfece6"/><path d="M0 116h185" stroke="#173d31" stroke-width="7"/></g>`;
    else prop=`<g transform="translate(280 106)"><rect width="160" height="120" rx="20" fill="#fff"/><circle cx="46" cy="42" r="19" fill="#8fb7a5"/><rect x="76" y="27" width="58" height="10" rx="5" fill="#173d31"/><rect x="76" y="49" width="44" height="8" rx="4" fill="#91a79d"/><rect x="26" y="78" width="108" height="10" rx="5" fill="#d7e4de"/><rect x="26" y="98" width="78" height="10" rx="5" fill="#d7e4de"/></g>`;
    return common+student+prop+`</svg>`;
  };

  const addCountryVisuals=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const hero=document.querySelector('main section[class*="hero"],main [class*="-hero"]');
    if(hero&&!hero.querySelector(".lizon-country-hero-visual")){
      const v=document.createElement("div");v.className="lizon-country-hero-visual";v.innerHTML=sceneSvg("study",meta);hero.appendChild(v);
    }
    const scenes=[
      ["#eligibility,#start","profile"],["#study,#universities,#providers,#institutions","study"],
      ["#money,#costs,#tuition","money"],["#visa","visa"],["#work,#work-life","work"],
      ["#after-study","after"],["#arrival","arrival"],["#cities","cities"]
    ];
    const used=new Set();
    scenes.forEach(([selector,type])=>{
      const section=document.querySelector(selector);
      if(!section||used.has(section)||section.querySelector(".lizon-country-scene"))return;used.add(section);
      const scene=document.createElement("figure");scene.className=`lizon-country-scene lizon-country-scene--${type}`;scene.innerHTML=sceneSvg(type,meta);
      const shell=section.querySelector('[class*="-shell"],.shell')||section;
      const heading=shell.querySelector('[class*="-heading"],header,h2');
      if(heading?.parentNode) heading.parentNode.insertBefore(scene,heading.nextSibling); else shell.appendChild(scene);
    });
  };

  const escape=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const addCountryUpdates=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const footer=document.querySelector("footer.footer,footer");if(!footer)return;
    const section=document.createElement("section");section.id="country-updates";section.className="lizon-country-updates";
    section.innerHTML=`<div class="lizon-country-updates__shell"><div class="lizon-country-updates__head"><div><small>COUNTRY UPDATES</small><h2>${escape(meta.name)} updates that can change your plan.</h2><p>Latest verified items for Bangladeshi students. Fresh country news appears first, with a current verified country briefing always available.</p></div><a href="news.html?search=${encodeURIComponent(meta.name)}">All ${escape(meta.name)} news →</a></div><div class="lizon-country-updates__track" aria-live="polite"><article class="lizon-country-update-card"><span>Checking latest updates…</span></article></div></div>`;
    footer.parentNode.insertBefore(section,footer);
    const track=section.querySelector(".lizon-country-updates__track");
    try{
      const [live,auto,seeds]=await Promise.all([
        fetch(`/api/content?category=study-abroad&country=${encodeURIComponent(meta.id)}&limit=8`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]})),
        fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]})),
        fetch("/data/country-updates-seed.json",{cache:"no-store"}).then(r=>r.json()).catch(()=>[])
      ]);
      const seen=new Set();
      const posts=[...(live.posts||[]),...(auto.posts||[]).filter(p=>p.country===meta.id)]
        .filter(p=>{const k=p.slug||p.source_url||p.title_en;if(!k||seen.has(k))return false;seen.add(k);return true})
        .sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,7);
      const seed=(Array.isArray(seeds)?seeds:[]).find(x=>x.id===meta.id);
      const liveCards=posts.map(p=>`<a class="lizon-country-update-card" href="news-article.html?slug=${encodeURIComponent(p.slug)}"><small>${p.importance==="critical"?"CRITICAL":p.content_type==="opportunity"?"OPPORTUNITY":"LATEST UPDATE"}</small><strong>${escape(p.title_en||p.title_bn||"Country update")}</strong><span>${escape(p.excerpt_en||p.excerpt_bn||"Open the full verified update.")}</span><b>Read full update →</b></a>`);
      const seedCard=seed?`<a class="lizon-country-update-card lizon-country-update-card--brief" href="${escape(seed.source_url)}"><small>VERIFIED COUNTRY BRIEF</small><strong>${escape(seed.title)}</strong><span>${escape(seed.excerpt)}</span><b>Open verified guide →</b></a>`:"";
      track.innerHTML=[...liveCards,seedCard].filter(Boolean).join("");
      if(!track.children.length){
        track.innerHTML=`<a class="lizon-country-update-card" href="news.html?search=${encodeURIComponent(meta.name)}"><small>COUNTRY WATCH</small><strong>Open the latest ${escape(meta.name)} updates.</strong><span>Verified Study Abroad news and planning changes for Bangladeshi students.</span><b>Check latest news →</b></a>`;
      }
      if(matchMedia("(max-width:700px)").matches&&track.children.length>1){
        let paused=false,timer;
        const pause=()=>{paused=true;clearTimeout(timer);timer=setTimeout(()=>paused=false,5000)};
        ["pointerdown","touchstart","scroll"].forEach(ev=>track.addEventListener(ev,pause,{passive:true}));
        setInterval(()=>{if(paused)return;const first=track.firstElementChild;if(!first)return;const step=first.getBoundingClientRect().width+12;const max=track.scrollWidth-track.clientWidth;track.scrollTo({left:track.scrollLeft+step>max-5?0:track.scrollLeft+step,behavior:"smooth"})},5000);
      }
    }catch{}
  };

  ready(()=>{compactGlobalNavigation();unifyGuide();genericClose();buildSearch();addCountryVisuals();addCountryUpdates()});
})();