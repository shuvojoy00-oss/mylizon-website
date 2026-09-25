/* ==========================================================
   LIZON EDUCATION — HOMEPAGE INTERACTIONS
========================================================== */

const SELECTORS = {
  header: "#site-header",
  menuToggle: "#menu-toggle",
  mobileMenu: "#mobile-menu",
  mobileMenuClose: "#mobile-menu-close",
  backToTop: "#back-to-top",
  resultsGrid: "#results-grid",
  showMoreResults: "#show-more-results",
   closeResults: "#close-results",
  resultDialog: "#result-dialog",
  resultDialogImage: "#result-dialog-image",
  videoDialog: "#video-dialog",
  videoFrame: "#video-frame"
};

const RESULT_IMAGES = {
    ielts: [
        {
            type: "IELTS",
            name: "694129910_1596042069198624_8716469945302976711_n.jpg",
            src: "assets/results/ielts/694129910_1596042069198624_8716469945302976711_n.jpg"
        },
        {
            type: "IELTS",
            name: "695753279_1596042122531952_2162575424079969370_n.jpg",
            src: "assets/results/ielts/695753279_1596042122531952_2162575424079969370_n.jpg"
        },
        {
            type: "IELTS",
            name: "696227682_1596042149198616_6806450380861803922_n.jpg",
            src: "assets/results/ielts/696227682_1596042149198616_6806450380861803922_n.jpg"
        }
    ],

    pte: [
        {
            type: "PTE",
            name: "699624236_1599255452210619_7323961056323092504_n.jpg",
            src: "assets/results/pte/699624236_1599255452210619_7323961056323092504_n.jpg"
        },
        {
            type: "PTE",
            name: "699624915_1599255458877285_7592624828092472839_n.jpg",
            src: "assets/results/pte/699624915_1599255458877285_7592624828092472839_n.jpg"
        },
        {
            type: "PTE",
            name: "701582601_1599255468877284_152775484624212849_n.jpg",
            src: "assets/results/pte/701582601_1599255468877284_152775484624212849_n.jpg"
        }
    ]
};

const state = {
  allResults: [],
  visibleResults: 6
};

/* ==========================================================
   UTILITIES
========================================================== */

function $(selector, scope = document) {
  return scope.querySelector(selector);
}

function $$(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

function isImageFile(file) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name || "");
}

function safeText(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================
   STICKY HEADER
========================================================== */

function initHeader() {
  const header = $(SELECTORS.header);

  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });
}

/* ==========================================================
   DESKTOP DROPDOWNS
========================================================== */

function initDropdowns() {
  const dropdowns = $$(".nav-dropdown");

  if (!dropdowns.length) return;

  const closeAll = (except = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === except) return;

      dropdown.classList.remove("is-open");

      const trigger = $(".nav-dropdown__trigger", dropdown);

      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  };

  dropdowns.forEach((dropdown) => {
    const trigger = $(".nav-dropdown__trigger", dropdown);

    if (!trigger) return;

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();

      const opening = !dropdown.classList.contains("is-open");

      closeAll(dropdown);

      dropdown.classList.toggle("is-open", opening);
      trigger.setAttribute("aria-expanded", String(opening));
    });
  });

  document.addEventListener("click", () => {
    closeAll();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
}

/* ==========================================================
   MOBILE MENU
========================================================== */

function initMobileMenu() {
  const toggle = $(SELECTORS.menuToggle);
  const menu = $(SELECTORS.mobileMenu);
  const closeButton = $(SELECTORS.mobileMenuClose);

  if (!toggle || !menu || !closeButton) return;

  let previousFocus = null;

  const openMenu = () => {
    previousFocus = document.activeElement;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");

    document.body.classList.add("menu-open");

    closeButton.focus();
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");

    document.body.classList.remove("menu-open");

    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  };

  toggle.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);

  $$("a", menu).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

/* ==========================================================
   REVEAL ANIMATIONS
========================================================== */

function initRevealAnimations() {
  const elements = $$(".reveal");

  if (!elements.length) return;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  ) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -45px 0px"
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

/* ==========================================================
   GITHUB RESULT GALLERY
========================================================== */

async function fetchGithubFolder(path, type) {
  const endpoint =
    `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}` +
    `/contents/${path}?ref=${GITHUB.branch}`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to load ${type} results.`);
  }

  const files = await response.json();

  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .filter((file) => file.type === "file" && isImageFile(file))
    .map((file) => ({
      type,
      name: file.name,
      src: file.download_url,
      htmlUrl: file.html_url
    }));
}

function interleaveResults(ielts, pte) {
  const combined = [];
  const maxLength = Math.max(ielts.length, pte.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (ielts[index]) combined.push(ielts[index]);
    if (pte[index]) combined.push(pte[index]);
  }

  return combined;
}

async function loadResults() {
    const grid = $(SELECTORS.resultsGrid);

    if (!grid) return;

    try {
        const response = await fetch("data/results.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to load student results.");
        }

        const data = await response.json();

        const ieltsResults = (data.ielts || []).map((src) => ({
            type: "IELTS",
            name: src.split("/").pop(),
            src
        }));

        const pteResults = (data.pte || []).map((src) => ({
            type: "PTE",
            name: src.split("/").pop(),
            src
        }));

        state.allResults = interleaveResults(
            ieltsResults,
            pteResults
        );

        state.visibleResults = 6;

        if (!state.allResults.length) {
            renderResultsFallback();
            return;
        }

        renderResults();
        hydrateHeroProof(ieltsResults, pteResults);
    } catch (error) {
        console.warn(error);
        renderResultsFallback();
    }
}

function renderResults() {
    const grid = $(SELECTORS.resultsGrid);
    const moreButton = $(SELECTORS.showMoreResults);
    const closeButton = $(SELECTORS.closeResults);

    if (!grid) return;

  const visible = state.allResults.slice(
    0,
    state.visibleResults
  );

  grid.innerHTML = visible
    .map((result, index) => {
      const label = safeText(result.type);
      const src = safeText(result.src);

      return `
        <article class="result-card">
          <span class="result-card__label">${label}</span>

          <button
            type="button"
            data-result-src="${src}"
            data-result-type="${label}"
            aria-label="View ${label} student result ${index + 1}"
          >
            <img
              src="${src}"
              alt="${label} student result shared with LizOn Education"
              loading="${index < 2 ? "eager" : "lazy"}"
              decoding="async"
            >
          </button>
        </article>
      `;
    })
    .join("");

  if (moreButton) {
    const hasMore =
        state.visibleResults < state.allResults.length;

    moreButton.hidden = !hasMore;

    if (hasMore) {
        moreButton.innerHTML =
            'View More Results <span aria-hidden="true">↓</span>';
    }
}

if (closeButton) {
    closeButton.hidden = state.visibleResults <= 6;
}

  bindResultButtons();
}

function renderResultsFallback() {
  const grid = $(SELECTORS.resultsGrid);
  const moreButton = $(SELECTORS.showMoreResults);

  if (!grid) return;

  grid.innerHTML = `
    <div class="results-loading">
      Real IELTS and PTE results are available in our student result library.
    </div>
  `;

  if (moreButton) {
    moreButton.hidden = true;
  }
}

function hydrateHeroProof(ieltsResults, pteResults) {
  const ieltsTarget = $(".result-preview--ielts");
  const pteTarget = $(".result-preview--pte");

  if (ieltsTarget && ieltsResults[0]) {
    ieltsTarget.outerHTML = `
      <img
        src="${safeText(ieltsResults[0].src)}"
        alt="Real IELTS student result shared with LizOn Education"
        decoding="async"
      >
    `;
  }

  if (pteTarget && pteResults[0]) {
    pteTarget.outerHTML = `
      <img
        src="${safeText(pteResults[0].src)}"
        alt="Real PTE student result shared with LizOn Education"
        decoding="async"
      >
    `;
  }
}

function bindResultButtons() {
  $$("[data-result-src]").forEach((button) => {
    button.addEventListener("click", () => {
      openResultDialog(
        button.dataset.resultSrc,
        button.dataset.resultType
      );
    });
  });
}

function initShowMoreResults() {
  const button = $(SELECTORS.showMoreResults);

  if (!button) return;

  button.addEventListener("click", () => {
    state.visibleResults += 6;
    renderResults();
  });
}
function initCloseResults() {
    const button = $(SELECTORS.closeResults);
    const resultsSection = $("#results");

    if (!button) return;

    button.addEventListener("click", () => {
        state.visibleResults = 6;
        renderResults();

        if (resultsSection) {
            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

/* ==========================================================
   RESULT DIALOG
========================================================== */

function openResultDialog(src, type) {
  const dialog = $(SELECTORS.resultDialog);
  const image = $(SELECTORS.resultDialogImage);

  if (!dialog || !image || !src) return;

  image.src = src;
  image.alt =
    `${type || "Student"} result shared with LizOn Education`;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function initResultDialog() {
  const dialog = $(SELECTORS.resultDialog);

  if (!dialog) return;

  const closeButton = $("[data-dialog-close]", dialog);

  closeButton?.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    const image = $(SELECTORS.resultDialogImage);

    if (image) {
      image.src = "";
    }
  });
}

/* ==========================================================
   VIDEO DIALOG
========================================================== */

function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1].split("/")[0];
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function openVideo(url) {
  const dialog = $(SELECTORS.videoDialog);
  const frame = $(SELECTORS.videoFrame);

  if (!dialog || !frame) return;

  const videoId = getYouTubeId(url);

  if (!videoId) return;

  frame.src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&rel=0`;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function closeVideo() {
  const dialog = $(SELECTORS.videoDialog);
  const frame = $(SELECTORS.videoFrame);

  if (!dialog || !frame) return;

  frame.src = "";

  if (dialog.open) {
    dialog.close();
  }
}

function initVideos() {
  $$("[data-video]").forEach((button) => {
    button.addEventListener("click", () => {
      openVideo(button.dataset.video);
    });
  });

  const dialog = $(SELECTORS.videoDialog);

  if (!dialog) return;

  const closeButton = $("[data-video-close]", dialog);

  closeButton?.addEventListener("click", closeVideo);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeVideo();
    }
  });

  dialog.addEventListener("close", () => {
    const frame = $(SELECTORS.videoFrame);

    if (frame) {
      frame.src = "";
    }
  });
}

/* ==========================================================
   FOOTER RESPONSIVE DETAILS
========================================================== */

function updateFooterDetails() {
  const groups = $$(".footer-group");
  const mobile = window.matchMedia("(max-width: 700px)").matches;

  groups.forEach((group) => {
    if (mobile) {
      group.removeAttribute("open");
    } else {
      group.setAttribute("open", "");
    }
  });
}

function initFooterDetails() {
  updateFooterDetails();

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      updateFooterDetails();
    }, 160);
  });
}

/* ==========================================================
   BACK TO TOP
========================================================== */

function initBackToTop() {
  const button = $(SELECTORS.backToTop);

  if (!button) return;

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior:
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
    });
  });
}

/* ==========================================================
   SMOOTH INTERNAL NAVIGATION
========================================================== */

function initInternalLinks() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      const headerHeight =
        $(SELECTORS.header)?.offsetHeight || 0;

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top,
        behavior:
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth"
      });
    });
  });
}

/* ==========================================================
   INITIALIZE
========================================================== */

function init() {
  initHeader();
  initDropdowns();
  initMobileMenu();
  initRevealAnimations();

  initShowMoreResults();
   initCloseResults();
  initResultDialog();
  initVideos();

  initFooterDetails();
  initBackToTop();
  initInternalLinks();

  loadResults();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
