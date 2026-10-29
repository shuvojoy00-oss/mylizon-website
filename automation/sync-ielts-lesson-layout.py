#!/usr/bin/env python3
"""Build full, static IELTS lesson pages using the approved TFNG page shell."""
from pathlib import Path
import html,json,re,datetime

ROOT=Path(__file__).resolve().parent.parent
master=(ROOT/"ielts-true-false-not-given.html").read_text(encoding="utf-8")
lessons=json.loads((ROOT/"data/ielts-lessons.json").read_text(encoding="utf-8"))["lessons"]
def slug(s):
    return re.sub(r"(^-+|-+$)","",re.sub(r"[^a-z0-9]+","-",s.lower()))
def esc(s):return html.escape(str(s),quote=True)
def path(l):
    return "ielts-true-false-not-given.html" if l["id"]=="ielts-032" else "ielts-lesson-"+l["id"][-3:]+"-"+slug(l["title"])+".html"
def section_body(old):
    m=re.search(r'<section class="card lesson-focus">.*?<h2>.*?</h2><p>(.*?)</p>',old,re.S)
    return html.unescape(re.sub("<[^>]*>","",m.group(1))) if m else "Understand the specific technique, practise it independently and explain the reasoning."

style=re.search(r"<style>[\s\S]*?</style>",master).group(0)
header=master[master.index("<body>")+len("<body>"):master.index('<main id="main-content"')]
shared=master[master.index('<section class="student-questions"'):master.index('<section class="sources">')]
shared=shared.replace("Reading-এর আলাদা আলাদা","IELTS-এর আলাদা আলাদা").replace("Build your Reading accuracy","Build your IELTS accuracy")
whatsapp=master[master.index('<aside class="whatsapp-help"'):master.index("</main>")]
whatsapp=whatsapp.replace("Need help with IELTS Reading?","Need help with IELTS preparation?")
tail=master[master.index("</main>"):]
tail=re.sub(r'<script>\(function\(\)\{const items=\[\.\.\.document\.querySelectorAll\("\.tfng-question"\)\][\s\S]*?</script>', "", tail, count=1)
common={
"Reading":("Passage evidence","Reading-এ matching word নয়, পুরো meaning এবং evidence মিলিয়ে answer দিন",["Choosing an answer because one word matches","Missing qualifying words like some, only, all","Relying on general knowledge rather than the passage"]),
"Listening":("Listening accuracy","Listening-এ paraphrase, correction এবং question instruction খেয়াল করুন",["Choosing the first answer-like word","Missing corrections and changed decisions","Ignoring spelling and answer-word limits"]),
"Writing Task 1":("Accurate visual description","Overview, main features এবং relevant comparison দিয়ে report লিখুন",["Listing numbers without an overview","Adding unsupported explanations","Leaving out useful comparisons or units"]),
"Writing Task 2":("Argument development","প্রশ্নের সব অংশ cover করে clear position, reasons এবং example লিখুন",["Not fully answering the prompt","Using memorised paragraphs without relevance","Developing body paragraphs without supporting reasons"]),
"Speaking":("Natural communication","মুখস্থ script নয়, question অনুযায়ী নিজের idea দিয়ে clear response দিন",["Memorising whole answers","Giving very short answers without explanation","Ignoring fluency, vocabulary, pronunciation or grammar"]),
"Grammar":("Form and meaning","Grammar-এর structure বুঝে নতুন sentence তৈরি করুন",["Memorising rules but not applying them","Changing the original meaning accidentally","Not reviewing sentence accuracy"]),
"Pre Basic":("Foundational skill","সহজ example দিয়ে শুরু করে নিজের mistake check করুন",["Only watching without practising","Skipping necessary basics","Not reviewing mistakes"]),
"Letter Writing":("Reader and purpose","Letter-এর recipient অনুযায়ী formal বা informal tone ঠিক রাখুন",["Missing required bullet points","Using an inappropriate tone","Not making the purpose clear"]),
"Bonus Classes":("Study strategy","Technique বাস্তবে প্রয়োগ করুন এবং নিজের progress measure করুন",["Trusting shortcuts without evidence","Skipping timed practice","Not identifying repeat mistakes"])
}
official={
"Reading":"https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading",
"Listening":"https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening",
"Writing Task 1":"https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing",
"Writing Task 2":"https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing",
"Speaking":"https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking"
}
arrow='<svg class="cta-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg>'
pages=[]
for i,l in enumerate(lessons):
    if l["id"]=="ielts-032":continue
    file=ROOT/path(l)
    old=file.read_text(encoding="utf-8")
    tip=section_body(old)
    n=esc(l["title"]);mod=esc(l["section"]);video=esc(l["videoId"])
    label,bangla,mistakes=common[l["section"]]
    previous=lessons[i-1] if i else l
    following=lessons[i+1] if i<len(lessons)-1 else l
    url="https://www.mylizon.com/"+path(l)
    desc="Free IELTS "+l["section"]+" lesson on "+l["title"]+". Watch Joy Sir, learn in Bangla, review common errors and explore the LizOn classroom."
    schema={"@context":"https://schema.org","@type":"LearningResource","name":l["title"],"url":url,"description":desc,"learningResourceType":"Lesson","inLanguage":["en","bn"],"isAccessibleForFree":True,"provider":{"@type":"EducationalOrganization","name":"LizOn Education","url":"https://www.mylizon.com/"}}
    head=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fcfbf7"><title>{n} | IELTS {mod} Free Lesson | LizOn Education</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{url}"><link rel="icon" href="/assets/logo/lizon-logo.png"><meta property="og:type" content="article"><meta property="og:title" content="{n} | IELTS Free Lesson"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://i.ytimg.com/vi/{video}/hqdefault.jpg"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><link rel="stylesheet" href="/css/homepage-test.css">{style}<style>.lesson-seo .learning-hero__visual.lesson-icon-flow{{display:flex;justify-content:center;align-items:center;gap:18px;min-height:180px}}.lesson-icon-flow span{{display:block;width:61px;height:61px;border:2px solid #94cbae;background:#d9efdf;border-radius:14px}}.lesson-icon-flow span:nth-child(2){{background:#bce4c9;border-radius:50%}}.lesson-icon-flow span:nth-child(3){{background:#80c99e}}.lesson-focus-note{{border-left:3px solid #248755;background:#f0f8f1;padding:14px;border-radius:0 10px 10px 0}}</style></head>'''
    hero=f'''<section class="learning-hero" aria-labelledby="guide-title"><div class="learning-hero__content"><div class="learning-hero__tag">IELTS {mod.upper()} · FREE STEP-BY-STEP GUIDE</div><h1 id="guide-title">{n}</h1><p class="learning-hero__lead">Watch the actual class, understand the method, and apply it with evidence and feedback.</p><a class="hero-learn-btn" href="#free-class">Watch the full video class {arrow}</a></div><div class="learning-hero__visual lesson-icon-flow" role="img" aria-label="Three stages of learning, from question to understanding to answer"><span></span><span></span><span></span></div></section>'''
    video_block=f'''<section class="class-feature" id="free-class"><div><p class="eyebrow">FREE VIDEO LESSON</p><h2>Watch Joy Sir’s {n} lesson</h2><p>This is the corresponding real lesson from LizOn’s IELTS classroom. Watch the demonstration, pause when a technique is explained, and note how the answer or response is developed.</p><p class="lesson-focus-note">{esc(tip)}</p><a class="lesson-link" href="/ieltsclass.html?lesson={l["id"]}">ঘুরে আসি ক্লাসরুম থেকে {arrow}</a></div><div class="lesson-preview" aria-label="Free class preview"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/{video}" title="LizOn IELTS {n} class" allow="accelerometer; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><p>Full lesson and class notes open in LizOn’s classroom.</p></div></section>'''
    intro=f'''<section class="bn-intro" id="quick-answer"><h2>বাংলায় বুঝুন</h2><p lang="bn">{esc(bangla)}</p><p><strong>{n}:</strong> {esc(tip)} Understand the instructions first, observe the actual video example and practise independently.</p></section>'''
    parts=f'''<section><h2>What exactly are you learning?</h2><p>The goal of <strong>{n}</strong> is to understand the task and the method demonstrated in the video. {esc(tip)}</p><p>This lesson is part of IELTS {mod}, so the exact assessment requirements depend on the task format.</p></section><section><h2>Step-by-step learning method</h2><ol><li><strong>Read the instructions.</strong> Identify what the task asks and what a complete answer requires.</li><li><strong>Observe the technique.</strong> Pause Joy Sir’s video and identify the specific reasoning or structure.</li><li><strong>Apply independently.</strong> Use a different example from suitable IELTS practice material.</li><li><strong>Review your mistakes.</strong> Identify exactly why a choice or response needs improvement and try again.</li></ol></section><section><h2>Common reasons Bangladesh students lose marks</h2><ul>{''.join('<li>'+esc(x)+'.</li>' for x in mistakes)}<li>Watching classes without practising the technique independently.</li></ul></section><section><h2>Questions students ask</h2><details><summary>How do I prepare for {n}?</summary><p>Start with Joy Sir’s classroom video, take brief notes, use a fresh task of the same type and review errors against reliable practice explanations.</p></details><details><summary>বাংলায় এই IELTS lesson বুঝতে পারব?</summary><p lang="bn">হ্যাঁ, উপরের বাংলা ব্যাখ্যা এবং ভিডিও example দিয়ে বিষয়টি বুঝে নিতে পারবেন।</p></details><details><summary>Are these official IELTS questions?</summary><p>No. This is LizOn Education’s independent study guide and video class, not an official IELTS test paper.</p></details></section><section><h2>What to practise next</h2><p>Apply the demonstrated technique to a fresh question or task, then review what needs more work. Continue with related lessons in the classroom.</p><p><a href="/{path(previous)}">Previous: {esc(previous["title"])}</a> · <a href="/{path(following)}">Next: {esc(following["title"])}</a></p><p><a href="/ielts-question-types.html">সব IELTS Question Type দেখুন</a></p></section>'''
    source=f'''<section class="sources"><h2>Official task reference</h2><p>Check the official IELTS task format and marking requirements: <a href="{official.get(l["section"],"https://ielts.org/take-a-test/preparation-resources")}" target="_blank" rel="noopener noreferrer">IELTS official preparation guidance</a>.</p><small>Independent educational content from LizOn Education. <a href="/joy.html">Meet Joy Sir</a>. No score guarantee is implied.</small></section>'''
    content=head+"<body>"+header+f'''<main id="main-content" class="lesson-seo shell"><nav aria-label="Breadcrumb" class="crumb"><a href="/">Home</a> / <a href="/ielts-question-types.html">IELTS question types</a> / {mod} / {n}</nav>'''+hero+video_block+intro+parts+shared+source+whatsapp+tail
    file.write_text(content,encoding="utf-8")
    pages.append({"id":l["id"],"file":path(l),"bytes":len(content.encode()),"has_header":'class="site-header"' in content,"has_footer":'class="footer"' in content,"has_results":'id="question-results-gallery"' in content,"has_level_test":"IELTS Level Test দিন" in content,"has_class_link":"ieltsclass.html?lesson="+l["id"] in content})
assert len(pages)==71
assert all(all(p[k] for k in ("has_header","has_footer","has_results","has_level_test","has_class_link")) for p in pages)
report={"generated_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"template":"ielts-true-false-not-given.html","pages":pages}
(ROOT/"automation/ielts-layout-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print("Regenerated",len(pages),"IELTS full-layout pages")
