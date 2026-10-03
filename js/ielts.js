
(function(){
  const DATA={
    batch:{
      eyebrow:"BATCH PREPARATION",
      heading:"Choose the pace that fits where you are now.",
      intro:"Compare the essential information first. Open the details only when you want to look deeper.",
      defaultPlan:"batchCrash",
      plans:[
        {
          id:"batchCrash",label:"BATCH",name:"Crash",metric:"1 Month",metricLabel:"Approx. duration",
          cardDescription:"Complete IELTS coverage with technique focused preparation.",
          duration:"Around 1 Month",durationLabel:"Approx. duration",
          summary:"A focused route for students who have already started IELTS and want complete question type coverage, better technique and a clearer exam approach.",
          facts:[["Classes","3 per week"],["Class time","Around 1 hour"],["Coverage","Complete IELTS"],["Approach","Technique focused"],["Mocks","2 full mocks"],["Format","Batch learning"]],
          bestFor:"Students who already have some IELTS foundation but feel stuck, confused by question types, or are not seeing the improvement they expected.",
          focus:["Listening, Reading, Writing and Speaking coverage","Techniques for IELTS question types","Exam approach and time management","Practice built around common scoring problems"],
          support:["Two full mock tests","Class based correction and guidance","Practice direction between classes","Progress focused preparation"],
          note:"Course content may be adjusted over time as LizOn updates teaching methods and student support."
        },
        {
          id:"batchFull",label:"BATCH",name:"Full",metric:"2 Months",metricLabel:"Approx. duration",
          cardDescription:"Foundation first, then complete IELTS preparation.",
          duration:"Around 2 Months",durationLabel:"Approx. duration",
          summary:"A longer structured preparation path that strengthens essential language foundations before moving through complete IELTS techniques and exam practice.",
          facts:[["Classes","3 per week"],["Class time","Around 1 hour"],["Foundation","Grammar + basics"],["Coverage","Complete IELTS"],["Mocks","5 full mocks"],["Evaluation","Weekly Writing + Speaking"]],
          bestFor:"Students who need more time, want grammar and foundation support, or prefer to build the basics before moving into full IELTS preparation.",
          focus:["Grammar and essential language foundation","Listening, Reading, Writing and Speaking","Question type techniques and exam strategy","Progressive practice from basic to exam level"],
          support:["Five full mock tests","Weekly Speaking evaluation","Weekly Writing evaluation","Ongoing correction and guided practice"],
          note:"The exact sequence can be adjusted when a batch needs more time on a particular skill."
        },
        {
          id:"batchSupport",label:"CONTINUED SUPPORT",name:"Until Desired Score",metric:"No Fixed Limit",metricLabel:"Support timeline",
          supportCard:true,
          cardDescription:"For students who do not want support to end with a fixed course timeline.",
          duration:"No Fixed Course Deadline",durationLabel:"Support timeline",
          summary:"A continued preparation option for students who want LizOn support beyond a normal fixed duration while they keep working toward their target score.",
          facts:[["Time limit","No fixed limit"],["Class limit","No fixed limit"],["Mocks","Continued"],["Evaluation","Continued"],["Focus","Target score journey"],["Support","Ongoing preparation"]],
          bestFor:"Students who worry about what happens after a normal course ends, especially those who have taken IELTS before or need continued guided preparation.",
          focus:["Continued work on weak areas","Repeated correction where needed","Exam readiness rather than a fixed end date","Preparation adjusted as performance changes"],
          support:["Continued classes within the plan structure","Continued mock opportunities","Continued evaluation","Ongoing guidance toward the student's target"],
          note:"This is continued preparation support, not an automatic score guarantee. Final IELTS performance depends on the student's skill, practice and exam performance."
        }
      ]
    },
    one:{
      eyebrow:"PERSONALISED 1ON1",
      heading:"Choose how much personalised preparation you need.",
      intro:"Each plan is built around the student's current level, weaknesses and target. The difference is preparation depth and available class time.",
      defaultPlan:"one10",
      plans:[
        {
          id:"one10",label:"1ON1 CRASH",name:"10 Classes",metric:"≈ 1 Month",metricLabel:"Flexible timeline",
          cardDescription:"Compact and highly targeted personal preparation.",
          duration:"Around 1 Month",durationLabel:"Typical timeline",
          summary:"A compact personalised plan focused on the student's current IELTS problems, technique gaps and the areas that need the most immediate correction.",
          facts:[["Classes","10 personal classes"],["Class time","Around 1 hour"],["Schedule","Flexible"],["Coverage","Complete IELTS as needed"],["Mock","1 full mock"],["Approach","Highly targeted"]],
          bestFor:"Students with a reasonable foundation who need focused correction, technique improvement or a short personalised preparation plan.",
          focus:["Problems identified from current performance","Listening, Reading, Writing and Speaking as needed","Technique correction and exam approach","Focused preparation rather than a fixed generic sequence"],
          support:["Personal instructor attention","Flexible scheduling","One full mock test","Individual correction and guidance"],
          note:"Because this is 1on1, the exact class sequence is personalised rather than identical for every student."
        },
        {
          id:"one15",label:"1ON1 COMPLETE",name:"15 Classes",metric:"≈ 1.5 Months",metricLabel:"Flexible timeline",
          cardDescription:"More room for complete preparation and correction.",
          duration:"Around 1.5 Months",durationLabel:"Typical timeline",
          summary:"A fuller personalised preparation plan with more time for complete IELTS coverage, individual correction and deeper skill development.",
          facts:[["Classes","15 personal classes"],["Class time","Around 1 hour"],["Schedule","Flexible"],["Coverage","Complete IELTS"],["Mocks","2 full mocks"],["Approach","Deeper preparation"]],
          bestFor:"Students who want complete personalised IELTS preparation with more correction time than the compact 10 class route.",
          focus:["Complete IELTS preparation","Individual skill and technique correction","Targeted work on repeated weaknesses","Exam approach and guided practice"],
          support:["Personal instructor attention","Flexible scheduling","Two full mock tests","Individual evaluation and correction"],
          note:"The exact preparation flow is adjusted to the student's level and progress."
        },
        {
          id:"one24",label:"BASIC TO ADVANCED",name:"24 Classes",metric:"≈ 2 Months",metricLabel:"Flexible timeline",
          cardDescription:"Foundation plus complete personalised preparation.",
          duration:"Around 2 Months",durationLabel:"Typical timeline",
          summary:"The deepest 1on1 route for students who need foundation support first and then complete IELTS preparation with more time for correction, mocks and development.",
          facts:[["Classes","24 personal classes"],["Class time","Around 1 hour"],["Schedule","Flexible"],["Foundation","Grammar + basics"],["Mocks","5 full mocks"],["Extra","Until Desired Score access"]],
          bestFor:"Students who need foundation work, more preparation time, or a complete personalised route from basics through exam readiness.",
          focus:["Grammar and essential language foundation where required","Complete Listening, Reading, Writing and Speaking preparation","Question type techniques and exam approach","Progressive development from foundation to exam readiness"],
          support:["Personal instructor attention","Flexible scheduling","Five full mock tests","Access to the Until Desired Score batch support route"],
          note:"The student's actual timeline can vary because 1on1 scheduling and learning pace are flexible."
        }
      ]
    }
  };

  const state={mode:"batch",selected:{batch:"batchCrash",one:"one10"},detailsOpen:false};
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));

  const el={
    batchPicker:$("#batch-picker"),onePicker:$("#one-picker"),courseEyebrow:$("#course-eyebrow"),
    courseTitle:$("#course-title"),courseIntro:$("#course-intro"),panel:$("#course-panel"),
    panelKicker:$("#panel-kicker"),panelTitle:$("#panel-title"),panelSummary:$("#panel-summary"),
    panelDuration:$("#panel-duration"),panelFacts:$("#panel-facts"),panelFit:$("#panel-fit"),
    panelFocus:$("#panel-focus"),panelSupport:$("#panel-support"),panelNote:$("#panel-note"),
    detailsToggle:$("#details-toggle"),details:$("#course-details")
  };

  function currentData(){return DATA[state.mode]}
  function currentPlan(){
    const data=currentData();
    return data.plans.find(p=>p.id===state.selected[state.mode])||data.plans[0]
  }

  function makePlanCard(plan,mode){
    const b=document.createElement("button");
    b.type="button";
    b.className="plan-card"+(plan.supportCard?" plan-card--support":"")+(state.selected[mode]===plan.id?" is-active":"");
    b.setAttribute("aria-pressed",String(state.selected[mode]===plan.id));
    b.dataset.plan=plan.id;

    const left=document.createElement("span");
    const label=document.createElement("span");label.className="plan-card__label";label.textContent=plan.label;
    const name=document.createElement("span");name.className="plan-card__name";name.textContent=plan.name;
    const desc=document.createElement("span");desc.className="plan-card__desc";desc.textContent=plan.cardDescription;
    left.append(label,name,desc);

    const metric=document.createElement("span");metric.className="plan-card__metric";
    const strong=document.createElement("strong");strong.textContent=plan.metric;
    const small=document.createElement("small");small.textContent=plan.metricLabel;
    metric.append(strong,small);

    b.append(left,metric);
    b.addEventListener("click",()=>{state.selected[mode]=plan.id;renderPicker(mode);renderPanel()});
    return b;
  }

  function renderPicker(mode){
    const target=mode==="batch"?el.batchPicker:el.onePicker;
    target.innerHTML="";
    DATA[mode].plans.forEach(p=>target.appendChild(makePlanCard(p,mode)));
  }

  function renderHeading(){
    const d=currentData();
    el.courseEyebrow.textContent=d.eyebrow;
    el.courseTitle.textContent=d.heading;
    el.courseIntro.textContent=d.intro;
  }

  function renderPanel(){
    const p=currentPlan();
    el.panel.classList.remove("is-changing");void el.panel.offsetWidth;el.panel.classList.add("is-changing");
    el.panelKicker.textContent=p.label;
    el.panelTitle.textContent=p.name;
    el.panelSummary.textContent=p.summary;
    el.panelDuration.innerHTML="";
    const st=document.createElement("strong");st.textContent=p.duration;
    const sp=document.createElement("span");sp.textContent=p.durationLabel;
    el.panelDuration.append(st,sp);

    el.panelFacts.innerHTML="";
    p.facts.forEach(([label,value])=>{
      const f=document.createElement("div");f.className="course-fact";
      const a=document.createElement("span");a.textContent=label;
      const b=document.createElement("strong");b.textContent=value;
      f.append(a,b);el.panelFacts.appendChild(f);
    });

    el.panelFit.textContent=p.bestFor;
    el.panelFocus.innerHTML="";
    p.focus.forEach(x=>{const li=document.createElement("li");li.textContent=x;el.panelFocus.appendChild(li)});
    el.panelSupport.innerHTML="";
    p.support.forEach(x=>{const li=document.createElement("li");li.textContent=x;el.panelSupport.appendChild(li)});
    el.panelNote.textContent=p.note;
    setDetails(false);
  }

  function setDetails(open){
    state.detailsOpen=open;
    el.details.hidden=!open;
    el.detailsToggle.setAttribute("aria-expanded",String(open));
    const label=$("span:first-child",el.detailsToggle);
    if(label)label.textContent=open?"Hide course details":"View course details";
  }

  function syncModeButtons(){
    $$("[data-mode]").forEach(b=>{
      const active=b.dataset.mode===state.mode;
      b.classList.toggle("is-active",active);
      b.setAttribute("aria-selected",String(active));
    })
  }

  function setMode(mode,scroll){
    if(!DATA[mode])return;
    state.mode=mode;
    syncModeButtons();
    el.batchPicker.hidden=mode!=="batch";
    el.onePicker.hidden=mode!=="one";
    renderHeading();renderPicker("batch");renderPicker("one");renderPanel();
    if(scroll){
      const header=$("#site-header"),sticky=$("#prep-sticky"),target=$("#courses");
      const offset=(header?header.offsetHeight:0)+(sticky?sticky.offsetHeight:0)+14;
      const top=target.getBoundingClientRect().top+window.scrollY-offset;
      window.scrollTo({top,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})
    }
  }

  $$("[data-mode]").forEach(b=>{
    b.addEventListener("click",()=>setMode(b.dataset.mode,Boolean(b.closest(".prep-sticky"))))
  });
  el.detailsToggle.addEventListener("click",()=>setDetails(!state.detailsOpen));

  renderPicker("batch");renderPicker("one");setMode("batch",false);
})();
