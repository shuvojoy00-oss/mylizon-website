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
    const input=document.querySelector('input[id$="-page-search-input"]');
    const results=document.querySelector('[id$="-page-search-results"]');
    const sheet=document.querySelector('[id$="-search-sheet"]');
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
      const attrs=[...button.attributes].map(a=>a.name).join(" ");
      const text=button.textContent.toLowerCase();
      if((/(search|searjp)/.test(attrs) && /toggle/.test(attrs)) || (text.includes("search") && !/close/.test(attrs))){
        button.addEventListener("click",openSearch);
      }
      if(/(search|searjp)/.test(attrs) && /close/.test(attrs)){
        button.addEventListener("click",closeSearch);
      }
    });
    if(sheet){
      sheet.querySelectorAll(".\au-sheet__backdrop,.uk-sheet__backdrop,.us-sheet__backdrop,[class$='sheet__backdrop']").forEach(el=>el.addEventListener("click",closeSearch));
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
        const hay=(item.title+" "+item.text).toLowerCase();
        const score=tokens.reduce((n,t)=>n+(item.title.toLowerCase().includes(t)?4:hay.includes(t)?1:0),0);
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

  document.addEventListener("DOMContentLoaded",()=>{
    upgradeFreeClassesNav();
    buildCountryDirectory();
    bindGenericCountrySearch();
  });
})();
