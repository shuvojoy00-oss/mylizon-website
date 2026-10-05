/* ==========================================================
   LIZON EDUCATION
   IELTS COURSE INTERACTION
========================================================== */

(function () {

  "use strict";


  /* ========================================================
     COURSE DATA

     Future course changes can mostly be made here without
     changing the HTML or CSS.
  ======================================================== */

  const COURSE_DATA = {


    /* ======================================================
       BATCH
    ======================================================= */

    batch: {

      eyebrow:
        "BATCH PREPARATION",

      heading:
        "Choose Your Batch",

      intro:
        "Start with the summary. Open only the course you want to explore.",

      plans: [


        /* CRASH */

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
  "Complete IELTS preparation with stronger focus on techniques and exam approach.",

          facts: [

            [
              "Classes",
              "3 per week"
            ],

            [
              "Class time",
              "Around 1 hour"
            ],

            [
              "Coverage",
              "Complete IELTS"
            ],

            [
              "Approach",
              "Technique focused"
            ],

            [
              "Mocks",
              "2 Full Mocks"
            ],

            [
              "Format",
              "Batch"
            ]

          ],

          bestFor:
            "Students who have already started IELTS preparation but are struggling with techniques, question types or score improvement.",

          focus: [

            "Listening, Reading, Writing and Speaking",

            "Techniques for IELTS question types",

            "Exam approach and time management",

            "Focused practice for common scoring problems"

          ],

          support: [

            "Two Full Mock Tests",

            "Class based correction",

            "Instructor guidance",

            "Practice direction between classes"

          ],

          note:
            "Course structure may be adjusted when a batch needs additional attention on a particular IELTS skill."

        },


        /* FULL */

        {
          id:
            "batchFull",

          label:
            "BATCH FULL",

          name:
            "Full",

          metric:
            "2 Months",

          metricLabel:
  "Approx. duration",

price:
  "৳ 8,000",

description:
  "Build the foundation first, then move through complete IELTS preparation.",

          facts: [

            [
              "Classes",
              "3 per week"
            ],

            [
              "Class time",
              "Around 1 hour"
            ],

            [
              "Foundation",
              "Grammar + Basics"
            ],

            [
              "Coverage",
              "Complete IELTS"
            ],

            [
              "Mocks",
              "5 Full Mocks"
            ],

            [
              "Evaluation",
              "Weekly"
            ]

          ],

          bestFor:
            "Students who need more preparation time, grammar support or a stronger foundation before completing full IELTS preparation.",

          focus: [

            "Grammar and essential language foundation",

            "Listening, Reading, Writing and Speaking",

            "IELTS question type techniques",

            "Exam strategy and progressive practice"

          ],

          support: [

            "Five Full Mock Tests",

            "Weekly Speaking Evaluation",

            "Weekly Writing Evaluation",

            "Ongoing correction and guided practice"

          ],

          note:
            "The exact sequence can be adjusted according to the overall progress of the batch."

        },


        /* UNTIL DESIRED SCORE */

        {
          id:
            "batchSupport",

          label:
            "CONTINUED SUPPORT",

          name:
            "Until Desired Score",

          metric:
            "No Fixed Limit",

         metricLabel:
  "Support timeline",

price:
  "৳ 11,000",

description:
  "For students who do not want their IELTS preparation support to end with a fixed course deadline.",

          supportCard:
            true,

          facts: [

            [
              "Time limit",
              "No fixed limit"
            ],

            [
              "Class limit",
              "No fixed limit"
            ],

            [
              "Mocks",
              "Continued"
            ],

            [
              "Evaluation",
              "Continued"
            ],

            [
              "Focus",
              "Target Score"
            ],

            [
              "Support",
              "Ongoing"
            ]

          ],

          bestFor:
            "Students who are worried about what happens after a normal course ends, including students who previously sat the IELTS test but did not achieve their target score.",

          focus: [

            "Continued work on weak areas",

            "Repeated correction where required",

            "Exam readiness instead of a fixed ending date",

            "Preparation adjusted as performance changes"

          ],

          support: [

            "Continued preparation support",

            "Continued mock opportunities",

            "Continued evaluation",

            "Guidance while working toward the target score"

          ],

          note:
            "This provides continued IELTS preparation support. It is not an automatic score guarantee. Final IELTS performance depends on the student's skill, practice and exam performance."

        }

      ]

    },



    /* ======================================================
       1ON1
    ======================================================= */

    one: {

      eyebrow:
        "PERSONALISED 1ON1",

      heading:
        "Choose Your 1on1 Plan",

      intro:
        "Every plan is personalised. Choose the preparation depth and class time that fit your situation.",

      plans: [


        /* 10 CLASSES */

        {
          id:
            "one10",

          label:
            "1ON1 CRASH",

          name:
            "10 Classes",

          metric:
            "Around 1 Month",

         metricLabel:
  "Flexible timeline",

price:
  "৳ 11,000",

description:
  "Compact personalised preparation focused on your most important IELTS problems.",

          facts: [

            [
              "Classes",
              "10"
            ],

            [
              "Class time",
              "Around 1 hour"
            ],

            [
              "Schedule",
              "Flexible"
            ],

            [
              "Coverage",
              "Personalised"
            ],

            [
              "Mock",
              "1 Full Mock"
            ],

            [
              "Approach",
              "Targeted"
            ]

          ],

          bestFor:
            "Students with a reasonable IELTS foundation who need focused correction, technique improvement or a short personalised preparation plan.",

          focus: [

            "Problems identified from current performance",

            "Listening, Reading, Writing and Speaking as required",

            "Technique correction",

            "Exam approach and targeted preparation"

          ],

          support: [

            "Personal instructor attention",

            "Flexible scheduling",

            "One Full Mock Test",

            "Individual correction and guidance"

          ],

          note:
            "Because this is 1on1 preparation, the exact class sequence can be personalised instead of following the same fixed structure for every student."

        },


        /* 15 CLASSES */

        {
          id:
            "one15",

          label:
            "1ON1 COMPLETE",

          name:
            "15 Classes",

          metric:
            "Around 1.5 Months",

          metricLabel:
  "Flexible timeline",

price:
  "৳ 15,000",

description:
  "More time for complete personalised IELTS preparation, correction and skill development.",

          facts: [

            [
              "Classes",
              "15"
            ],

            [
              "Class time",
              "Around 1 hour"
            ],

            [
              "Schedule",
              "Flexible"
            ],

            [
              "Coverage",
              "Complete IELTS"
            ],

            [
              "Mocks",
              "2 Full Mocks"
            ],

            [
              "Approach",
              "Personalised"
            ]

          ],

          bestFor:
            "Students who want complete personalised IELTS preparation with more correction and development time than the 10 class plan.",

          focus: [

            "Complete IELTS preparation",

            "Individual skill correction",

            "Work on repeated weaknesses",

            "Exam approach and guided practice"

          ],

          support: [

            "Personal instructor attention",

            "Flexible scheduling",

            "Two Full Mock Tests",

            "Individual evaluation and correction"

          ],

          note:
            "The preparation flow can change according to the student's current level, weaknesses and progress."

        },


        /* 24 CLASSES */

        {
          id:
            "one24",

          label:
            "BASIC TO ADVANCED",

          name:
            "24 Classes",

          metric:
            "Around 2 Months",

          metricLabel:
  "Flexible timeline",

price:
  "৳ 19,000",

description:
  "Foundation plus complete personalised IELTS preparation with more time for development.",
          facts: [

            [
              "Classes",
              "24"
            ],

            [
              "Class time",
              "Around 1 hour"
            ],

            [
              "Schedule",
              "Flexible"
            ],

            [
              "Foundation",
              "Grammar + Basics"
            ],

            [
              "Mocks",
              "5 Full Mocks"
            ],

            [
              "Extra",
              "Continued Support"
            ]

          ],

          bestFor:
            "Students who need foundation work, more preparation time or a complete personalised path from basics through IELTS exam readiness.",

          focus: [

            "Grammar and essential foundation where required",

            "Complete Listening, Reading, Writing and Speaking",

            "Question type techniques and exam strategy",

            "Development from foundation to exam readiness"

          ],

          support: [

            "Personal instructor attention",

            "Flexible scheduling",

            "Five Full Mock Tests",

            "Access to Until Desired Score Batch support"

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
      "--ielts-header-height",
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
     IELTS SCORE STORIES

     Images are loaded automatically from:
     assets/results/ielts

     Add a new image to that folder and it will appear here
     without editing this page again.
  ======================================================== */

  const IELTS_RESULTS_API =
    "https://api.github.com/repos/shuvojoy00-oss/mylizon-website/contents/assets/results/ielts?ref=main";


  const IELTS_RESULT_FALLBACK = [

    "assets/results/ielts/694129910_1596042069198624_8716469945302976711_n.jpg",

    "assets/results/ielts/695753279_1596042122531952_2162575424079969370_n.jpg",

    "assets/results/ielts/696227682_1596042149198616_6806450380861803922_n.jpg",

    "assets/results/ielts/696359626_1596042235865274_4701816227566343418_n.jpg",

    "assets/results/ielts/696410853_1596041999198631_8044688885627648774_n.jpg",

    "assets/results/ielts/696604157_1596042219198609_5788358319808576478_n.jpg"
  ];


  const ieltsResultState = {

    all:
      [],

    visible:
      6

  };


  function isIeltsResultImage(
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


  function renderIeltsResults() {

    const grid =
      $("#ielts-results-grid");

    const moreButton =
      $("#show-more-ielts-results");

    const closeButton =
      $("#close-ielts-results");


    if (
      !grid
    ) {
      return;
    }


    const visibleResults =
      ieltsResultState.all.slice(
        0,
        ieltsResultState.visible
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
                  IELTS · STUDENT RESULT
                </span>

                <button
                  type="button"
                  data-ielts-result-src="${src}"
                  aria-label="View IELTS student result ${index + 1}"
                >

                  <img
                    src="${src}"
                    alt="IELTS student result shared with LizOn Education"
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
        ieltsResultState.visible >=
        ieltsResultState.all.length;

    }


    if (
      closeButton
    ) {

      closeButton.hidden =
        ieltsResultState.visible <=
        6;

    }


    bindIeltsResultButtons();

  }


  async function loadIeltsResults() {

    try {

      const response =
        await fetch(
          IELTS_RESULTS_API,
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
          "Could not load IELTS results"
        );
      }


      const files =
        await response.json();


      const results =
        files
          .filter(
            isIeltsResultImage
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


      ieltsResultState.all =
        results.length
          ? results
          : IELTS_RESULT_FALLBACK;

    } catch (
      error
    ) {

      console.warn(
        "Using local IELTS result fallback.",
        error
      );


      ieltsResultState.all =
        IELTS_RESULT_FALLBACK;

    }


    renderIeltsResults();

  }


  function bindIeltsResultButtons() {

    $$(
      "[data-ielts-result-src]"
    ).forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openIeltsResult(
              button.dataset.ieltsResultSrc
            );

          }
        );

      }
    );

  }


  function openIeltsResult(
    src
  ) {

    const dialog =
      $("#ielts-result-dialog");

    const image =
      $("#ielts-result-dialog-image");


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
      "IELTS student result shared with LizOn Education";


    if (
      typeof dialog.showModal ===
      "function"
    ) {

      dialog.showModal();

    }

  }


  function initIeltsResults() {

    const dialog =
      $("#ielts-result-dialog");


    if (
      dialog
    ) {

      const closeButton =
        $(
          "[data-ielts-dialog-close]",
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
            $("#ielts-result-dialog-image");


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
      $("#show-more-ielts-results");


    moreButton?.addEventListener(
      "click",
      () => {

        ieltsResultState.visible +=
          6;

        renderIeltsResults();

      }
    );


    const closeResultsButton =
      $("#close-ielts-results");


    closeResultsButton?.addEventListener(
      "click",
      () => {

        ieltsResultState.visible =
          6;

        renderIeltsResults();


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


    loadIeltsResults();

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

    initIeltsResults();

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
