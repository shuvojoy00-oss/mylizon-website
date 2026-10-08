(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));

  function upgradeFreeClassesNav(){
    const desktop = document.querySelector(".desktop-nav");
    if(desktop && !desktop.querySelector("#free-classes-menu")){
      const link = [...desktop.querySelectorAll("a.desktop-nav__link")].find(a => a.textContent.trim() === "Free Classes");
      if(link){
        const wrap=document.createElement("div");
        wrap.className="nav-dropdown";
        wrap.innerHTML=`
          <button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-controls="free-classes-menu">
            Free Classes <span class="nav-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="nav-dropdown__panel" id="free-classes-menu">
            <span class="nav-dropdown__eyebrow">FREE LEARNING</span>
            <a class="nav-feature" href="ieltsclass.html"><strong>Free IELTS Classes</strong><span>Learn IELTS with LizOn.</span></a>
            <a href="pteclass.html">Free PTE Classes <span>↗</span></a>
          </div>`;
        link.replaceWith(wrap);
        const trigger=wrap.querySelector(".nav-dropdown__trigger");
        trigger?.addEventListener("click",event=>{
          if(!window.matchMedia("(min-width: 901px)").matches) return;
          const expanded=trigger.getAttribute("aria-expanded")==="true";
          document.querySelectorAll(".nav-dropdown__trigger").forEach(item=>item.setAttribute("aria-expanded","false"));
          trigger.setAttribute("aria-expanded",String(!expanded));
          event.stopPropagation();
        });
      }
    }
    const mobile = document.querySelector(".mobile-nav");
    if(mobile && !mobile.querySelector("[data-shared-free-classes]")){
      const link=[...mobile.querySelectorAll("a.mobile-nav__main")].find(a=>a.textContent.trim()==="Free Classes");
      if(link){
        const details=document.createElement("details");
        details.setAttribute("data-shared-free-classes","");
        details.innerHTML=`<summary>Free Classes <span>+</span></summary><div class="mobile-nav__sub"><a href="ieltsclass.html">Free IELTS Classes</a><a href="pteclass.html">Free PTE Classes</a></div>`;
        link.replaceWith(details);
      }
    }
  }

  async function buildCountryDirectory(){
    if(document.querySelector(".sa-country-directory")) return;
    const footer=document.querySelector("footer.footer");
    if(!footer) return;
    try{
      const r=await fetch("data/studyabroad-countries.json",{cache:"no-store"});
      if(!r.ok) return;
      const countries=(await r.json()).slice().sort((a,b)=>a.name.localeCompare(b.name));
      const section=document.createElement("section");
      section.className="sa-country-directory";
      section.setAttribute("aria-label","Study abroad country directory");
      section.innerHTML=`
        <div class="sa-country-directory__inner">
          <span class="sa-country-directory__eyebrow">STUDY DESTINATIONS</span>
          <h2>Explore a country guide.</h2>
          <p>Open any destination directly.</p>
          <div class="sa-country-directory__links">
            ${countries.map(c=>`<a href="${esc(c.page)}">${esc(c.name)}</a>`).join("")}
          </div>
        </div>`;
      footer.parentNode.insertBefore(section,footer);
    }catch(_){}
  }

  function bindGenericCountrySearch(){
    const sheets=[...document.querySelectorAll('[id$="-search-sheet"],[class*="search-sheet"]')];
    const sheet=sheets.find(el=>el.querySelector('input[type="search"]')) || null;
    const input=document.querySelector('input[id$="-page-search-input"]')
      || sheet?.querySelector('input[type="search"]')
      || [...document.querySelectorAll('input[type="search"]')].find(el=>/search/i.test(el.id||""));
    const results=document.querySelector('[id$="-page-search-results"]')
      || sheet?.querySelector('[id*="search"][id*="result"],[class*="page-search__results"],[class*="search-results"]');

    if(!input || !results || input.dataset.sharedSearchBound) return;
    input.dataset.sharedSearchBound="true";

    const openSearch=()=>{
      if(sheet){
        sheet.classList.add("is-open");
        sheet.setAttribute("aria-hidden","false");
        document.body.style.overflow="hidden";
      }
      setTimeout(()=>input.focus(),40);
    };
    const closeSearch=()=>{
      if(sheet){
        sheet.classList.remove("is-open");
        sheet.setAttribute("aria-hidden","true");
        document.body.style.overflow="";
      }
    };

    [...document.querySelectorAll("button")].forEach(button=>{
      const attrs=[...button.attributes].map(a=>a.name).join(" ").toLowerCase();
      const text=button.textContent.toLowerCase();
      const looksLikeSearch=/(search|searjp|searde)/.test(attrs) || text.includes("search");
      if(looksLikeSearch && (/toggle/.test(attrs) || text.includes("search")) && !/close/.test(attrs)){
        button.addEventListener("click",openSearch);
      }
      if(looksLikeSearch && /close/.test(attrs)){
        button.addEventListener("click",closeSearch);
      }
    });

    if(sheet){
      [...sheet.querySelectorAll("button")].forEach(button=>{
        const cls=String(button.className||"");
        if(/backdrop|close/i.test(cls)) button.addEventListener("click",closeSearch);
      });
    }

    const main=document.querySelector("main");
    const sections=main ? [...main.querySelectorAll("section[id]")] : [];
    const index=sections.map(section=>{
      const heading=section.querySelector("h1,h2,h3,summary");
      const title=(heading?.textContent || section.id).trim();
      const text=(section.textContent || "").replace(/\s+/g," ").trim();
      return {section,title,text};
    });

    const render=()=>{
      const q=input.value.trim().toLowerCase();
      results.innerHTML="";
      if(!q){
        results.innerHTML='<div class="sa-shared-search-empty">Type a topic, requirement, cost, visa term, university or arrival question.</div>';
        return;
      }
      const tokens=q.split(/\s+/).filter(Boolean);
      const matches=index.map(item=>{
        const title=item.title.toLowerCase();
        const hay=(item.title+" "+item.text).toLowerCase();
        const score=tokens.reduce((n,t)=>n+(title.includes(t)?4:hay.includes(t)?1:0),0);
        return {item,score};
      }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,10);

      if(!matches.length){
        results.innerHTML='<div class="sa-shared-search-empty">No close match found. Try a shorter keyword.</div>';
        return;
      }

      matches.forEach(({item})=>{
        const b=document.createElement("button");
        b.type="button";
        b.className="sa-shared-search-result";
        const excerpt=item.text.length>150?item.text.slice(0,150)+"…":item.text;
        b.innerHTML=`<strong>${esc(item.title)}</strong><span>${esc(excerpt)}</span>`;
        b.addEventListener("click",()=>{
          closeSearch();
          const details=item.section.closest("details"); if(details) details.open=true;
          item.section.scrollIntoView({behavior:"smooth",block:"start"});
        });
        results.appendChild(b);
      });
    };

    input.addEventListener("input",render);
    input.addEventListener("keydown",e=>{if(e.key==="Escape") closeSearch();});
    render();
  }



  const PLAN_KEY = "lizon-studyabroad-plan-v1";

  function flagCode(code){
    return String(code || "").toLowerCase() === "uk" ? "gb" : String(code || "").toLowerCase();
  }

  async function loadSharedCountries(){
    try{
      const response=await fetch("data/studyabroad-countries.json",{cache:"no-store"});
      if(!response.ok) return [];
      const data=await response.json();
      return Array.isArray(data)?data:[];
    }catch(_){return []}
  }

  function readSharedPlan(){
    try{
      const raw=JSON.parse(localStorage.getItem(PLAN_KEY)||"{}");
      return {
        shortlist:Array.isArray(raw.shortlist)?raw.shortlist.slice(0,5):[],
        cost:raw.cost&&typeof raw.cost==="object"?raw.cost:null,
        timeline:raw.timeline&&typeof raw.timeline==="object"?raw.timeline:null,
        updatedAt:raw.updatedAt||null
      };
    }catch(_){
      return {shortlist:[],cost:null,timeline:null,updatedAt:null};
    }
  }

  function writeSharedPlan(plan){
    plan.updatedAt=new Date().toISOString();
    try{localStorage.setItem(PLAN_KEY,JSON.stringify(plan));}catch(_){}
    window.dispatchEvent(new CustomEvent("lizon-study-plan-updated",{detail:plan}));
  }

  function toggleSharedCountry(country){
    const plan=readSharedPlan();
    const index=plan.shortlist.findIndex(item=>item.id===country.id);
    if(index>=0){
      plan.shortlist.splice(index,1);
      writeSharedPlan(plan);
      return {saved:false,full:false};
    }
    if(plan.shortlist.length>=5) return {saved:false,full:true};
    plan.shortlist.push({
      id:country.id,
      name:country.name,
      code:country.code||country.name.slice(0,2).toUpperCase(),
      page:country.page
    });
    writeSharedPlan(plan);
    return {saved:true,full:false};
  }

  function addCountryHeroSave(countries){
    const current=(location.pathname.split("/").pop()||"").toLowerCase();
    if(!current || current==="studyabroad.html" || current==="studyabroad") return;
    const country=countries.find(item=>String(item.page||"").toLowerCase()===current);
    if(!country || document.querySelector("[data-shared-country-save]")) return;

    const hero=document.querySelector("main section");
    if(!hero) return;
    const eligibility=hero.querySelector('a[href*="assessment"]');
    const actionHost=eligibility?.parentElement || hero.querySelector('[class*="actions"]');
    if(!actionHost) return;

    const button=document.createElement("button");
    button.type="button";
    button.className="sa-country-save-button";
    button.setAttribute("data-shared-country-save","");
    const refresh=()=>{
      const saved=readSharedPlan().shortlist.some(item=>item.id===country.id);
      button.classList.toggle("is-saved",saved);
      button.setAttribute("aria-pressed",String(saved));
      button.textContent=saved ? country.name+" Saved to My Plan" : "Save "+country.name+" to My Plan";
    };
    button.addEventListener("click",()=>{
      const result=toggleSharedCountry(country);
      if(result.full){
        button.classList.add("is-limit");
        button.textContent="My Plan already has 5 countries";
        setTimeout(()=>{button.classList.remove("is-limit");refresh();},2200);
        return;
      }
      refresh();
    });
    actionHost.appendChild(button);
    refresh();
  }

  function setupExploreCountriesNav(countries){
    const ordered=countries.slice().sort((a,b)=>a.name.localeCompare(b.name));
    const desktop=document.querySelector(".desktop-nav");
    if(desktop && !desktop.querySelector("#explore-countries-menu")){
      const results=[...desktop.querySelectorAll("a.desktop-nav__link")].find(a=>a.textContent.trim()==="Results");
      const wrap=document.createElement("div");
      wrap.className="nav-dropdown sa-country-nav";
      wrap.innerHTML=`
        <button class="nav-dropdown__trigger" type="button" aria-expanded="false" aria-controls="explore-countries-menu">
          Explore Countries <span class="nav-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="nav-dropdown__panel sa-country-mega" id="explore-countries-menu">
          <div class="sa-country-mega__head"><strong>Study destinations</strong><span>Open a country guide</span></div>
          <div class="sa-country-mega__grid">
            ${ordered.map(c=>`<a href="${esc(c.page)}">${esc(c.name)}</a>`).join("")}
          </div>
        </div>`;
      if(results) desktop.insertBefore(wrap,results); else desktop.appendChild(wrap);

      const trigger=wrap.querySelector(".nav-dropdown__trigger");
      const closeOthers=()=>document.querySelectorAll(".nav-dropdown__trigger").forEach(item=>{
        if(item!==trigger) item.setAttribute("aria-expanded","false");
      });
      const open=()=>{if(window.matchMedia("(min-width:901px)").matches){closeOthers();trigger.setAttribute("aria-expanded","true");}};
      const close=()=>{if(window.matchMedia("(min-width:901px)").matches)trigger.setAttribute("aria-expanded","false");};
      wrap.addEventListener("mouseenter",open);
      wrap.addEventListener("mouseleave",close);
      wrap.addEventListener("focusin",open);
      wrap.addEventListener("focusout",e=>{if(!wrap.contains(e.relatedTarget))close();});
      trigger.addEventListener("click",e=>{
        if(!window.matchMedia("(min-width:901px)").matches)return;
        const expanded=trigger.getAttribute("aria-expanded")==="true";
        closeOthers();
        trigger.setAttribute("aria-expanded",String(!expanded));
        e.stopPropagation();
      });
    }

    const mobile=document.querySelector(".mobile-nav");
    if(mobile && !mobile.querySelector("[data-shared-country-menu]")){
      const results=[...mobile.querySelectorAll("a.mobile-nav__main")].find(a=>a.textContent.trim()==="Results");
      const details=document.createElement("details");
      details.setAttribute("data-shared-country-menu","");
      details.innerHTML=`
        <summary>Explore Countries <span>+</span></summary>
        <div class="mobile-nav__sub sa-mobile-country-menu">
          ${ordered.map(c=>`<a href="${esc(c.page)}">${esc(c.name)}</a>`).join("")}
        </div>`;
      if(results) mobile.insertBefore(details,results); else mobile.appendChild(details);
    }

    const freeDesktop=[...(desktop?.querySelectorAll("a.desktop-nav__link")||[])].find(a=>a.textContent.trim()==="Free Classes");
    freeDesktop?.remove();
    desktop?.querySelector("#free-classes-menu")?.closest(".nav-dropdown")?.remove();
    const freeMobile=[...(mobile?.querySelectorAll("a.mobile-nav__main")||[])].find(a=>a.textContent.trim()==="Free Classes");
    freeMobile?.remove();
    mobile?.querySelector("[data-shared-free-classes]")?.remove();
  }
  document.addEventListener("DOMContentLoaded",async()=>{
    const countries=await loadSharedCountries();
    setupExploreCountriesNav(countries);
    addCountryHeroSave(countries);
    buildCountryDirectory();
    bindGenericCountrySearch();
  });
})();
