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
    region: "All",
    level: "All",
    query: "",
    preferences: new Set()
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function escapeHtml(value = "") {
    return value.replace(/[&<>"']/g, char => ({
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
    setupUtilities();
    loadCountries();
    observeReveals();
  });
})();