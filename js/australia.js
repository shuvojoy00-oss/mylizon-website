/* LizOn Education — Australia Guide interactions */
document.addEventListener("DOMContentLoaded", () => {
  const guideLinks = [...document.querySelectorAll("[data-au-guide-link]")];
  const sections = [...document.querySelectorAll("[data-au-section]")];
  const mobileToggle = document.querySelector("[data-au-guide-toggle]");
  const mobileLabel = document.querySelector("[data-au-guide-label]");
  const sheet = document.querySelector("#au-guide-sheet");
  const closeSheet = () => {
    if (!sheet) return;
    sheet.classList.remove("is-open");
    document.body.style.overflow = "";
  };
  const openSheet = () => {
    if (!sheet) return;
    sheet.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  if (mobileToggle) mobileToggle.addEventListener("click", openSheet);
  document.querySelectorAll("[data-au-guide-close]").forEach(el => el.addEventListener("click", closeSheet));
  guideLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeSheet();
    });
  });

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      guideLinks.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === "#" + id));
      if (mobileLabel) {
        const active = guideLinks.find(link => link.getAttribute("href") === "#" + id);
        if (active) mobileLabel.textContent = active.textContent.trim();
      }
    }, {rootMargin:"-28% 0px -58% 0px", threshold:[0,.15,.3,.6]});
    sections.forEach(section => observer.observe(section));
  }

  const filters = [...document.querySelectorAll("[data-uni-filter]")];
  const uniCards = [...document.querySelectorAll("[data-uni-card]")];
  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.uniFilter;
      uniCards.forEach(card => {
        const tags = (card.dataset.tags || "").split(" ");
        card.hidden = filter !== "all" && !tags.includes(filter);
      });
    });
  });


  const bdSearch = document.querySelector("#bd-university-search");
  const bdStatus = document.querySelector("#bd-university-status");
  const bdSuggestions = document.querySelector("#bd-university-suggestions");
  const bdUniversities = [...document.querySelectorAll("[data-bd-uni]")];

  const aliasMap = {
    "nsu":"north south university",
    "aiub":"american international university bangladesh",
    "bracu":"brac university",
    "brac":"brac university",
    "ewu":"east west university",
    "iub":"independent university bangladesh",
    "ulab":"university of liberal arts bangladesh",
    "uiu":"united international university",
    "diu":"daffodil international university",
    "uap":"university of asia pacific",
    "aust":"ahsanullah university of science and technology",
    "buet":"bangladesh university of engineering and technology",
    "cuet":"chittagong university of engineering and technology",
    "kuet":"khulna university of engineering and technology",
    "ruet":"rajshahi university of engineering and technology",
    "duet":"dhaka university of engineering and technology",
    "iut":"islamic university of technology",
    "sust":"shahjalal university of science and technology",
    "du":"university of dhaka",
    "cu":"university of chittagong",
    "ru":"university of rajshahi",
    "ju":"jahangirnagar university",
    "bup":"bangladesh university of professionals",
    "nu":"national university",
    "bau":"bangladesh agricultural university",
    "butex":"bangladesh university of textiles",
    "mbstu":"mawlana bhashani science and technology university",
    "pstu":"patuakhali science and technology university",
    "hstu":"hajee mohammad danesh science and technology university",
    "nstu":"noakhali science and technology university",
    "jnu":"jagannath university",
    "ustc":"university of science and technology chittagong",
    "bubt":"bangladesh university of business & technology",
    "iubat":"international university of business agriculture and technology",
    "gub":"green university of bangladesh",
    "seu":"southeast university"
  };

  const normalize = value => value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const reverseUniversityName = name => {
    const cleaned = name.replace(/\([^)]*\)/g, "").trim();
    const match = cleaned.match(/^university of (.+)$/i);
    return match ? `${match[1]} university` : "";
  };

  const initials = name => {
    const stop = new Set(["of","and","the","for","in","at","bangladesh"]);
    return name
      .replace(/\([^)]*\)/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .filter(word => !stop.has(word.toLowerCase()))
      .map(word => word[0])
      .join("")
      .toLowerCase();
  };

  if (bdSearch && bdUniversities.length && bdSuggestions) {
    bdUniversities.forEach((item, index) => {
      const name = item.textContent.trim();
      const base = normalize(name);
      const reversed = normalize(reverseUniversityName(name));
      const acronym = initials(name);
      const explicitAcronym = (name.match(/\(([^)]+)\)/) || [])[1] || "";
      item.dataset.searchText = [base, reversed, acronym, normalize(explicitAcronym)].filter(Boolean).join(" ");
      item.id = `bd-uni-${index + 1}`;
    });

    let currentResults = [];
    let activeIndex = -1;

    const closeSuggestions = () => {
      bdSuggestions.innerHTML = "";
      bdSuggestions.classList.remove("is-open");
      bdSearch.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    };

    const jumpToInstitution = item => {
      const section = item.dataset.section;
      const detail = document.querySelector(`[data-bd-section="${section}"]`);
      if (detail) detail.open = true;

      bdUniversities.forEach(el => el.classList.remove("is-search-hit"));
      item.classList.add("is-search-hit");

      const targetTop = item.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({top: targetTop, behavior:"smooth"});

      bdSearch.value = item.textContent.trim();
      bdStatus.innerHTML = `Found in <strong>Section ${section}</strong>. Jumped to <strong>${item.textContent.trim()}</strong>.`;
      closeSuggestions();

      window.setTimeout(() => item.classList.remove("is-search-hit"), 2400);
    };

    const scoreItem = (item, query) => {
      const text = item.dataset.searchText || "";
      const name = normalize(item.textContent);
      const aliasResolved = aliasMap[query] || query;

      if (name === aliasResolved) return 1000;
      if (text.split(" ").includes(aliasResolved)) return 950;
      if (name.startsWith(aliasResolved)) return 900;
      if (text.startsWith(aliasResolved)) return 850;
      if (text.includes(aliasResolved)) return 700;

      const words = aliasResolved.split(" ").filter(Boolean);
      if (words.length > 1 && words.every(word => text.includes(word))) return 600;

      return 0;
    };

    const renderSuggestions = query => {
      const q = normalize(query);

      if (!q) {
        closeSuggestions();
        bdStatus.textContent = "Start typing. Tap a result to jump directly to its section.";
        return;
      }

      currentResults = bdUniversities
        .map(item => ({item, score: scoreItem(item, q)}))
        .filter(result => result.score > 0)
        .sort((a,b) => b.score - a.score || a.item.textContent.localeCompare(b.item.textContent))
        .slice(0, 10);

      bdSuggestions.innerHTML = "";

      if (!currentResults.length) {
        bdSuggestions.innerHTML = `
          <div class="au-suggestion-empty">
            <strong>No standalone Section 1/2/3 match yet.</strong>
            <span>If this is a college, check the degree-awarding university on the certificate/transcript. If the awarding body is National University, search “NU” or “National University”.</span>
          </div>`;
        bdSuggestions.classList.add("is-open");
        bdSearch.setAttribute("aria-expanded", "true");
        bdStatus.innerHTML = `No standalone section match for <strong>${query}</strong>. Try the awarding university name or abbreviation.`;
        activeIndex = -1;
        return;
      }

      currentResults.forEach(({item}, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "au-suggestion";
        button.setAttribute("role", "option");
        button.dataset.index = String(index);
        button.innerHTML = `
          <span class="au-suggestion__name">${item.textContent.trim()}</span>
          <span class="au-suggestion__section">Section ${item.dataset.section}</span>`;
        button.addEventListener("mousedown", event => event.preventDefault());
        button.addEventListener("click", () => jumpToInstitution(item));
        bdSuggestions.appendChild(button);
      });

      bdSuggestions.classList.add("is-open");
      bdSearch.setAttribute("aria-expanded", "true");
      bdStatus.innerHTML = `Showing <strong>${currentResults.length}</strong> best match${currentResults.length === 1 ? "" : "es"}. Keep typing to narrow the list.`;
      activeIndex = -1;
    };

    const syncActiveSuggestion = () => {
      const options = [...bdSuggestions.querySelectorAll(".au-suggestion")];
      options.forEach((option, index) => option.classList.toggle("is-active", index === activeIndex));
      if (activeIndex >= 0 && options[activeIndex]) {
        options[activeIndex].scrollIntoView({block:"nearest"});
      }
    };

    bdSearch.addEventListener("input", () => renderSuggestions(bdSearch.value));

    bdSearch.addEventListener("focus", () => {
      if (bdSearch.value.trim()) renderSuggestions(bdSearch.value);
    });

    bdSearch.addEventListener("keydown", event => {
      if (!bdSuggestions.classList.contains("is-open")) {
        if (event.key === "ArrowDown") renderSuggestions(bdSearch.value);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
        syncActiveSuggestion();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        syncActiveSuggestion();
      } else if (event.key === "Enter" && activeIndex >= 0 && currentResults[activeIndex]) {
        event.preventDefault();
        jumpToInstitution(currentResults[activeIndex].item);
      } else if (event.key === "Escape") {
        closeSuggestions();
      }
    });

    document.addEventListener("click", event => {
      if (!event.target.closest("#bd-university-autocomplete")) closeSuggestions();
    });
  }

  const calc = document.querySelector("#earnings-calculator");
  if (calc) {
    const wage = calc.querySelector("[name=wage]");
    const hours = calc.querySelector("[name=hours]");
    const weekly = calc.querySelector("[data-weekly]");
    const fortnight = calc.querySelector("[data-fortnight]");
    const monthly = calc.querySelector("[data-monthly]");
    const update = () => {
      const w = Math.max(0, Number(wage.value) || 0);
      const h = Math.min(24, Math.max(0, Number(hours.value) || 0));
      const wk = w * h;
      weekly.textContent = "AUD " + wk.toFixed(2);
      fortnight.textContent = "AUD " + (wk * 2).toFixed(2);
      monthly.textContent = "AUD " + (wk * 52 / 12).toFixed(2);
    };
    [wage,hours].forEach(input => input.addEventListener("input", update));
    update();
  }

  const pointsCalc = document.querySelector("#points-calculator");
  if (pointsCalc) {
    const fields = [...pointsCalc.querySelectorAll("select")];
    const total = pointsCalc.querySelector("[data-points-total]");
    const update = () => {
      total.textContent = fields.reduce((sum, field) => sum + Number(field.value || 0), 0);
    };
    fields.forEach(field => field.addEventListener("change", update));
    update();
  }

  const cityA = document.querySelector("#city-a");
  const cityB = document.querySelector("#city-b");
  const compare = document.querySelector("#city-compare");
  const cityData = {
    sydney:{name:"Sydney",rent:"High",regional:"No",feel:"Largest-city pace",strength:"Large university and job market"},
    melbourne:{name:"Melbourne",rent:"High",regional:"No",feel:"Large student city",strength:"Very broad university choice"},
    brisbane:{name:"Brisbane",rent:"Moderate–high",regional:"No",feel:"Warm, growing city",strength:"Strong QLD university ecosystem"},
    perth:{name:"Perth",rent:"Moderate–high",regional:"Yes · Category 2",feel:"West-coast lifestyle",strength:"Major regional-classified capital"},
    adelaide:{name:"Adelaide",rent:"Moderate",regional:"Yes · Category 2",feel:"Smaller capital",strength:"Regional classification + major universities"},
    canberra:{name:"Canberra",rent:"Moderate–high",regional:"Yes · Category 2",feel:"Smaller national capital",strength:"Research and policy environment"},
    hobart:{name:"Hobart",rent:"Moderate",regional:"Yes",feel:"Small-city environment",strength:"Regional classification"},
    darwin:{name:"Darwin",rent:"Moderate",regional:"Yes",feel:"Tropical, smaller market",strength:"Regional classification"}
  };
  const renderCityCompare = () => {
    if (!compare || !cityA || !cityB) return;
    const a = cityData[cityA.value], b = cityData[cityB.value];
    compare.innerHTML = [a,b].map(c => `<article class="au-card"><span class="au-tag">${c.regional}</span><h3>${c.name}</h3><p><strong>Rent:</strong> ${c.rent}<br><strong>Feel:</strong> ${c.feel}<br><strong>Strength:</strong> ${c.strength}</p></article>`).join("");
  };
  [cityA,cityB].forEach(el => el && el.addEventListener("change", renderCityCompare));
  renderCityCompare();
});
