/* ==========================================================
   LIZON EDUCATION
   PTE COURSE INTERACTION
========================================================== */

(function () {

  "use strict";


  /* ========================================================
     COURSE DATA

     Future course changes can mostly be made here without
     changing the HTML or CSS.
  ======================================================== */

  const COURSE_DATA = {

    batch: {

      eyebrow:
        "BATCH PREPARATION",

      heading:
        "Choose Your Batch",

      intro:
        "Start with the summary. Open only the course you want to explore.",

      plans: [

        {
          id:
            "batchCrash",

          label:
            "BATCH CRASH",

          name:
            "Crash",

          metric:
            "1 Month",

          metricLabel:
            "Approx. duration",

          price:
            "৳ 6,000",

          description:
            "Complete PTE preparation with stronger focus on techniques, question types and exam approach.",

          facts: [
            ["Classes", "3 per week"],
            ["Class time", "Around 1 hour"],
            ["Coverage", "All PTE question types"],
            ["Approach", "Technique focused"],
            ["Strategy", "Official Pearson"],
            ["Format", "Batch"]
          ],

          bestFor:
            "Students who have already started PTE preparation but are struggling to improve their score or apply the right techniques.",

          focus: [
            "Techniques for all PTE question types",
            "Exam approach and scoring priorities",
            "Personal improvement direction",
            "Focused work on common score problems"
          ],

          support: [
            "Official Pearson strategy",
            "Class based correction",
            "Instructor guidance",
            "Practice direction between classes"
          ],

          note:
            "The exact teaching sequence can be adjusted when a batch needs extra attention on a particular PTE question type."
        },

        {
          id:
            "batchSupport",

          label:
            "CONTINUED SUPPORT",

          name:
            "Until Desired Score",

          metric:
            "Until Desired Score",

          metricLabel:
            "Support timeline",

          price:
            "৳ 9,000",

          description:
            "In depth PTE preparation for students who need repeated teaching, correction and continued support.",

          supportCard:
            true,

          facts: [
            ["Classes", "3 per week"],
            ["Extra", "Monthly extra class"],
            ["Class time", "Around 1 hour"],
            ["Coverage", "In depth PTE"],
            ["Limits", "No fixed limit"],
            ["Foundation", "Grammar + Basics"]
          ],

          bestFor:
            "Students who need multiple rounds of teaching and correction for PTE question types and do not want support to end with a fixed course deadline.",

          focus: [
            "In depth work across PTE question types",
            "Repeated teaching where required",
            "Grammar and basic support when needed",
            "Preparation adjusted as performance changes"
          ],

          support: [
            "No fixed class limit",
            "No fixed mock limit",
            "No fixed evaluation limit",
            "Monthly personalised teacher meeting",
            "Official Pearson strategy"
          ],

          note:
            "This provides continued PTE preparation support. It is not an automatic score guarantee. Final performance depends on the student's skill, practice and exam performance."
        }

      ]

    },


    one: {

      eyebrow:
        "PERSONALISED 1ON1",

      heading:
        "Choose Your 1on1 Plan",

      intro:
        "Every plan is personalised. Choose the preparation depth and class time that fit your situation.",

      plans: [

        {
          id:
            "one10",

          label:
            "1ON1 CRASH",

          name:
            "10 Classes",

          metric:
            "10 Classes",

          metricLabel:
            "Flexible timeline",

          price:
            "৳ 11,000",

          description:
            "Compact personalised PTE preparation focused on solving your specific score problems.",

          facts: [
            ["Classes", "10"],
            ["Class time", "Around 1 hour"],
            ["Schedule", "Flexible"],
            ["Focus", "Specific problems"],
            ["Strategy", "Official Pearson"],
            ["Format", "1on1"]
          ],

          bestFor:
            "Students who already understand PTE but need focused personal correction, strategy improvement or help with specific question types.",

          focus: [
            "Identify and solve specific problems",
            "Question types selected from your weaknesses",
            "Technique correction",
            "Exam approach and scoring strategy"
          ],

          support: [
            "Personal instructor attention",
            "Flexible scheduling",
            "Official Pearson strategy",
            "Individual correction and guidance"
          ],

          note:
            "Because this is 1on1 preparation, the class sequence is personalised instead of following the same fixed order for every student."
        },

        {
          id:
            "one15",

          label:
            "1ON1 COMPLETE",

          name:
            "15 Classes",

          metric:
            "15 Classes",

          metricLabel:
            "Flexible timeline",

          price:
            "৳ 15,000",

          description:
            "Complete personalised PTE preparation with more time for correction, strategy and score development.",

          facts: [
            ["Classes", "15"],
            ["Class time", "Around 1 hour"],
            ["Schedule", "Flexible"],
            ["Coverage", "Complete PTE"],
            ["Strategy", "Official Pearson"],
            ["Format", "1on1"]
          ],

          bestFor:
            "Students who want complete personalised PTE preparation with more correction and development time than the 10 class plan.",

          focus: [
            "Complete PTE preparation",
            "Individual question type correction",
            "Work on repeated weaknesses",
            "Exam approach and scoring strategy"
          ],

          support: [
            "Personal instructor attention",
            "Flexible scheduling",
            "Official Pearson strategy",
            "Individual evaluation and correction"
          ],

          note:
            "The preparation flow can change according to the student's current score, weaknesses and progress."
        },

        {
          id:
            "one24",

          label:
            "BASIC TO ADVANCED",

          name:
            "24 Classes",

          metric:
            "24 Classes",

          metricLabel:
            "Flexible timeline",

          price:
            "৳ 19,000",

          description:
            "Start from the basics and move through complete personalised PTE preparation.",

          facts: [
            ["Classes", "24"],
            ["Class time", "Around 1 hour"],
            ["Schedule", "Flexible"],
            ["Foundation", "Basic to Advanced"],
            ["Strategy", "Official Pearson"],
            ["Extra", "Batch Access"]
          ],

          bestFor:
            "Students who need foundation work, more preparation time or a complete personalised path from basics to PTE exam readiness.",

          focus: [
            "Grammar and essential basics where required",
            "Complete PTE question type preparation",
            "Official Pearson strategy",
            "Development from foundation to exam readiness"
          ],

          support: [
            "Personal instructor attention",
            "Flexible scheduling",
            "Individual correction and guidance",
            "Access to Until Desired Score Batch"
          ],

          note:
            "The actual timeline may vary because 1on1 scheduling and learning pace are flexible."
        }

      ]

    }

  };


  /* ========================================================
     STATE
  ======================================================== */

  const state = {

    mode:
      "batch",

    openCourse:
      null

  };



  /* ========================================================
     HELPERS
  ======================================================== */

  const $ = (
    selector,
    scope = document
  ) =>
    scope.querySelector(
      selector
    );


  const $$ = (
    selector,
    scope = document
  ) =>
    Array.from(
      scope.querySelectorAll(
        selector
      )
    );


  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );



  /* ========================================================
     ELEMENTS
  ======================================================== */

  const elements = {

    header:
      $("#site-header"),

    heroChoice:
      $("#hero-choice"),

    sticky:
      $("#prep-sticky"),

    courseSection:
      $("#courses"),

    courseEyebrow:
      $("#course-eyebrow"),

    courseTitle:
      $("#course-title"),

    courseIntro:
      $("#course-intro"),

    accordion:
      $("#course-accordion")

  };



  /* ========================================================
     GET CURRENT MODE
  ======================================================== */

  function getModeData() {

    return COURSE_DATA[
      state.mode
    ];

  }



  /* ========================================================
     CREATE ELEMENT
  ======================================================== */

  function createElement(
    tag,
    className,
    text
  ) {

    const element =
      document.createElement(
        tag
      );


    if (
      className
    ) {

      element.className =
        className;

    }


    if (
      typeof text ===
      "string"
    ) {

      element.textContent =
        text;

    }


    return element;

  }



  /* ========================================================
     CREATE COURSE FACT
  ======================================================== */

  function createFact(
    label,
    value
  ) {

    const fact =
      createElement(
        "div",
        "course-fact"
      );


    const factLabel =
      createElement(
        "span",
        "",
        label
      );


    const factValue =
      createElement(
        "strong",
        "",
        value
      );


    fact.append(
      factLabel,
      factValue
    );


    return fact;

  }



  /* ========================================================
     CREATE LIST
  ======================================================== */

  function createDetailList(
    items
  ) {

    const list =
      document.createElement(
        "ul"
      );


    items.forEach(
      item => {

        const listItem =
          document.createElement(
            "li"
          );


        listItem.textContent =
          item;


        list.appendChild(
          listItem
        );

      }
    );


    return list;

  }



  /* ========================================================
     CREATE COURSE CARD
  ======================================================== */

  function createCourseCard(
    course
  ) {

    const isOpen =
      state.openCourse ===
      course.id;


    const card =
      createElement(
        "article",
        "course-card"
      );


    card.dataset.courseId =
      course.id;


    if (
      course.supportCard
    ) {

      card.classList.add(
        "is-support"
      );

    }


    if (
      isOpen
    ) {

      card.classList.add(
        "is-open"
      );

    }



    /* ======================================================
       CARD TOP
    ======================================================= */

    const top =
      createElement(
        "div",
        "course-card__top"
      );


    const main =
      createElement(
        "div",
        "course-card__main"
      );


    const label =
      createElement(
        "span",
        "course-card__label",
        course.label
      );


    const name =
      createElement(
        "h3",
        "course-card__name",
        course.name
      );


    const description =
      createElement(
        "p",
        "course-card__description",
        course.description
      );


    main.append(
      label,
      name,
      description
    );



    const metric =
      createElement(
        "div",
        "course-card__metric"
      );


    const metricValue =
      createElement(
        "strong",
        "",
        course.metric
      );


    const metricLabel =
      createElement(
        "span",
        "",
        course.metricLabel
      );


    metric.append(
      metricValue,
      metricLabel
    );


    top.append(
      main,
      metric
    );


    card.appendChild(
      top
    );



    /* ======================================================
       ACTIONS
    ======================================================= */

    const actions =
      createElement(
        "div",
        "course-card__actions"
      );



    const detailsButton =
      createElement(
        "button",
        "course-detail-button"
      );


    detailsButton.type =
      "button";


    detailsButton.setAttribute(
      "aria-expanded",
      String(
        isOpen
      )
    );


    const detailsText =
      createElement(
        "span",
        "",
        isOpen
          ? "Hide Details"
          : "View Details"
      );


    const detailsIcon =
      createElement(
        "span",
        "course-detail-button__icon",
        "↓"
      );


    detailsIcon.setAttribute(
      "aria-hidden",
      "true"
    );


    detailsButton.append(
      detailsText,
      detailsIcon
    );



    const admitButton =
      createElement(
        "a",
        "course-admit-button",
        "Admit Now"
      );


    admitButton.href =
      "pay.html";

const priceWrap =
  createElement(
    "div",
    "course-price-wrap"
  );

const price =
  createElement(
    "span",
    "course-price",
    course.price
  );

const divider =
  createElement(
    "span",
    "course-price-divider",
    "│"
  );

divider.setAttribute(
  "aria-hidden",
  "true"
);

priceWrap.append(
  price,
  divider,
  admitButton
);
    actions.append(
  detailsButton,
  priceWrap
);


    card.appendChild(
      actions
    );



    /* ======================================================
       EXPANDED DETAILS
    ======================================================= */

    const details =
      createElement(
        "div",
        "course-card__details"
      );


    const detailsInner =
      createElement(
        "div",
        "course-card__details-inner"
      );



    /* FACTS */

    const facts =
      createElement(
        "div",
        "course-facts"
      );


    course.facts.forEach(
      (
        [
          factLabel,
          factValue
        ]
      ) => {

        facts.appendChild(
          createFact(
            factLabel,
            factValue
          )
        );

      }
    );


    detailsInner.appendChild(
      facts
    );



    /* BEST FOR */

    const bestFor =
      createElement(
        "div",
        "course-best-for"
      );


    const bestForLabel =
      createElement(
        "strong",
        "",
        "Best For"
      );


    const bestForText =
      createElement(
        "p",
        "",
        course.bestFor
      );


    bestFor.append(
      bestForLabel,
      bestForText
    );


    detailsInner.appendChild(
      bestFor
    );



    /* FOCUS + SUPPORT */

    const columns =
      createElement(
        "div",
        "course-detail-columns"
      );


    const focusColumn =
      createElement(
        "div",
        "course-detail-column"
      );


    const focusHeading =
      createElement(
        "h4",
        "",
        "Preparation Focus"
      );


    focusColumn.append(
      focusHeading,
      createDetailList(
        course.focus
      )
    );



    const supportColumn =
      createElement(
        "div",
        "course-detail-column"
      );


    const supportHeading =
      createElement(
        "h4",
        "",
        "Support Included"
      );


    supportColumn.append(
      supportHeading,
      createDetailList(
        course.support
      )
    );


    columns.append(
      focusColumn,
      supportColumn
    );


    detailsInner.appendChild(
      columns
    );



    /* NOTE */

    const note =
      createElement(
        "p",
        "course-detail-note",
        course.note
      );


    detailsInner.appendChild(
      note
    );



    /* ADMIT AGAIN AT BOTTOM */

    const detailFooter =
  createElement(
    "div",
    "course-detail-footer"
  );


const bottomHideButton =
  createElement(
    "button",
    "course-bottom-hide",
    "Hide Details ↑"
  );


bottomHideButton.type =
  "button";


bottomHideButton.addEventListener(
  "click",
  () => {

    toggleCourse(
      course.id
    );

    requestAnimationFrame(
      () => {

        const heading =
          elements.courseTitle;

        if (
          !heading
        ) {
          return;
        }

        const headerHeight =
          getHeaderHeight();

        const stickyHeight =
          elements.sticky
            ? elements.sticky.offsetHeight
            : 0;

        const destination =
          heading
            .getBoundingClientRect()
            .top +
          window.scrollY -
          headerHeight -
          stickyHeight -
          24;

        window.scrollTo({

          top:
            Math.max(
              0,
              destination
            ),

          behavior:
            prefersReducedMotion.matches
              ? "auto"
              : "smooth"

        });

      }
    );

  }
);


const detailAdmit =
  createElement(
    "a",
    "course-admit-button",
    "Admit Now"
  );


detailAdmit.href =
  "pay.html";


detailFooter.append(
  bottomHideButton,
  detailAdmit
);


detailsInner.appendChild(
  detailFooter
);


    details.appendChild(
      detailsInner
    );


    card.appendChild(
      details
    );



    /* ======================================================
       TOGGLE EVENT
    ======================================================= */

    detailsButton.addEventListener(
      "click",
      () => {

        toggleCourse(
          course.id
        );

      }
    );


    return card;

  }



  /* ========================================================
     RENDER COURSE SECTION
  ======================================================== */

  function renderCourses() {

    const data =
      getModeData();


    elements.courseEyebrow.textContent =
      data.eyebrow;


    elements.courseTitle.textContent =
      data.heading;


    elements.courseIntro.textContent =
      data.intro;


    elements.accordion.innerHTML =
      "";


    elements.accordion.dataset.mode =
      state.mode;


    elements.accordion.classList.toggle(
      "has-open",
      Boolean(
        state.openCourse
      )
    );


    data.plans.forEach(
      course => {

        elements.accordion.appendChild(
          createCourseCard(
            course
          )
        );

      }
    );

  }



  /* ========================================================
     TOGGLE ONE COURSE

     Only one course can be open at a time.
  ======================================================== */

  function toggleCourse(
    courseId
  ) {

    const wasOpen =
      state.openCourse ===
      courseId;


    state.openCourse =
      wasOpen
        ? null
        : courseId;


    renderCourses();


    /*
      When opening a card on mobile or a smaller laptop,
      keep that selected card comfortably visible.

      We only move the page if the card is outside the
      comfortable visible area.
    */

    if (
      !wasOpen
    ) {

      requestAnimationFrame(
        () => {

          const card =
            $(
              `[data-course-id="${courseId}"]`
            );


          if (
            !card
          ) {
            return;
          }


          const rect =
            card.getBoundingClientRect();


          const headerHeight =
            getHeaderHeight();


          const stickyHeight =
            elements.sticky
              ? elements.sticky.offsetHeight
              : 0;


          const safeTop =
            headerHeight +
            stickyHeight +
            18;


          /*
            Only scroll if the beginning of the selected card
            is hidden above the sticky navigation.

            Clicking a visible card will therefore NOT cause
            an unnecessary jump.
          */

          if (
            rect.top <
            safeTop
          ) {

            const destination =
              window.scrollY +
              rect.top -
              safeTop;


            window.scrollTo({

              top:
                destination,

              behavior:
                prefersReducedMotion.matches
                  ? "auto"
                  : "smooth"

            });

          }

        }
      );

    }

  }



  /* ========================================================
     MODE SELECTOR
  ======================================================== */

  function syncModeButtons() {

    $$(
      "[data-mode]"
    ).forEach(
      button => {

        const active =
          button.dataset.mode ===
          state.mode;


        button.classList.toggle(
          "is-active",
          active
        );


        button.setAttribute(
          "aria-selected",
          String(
            active
          )
        );

      }
    );

  }



  function setMode(
    mode,
    source
  ) {

    if (
      !COURSE_DATA[
        mode
      ]
    ) {
      return;
    }


    state.mode =
      mode;


    /*
      Switching Batch / 1on1 closes any expanded course.

      This prevents old Batch details appearing while
      viewing 1on1 and vice versa.
    */

    state.openCourse =
      null;


    syncModeButtons();

    renderCourses();



    /*
      If selected from the hero, take the student directly
      to the relevant course options.

      If selected from the sticky navigation, they are
      already inside the course area and remain there.
    */

    if (
      source ===
      "hero"
    ) {

      scrollToCourseSection();

    }

  }



  /* ========================================================
     SCROLL TO COURSE SECTION
  ======================================================== */

  function scrollToCourseSection() {

    if (
      !elements.courseSection
    ) {
      return;
    }


    const headerHeight =
      getHeaderHeight();


    const stickyHeight =
      64;


    const destination =
      elements.courseSection
        .getBoundingClientRect()
        .top +
      window.scrollY -
      headerHeight -
      stickyHeight -
      12;


    window.scrollTo({

      top:
        Math.max(
          0,
          destination
        ),

      behavior:
        prefersReducedMotion.matches
          ? "auto"
          : "smooth"

    });

  }



  /* ========================================================
     HEADER HEIGHT

     This fixes the previous problem where the sticky
     preparation selector covered the course heading.
  ======================================================== */

  function getHeaderHeight() {

    if (
      !elements.header
    ) {
      return 0;
    }


    return elements.header.offsetHeight;

  }



  function updateHeaderHeightVariable() {

    const headerHeight =
      getHeaderHeight();


    document.documentElement.style.setProperty(
      "--pte-header-height",
      `${headerHeight}px`
    );

  }



  /* ========================================================
     SMART STICKY CONTROL

     Hero selector visible:
     sticky selector hidden.

     Hero selector has left the screen AND user is inside
     course section:
     sticky selector visible.

     User leaves course section:
     sticky selector hidden again.
  ======================================================== */

  let stickyTicking =
    false;


  function updateStickySelector() {

    stickyTicking =
      false;


    if (
      !elements.heroChoice ||
      !elements.courseSection ||
      !elements.sticky
    ) {
      return;
    }


    const headerHeight =
      getHeaderHeight();


    const heroRect =
      elements.heroChoice
        .getBoundingClientRect();


    const courseRect =
      elements.courseSection
        .getBoundingClientRect();


    const stickyHeight =
      elements.sticky.offsetHeight ||
      64;


    const heroHasGone =
      heroRect.bottom <=
      headerHeight + 8;


    const courseHasStarted =
      courseRect.top <=
      headerHeight +
      stickyHeight +
      100;


    const courseStillActive =
      courseRect.bottom >
      headerHeight +
      stickyHeight +
      50;


    const shouldShow =
      heroHasGone &&
      courseHasStarted &&
      courseStillActive;


    elements.sticky.classList.toggle(
      "is-visible",
      shouldShow
    );


    elements.sticky.setAttribute(
      "aria-hidden",
      String(
        !shouldShow
      )
    );

  }



  function requestStickyUpdate() {

    if (
      stickyTicking
    ) {
      return;
    }


    stickyTicking =
      true;


    requestAnimationFrame(
      updateStickySelector
    );

  }



  /* ========================================================
     MODE CLICK EVENTS
  ======================================================== */

  function initModeButtons() {

    $$(
      "[data-mode]"
    ).forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            setMode(
              button.dataset.mode,
              button.dataset.modeSource
            );

          }
        );

      }
    );

  }



  /* ========================================================
     RESIZE
  ======================================================== */

  let resizeTimer;


  function initResize() {

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(
          resizeTimer
        );


        resizeTimer =
          setTimeout(
            () => {

              updateHeaderHeightVariable();

              updateStickySelector();

            },
            120
          );

      }
    );

  }



  /* ========================================================
     SCROLL
  ======================================================== */

  function initScroll() {

    window.addEventListener(
      "scroll",
      requestStickyUpdate,
      {
        passive:
          true
      }
    );

  }



  /* ========================================================
     PTE SCORE STORIES

     Images are loaded automatically from:
     assets/results/pte

     Add a new image to that folder and it will appear here
     without editing this page again.
  ======================================================== */

  const PTE_RESULTS_API =
    "https://api.github.com/repos/shuvojoy00-oss/mylizon-website/contents/assets/results/pte?ref=main";


  const PTE_RESULT_FALLBACK = [

    "assets/results/pte/699624236_1599255452210619_7323961056323092504_n.jpg",

    "assets/results/pte/699624915_1599255458877285_7592624828092472839_n.jpg",

    "assets/results/pte/699997075_1599255465543951_794520435271332787_n.jpg",

    "assets/results/pte/700763342_1599255455543952_8853059976625922461_n.jpg",

    "assets/results/pte/700800341_1601705711965593_4051639840730700763_n.jpg",

    "assets/results/pte/701559009_1599255472210617_1659196166486214050_n.jpg",

    "assets/results/pte/701582601_1599255468877284_152775484624212849_n.jpg",

    "assets/results/pte/702209085_1601705658632265_1432942157915160583_n.jpg",

    "assets/results/pte/702569886_1599255475543950_6631217968710696460_n.jpg",

    "assets/results/pte/702570242_1599255462210618_4626382016570292017_n.jpg",

    "assets/results/pte/703577830_1601705608632270_113755144754354356_n.jpg"

  ];


  const pteResultState = {

    all:
      [],

    visible:
      6

  };


  function isPteResultImage(
    file
  ) {

    return (
      file &&
      file.type === "file" &&
      /\.(png|jpe?g|webp|avif)$/i.test(
        file.name || ""
      )
    );

  }


  function renderPteResults() {

    const grid =
      $("#pte-results-grid");

    const moreButton =
      $("#show-more-pte-results");

    const closeButton =
      $("#close-pte-results");


    if (
      !grid
    ) {
      return;
    }


    const visibleResults =
      pteResultState.all.slice(
        0,
        pteResultState.visible
      );


    grid.innerHTML =
      visibleResults
        .map(
          (
            src,
            index
          ) => {

            return `
              <article class="result-card reveal is-visible">

                <span class="result-card__label">
                  PTE · STUDENT RESULT
                </span>

                <button
                  type="button"
                  data-pte-result-src="${src}"
                  aria-label="View PTE student result ${index + 1}"
                >

                  <img
                    src="${src}"
                    alt="PTE student result shared with LizOn Education"
                    loading="${index < 3 ? "eager" : "lazy"}"
                    decoding="async"
                  >

                </button>

              </article>
            `;

          }
        )
        .join("");


    if (
      moreButton
    ) {

      moreButton.hidden =
        pteResultState.visible >=
        pteResultState.all.length;

    }


    if (
      closeButton
    ) {

      closeButton.hidden =
        pteResultState.visible <=
        6;

    }


    bindPteResultButtons();

  }


  async function loadPteResults() {

    try {

      const response =
        await fetch(
          PTE_RESULTS_API,
          {
            headers: {
              "Accept":
                "application/vnd.github+json"
            }
          }
        );


      if (
        !response.ok
      ) {
        throw new Error(
          "Could not load PTE results"
        );
      }


      const files =
        await response.json();


      const results =
        files
          .filter(
            isPteResultImage
          )
          .sort(
            (
              a,
              b
            ) =>
              b.name.localeCompare(
                a.name,
                undefined,
                {
                  numeric:
                    true
                }
              )
          )
          .map(
            file =>
              file.download_url
          )
          .filter(
            Boolean
          );


      pteResultState.all =
        results.length
          ? results
          : PTE_RESULT_FALLBACK;

    } catch (
      error
    ) {

      console.warn(
        "Using local PTE result fallback.",
        error
      );


      pteResultState.all =
        PTE_RESULT_FALLBACK;

    }


    renderPteResults();

  }


  function bindPteResultButtons() {

    $$(
      "[data-pte-result-src]"
    ).forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openPteResult(
              button.dataset.pteResultSrc
            );

          }
        );

      }
    );

  }


  function openPteResult(
    src
  ) {

    const dialog =
      $("#pte-result-dialog");

    const image =
      $("#pte-result-dialog-image");


    if (
      !dialog ||
      !image ||
      !src
    ) {
      return;
    }


    image.src =
      src;

    image.alt =
      "PTE student result shared with LizOn Education";


    if (
      typeof dialog.showModal ===
      "function"
    ) {

      dialog.showModal();

    }

  }


  function initPteResults() {

    const dialog =
      $("#pte-result-dialog");


    if (
      dialog
    ) {

      const closeButton =
        $(
          "[data-pte-dialog-close]",
          dialog
        );


      closeButton?.addEventListener(
        "click",
        () => {

          dialog.close();

        }
      );


      dialog.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            dialog
          ) {

            dialog.close();

          }

        }
      );


      dialog.addEventListener(
        "close",
        () => {

          const image =
            $("#pte-result-dialog-image");


          if (
            image
          ) {

            image.src =
              "";

          }

        }
      );

    }


    const moreButton =
      $("#show-more-pte-results");


    moreButton?.addEventListener(
      "click",
      () => {

        pteResultState.visible +=
          6;

        renderPteResults();

      }
    );


    const closeResultsButton =
      $("#close-pte-results");


    closeResultsButton?.addEventListener(
      "click",
      () => {

        pteResultState.visible =
          6;

        renderPteResults();


        const section =
          $("#results");


        section?.scrollIntoView({
          behavior:
            prefersReducedMotion.matches
              ? "auto"
              : "smooth",

          block:
            "start"
        });

      }
    );


    loadPteResults();

  }



  /* ========================================================
     INITIALIZE
  ======================================================== */

  function init() {

    updateHeaderHeightVariable();

    initModeButtons();

    initResize();

    initScroll();

    syncModeButtons();

    renderCourses();

    updateStickySelector();

    initPteResults();

  }



  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
