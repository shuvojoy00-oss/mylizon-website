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
      panel.innerHTML='<span class="nav-dropdown__eyebrow">STUDY ABROAD</span><a class="nav-feature" href="studyabroad.html#countries"><strong>Explore Countries</strong><span>All destinations in one place.</span></a><a href="assessment.html">Check Your Eligibility <span>↗</span></a><a href="studyabroad.html#radar">Study Abroad Updates <span>↗</span></a><a href="https://wa.me/8801608881545" target="_blank" rel="noopener noreferrer">Talk to an Expert <span>↗</span></a>';
    }
    document.querySelectorAll(".desktop-nav__link").forEach(a=>{
      const href=(a.getAttribute("href")||"").toLowerCase();
      const text=norm(a.textContent);
      if(href.startsWith("#") && (text==="universities" || text==="university" || text==="visa")) a.remove();
    });
    document.querySelectorAll(".mobile-nav__sub").forEach(sub=>{
      const parent=sub.closest("details");
      if(parent && /study abroad/i.test(parent.querySelector("summary")?.textContent||"")){
        sub.innerHTML='<a href="studyabroad.html#countries">Explore Countries</a><a href="assessment.html">Check Your Eligibility</a><a href="studyabroad.html#radar">Study Abroad Updates</a><a href="https://wa.me/8801608881545">Talk to an Expert</a>';
      }
    });
    document.querySelectorAll("footer details.footer-group").forEach(group=>{
      if(/study abroad/i.test(group.querySelector("summary")?.textContent||"")){
        group.dataset.lizonStudyFooter="true";
        const box=group.querySelector("div");
        if(box) box.innerHTML='<a href="studyabroad.html#countries">Explore Countries</a><a href="assessment.html">Check Your Eligibility</a><a href="studyabroad.html#radar">Study Abroad Updates</a><a href="https://wa.me/8801608881545">Talk to an Expert</a>';
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
      if(!ranked.length){results.innerHTML='<div class="lizon-search-empty"><strong>No direct match.</strong><br>Try a shorter phrase such as visa, family, scholarship, money, work, intake, university or after study.</div>';return}
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

  ready(()=>{compactGlobalNavigation();unifyGuide();genericClose();buildSearch()});
})();