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
    "dhaka university":"university of dhaka",
    "cu":"university of chittagong",
    "chittagong university":"university of chittagong",
    "ru":"university of rajshahi",
    "rajshahi university":"university of rajshahi",
    "ju":"jahangirnagar university",
    "bup":"bangladesh university of professionals",
    "nu":"national university",
    "national university bangladesh":"national university",
    "bau":"bangladesh agricultural university",
    "butex":"bangladesh university of textiles",
    "mbstu":"mawlana bhashani science and technology university",
    "pstu":"patuakhali science and technology university",
    "hstu":"hajee mohammad danesh science and technology university",
    "nstu":"noakhali science and technology university",
    "jnu":"jagannath university",
    "jagannath":"jagannath university",
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

  if (bdSearch && bdUniversities.length) {
    bdUniversities.forEach(item => {
      item.dataset.searchText = normalize(item.textContent);
    });

    bdSearch.addEventListener("input", () => {
      const raw = bdSearch.value.trim();
      const normalizedRaw = normalize(raw);
      const resolved = aliasMap[normalizedRaw] || normalizedRaw;
      let matches = 0;

      bdUniversities.forEach(item => {
        const hit = !resolved || item.dataset.searchText.includes(resolved);
        item.hidden = !hit;
        if (hit && resolved) matches += 1;
      });

      if (resolved) {
        document.querySelectorAll(".au-section-lists details").forEach(detail => detail.open = true);
      }

      if (!bdStatus) return;

      if (!resolved) {
        bdStatus.innerHTML = "Search by full name, common abbreviation or college name.";
      } else if (matches > 0) {
        const aliasNote = aliasMap[normalizedRaw] ? ` <span>Matched “${raw}” to its common university name.</span>` : "";
        bdStatus.innerHTML = `Found <strong>${matches}</strong> matching CEP-listed institution${matches === 1 ? "" : "s"}.${aliasNote}`;
      } else {
        const looksLikeCollege = /college|mohila|women.?s college|govt|government|degree college/i.test(raw);
        bdStatus.innerHTML = looksLikeCollege
          ? `<strong>No standalone Section 1/2/3 entry found for “${raw}”.</strong> For an affiliated college, check the <em>degree-awarding university</em> printed on the certificate/transcript. If the degree is awarded by National University, use National University’s current Section 2 classification and verify the college’s NU affiliation.`
          : `<strong>“${raw}” is not in the current standalone Section 1/2/3 list shown here.</strong> This does not automatically mean the qualification is unacceptable. Check the awarding body, current Bangladesh recognition, and ask the target Australian provider for a formal assessment.`;
      }
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
