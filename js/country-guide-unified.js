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
      panel.innerHTML='<span class="nav-dropdown__eyebrow">STUDY ABROAD</span><a class="nav-feature" href="studyabroad.html#countries"><strong>Explore Countries</strong><span>All destinations in one place.</span></a><a href="assessment.html">Check Your Eligibility <span>↗</span></a><a href="#country-updates">Country Updates <span>↗</span></a><a href="news.html?category=study-abroad" data-news-link>Study Abroad News & Updates <span>↗</span></a><a href="https://wa.me/8801608881545" target="_blank" rel="noopener noreferrer">Talk to an Expert <span>↗</span></a>';
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
        if(box) box.innerHTML='<a href="studyabroad.html#countries">Explore Countries</a><a href="assessment.html">Check Your Eligibility</a><a href="#country-updates">Country Updates</a><a href="https://wa.me/8801608881545">Talk to an Expert</a>';
        group.removeAttribute("open");
      }
    });
  };
  const anyOverlayOpen=()=>Boolean(
    document.querySelector(".mobile-menu.is-open,[class*=\"sheet\"].is-open,dialog[open]")
  );
  const syncScrollLock=()=>{
    if(anyOverlayOpen()){
      document.body.classList.add("menu-open");
    }else{
      document.body.classList.remove("menu-open");
      document.body.style.overflow="";
      document.documentElement.style.overflow="";
    }
  };
  const releaseScrollIfSafe=()=>requestAnimationFrame(syncScrollLock);

  const findGuideRail=()=>document.querySelector('div[class*="guide-sticky"]');
  const findGuideSheet=()=>[...document.querySelectorAll('[id$="guide-sheet"],[class*="sheet"]')].find(x=>!/search/i.test(x.id||"") && /guide/i.test(x.id||x.className||""));
  const findSearchSheet=()=>document.querySelector('[id$="search-sheet"],[class*="search-sheet"]');
  const openSheet=sheet=>{if(!sheet)return;sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");syncScrollLock()};
  const closeSheet=sheet=>{if(!sheet)return;sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true");releaseScrollIfSafe()};

  const unifyGuide=()=>{
    const rail=findGuideRail(); if(!rail)return;
    rail.classList.add("lizon-country-guide-rail");
    document.body.classList.add("lizon-has-fixed-country-guide");
    const syncFixedGuide=()=>{
      const header=document.querySelector(".site-header");
      const hh=Math.round(header?.getBoundingClientRect().height||70);
      document.documentElement.style.setProperty("--lizon-header-h",hh+"px");
      requestAnimationFrame(()=>{
        const gh=Math.round(rail.getBoundingClientRect().height||58);
        document.documentElement.style.setProperty("--lizon-guide-h",gh+"px");
      });
    };
    syncFixedGuide();
    window.addEventListener("resize",syncFixedGuide,{passive:true});
    if("ResizeObserver" in window){
      const ro=new ResizeObserver(syncFixedGuide);
      const header=document.querySelector(".site-header"); if(header)ro.observe(header);
      ro.observe(rail);
    }
    const duplicateGuide=document.querySelector("#guide");
    if(duplicateGuide&&duplicateGuide!==rail){
      const links=duplicateGuide.querySelectorAll('a[href^="#"]');
      if(links.length>=5 && (duplicateGuide.textContent||"").trim().length<900) duplicateGuide.classList.add("lizon-duplicate-guide-intro");
    }
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
      actions.innerHTML=`
        <button class="lizon-guide-button" type="button" aria-label="Open country guide">
          <span class="lizon-toolbar-icon lizon-toolbar-icon--guide" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 5.5h6.2c1.1 0 2 .9 2 2v11H7.1A2.1 2.1 0 0 1 5 16.4V5.5Zm14 0h-3.7c-1.1 0-2 .9-2 2v11h3.6a2.1 2.1 0 0 0 2.1-2.1V5.5Z"/><path d="M8 9h2.5M8 12h2.5M15.5 9H18M15.5 12H18"/></svg>
          </span>
          <span class="lizon-toolbar-copy"><small>COUNTRY</small><strong>Guide</strong></span>
        </button>
        <button class="lizon-search-button" type="button" aria-label="Search this country guide">
          <span class="lizon-toolbar-icon lizon-toolbar-icon--search" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/></svg>
          </span>
          <span class="lizon-toolbar-copy"><small>FIND ANYTHING</small><strong>Search</strong></span>
        </button>`;
      inner.appendChild(actions);
    }
    actions.querySelector(".lizon-guide-button")?.addEventListener("click",()=>openSheet(findGuideSheet()));
    actions.querySelector(".lizon-search-button")?.addEventListener("click",()=>{
      const sheet=findSearchSheet();openSheet(sheet);setTimeout(()=>sheet?.querySelector('input[type="search"]')?.focus(),80);
    });
    if(![...nav.querySelectorAll("a")].some(a=>(a.getAttribute("href")||"")==="#country-updates")){const u=document.createElement("a");u.href="#country-updates";u.textContent="Country Updates";nav.appendChild(u)}
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",releaseScrollIfSafe));
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

  const addHeroJourney=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const hero=document.querySelector('main section[class*="hero"],main [class*="-hero"]');
    if(!hero||hero.querySelector(".lizon-country-route-visual"))return;
    const content=hero.querySelector('[class*="hero__content"],[class*="hero__copy"],[class*="hero-copy"]')
      || hero.querySelector('[class*="-hero__grid"]')?.firstElementChild
      || hero.querySelector('[class*="-shell"],.shell')?.firstElementChild
      || hero.firstElementChild;
    if(!content)return;
    const destFlag=flagUrl(meta.code);
    if(!destFlag)return;
    const route=document.createElement("div");
    route.className="lizon-country-route-visual";
    route.setAttribute("aria-hidden","true");
    route.innerHTML=`
      <span class="lizon-route-flag lizon-route-flag--bd"><img src="https://flagcdn.com/w160/bd.png" alt=""></span>
      <svg class="lizon-route-svg" viewBox="0 0 320 86" focusable="false">
        <defs>
          <linearGradient id="lizonRouteGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#1d6a4d"/>
            <stop offset=".52" stop-color="#b99b54"/>
            <stop offset="1" stop-color="#a23d49"/>
          </linearGradient>
          <filter id="lizonRouteGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path class="lizon-route-shadow" d="M42 61 C112 11 207 10 279 58"/>
        <path class="lizon-route-path" d="M42 61 C112 11 207 10 279 58"/>
        <circle class="lizon-route-pulse lizon-route-pulse--start" cx="42" cy="61" r="4"/>
        <circle class="lizon-route-pulse lizon-route-pulse--end" cx="279" cy="58" r="4"/>
        <g class="lizon-route-plane" transform="translate(160 23) rotate(12)">
          <path d="M-15 1 15-7 19-4 6 3 13 10 9 12 1 6-6 12-10 11-6 4-16 5Z"/>
        </g>
      </svg>
      <span class="lizon-route-flag lizon-route-flag--destination"><img src="${destFlag}" alt=""></span>
    `;
    const marker=content.querySelector('[class*="kicker"],[class*="eyebrow"]');
    if(marker?.parentNode) marker.parentNode.insertBefore(route,marker.nextSibling);
    else content.prepend(route);
  };

  const PHOTO_LABELS={
    hero:"Student life",profile:"Profile planning",study:"Study",money:"Living & budget",
    visa:"Visa & travel",work:"Work while studying",after:"After study",arrival:"Arrival",cities:"Life in the city"
  };

  const usedPhotoUrls=new Set();
  const photoCard=async(type,meta,hero=false)=>{
    for(let skip=0;skip<5;skip++){
      const figure=document.createElement("figure");
      figure.className=hero?"lizon-country-photo lizon-country-photo--hero":`lizon-country-photo lizon-country-photo--${type}`;
      figure.innerHTML=`<div class="lizon-country-photo__loading"></div><figcaption><span>${PHOTO_LABELS[type]||"Student journey"}</span><strong>${escape(meta.name)}</strong></figcaption>`;
      try{
        const response=await fetch(`/api/country-visual?country=${encodeURIComponent(meta.id)}&type=${encodeURIComponent(type)}&skip=${skip}`,{cache:"force-cache"});
        if(!response.ok)continue;
        const data=await response.json();
        if(!data?.image||usedPhotoUrls.has(data.image))continue;
        usedPhotoUrls.add(data.image);
        const img=document.createElement("img");
        img.src=data.image;
        img.alt=`${meta.name} ${PHOTO_LABELS[type]||"student life"} visual`;
        img.loading=hero?"eager":"lazy";
        img.decoding="async";
        img.referrerPolicy="no-referrer";
        figure.prepend(img);
        const loading=figure.querySelector(".lizon-country-photo__loading"); if(loading)loading.remove();
        const cap=figure.querySelector("figcaption");
        if(cap){
          const credit=document.createElement("span");
          credit.className="lizon-country-photo__credit";
          credit.textContent="Visual source · Wikimedia Commons";
          cap.appendChild(credit);
        }
        return figure;
      }catch{}
    }
    return null;
  };

  const addCountryVisuals=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const hero=document.querySelector('main section[class*="hero"],main [class*="-hero"]');
    if(hero&&!hero.querySelector(".lizon-country-photo--hero")){
      const card=await photoCard("hero",meta,true);
      if(card){
        const target=hero.querySelector('[class*="-hero__grid"],[class*="-shell"],.shell')||hero;
        target.appendChild(card);
      }
    }
    const scenes=[
      ["#study,#universities,#providers,#institutions","study"],
      ["#money,#costs,#tuition","money"],
      ["#visa","visa"],
      ["#work,#work-life","work"],
      ["#after-study,#arrival","after"]
    ];
    const used=new Set();
    for(const [selector,type] of scenes){
      const section=document.querySelector(selector);
      if(!section||used.has(section)||section.querySelector(".lizon-country-photo"))continue;
      used.add(section);
      const card=await photoCard(type,meta,false);
      if(!card)continue;
      const shell=section.querySelector('[class*="-shell"],.shell')||section;
      const heading=shell.querySelector('[class*="-heading"],header');
      if(heading?.parentNode)heading.parentNode.insertBefore(card,heading.nextSibling);else shell.prepend(card);
    }
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

  const addVisualSourceNote=()=>{
    const sources=document.querySelector("#sources");
    if(!sources||sources.querySelector("[data-lizon-visual-source]"))return;
    const host=sources.querySelector('[class*="-source-grid"],[class*="-sources"],[class*="-shell"],.shell')||sources;
    const note=document.createElement("div");
    note.setAttribute("data-lizon-visual-source","");
    note.className="lizon-visual-source-note";
    note.innerHTML='<strong>Visual source</strong><span>Destination photography is sourced from Wikimedia Commons and displayed under the applicable Commons license.</span><a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia Commons ↗</a>';
    host.appendChild(note);
  };

  ready(()=>{compactGlobalNavigation();unifyGuide();genericClose();buildSearch();addHeroJourney();addCountryVisuals();addCountryUpdates();addVisualSourceNote();releaseScrollIfSafe();
    window.addEventListener("pageshow",releaseScrollIfSafe,{passive:true});
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)releaseScrollIfSafe()});
    const mo=new MutationObserver(releaseScrollIfSafe);mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class","aria-hidden"]});
  });
})();