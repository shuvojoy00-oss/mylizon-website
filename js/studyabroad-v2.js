(() => {
  const STORAGE_KEY = "lizon-studyabroad-preferences-v1";

  const fallbackCountries = [
    ["australia","Australia","Oceania","australia.html","AU"],
    ["newzealand","New Zealand","Oceania","newzealand.html","NZ"],
    ["uk","United Kingdom","Europe","uk.html","UK"],
    ["canada","Canada","North America","canada.html","CA"],
    ["usa","United States","North America","usa.html","US"],
    ["ireland","Ireland","Europe","ireland.html","IE"],
    ["belgium","Belgium","Europe","belgium.html","BE"],
    ["switzerland","Switzerland","Europe","switzerland.html","CH"],
    ["denmark","Denmark","Europe","denmark.html","DK"],
    ["finland","Finland","Europe","finland.html","FI"],
    ["netherlands","Netherlands","Europe","netherlands.html","NL"],
    ["norway","Norway","Europe","norway.html","NO"],
    ["sweden","Sweden","Europe","sweden.html","SE"]
  ].map(([id,name,region,page,code]) => ({
    id,name,region,page,code,
    levels:["Bachelor","Masters","PhD"],
    line:"Explore study options, costs, visa rules and student pathways."
  }));

  const state = {
    countries: [],
    intelligence: [],
    region: "All",
    level: "All",
    query: "",
    preferences: new Set()
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[char]));
  }

  function loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) saved.slice(0, 3).forEach(item => state.preferences.add(item));
    } catch (_) {}
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.preferences]));
    } catch (_) {}
  }

  function updatePreferenceUI(message = "") {
    $$(".sa-priority").forEach(button => {
      const active = state.preferences.has(button.dataset.preference);
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const count = state.preferences.size;
    const status = $("#sa-priority-status");
    const summary = $("#sa-preference-summary");

    if (status) {
      status.textContent = message || (count
        ? `${count} of 3 priorities selected`
        : "Choose up to 3. You can change them anytime.");
    }

    if (summary) {
      if (!count) {
        summary.innerHTML = '<span>No priorities selected yet.</span>';
      } else {
        summary.innerHTML = [...state.preferences]
          .map(item => `<span>${escapeHtml(item)}</span>`)
          .join("");
      }
    }

    const heroPrefs = $("#sa-hero-preferences");
    if (heroPrefs) {
      heroPrefs.textContent = count
        ? [...state.preferences].join(" · ")
        : "Budget · career · post study";
    }

    const matcherPrefs = $("#sa-match-priorities");
    if (matcherPrefs) {
      matcherPrefs.innerHTML = count
        ? [...state.preferences].map(item => `<span>${escapeHtml(item)}</span>`).join("")
        : "None selected yet";
    }
  }

  function setupPriorities() {
    loadPreferences();
    $$(".sa-priority").forEach(button => {
      button.addEventListener("click", () => {
        const value = button.dataset.preference;
        if (state.preferences.has(value)) {
          state.preferences.delete(value);
          savePreferences();
          updatePreferenceUI();
          return;
        }

        if (state.preferences.size >= 3) {
          updatePreferenceUI("You can choose up to 3. Remove one to select another.");
          return;
        }

        state.preferences.add(value);
        savePreferences();
        updatePreferenceUI();
      });
    });
    updatePreferenceUI();
  }

  async function loadCountries() {
    try {
      const response = await fetch("data/studyabroad-countries.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Country data unavailable");
      const data = await response.json();
      state.countries = Array.isArray(data) ? data : fallbackCountries;
    } catch (_) {
      state.countries = fallbackCountries;
    }
    renderCountries();
    populateCompareSelects();
  }

  function filteredCountries() {
    const query = state.query.trim().toLowerCase();
    return state.countries.filter(country => {
      const regionMatch = state.region === "All" || country.region === state.region;
      const levelMatch = state.level === "All" || (country.levels || []).includes(state.level);
      const queryMatch = !query || [
        country.name,
        country.region,
        country.line,
        ...(country.levels || [])
      ].join(" ").toLowerCase().includes(query);
      return regionMatch && levelMatch && queryMatch;
    });
  }

  function cardTemplate(country, index) {
    const levels = (country.levels || []).slice(0, 3)
      .map(level => `<span>${escapeHtml(level)}</span>`).join("");

    return `
      <article class="sa-country-card sa-reveal" style="--delay:${Math.min(index, 7) * 45}ms">
        <a class="sa-country-card__visual" href="${escapeHtml(country.page)}" aria-label="Explore ${escapeHtml(country.name)}">
          <span class="sa-country-card__code">${escapeHtml(country.code || country.name.slice(0,2).toUpperCase())}</span>
          <span class="sa-country-card__region">${escapeHtml(country.region)}</span>
          <span class="sa-country-card__orb" aria-hidden="true"></span>
          <span class="sa-country-card__route" aria-hidden="true"></span>
        </a>
        <div class="sa-country-card__body">
          <div class="sa-country-card__meta">${levels}</div>
          <h3>${escapeHtml(country.name)}</h3>
          <p>${escapeHtml(country.line || "Explore study options, costs and pathways.")}</p>
          <a class="sa-country-card__link" href="${escapeHtml(country.page)}">
            Explore ${escapeHtml(country.name)}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    `;
  }

  function renderCountries() {
    const grid = $("#sa-country-grid");
    if (!grid) return;

    const countries = filteredCountries();
    grid.innerHTML = countries.map(cardTemplate).join("");

    const count = $("#sa-country-count");
    if (count) count.textContent = `${countries.length} destination${countries.length === 1 ? "" : "s"}`;

    const empty = $("#sa-country-empty");
    if (empty) empty.hidden = countries.length !== 0;

    observeReveals();
  }

  function setupExplorer() {
    const search = $("#sa-country-search");
    const level = $("#sa-level-filter");

    if (search) {
      search.addEventListener("input", event => {
        state.query = event.target.value;
        renderCountries();
      });
    }

    if (level) {
      level.addEventListener("change", event => {
        state.level = event.target.value;
        renderCountries();
      });
    }

    $$(".sa-region-filter").forEach(button => {
      button.addEventListener("click", () => {
        state.region = button.dataset.region;
        $$(".sa-region-filter").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderCountries();
      });
    });
  }

  function setupHeader() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    const close = $("#mobile-menu-close");

    const openMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    };

    const closeMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    toggle?.addEventListener("click", openMenu);
    close?.addEventListener("click", closeMenu);
    $$(".mobile-menu a").forEach(link => link.addEventListener("click", closeMenu));

    $$(".nav-dropdown__trigger").forEach(trigger => {
      trigger.addEventListener("click", event => {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        $$(".nav-dropdown__trigger").forEach(item => item.setAttribute("aria-expanded", "false"));
        trigger.setAttribute("aria-expanded", String(!expanded));
        event.stopPropagation();
      });
    });

    document.addEventListener("click", () => {
      $$(".nav-dropdown__trigger").forEach(item => item.setAttribute("aria-expanded", "false"));
    });
  }

  let revealObserver;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      $$(".sa-reveal").forEach(el => el.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }

    $$(".sa-reveal:not(.is-visible)").forEach(el => revealObserver.observe(el));
  }

  async function ensureIntelligence() {
    if (state.intelligence.length) return state.intelligence;
    try {
      const response = await fetch("data/studyabroad-intelligence.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Matcher data unavailable");
      const data = await response.json();
      state.intelligence = Array.isArray(data) ? data.filter(item => item.matcherReady) : [];
    } catch (_) {
      state.intelligence = [];
    }
    return state.intelligence;
  }

  function matcherInputs() {
    return {
      level: $("#sa-match-level")?.value || "Masters",
      budget: Number($("#sa-match-budget")?.value || 0),
      region: $("#sa-match-region")?.value || "Any",
      concern: $("#sa-match-concern")?.value || "none",
      family: $("#sa-match-family")?.value || "no",
      priorities: [...state.preferences]
    };
  }

  function scoreDestination(intel, country, input) {
    let score = 0;
    const reasons = [];
    const cautions = [];

    if ((intel.levels || []).includes(input.level)) {
      score += 1;
      reasons.push(`${input.level} study is covered in this destination guide.`);
    }

    if (input.region !== "Any") {
      if (country.region === input.region) {
        score += 3;
        reasons.push(`Matches your ${input.region} preference.`);
      } else {
        score -= 1;
      }
    }

    if (input.budget) {
      if (intel.budgetBand <= input.budget) {
        score += 4;
        reasons.push("Broad budget level fits your selected comfort range.");
      } else {
        score -= (intel.budgetBand - input.budget) * 3;
        cautions.push("This destination commonly needs a higher overall budget than the range you selected.");
      }
    }

    if (input.concern === "lowGpa") {
      if (intel.lowGpa) {
        score += 3;
        reasons.push("The guide includes low GPA or pathway considerations.");
      } else {
        score -= 2;
        cautions.push("Low GPA or pathway flexibility is not a strong signal in the current guide.");
      }
    }

    if (input.concern === "studyGap") {
      if (intel.studyGap) {
        score += 3;
        reasons.push("The guide directly addresses study gap or credibility planning.");
      } else {
        score -= 2;
        cautions.push("Your study gap would need more individual checking for this destination.");
      }
    }

    if (input.family === "yes") {
      if (intel.familyScore >= 3) {
        score += 4;
        reasons.push("Current family pathways are comparatively relevant to your plan.");
      } else if (intel.familyScore === 2) {
        score += 2;
        reasons.push("Family routes exist, but conditions matter.");
      } else {
        score -= 2;
        cautions.push(intel.familyNote || "Family options are restrictive or use a separate route.");
      }
    }

    for (const priority of input.priorities) {
      if (priority === "Affordable study") {
        if (intel.budgetBand === 1) {
          score += 4;
          reasons.push("Lower cost potential is a stronger planning signal here.");
        } else if (intel.budgetBand === 2) {
          score += 2;
          reasons.push("Costs can sit in a middle planning band depending on provider and city.");
        }
      }

      if (priority === "Scholarship" && intel.scholarship) {
        score += 2;
        reasons.push("Scholarship routes are covered in the current guide.");
      }

      if (priority === "Career opportunities") {
        score += intel.postStudyScore || 0;
        if ((intel.postStudyScore || 0) >= 2) reasons.push("There is a meaningful graduate work route to investigate.");
      }

      if (priority === "Bring family") {
        score += Math.max(0, (intel.familyScore || 0) - 1);
      }

      if (priority === "Post study work") {
        score += (intel.postStudyScore || 0) * 1.5;
        if ((intel.postStudyScore || 0) >= 2) reasons.push("Post study work is a notable planning factor here.");
      }

      if (priority === "Low GPA options") {
        if (intel.lowGpa) {
          score += 2;
          reasons.push("The guide discusses alternatives for weaker academic profiles.");
        } else {
          score -= 1;
        }
      }

      if (priority === "Study gap") {
        if (intel.studyGap) {
          score += 2;
          reasons.push("Study gap evidence is directly discussed in the guide.");
        } else {
          score -= 1;
        }
      }

      if (priority === "Research" && intel.research) {
        score += 2;
        reasons.push("Research and doctoral routes are included in the guide.");
      }

      if (priority === "Fast intake") {
        score += intel.intakeScore || 0;
        if ((intel.intakeScore || 0) >= 2) reasons.push("Multiple or secondary intake options are available to investigate.");
      }
    }

    if (input.priorities.includes("Longer term pathway")) {
      cautions.push("Long term residence is deliberately not auto-scored. It depends on future work, occupation and immigration rules.");
    }

    if (!cautions.length && input.family === "yes") {
      cautions.push(intel.familyNote || "Recheck current family rules before making a decision.");
    }

    if (!cautions.length && input.priorities.includes("Post study work")) {
      cautions.push(intel.postStudyNote || "Recheck current graduate work eligibility for your exact qualification.");
    }

    if (!cautions.length) {
      cautions.push("This is a planning match, not an admission or visa prediction. Verify the exact programme and current official rules.");
    }

    return {
      intel,
      country,
      score,
      reasons: [...new Set(reasons)].slice(0, 4),
      caution: cautions[0]
    };
  }

  function fitCard(result, index) {
    const strong = index < 3;
    const label = strong ? "Strong fit to explore" : "Worth comparing";
    const reasons = result.reasons.length
      ? result.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")
      : "<li>Useful destination to compare against your current inputs.</li>";

    return `
      <article class="sa-fit-card ${strong ? "sa-fit-card--top" : ""}">
        <div class="sa-fit-card__top">
          <div class="sa-fit-card__country">
            <span class="sa-fit-card__code">${escapeHtml(result.country.code || result.country.name.slice(0,2))}</span>
            <strong>${escapeHtml(result.country.name)}</strong>
          </div>
          <span class="sa-fit-card__label ${strong ? "" : "sa-fit-card__label--compare"}">${label}</span>
        </div>

        <h4>Why it surfaced</h4>
        <ul class="sa-fit-card__reasons">${reasons}</ul>

        <div class="sa-fit-card__caution">${escapeHtml(result.caution)}</div>

        <div class="sa-fit-card__actions">
          <a href="${escapeHtml(result.country.page)}">Open country guide ↗</a>
          <small>Verified ${escapeHtml(result.intel.lastVerified || "recently")}</small>
        </div>
      </article>
    `;
  }

  async function runMatcher() {
    const intelligence = await ensureIntelligence();
    const resultsWrap = $("#sa-match-results");
    const grid = $("#sa-match-results-grid");
    const count = $("#sa-match-result-count");
    if (!resultsWrap || !grid) return;

    if (!intelligence.length) {
      resultsWrap.hidden = false;
      grid.innerHTML = '<div class="sa-country-empty">Matcher data could not be loaded. Please use the country guides or eligibility assessment.</div>';
      if (count) count.textContent = "";
      return;
    }

    const input = matcherInputs();
    const countryMap = new Map(state.countries.map(country => [country.id, country]));

    const ranked = intelligence
      .map(intel => {
        const country = countryMap.get(intel.id);
        return country ? scoreDestination(intel, country, input) : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.country.name.localeCompare(b.country.name))
      .slice(0, 6);

    grid.innerHTML = ranked.map(fitCard).join("");
    resultsWrap.hidden = false;
    if (count) count.textContent = `Top ${ranked.length} from ${intelligence.length} live guides`;
    resultsWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setupMatcher() {
    const form = $("#sa-matcher-form");
    if (!form) return;
    form.addEventListener("submit", event => {
      event.preventDefault();
      runMatcher();
    });
    ensureIntelligence();
  }

  function populateCompareSelects() {
    const selects = [$("#sa-compare-1"), $("#sa-compare-2"), $("#sa-compare-3")].filter(Boolean);
    if (!selects.length || !state.countries.length) return;

    const defaults = ["australia", "newzealand", "uk"];
    selects.forEach((select, index) => {
      const current = select.value;
      select.innerHTML = '<option value="">Choose a country</option>' +
        state.countries.map(country =>
          `<option value="${escapeHtml(country.id)}">${escapeHtml(country.name)}</option>`
        ).join("");
      select.value = current || defaults[index] || "";
    });
  }

  function comparisonLabel(type, value) {
    const maps = {
      budget: {
        1: "Lower cost potential",
        2: "Mid range planning",
        3: "Higher budget commonly needed"
      },
      family: {
        1: "Restrictive or separate route",
        2: "Conditional family route",
        3: "Comparatively clearer route"
      },
      postStudy: {
        1: "Shorter or limited route",
        2: "Post study route available",
        3: "Stronger or longer graduate route"
      },
      intake: {
        1: "One main intake dominates",
        2: "Main + selected secondary starts",
        3: "Multiple common intake options"
      }
    };
    return maps[type]?.[value] || "Check current guide";
  }

  function compareValue(intel, key) {
    if (key === "budget") return comparisonLabel("budget", intel.budgetBand);
    if (key === "family") return comparisonLabel("family", intel.familyScore);
    if (key === "postStudy") return comparisonLabel("postStudy", intel.postStudyScore);
    if (key === "intake") return comparisonLabel("intake", intel.intakeScore);
    if (key === "lowGpa") return intel.lowGpa ? "Pathway / weaker profile guidance included" : "Needs individual checking";
    if (key === "studyGap") return intel.studyGap ? "Study gap guidance included" : "Needs individual checking";
    if (key === "scholarship") return intel.scholarship ? "Scholarship routes covered" : "Check provider funding";
    if (key === "research") return intel.research ? "Research / PhD routes covered" : "Check research availability";
    return "Check current guide";
  }

  async function runCompare() {
    await ensureIntelligence();
    const result = $("#sa-compare-results");
    if (!result) return;

    const ids = [$("#sa-compare-1")?.value, $("#sa-compare-2")?.value, $("#sa-compare-3")?.value]
      .filter(Boolean)
      .filter((id, index, list) => list.indexOf(id) === index);

    if (ids.length < 2) {
      result.innerHTML = '<div class="sa-compare-placeholder">Choose at least two different countries to compare.</div>';
      return;
    }

    const intelMap = new Map(state.intelligence.map(item => [item.id, item]));
    const countryMap = new Map(state.countries.map(item => [item.id, item]));
    const selected = ids.map(id => ({
      intel: intelMap.get(id),
      country: countryMap.get(id)
    })).filter(item => item.intel && item.country);

    if (selected.length < 2) {
      result.innerHTML = '<div class="sa-compare-placeholder">Comparison data is not ready for those destinations yet.</div>';
      return;
    }

    while (selected.length < 3) selected.push(null);

    const head = selected.map(item => item ? `
      <div class="sa-compare-cell">
        <div class="sa-compare-country">
          <span class="sa-compare-country__code">${escapeHtml(item.country.code)}</span>
          <strong>${escapeHtml(item.country.name)}</strong>
        </div>
        <a href="${escapeHtml(item.country.page)}">Open guide ↗</a>
      </div>
    ` : '<div class="sa-compare-cell"></div>').join("");

    const rows = [
      ["Budget planning", "budget"],
      ["Family planning", "family"],
      ["Post study route", "postStudy"],
      ["Intake flexibility", "intake"],
      ["Low GPA / pathway", "lowGpa"],
      ["Study gap", "studyGap"],
      ["Scholarships", "scholarship"],
      ["Research", "research"]
    ];

    const body = rows.map(([label, key]) => `
      <div class="sa-compare-row">
        <div class="sa-compare-cell">${escapeHtml(label)}</div>
        ${selected.map(item => item
          ? `<div class="sa-compare-cell"><span class="sa-compare-tag">${escapeHtml(compareValue(item.intel, key))}</span></div>`
          : '<div class="sa-compare-cell"></div>'
        ).join("")}
      </div>
    `).join("");

    result.innerHTML = `
      <div class="sa-compare-table">
        <div class="sa-compare-row sa-compare-row--head">
          <div class="sa-compare-cell">Planning signal</div>
          ${head}
        </div>
        ${body}
      </div>
    `;
  }

  function setupCompare() {
    $("#sa-run-compare")?.addEventListener("click", runCompare);
  }

  function setupUtilities() {
    $("#back-to-top")?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $$("[data-scroll-to]").forEach(link => {
      link.addEventListener("click", event => {
        const target = $(link.dataset.scrollTo);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupHeader();
    setupPriorities();
    setupExplorer();
    setupMatcher();
    setupCompare();
    setupUtilities();
    loadCountries();
    observeReveals();
  });
})();