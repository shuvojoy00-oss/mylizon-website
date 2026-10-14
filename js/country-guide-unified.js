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

  const addCountryVisuals=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const bd="https://flagcdn.com/w80/bd.png",dest=flagUrl(meta.code);
    const scenes=[
      ["#eligibility,#start","PROFILE","Academic profile"],
      ["#study,#universities,#providers,#institutions","STUDY","Campus life"],
      ["#money,#costs,#tuition","MONEY","Planning costs"],
      ["#visa","VISA","Bangladesh to "+meta.name],
      ["#work,#work-life","WORK","Student work"],
      ["#after-study","AFTER STUDY","Graduate future"],
      ["#arrival","ARRIVAL","Landing in "+meta.name],
      ["#cities","LIFE","Culture and cities"]
    ];
    const used=new Set();
    scenes.forEach(([selector,label,copy])=>{
      const section=document.querySelector(selector);
      if(!section||used.has(section))return;used.add(section);
      const scene=document.createElement("div");scene.className="lizon-country-scene";scene.setAttribute("aria-hidden","true");
      scene.innerHTML=`<div class="lizon-country-scene__flags"><img src="${bd}" alt=""><span>→</span><img src="${dest}" alt=""></div><strong>${label}</strong><span>${copy}</span>`;
      section.appendChild(scene);
    });
    document.documentElement.style.setProperty("--lizon-destination-flag",`url("${dest}")`);
  };

  const escape=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const addCountryUpdates=async()=>{
    const meta=await countryMetaFromPage();if(!meta)return;
    const footer=document.querySelector("footer.footer,footer");if(!footer)return;
    const section=document.createElement("section");section.id="country-updates";section.className="lizon-country-updates";
    section.innerHTML=`<div class="lizon-country-updates__shell"><div class="lizon-country-updates__head"><div><small>COUNTRY UPDATES</small><h2>${escape(meta.name)} updates that can change your plan.</h2><p>Latest verified items from the LizOn Study Abroad news desk. New country-specific items appear here automatically.</p></div><a href="news.html?search=${encodeURIComponent(meta.name)}">All ${escape(meta.name)} news →</a></div><div class="lizon-country-updates__track" aria-live="polite"><article class="lizon-country-update-card"><span>Checking latest updates…</span></article></div></div>`;
    footer.parentNode.insertBefore(section,footer);
    const track=section.querySelector(".lizon-country-updates__track");
    try{
      const [live,auto]=await Promise.all([
        fetch(`/api/content?category=study-abroad&country=${encodeURIComponent(meta.id)}&limit=8`,{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]})),
        fetch("/data/insights-auto.json",{cache:"no-store"}).then(r=>r.json()).catch(()=>({posts:[]}))
      ]);
      const seen=new Set();
      const posts=[...(live.posts||[]),...(auto.posts||[]).filter(p=>p.country===meta.id)]
        .filter(p=>{const k=p.slug||p.source_url||p.title_en;if(!k||seen.has(k))return false;seen.add(k);return true})
        .sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0)).slice(0,8);
      if(posts.length){
        track.innerHTML=posts.map(p=>`<a class="lizon-country-update-card" href="news-article.html?slug=${encodeURIComponent(p.slug)}"><small>${p.importance==="critical"?"CRITICAL":p.content_type==="opportunity"?"OPPORTUNITY":"LATEST UPDATE"}</small><strong>${escape(p.title_en||p.title_bn||"Country update")}</strong><span>${escape(p.excerpt_en||p.excerpt_bn||"Open the full verified update.")}</span><b>Read full update →</b></a>`).join("");
      }else{
        track.innerHTML=`<a class="lizon-country-update-card lizon-country-update-card--empty" href="news.html?search=${encodeURIComponent(meta.name)}"><small>VERIFIED WATCH</small><strong>No fresh country-specific alert is published right now.</strong><span>We do not invent a daily story when there is no verified change. Open the news desk for the latest ${escape(meta.name)} search and broader Study Abroad updates.</span><b>Check latest news →</b></a>`;
      }
      if(matchMedia("(max-width:700px)").matches&&track.children.length>1){
        let paused=false;
        track.addEventListener("pointerdown",()=>paused=true,{passive:true});
        ["pointerup","touchend"].forEach(ev=>track.addEventListener(ev,()=>setTimeout(()=>paused=false,5000),{passive:true}));
        setInterval(()=>{if(paused)return;const first=track.firstElementChild;if(!first)return;const step=first.getBoundingClientRect().width+12;const max=track.scrollWidth-track.clientWidth;track.scrollTo({left:track.scrollLeft+step>max-5?0:track.scrollLeft+step,behavior:"smooth"})},5000);
      }
    }catch{}
  };

  ready(()=>{compactGlobalNavigation();unifyGuide();genericClose();buildSearch();addCountryVisuals();addCountryUpdates()});
})();