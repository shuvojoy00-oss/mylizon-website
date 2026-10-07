(() => {
  const STORAGE_KEY = "lizon-studyabroad-preferences-v1";
  const PLAN_KEY = "lizon-studyabroad-plan-v1";
  const HANDOFF_KEY = "lizon-studyabroad-handoff-v1";

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
    ["sweden","Sweden","Europe","sweden.html","SE"],
    ["france","France","Europe","france.html","FR"],
    ["poland","Poland","Europe","poland.html","PL"],
    ["spain","Spain","Europe","spain.html","ES"],
    ["austria","Austria","Europe","austria.html","AT"],
    ["croatia","Croatia","Europe","croatia.html","HR"],
    ["germany","Germany","Europe","germany.html","DE"],
    ["greece","Greece","Europe","greece.html","GR"],
    ["italy","Italy","Europe","italy.html","IT"],
    ["lithuania","Lithuania","Europe","lithuania.html","LT"],
    ["estonia","Estonia","Europe","estonia.html","EE"],
    ["hungary","Hungary","Europe","hungary.html","HU"],
    ["malta","Malta","Europe","malta.html","MT"],
    ["china","China","Asia","china.html","CN"],
    ["turkey","Türkiye","Europe","turkey.html","TR"],
    ["uae","United Arab Emirates","Asia","uae.html","AE"],
    ["latvia","Latvia","Europe","latvia.html","LV"],
    ["romania","Romania","Europe","romania.html","RO"],
    ["czech","Czech Republic","Europe","czech.html","CZ"],
    ["portugal","Portugal","Europe","portugal.html","PT"],
    ["slovenia","Slovenia","Europe","slovenia.html","SI"],
    ["serbia","Serbia","Europe","serbia.html","RS"],
    ["slovakia","Slovakia","Europe","slovakia.html","SK"],
    ["bulgaria","Bulgaria","Europe","bulgaria.html","BG"],
    ["singapore","Singapore","Asia","singapore.html","SG"],
    ["qatar","Qatar","Asia","qatar.html","QA"],
    ["saudi-arabia","Saudi Arabia","Asia","saudi-arabia.html","SA"],
    ["thailand","Thailand","Asia","thailand.html","TH"]
  ].map(([id,name,region,page,code]) => ({
    id,name,region,page,code,
    levels:["Bachelor","Masters","PhD"],
    line:"Explore study options, costs, visa rules and student pathways."
  }));

  const state = {
    countries: [],
    intelligence: [],
    costs: [],
    timelines: [],
    radar: [],
    radarFilter: "All",
    region: "All",
    level: "All",
    query: "",
    preferences: new Set(),
    plan: { shortlist: [], cost: null, timeline: null, updatedAt: null }
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

  function loadPlan() {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}");
      if (saved && typeof saved === "object") {
        state.plan = {
          shortlist: Array.isArray(saved.shortlist) ? saved.shortlist.slice(0, 5) : [],
          cost: saved.cost && typeof saved.cost === "object" ? saved.cost : null,
          timeline: saved.timeline && typeof saved.timeline === "object" ? saved.timeline : null,
          updatedAt: saved.updatedAt || null
        };
      }
    } catch (_) {
      state.plan = { shortlist: [], cost: null, timeline: null, updatedAt: null };
    }
  }

  function persistPlan() {
    state.plan.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(state.plan));
    } catch (_) {}
    renderPlan();
    refreshPlanButtons();
  }

  function planCountryMeta(id) {
    return currentCountryMeta(id) || fallbackCountries.find(item => item.id === id) || null;
  }

  function isCountrySaved(id) {
    return state.plan.shortlist.some(item => item.id === id);
  }

  function togglePlanCountry(id) {
    const index = state.plan.shortlist.findIndex(item => item.id === id);
    if (index >= 0) {
      state.plan.shortlist.splice(index, 1);
      persistPlan();
      return;
    }

    if (state.plan.shortlist.length >= 5) {
      const summary = $("#sa-plan-action-summary");
      if (summary) summary.textContent = "Your shortlist can hold up to five countries. Remove one before adding another.";
      return;
    }

    const country = planCountryMeta(id);
    if (!country) return;

    state.plan.shortlist.push({
      id: country.id,
      name: country.name,
      code: country.code || country.name.slice(0, 2).toUpperCase(),
      page: country.page
    });
    persistPlan();
  }

  function refreshPlanButtons() {
    document.querySelectorAll("[data-plan-country]").forEach(button => {
      const saved = isCountrySaved(button.dataset.planCountry);
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", String(saved));
      button.textContent = saved ? "Saved to plan" : "Save to plan";
    });
  }

  function planCompletion() {
    return [
      state.preferences.size > 0,
      state.plan.shortlist.length > 0,
      Boolean(state.plan.cost),
      Boolean(state.plan.timeline)
    ].filter(Boolean).length;
  }

  function renderPlan() {
    const priorities = $("#sa-plan-priorities");
    if (priorities) {
      priorities.innerHTML = state.preferences.size
        ? [...state.preferences].map(item => `<span>${escapeHtml(item)}</span>`).join("")
        : '<span class="sa-plan-empty">Choose up to three priorities.</span>';
    }

    const shortlist = $("#sa-plan-shortlist");
    if (shortlist) {
      shortlist.innerHTML = state.plan.shortlist.length
        ? state.plan.shortlist.map(item => `
            <div class="sa-plan-country">
              <div class="sa-plan-country__main">
                <span class="sa-plan-country__code">${escapeHtml(item.code || item.name.slice(0,2))}</span>
                <strong>${escapeHtml(item.name)}</strong>
              </div>
              <button type="button" data-plan-remove="${escapeHtml(item.id)}">Remove</button>
            </div>
          `).join("")
        : '<span class="sa-plan-empty">Save countries from Explore or Best Fit.</span>';
    }

    const budget = $("#sa-plan-budget");
    if (budget) {
      if (state.plan.cost) {
        const bdt = state.plan.cost.bdtText ? ` · ${escapeHtml(state.plan.cost.bdtText)}` : "";
        budget.innerHTML = `
          <strong>${escapeHtml(state.plan.cost.firstYearText)}</strong>
          <span>${escapeHtml(state.plan.cost.countryName)} · ${escapeHtml(state.plan.cost.level)} · First-year planning cost${bdt}</span>
          <span>Funding target: ${escapeHtml(state.plan.cost.fundingText || "Check official target")}</span>
        `;
      } else {
        budget.innerHTML = '<strong>Not calculated yet</strong><span>Use the Real Cost Calculator to add a first-year estimate.</span>';
      }
    }

    const intake = $("#sa-plan-intake");
    if (intake) {
      if (state.plan.timeline) {
        intake.innerHTML = `
          <strong>${escapeHtml(state.plan.timeline.countryName)} · ${escapeHtml(state.plan.timeline.intakeLabel)} ${escapeHtml(state.plan.timeline.year)}</strong>
          <span>${escapeHtml(state.plan.timeline.status)} · Recommended start ${escapeHtml(state.plan.timeline.recommendedStart)}</span>
        `;
      } else {
        intake.innerHTML = '<strong>No intake saved yet</strong><span>Build an Intake Planner timeline to save your target.</span>';
      }
    }

    const ready = planCompletion();
    const progressText = $("#sa-plan-progress-text");
    const progressBar = $("#sa-plan-progress-bar");
    if (progressText) progressText.textContent = `${ready} of 4 parts ready`;
    if (progressBar) progressBar.style.width = `${ready * 25}%`;

    const action = $("#sa-plan-action-summary");
    if (action) {
      const messages = [
        "Start with your priorities or save a country you want to explore.",
        "Good start. Add more of your shortlist, budget or intake so the plan becomes useful.",
        "Your plan is taking shape. Complete the missing parts before moving into eligibility checking.",
        "Almost ready. One more planning piece will give the counsellor much better context.",
        "Your core planning picture is ready. The next step is to check eligibility against your real academic and financial profile."
      ];
      action.textContent = messages[ready];
    }

    renderHandoff();
  }

  function buildHandoffSummary() {
    const lines = ["LizOn Study Abroad Plan"];

    if (state.plan.shortlist.length) {
      lines.push(`Shortlist: ${state.plan.shortlist.map(item => item.name).join(", ")}`);
    }

    if (state.preferences.size) {
      lines.push(`Priorities: ${[...state.preferences].join(", ")}`);
    }

    if (state.plan.cost) {
      lines.push(`Latest cost plan: ${state.plan.cost.countryName} · ${state.plan.cost.level}`);
      lines.push(`First-year estimate: ${state.plan.cost.firstYearText}`);
      lines.push(`Funding target: ${state.plan.cost.fundingText}`);
      if (state.plan.cost.bdtText) lines.push(`BDT view: ${state.plan.cost.bdtText}`);
    }

    if (state.plan.timeline) {
      lines.push(`Target intake: ${state.plan.timeline.countryName} · ${state.plan.timeline.intakeLabel} ${state.plan.timeline.year}`);
      lines.push(`Planning status: ${state.plan.timeline.status}`);
      lines.push(`Recommended preparation start: ${state.plan.timeline.recommendedStart}`);
    }

    const ready = planCompletion();
    lines.push(`Plan completeness: ${ready}/4`);
    lines.push("");
    lines.push("I would like LizOn to review this plan and guide me on my next step.");

    return {
      text: lines.join("\n"),
      ready,
      hasContext: ready > 0
    };
  }

  function persistHandoff(summary) {
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify({
        summary: summary.text,
        plan: state.plan,
        priorities: [...state.preferences],
        savedAt: new Date().toISOString()
      }));
    } catch (_) {}
  }

  function renderHandoff() {
    const preview = $("#sa-handoff-preview");
    const panel = preview?.closest(".sa-handoff-panel");
    const status = $("#sa-handoff-status");
    const whatsapp = $("#sa-handoff-whatsapp");
    const assessment = $("#sa-handoff-assessment");
    const copy = $("#sa-handoff-copy");
    if (!preview || !panel) return;

    const summary = buildHandoffSummary();
    preview.textContent = summary.hasContext ? summary.text : "No Study Plan details saved yet.";
    panel.classList.toggle("is-empty", !summary.hasContext);

    if (status) {
      status.classList.toggle("is-ready", summary.hasContext);
      status.textContent = summary.hasContext
        ? `${summary.ready} of 4 planning parts are ready. Review the preview before sharing it.`
        : "Add something to My Study Plan and your handoff summary will appear here.";
    }

    if (copy) copy.disabled = !summary.hasContext;

    if (whatsapp) {
      const message = summary.hasContext
        ? `Hi LizOn,\nI built a Study Abroad plan on MyLizOn.com.\n\n${summary.text}`
        : "Hi LizOn, I would like guidance about studying abroad.";
      whatsapp.href = `https://wa.me/8801608881545?text=${encodeURIComponent(message)}`;
      whatsapp.setAttribute("aria-disabled", String(!summary.hasContext));
    }

    if (assessment) {
      assessment.href = summary.hasContext ? "assessment.html?from=study-plan" : "assessment.html";
    }

    if (summary.hasContext) persistHandoff(summary);
  }

  async function copyHandoffSummary() {
    const summary = buildHandoffSummary();
    if (!summary.hasContext) return;

    const button = $("#sa-handoff-copy");
    try {
      await navigator.clipboard.writeText(summary.text);
      if (button) {
        const original = button.textContent;
        button.textContent = "Copied";
        button.classList.add("is-copied");
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove("is-copied");
        }, 1600);
      }
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = summary.text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); } catch (_) {}
      textarea.remove();
    }
  }

  function setupPersonalPlan() {
    loadPlan();
    renderPlan();

    document.addEventListener("click", event => {
      const saveButton = event.target.closest("[data-plan-country]");
      if (saveButton) {
        event.preventDefault();
        togglePlanCountry(saveButton.dataset.planCountry);
        return;
      }

      const removeButton = event.target.closest("[data-plan-remove]");
      if (removeButton) {
        event.preventDefault();
        togglePlanCountry(removeButton.dataset.planRemove);
      }
    });

    $("#sa-plan-clear")?.addEventListener("click", () => {
      state.plan = { shortlist: [], cost: null, timeline: null, updatedAt: null };
      try {
        localStorage.removeItem(PLAN_KEY);
        localStorage.removeItem(HANDOFF_KEY);
      } catch (_) {}
      renderPlan();
      refreshPlanButtons();
    });

    $("#sa-handoff-copy")?.addEventListener("click", copyHandoffSummary);
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

    renderPlan();
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
    populateCostCountrySelect();
    populateTimelineCountrySelect();
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
          <div class="sa-country-card__actions">
            <a class="sa-country-card__link" href="${escapeHtml(country.page)}">
              Explore ${escapeHtml(country.name)}
              <span aria-hidden="true">↗</span>
            </a>
            <button class="sa-save-country ${isCountrySaved(country.id) ? "is-saved" : ""}" type="button" data-plan-country="${escapeHtml(country.id)}" aria-pressed="${isCountrySaved(country.id)}">
              ${isCountrySaved(country.id) ? "Saved to plan" : "Save to plan"}
            </button>
          </div>
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
    refreshPlanButtons();
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
    const desktopQuery = window.matchMedia("(min-width: 901px)");

    const closeDesktopDropdowns = () => {
      document.querySelectorAll(".nav-dropdown__trigger").forEach(item => item.setAttribute("aria-expanded", "false"));
    };

    const openMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      document.body.classList.add("menu-open");
      close?.focus();
    };

    const closeMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      document.body.classList.remove("menu-open");
    };

    toggle?.addEventListener("click", openMenu);
    close?.addEventListener("click", closeMenu);
    document.querySelectorAll(".mobile-menu a").forEach(link => link.addEventListener("click", closeMenu));

    document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
      const trigger = $(".nav-dropdown__trigger", dropdown);
      if (!trigger) return;

      const openDropdown = () => {
        if (!desktopQuery.matches) return;
        closeDesktopDropdowns();
        trigger.setAttribute("aria-expanded", "true");
      };

      const closeDropdown = () => {
        if (!desktopQuery.matches) return;
        trigger.setAttribute("aria-expanded", "false");
      };

      dropdown.addEventListener("mouseenter", openDropdown);
      dropdown.addEventListener("mouseleave", closeDropdown);
      dropdown.addEventListener("focusin", openDropdown);
      dropdown.addEventListener("focusout", event => {
        if (!dropdown.contains(event.relatedTarget)) closeDropdown();
      });

      trigger.addEventListener("click", event => {
        if (!desktopQuery.matches) return;
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        closeDesktopDropdowns();
        trigger.setAttribute("aria-expanded", String(!expanded));
        event.stopPropagation();
      });
    });

    document.addEventListener("click", closeDesktopDropdowns);
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      closeDesktopDropdowns();
      if (menu?.classList.contains("is-open")) {
        closeMenu();
        toggle?.focus();
      }
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
        <button class="sa-fit-card__save ${isCountrySaved(result.country.id) ? "is-saved" : ""}" type="button" data-plan-country="${escapeHtml(result.country.id)}" aria-pressed="${isCountrySaved(result.country.id)}">
          ${isCountrySaved(result.country.id) ? "Saved to plan" : "Save to plan"}
        </button>
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
    refreshPlanButtons();
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

  async function populateCompareSelects() {
    const selects = [$("#sa-compare-1"), $("#sa-compare-2"), $("#sa-compare-3")].filter(Boolean);
    if (!selects.length || !state.countries.length) return;

    await ensureIntelligence();
    const comparisonIds = new Set(state.intelligence.map(item => item.id));
    const comparisonCountries = state.countries.filter(country => comparisonIds.has(country.id));
    const defaults = ["australia", "newzealand", "uk"];

    selects.forEach((select, index) => {
      const current = select.value;
      select.innerHTML = '<option value="">Choose a country</option>' +
        comparisonCountries.map(country =>
          `<option value="${escapeHtml(country.id)}">${escapeHtml(country.name)}</option>`
        ).join("");
      select.value = current && comparisonIds.has(current) ? current : (defaults[index] || "");
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
        <button class="sa-save-country ${isCountrySaved(item.country.id) ? "is-saved" : ""}" type="button" data-plan-country="${escapeHtml(item.country.id)}" aria-pressed="${isCountrySaved(item.country.id)}">
          ${isCountrySaved(item.country.id) ? "Saved to plan" : "Save to plan"}
        </button>
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
    refreshPlanButtons();
  }

  function setupCompare() {
    $("#sa-run-compare")?.addEventListener("click", runCompare);
  }

  async function ensureCostData() {
    if (state.costs.length) return state.costs;
    try {
      const response = await fetch("data/studyabroad-costs.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Cost data unavailable");
      const data = await response.json();
      state.costs = Array.isArray(data) ? data : [];
    } catch (_) {
      state.costs = [];
    }
    return state.costs;
  }

  function costCountry() {
    const id = $("#sa-cost-country")?.value;
    return state.costs.find(item => item.id === id) || null;
  }

  function currentCountryMeta(id) {
    return state.countries.find(item => item.id === id) || null;
  }

  function formatCost(value, cost) {
    if (!Number.isFinite(value)) return "—";
    const maximumFractionDigits = Math.abs(value - Math.round(value)) > 0.001 ? 2 : 0;
    const number = new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
    if (cost?.symbol === "€" || cost?.symbol === "£" || cost?.symbol === "$") return `${cost.symbol}${number}`;
    if (cost?.symbol === "A$" || cost?.symbol === "C$" || cost?.symbol === "NZ$") return `${cost.symbol}${number}`;
    return `${cost?.symbol || cost?.currency || ""} ${number}`.trim();
  }

  function formatBDT(value, rate) {
    if (!Number.isFinite(value) || !Number.isFinite(rate) || rate <= 0) return "";
    return `≈ ৳${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value * rate)} at your BDT rate`;
  }

  function tuitionPreset(cost, level) {
    const t = cost?.tuition?.[level];
    if (!t || !Number.isFinite(t.min) || !Number.isFinite(t.max)) return null;
    return t.min === t.max ? t.min : Math.round((t.min + t.max) / 2);
  }

  function livingProfile(cost) {
    if (!cost?.living) return { required: 0, planning: 0, note: "" };
    if (cost.living.type === "location") {
      const id = $("#sa-cost-location")?.value || cost.living.locations?.[0]?.id;
      const location = cost.living.locations?.find(item => item.id === id) || cost.living.locations?.[0];
      return {
        required: Number(location?.requiredAnnual || 0),
        planning: Number(location?.planningAnnual || location?.requiredAnnual || 0),
        note: cost.living.note || ""
      };
    }
    return {
      required: Number(cost.living.requiredAnnual || 0),
      planning: Number(cost.living.planningAnnual || cost.living.requiredAnnual || 0),
      note: cost.living.note || ""
    };
  }

  function familyFunding(cost) {
    const adults = Number($("#sa-cost-adults")?.value || 0);
    const children = Number($("#sa-cost-children")?.value || 0);
    const dependants = adults + children;
    if (!dependants || !cost?.family) return { amount: 0, note: dependants ? "No automatic family formula is stored for this destination. Add real family costs under housing setup / other." : "" };

    const family = cost.family;
    if (family.type === "householdTable") {
      const size = 1 + dependants;
      const total = Number(family.table?.[size]);
      const base = Number(family.table?.[1] || 0);
      if (Number.isFinite(total)) return { amount: Math.max(0, total - base), note: family.note || "" };
      return { amount: 0, note: "The stored household table does not cover this family size. Check the current country guide." };
    }

    if (family.type === "locationMonthly9") {
      const location = $("#sa-cost-location")?.value || "outside";
      const per = Number(location === "london" ? family.londonAdult : family.outsideAdult);
      return { amount: per * 9 * dependants, note: family.note || "" };
    }

    if (family.type === "monthlyFlat") {
      return {
        amount: (Number(family.adult || 0) * adults + Number(family.child || 0) * children) * 12,
        note: family.note || ""
      };
    }

    if (family.type === "firstPlusAdditional") {
      const monthly = dependants > 0 ? Number(family.first || 0) + Math.max(0, dependants - 1) * Number(family.additional || 0) : 0;
      return { amount: monthly * 12, note: family.note || "" };
    }

    return { amount: 0, note: family.note || "" };
  }

  function updateCostLocation(cost) {
    const wrap = $("#sa-cost-location-wrap");
    const select = $("#sa-cost-location");
    if (!wrap || !select) return;
    const locations = cost?.living?.type === "location" ? cost.living.locations || [] : [];
    wrap.hidden = !locations.length;
    if (!locations.length) {
      select.innerHTML = "";
      return;
    }
    const old = select.value;
    select.innerHTML = locations.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("");
    if (locations.some(item => item.id === old)) select.value = old;
  }

  function applyCostDefaults({ resetTuition = true } = {}) {
    const cost = costCountry();
    if (!cost) return;

    updateCostLocation(cost);
    const level = $("#sa-cost-level")?.value || "Masters";
    const tuition = tuitionPreset(cost, level);
    const tuitionInput = $("#sa-cost-tuition");
    const tuitionHint = $("#sa-cost-tuition-hint");
    if (tuitionInput && resetTuition) tuitionInput.value = tuition ?? "";

    const t = cost.tuition?.[level];
    if (tuitionHint) {
      if (t && Number.isFinite(t.min) && Number.isFinite(t.max)) {
        const range = t.min === t.max
          ? `Guide default: ${formatCost(t.min, cost)}.`
          : `Guide range: ${formatCost(t.min, cost)}–${formatCost(t.max, cost)}. Midpoint prefilled.`;
        tuitionHint.textContent = `${range} ${t.label || "Replace with your exact offer-letter tuition."}`;
      } else {
        tuitionHint.textContent = cost.tuitionGuide || "No reliable national tuition default. Enter the exact programme fee.";
      }
    }

    const living = livingProfile(cost);
    const livingInput = $("#sa-cost-living");
    if (livingInput) livingInput.value = living.planning || "";
    const livingHint = $("#sa-cost-living-hint");
    if (livingHint) livingHint.textContent = living.note || "Enter your realistic year-1 living budget.";

    const schoolWrap = $("#sa-cost-school-funding-wrap");
    if (schoolWrap) schoolWrap.hidden = !["school_defined","manual"].includes(cost.fundingMode);

    const country = currentCountryMeta(cost.id);
    const guideLink = $("#sa-cost-guide-link");
    if (guideLink && country) guideLink.href = country.page;

    calculateCost();
  }

  async function populateCostCountrySelect() {
    const select = $("#sa-cost-country");
    if (!select || !state.countries.length) return;
    await ensureCostData();
    const current = select.value;
    const costIds = new Set(state.costs.map(item => item.id));
    select.innerHTML = state.countries
      .filter(country => costIds.has(country.id))
      .map(country => `<option value="${escapeHtml(country.id)}">${escapeHtml(country.name)}</option>`)
      .join("");
    select.value = current && costIds.has(current) ? current : "australia";
    applyCostDefaults();
  }

  function calculateCost({ saveToPlan = false } = {}) {
    const cost = costCountry();
    if (!cost) return;

    const num = id => Math.max(0, Number($(id)?.value || 0));
    const tuitionEl = $("#sa-cost-tuition");
    const livingEl = $("#sa-cost-living");
    const tuition = num("#sa-cost-tuition");
    const scholarship = num("#sa-cost-scholarship");
    const paid = num("#sa-cost-paid");
    const livingBudget = num("#sa-cost-living");
    const insurance = num("#sa-cost-insurance");
    const travel = num("#sa-cost-travel");
    const setup = num("#sa-cost-setup");
    const bdtRate = num("#sa-cost-bdt-rate");
    const schoolFunding = num("#sa-cost-school-funding");

    const netTuition = Math.max(0, tuition - scholarship);
    const outstandingTuition = Math.max(0, netTuition - paid);
    const living = livingProfile(cost);
    const family = familyFunding(cost);

    const visa = Number(cost.visaFee || 0);
    const mandatory = (cost.mandatoryFees || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const fundingExtras = (cost.fundingExtras || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const level = $("#sa-cost-level")?.value || "Masters";
    const tuitionRule = cost.tuition?.[level];
    const tuitionCanBeZero = tuitionRule && Number(tuitionRule.min) === 0 && Number(tuitionRule.max) === 0;
    const tuitionMissing = !tuitionCanBeZero && !String(tuitionEl?.value || "").trim();
    const livingMissing = !String(livingEl?.value || "").trim();

    const firstYear = netTuition + livingBudget + family.amount + visa + mandatory + insurance + travel + setup;

    let fundingTarget = outstandingTuition + living.required + family.amount + fundingExtras;
    if (cost.fundingMode === "school_defined" || cost.fundingMode === "manual") {
      fundingTarget = schoolFunding;
    }

    const country = currentCountryMeta(cost.id);
    $("#sa-cost-summary-title").textContent = country ? `${country.name} · ${$("#sa-cost-level")?.value || "Study"}` : "Your estimate";
    $("#sa-cost-total").textContent = tuitionMissing || livingMissing ? "Complete the inputs" : formatCost(firstYear, cost);
    $("#sa-cost-funding").textContent = fundingTarget > 0 ? formatCost(fundingTarget, cost) : "Enter official target";
    $("#sa-cost-total-bdt").textContent = tuitionMissing || livingMissing ? "" : formatBDT(firstYear, bdtRate);
    $("#sa-cost-funding-bdt").textContent = formatBDT(fundingTarget, bdtRate);

    const lines = [
      ["Tuition after scholarship", netTuition],
      ["Living budget", livingBudget],
      ...(family.amount ? [["Family funding / budget", family.amount]] : []),
      ...(visa ? [["Visa / permit fee", visa]] : []),
      ...(mandatory ? [["Other stored mandatory fees", mandatory]] : []),
      ...(insurance ? [["Insurance / health", insurance]] : []),
      ...(travel ? [["Travel", travel]] : []),
      ...(setup ? [["Setup / other", setup]] : [])
    ];

    $("#sa-cost-breakdown").innerHTML = lines.map(([label, value]) =>
      `<div class="sa-cost-line"><span>${escapeHtml(label)}</span><strong>${formatCost(value, cost)}</strong></div>`
    ).join("") +
    `<div class="sa-cost-line sa-cost-line--total"><span>Tuition still unpaid</span><strong>${formatCost(outstandingTuition, cost)}</strong></div>`;

    const notes = [
      cost.fundingNote,
      family.note,
      tuitionMissing ? "Enter the exact tuition before treating the first-year planning total as complete." : "",
      livingMissing ? "Enter a realistic first-year living budget before treating the planning total as complete." : "",
      !cost.visaFee ? "No fixed visa fee is auto-added for this country. Check the guide and add it under setup / other if applicable." : "",
      cost.lastVerified ? `Country cost data last reviewed: ${cost.lastVerified}.` : ""
    ].filter(Boolean);

    $("#sa-cost-rule-note").innerHTML = notes.map(note => `<div>${escapeHtml(note)}</div>`).join("");

    if (saveToPlan && !tuitionMissing && !livingMissing) {
      state.plan.cost = {
        countryId: cost.id,
        countryName: country?.name || cost.id,
        level,
        firstYearText: formatCost(firstYear, cost),
        fundingText: fundingTarget > 0 ? formatCost(fundingTarget, cost) : "Check official target",
        bdtText: formatBDT(firstYear, bdtRate),
        savedAt: new Date().toISOString()
      };
      persistPlan();
    }
  }

  function setupCostCalculator() {
    const form = $("#sa-cost-form");
    if (!form) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      calculateCost({ saveToPlan: true });
    });

    $("#sa-cost-country")?.addEventListener("change", () => applyCostDefaults({ resetTuition: true }));
    $("#sa-cost-level")?.addEventListener("change", () => applyCostDefaults({ resetTuition: true }));
    $("#sa-cost-location")?.addEventListener("change", () => {
      const cost = costCountry();
      const living = livingProfile(cost);
      if ($("#sa-cost-living")) $("#sa-cost-living").value = living.planning || "";
      calculateCost();
    });

    ["#sa-cost-tuition","#sa-cost-scholarship","#sa-cost-paid","#sa-cost-living","#sa-cost-adults","#sa-cost-children","#sa-cost-insurance","#sa-cost-travel","#sa-cost-setup","#sa-cost-bdt-rate","#sa-cost-school-funding"]
      .forEach(id => $(id)?.addEventListener("input", calculateCost));
    ["#sa-cost-adults","#sa-cost-children"].forEach(id => $(id)?.addEventListener("change", calculateCost));

    ensureCostData().then(() => populateCostCountrySelect());
  }

  async function ensureTimelineData() {
    if (state.timelines.length) return state.timelines;
    try {
      const response = await fetch("data/studyabroad-timelines.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Timeline data unavailable");
      const data = await response.json();
      state.timelines = Array.isArray(data) ? data : [];
    } catch (_) {
      state.timelines = [];
    }
    return state.timelines;
  }

  function timelineRule() {
    const id = $("#sa-timeline-country")?.value;
    return state.timelines.find(item => item.id === id) || null;
  }

  function populateTimelineCountrySelect() {
    const select = $("#sa-timeline-country");
    if (!select || !state.countries.length) return;

    ensureTimelineData().then(() => {
      const ready = new Set(state.timelines.map(item => item.id));
      const current = select.value;
      select.innerHTML = state.countries
        .filter(country => ready.has(country.id))
        .map(country => `<option value="${escapeHtml(country.id)}">${escapeHtml(country.name)}</option>`)
        .join("");

      if (current && ready.has(current)) {
        select.value = current;
      } else if (ready.has("uk")) {
        select.value = "uk";
      }

      populateTimelineIntakes();
    });
  }

  function populateTimelineIntakes() {
    const rule = timelineRule();
    const select = $("#sa-timeline-intake");
    if (!rule || !select) return;

    const current = Number(select.value || 0);
    select.innerHTML = (rule.intakes || [])
      .map(item => `<option value="${item.month}">${escapeHtml(item.label)}</option>`)
      .join("");

    if ((rule.intakes || []).some(item => item.month === current)) {
      select.value = String(current);
    }

    populateTimelineYears();
    updateTimelineSummary(false);
  }

  function populateTimelineYears() {
    const select = $("#sa-timeline-year");
    const month = Number($("#sa-timeline-intake")?.value || 1);
    if (!select) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const firstYear = month > currentMonth ? currentYear : currentYear + 1;
    const old = Number(select.value || 0);

    const years = Array.from({ length: 5 }, (_, index) => firstYear + index);
    select.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join("");
    if (years.includes(old)) select.value = String(old);
  }

  function monthStart(year, month) {
    return new Date(Number(year), Number(month) - 1, 1, 12, 0, 0, 0);
  }

  function shiftMonths(date, delta) {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1, 12, 0, 0, 0);
  }

  function monthDistance(from, to) {
    return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  }

  function formatTimelineMonth(date) {
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
  }

  function timelineStageDate(target, monthsBefore) {
    return shiftMonths(target, -Math.max(0, monthsBefore));
  }

  function englishStageCopy(status) {
    if (status === "ready") {
      return "Confirm that your current English result or exemption is accepted by the exact programme. Do not retest unless the programme requires it.";
    }
    if (status === "preparing") {
      return "Keep IELTS or PTE preparation moving while you confirm programme requirements. Aim to finish early enough to avoid delaying applications.";
    }
    return "Start IELTS or PTE planning now and check whether the destination or programme uses a different language requirement.";
  }

  function buildTimelineStages(rule, target) {
    const level = $("#sa-timeline-level")?.value || "Masters";
    const english = $("#sa-timeline-english")?.value || "not-started";
    const application = Number(rule.applicationMonthsBefore || 8);
    const visa = Number(rule.visaMonthsBefore || 3);
    const start = Number(rule.startMonthsBefore || 10);

    return [
      {
        monthsBefore:start,
        title:"Profile + English plan",
        copy:englishStageCopy(english)
      },
      {
        monthsBefore:Math.max(application + 3, start - 2),
        title:"Shortlist programmes",
        copy:`Compare course fit, academic entry, intake availability, fees and scholarship timing for your ${level} plan.`
      },
      {
        monthsBefore:Math.max(application + 1, start - 4),
        title:"Prepare the application file",
        copy:"Collect academic documents, passport, CV, references, statement or research material where required, and finish outstanding English evidence."
      },
      {
        monthsBefore:application,
        title:"Submit applications",
        copy:"Apply early enough to handle conditions, document queries, scholarship rounds and programme-specific deadlines."
      },
      {
        monthsBefore:Math.max(visa + 2, application - 3),
        title:rule.offerStep || "Offer + conditions",
        copy:"Complete admission conditions and any country-specific confirmation, sponsorship or pre-enrolment step."
      },
      {
        monthsBefore:Math.max(visa + 1, 3),
        title:"Lock the financial plan",
        copy:"Confirm tuition due, scholarship, official funding evidence, sponsor documents and realistic first-year costs before visa submission."
      },
      {
        monthsBefore:visa,
        title:rule.visaStep || "Visa / permit preparation",
        copy:"Use the current official checklist for your exact route. Medical, biometrics, insurance, police evidence or interviews may add time."
      },
      {
        monthsBefore:1,
        title:"Accommodation + departure",
        copy:"Arrange housing, travel, insurance, arrival documents, airport plan and the first weeks of practical setup."
      },
      {
        monthsBefore:0,
        title:"Classes begin",
        copy:"Arrive with enough time for registration, orientation and any residence-card or local setup required after entry.",
        target:true
      }
    ].map((stage, index) => ({
      ...stage,
      index:index + 1,
      date:timelineStageDate(target, stage.monthsBefore)
    }));
  }

  function timelineBadge(stage, now, target) {
    if (stage.target) return { label:"Target intake", className:"sa-timeline-badge" };

    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const stageMonth = new Date(stage.date.getFullYear(), stage.date.getMonth(), 1);

    if (stageMonth < thisMonth && target > now) {
      return { label:"Start now", className:"sa-timeline-badge sa-timeline-badge--late" };
    }

    if (stageMonth.getFullYear() === thisMonth.getFullYear() && stageMonth.getMonth() === thisMonth.getMonth()) {
      return { label:"Now", className:"sa-timeline-badge sa-timeline-badge--now" };
    }

    return { label:"Recommended", className:"sa-timeline-badge" };
  }

  function updateTimelineSummary(showResults = true) {
    const rule = timelineRule();
    if (!rule) return;

    const month = Number($("#sa-timeline-intake")?.value || rule.intakes?.[0]?.month || 1);
    const year = Number($("#sa-timeline-year")?.value || new Date().getFullYear() + 1);
    const target = monthStart(year, month);
    const now = new Date();
    const distance = monthDistance(now, target);
    const country = currentCountryMeta(rule.id);
    const intake = (rule.intakes || []).find(item => item.month === month);

    const targetEl = $("#sa-timeline-target");
    if (targetEl) targetEl.textContent = `${country?.name || rule.id} · ${intake?.label || formatTimelineMonth(target)} · ${year}`;

    const special = $("#sa-timeline-special");
    if (special) special.textContent = rule.specialTiming || "Always verify programme-specific deadlines.";

    const guide = $("#sa-timeline-guide-link");
    if (guide && country) guide.href = country.page;

    let planningStatus = "Comfortable planning window";
    const status = $("#sa-timeline-status");
    if (status) {
      status.classList.remove("is-urgent","is-late");
      let label = planningStatus;
      if (distance < Number(rule.startMonthsBefore || 10) && distance > Number(rule.visaMonthsBefore || 3) + 2) {
        label = "Start now";
        status.classList.add("is-urgent");
      } else if (distance <= Number(rule.visaMonthsBefore || 3) + 2) {
        label = "Compressed timeline. Verify deadlines now.";
        status.classList.add("is-late");
      }
      planningStatus = label;
      status.querySelector("strong").textContent = label;
    }

    if (!showResults) return;

    const stages = buildTimelineStages(rule, target);
    const list = $("#sa-timeline-list");
    const results = $("#sa-timeline-results");
    if (!list || !results) return;

    list.innerHTML = stages.map(stage => {
      const badge = timelineBadge(stage, now, target);
      const stageMonth = new Date(stage.date.getFullYear(), stage.date.getMonth(), 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const stateClass = stage.target ? " is-target" : (stageMonth <= currentMonth && target > now ? " is-now" : "");

      return `
        <article class="sa-timeline-item${stateClass}">
          <span class="sa-timeline-dot">${String(stage.index).padStart(2,"0")}</span>
          <div class="sa-timeline-date">
            <strong>${escapeHtml(formatTimelineMonth(stage.date))}</strong>
            <small>${stage.monthsBefore ? `${stage.monthsBefore} mo before` : "Intake month"}</small>
          </div>
          <div class="sa-timeline-copy">
            <h4>${escapeHtml(stage.title)}</h4>
            <p>${escapeHtml(stage.copy)}</p>
          </div>
          <span class="${badge.className}">${badge.label}</span>
        </article>
      `;
    }).join("");

    const windowEl = $("#sa-timeline-window");
    const recommendedStart = formatTimelineMonth(shiftMonths(target, -Number(rule.startMonthsBefore || 10)));
    if (windowEl) windowEl.textContent = `Recommended start: ${recommendedStart}`;

    state.plan.timeline = {
      countryId: rule.id,
      countryName: country?.name || rule.id,
      intakeLabel: intake?.label || formatTimelineMonth(target),
      year: String(year),
      level: $("#sa-timeline-level")?.value || "Masters",
      english: $("#sa-timeline-english")?.value || "not-started",
      status: planningStatus,
      recommendedStart,
      savedAt: new Date().toISOString()
    };
    persistPlan();

    results.hidden = false;
    results.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function setupTimelinePlanner() {
    const form = $("#sa-timeline-form");
    if (!form) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      updateTimelineSummary(true);
    });

    $("#sa-timeline-country")?.addEventListener("change", populateTimelineIntakes);
    $("#sa-timeline-intake")?.addEventListener("change", () => {
      populateTimelineYears();
      updateTimelineSummary(false);
    });
    $("#sa-timeline-year")?.addEventListener("change", () => updateTimelineSummary(false));
    $("#sa-timeline-level")?.addEventListener("change", () => updateTimelineSummary(false));
    $("#sa-timeline-english")?.addEventListener("change", () => updateTimelineSummary(false));

    ensureTimelineData().then(() => populateTimelineCountrySelect());
  }

  async function ensureRadarData() {
    if (state.radar.length) return state.radar;
    try {
      const response = await fetch("data/studyabroad-radar.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Radar data unavailable");
      const data = await response.json();
      state.radar = Array.isArray(data) ? data : [];
    } catch (_) {
      state.radar = [];
    }
    return state.radar;
  }

  function radarToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }

  function radarDate(item) {
    const parts = String(item.effectiveDate || "").split("-").map(Number);
    return new Date(parts[0] || 2000, (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0, 0);
  }

  function radarStatus(item) {
    return radarDate(item) > radarToday() ? "upcoming" : "in-effect";
  }

  function formatRadarDate(item) {
    return new Intl.DateTimeFormat("en-GB", {
      day:"numeric",
      month:"short",
      year:"numeric"
    }).format(radarDate(item));
  }

  function formatRadarVerified(value) {
    const parts = String(value || "").split("-").map(Number);
    if (!parts[0]) return "";
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0, 0);
    return new Intl.DateTimeFormat("en-GB", {
      day:"numeric",
      month:"long",
      year:"numeric"
    }).format(date);
  }

  function radarFilterMatch(item, filter) {
    if (filter === "All") return true;
    if (filter === "Coming next") return radarStatus(item) === "upcoming";
    if (filter === "Work & post study") return ["Work rights","Post study"].includes(item.category);
    return item.category === filter;
  }

  function sortedRadar(items = state.radar) {
    const today = radarToday();
    return [...items].sort((a, b) => {
      const ad = radarDate(a);
      const bd = radarDate(b);
      const aFuture = ad > today;
      const bFuture = bd > today;

      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      if (aFuture && bFuture) return ad - bd || Number(b.priority || 0) - Number(a.priority || 0);
      return bd - ad || Number(b.priority || 0) - Number(a.priority || 0);
    });
  }

  function radarCountryCode(item) {
    return currentCountryMeta(item.countryId)?.code || String(item.country || "").slice(0,2).toUpperCase();
  }

  function radarFeatureItem() {
    const sorted = sortedRadar();
    return sorted.find(item => radarStatus(item) === "upcoming") || sorted[0] || null;
  }

  function renderRadarFeature() {
    const host = $("#sa-radar-feature");
    if (!host) return;
    const item = radarFeatureItem();

    if (!item) {
      host.innerHTML = '<div class="sa-radar-feature__loading">No verified Radar update is available right now.</div>';
      return;
    }

    const status = radarStatus(item);
    const date = radarDate(item);
    const days = Math.ceil((date - radarToday()) / 86400000);
    const timing = status === "upcoming"
      ? (days === 1 ? "Tomorrow" : `${days} days away`)
      : "In effect";

    host.innerHTML = `
      <div class="sa-radar-feature__inner">
        <div>
          <div class="sa-radar-feature__eyebrow">
            <span class="sa-radar-chip sa-radar-chip--gold">${status === "upcoming" ? "Next confirmed change" : "Latest verified change"}</span>
            <span class="sa-radar-chip">${escapeHtml(item.country)}</span>
            <span class="sa-radar-chip">${escapeHtml(item.category)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="sa-radar-feature__summary">${escapeHtml(item.summary)}</p>
        </div>

        <div class="sa-radar-feature__side">
          <span>${status === "upcoming" ? "Effective" : "In effect from"} · ${escapeHtml(formatRadarDate(item))}</span>
          <p>${escapeHtml(item.impact)}</p>
          <div class="sa-radar-feature__links">
            <a href="${escapeHtml(item.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceLabel)} ↗</a>
            <a href="${escapeHtml(item.guidePage)}">Full country guide →</a>
          </div>
          <div style="margin-top:12px;color:rgba(255,255,255,.52);font-size:.65rem;font-weight:700">${escapeHtml(timing)}</div>
        </div>
      </div>
    `;
  }

  function radarCard(item) {
    const status = radarStatus(item);
    const statusLabel = status === "upcoming" ? "Coming soon" : "In effect";

    return `
      <article class="sa-radar-card">
        <div class="sa-radar-card__meta">
          <div class="sa-radar-card__country">
            <span class="sa-radar-card__code">${escapeHtml(radarCountryCode(item))}</span>
            <strong>${escapeHtml(item.country)}</strong>
          </div>
          <span class="sa-radar-status ${status === "upcoming" ? "sa-radar-status--upcoming" : ""}">${statusLabel}</span>
        </div>

        <span class="sa-radar-card__category">${escapeHtml(item.category)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="sa-radar-card__summary">${escapeHtml(item.summary)}</p>

        <div class="sa-radar-card__impact">
          <span>Why it matters</span>
          <p>${escapeHtml(item.impact)}</p>
        </div>

        <div class="sa-radar-card__foot">
          <div class="sa-radar-card__date">
            <strong>${escapeHtml(formatRadarDate(item))}</strong>
            <small>Verified ${escapeHtml(formatRadarVerified(item.lastVerified))}</small>
          </div>

          <div class="sa-radar-card__links">
            <a href="${escapeHtml(item.officialUrl)}" target="_blank" rel="noopener noreferrer">Official source ↗</a>
            <a href="${escapeHtml(item.guidePage)}">Country guide →</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderRadar() {
    const grid = $("#sa-radar-grid");
    if (!grid) return;

    const feature = radarFeatureItem();
    const filtered = sortedRadar(state.radar)
      .filter(item => radarFilterMatch(item, state.radarFilter))
      .filter(item => item.id !== feature?.id);

    grid.innerHTML = filtered.map(radarCard).join("");

    const count = $("#sa-radar-count");
    if (count) count.textContent = `${filtered.length} update${filtered.length === 1 ? "" : "s"}`;

    const empty = $("#sa-radar-empty");
    if (empty) empty.hidden = filtered.length !== 0;

    const latestVerified = state.radar
      .map(item => item.lastVerified)
      .filter(Boolean)
      .sort()
      .at(-1);
    const verified = $("#sa-radar-verified");
    if (verified && latestVerified) verified.textContent = `Last reviewed ${formatRadarVerified(latestVerified)}`;
  }

  function setupRadar() {
    document.querySelectorAll(".sa-radar-filter").forEach(button => {
      button.addEventListener("click", () => {
        state.radarFilter = button.dataset.radarFilter || "All";
        document.querySelectorAll(".sa-radar-filter").forEach(item => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderRadar();
      });
    });

    ensureRadarData().then(() => {
      renderRadarFeature();
      renderRadar();
    });
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
    setupPersonalPlan();
    setupPriorities();
    setupExplorer();
    setupMatcher();
    setupCompare();
    setupCostCalculator();
    setupTimelinePlanner();
    setupRadar();
    setupUtilities();
    loadCountries();
    observeReveals();
  });
})();