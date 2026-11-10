#!/usr/bin/env python3
"""Read-only pre-merge checks for LizOn lesson article revisions."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,sys
ROOT=Path(__file__).resolve().parent.parent
BASE="https://www.mylizon.com/"
IELTS=json.loads((ROOT/"data/ielts-lessons.json").read_text())["lessons"]
PTE=json.loads((ROOT/"data/pte-lessons.json").read_text())["lessons"]
class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags=[]
        self.attrs=[]
    def handle_starttag(self,tag,attrs):
        self.tags.append(tag)
        self.attrs.append((tag,dict(attrs)))
def slug(t):return re.sub(r"(^-+|-+$)","",re.sub(r"[^a-z0-9]+","-",t.lower()))
def ielts_page(l):
    return "ielts-true-false-not-given.html" if l["id"]=="ielts-032" else "ielts-lesson-"+l["id"][-3:]+"-"+slug(l["title"])+".html"
PTE_ALIASES={
    "speaking-2":"pte-describe-image.html",
    "speaking-5":"pte-summarize-group-discussion.html",
    "speaking-6":"pte-respond-to-a-situation.html",
    "reading-5":"pte-reading-reorder-paragraphs.html",
    "reading-1":"pte-reading-fill-in-blanks.html",
}
def pte_page(l):
    return PTE_ALIASES.get(l["id"]) or "pte-lesson-"+l["id"]+"-"+slug(l["title"])+".html"
PUBLISHED_PTE=[l for l in PTE if l.get("status")=="published"]
PAGE_SET={ielts_page(l) for l in IELTS}|{pte_page(l) for l in PUBLISHED_PTE}|{"ielts-matching-headings.html","pte-question-types.html"}
SITEMAP=(ROOT/"sitemap.xml").read_text(encoding="utf-8")
report={"checks":[],"warnings":[],"errors":[]}
for name in sorted(PAGE_SET):
    p=ROOT/name
    if not p.exists():
        report["errors"].append(name+": missing page")
        continue
    content=p.read_text(encoding="utf-8")
    scan=Scan()
    try:scan.feed(content)
    except Exception as e:report["errors"].append(name+": HTML parse exception "+str(e))
    if "main" not in scan.tags:report["errors"].append(name+": missing main landmark")
    if "h1" not in scan.tags:report["errors"].append(name+": missing h1")
    if not any(tag=="link" and a.get("rel")=="canonical" and a.get("href")==BASE+name for tag,a in scan.attrs):
        report["errors"].append(name+": incorrect canonical")
    if name.startswith("ielts-lesson-") or name=="ielts-true-false-not-given.html":
        lesson=next((l for l in IELTS if ielts_page(l)==name),None)
        if lesson and lesson.get("videoId") not in content:report["errors"].append(name+": video id differs from catalog")
        if lesson and "data-ielts-notes-id=\""+lesson["id"]+"\"" not in content:
            report["errors"].append(name+": live notes widget missing or mismatched")
    pte_lesson=next((l for l in PUBLISHED_PTE if pte_page(l)==name),None)
    if pte_lesson:
        expected_link="/pteclass.html?lesson="+pte_lesson["id"]
        if expected_link not in content:report["errors"].append(name+": incorrect PTE classroom link")
        if pte_lesson.get("videoId") and pte_lesson["videoId"] not in content and name.startswith("pte-lesson-"):
            report["errors"].append(name+": expected PTE lesson video ID absent")
    if name.startswith("pte-lesson-") and BASE+name not in SITEMAP:
        report["errors"].append(name+": PTE guide missing from sitemap")
    for tag,a in scan.attrs:
        if tag=="a":
            href=a.get("href","")
            if href.startswith("/") and not href.startswith("//"):
                target=href.split("#")[0].split("?")[0].lstrip("/")
                if target and target.endswith(".html") and not (ROOT/target).exists():
                    report["warnings"].append(name+": target missing locally: "+target)
    if '<section class="lizon-original-worked"' in content:
        if not re.search(r"original (teaching|practice) (example|scenario)",content,re.I):report["warnings"].append(name+": original example label not found")
        if "<summary" not in content:
            report["warnings"].append(name+": missing explanation toggle")
    if '<section class="lizon-specific-example"' in content:
        if "Original practice example" not in content:report["errors"].append(name+": unlabelled example")
    if "01608881545" in content:report["warnings"].append(name+": outdated hotline")
    report["checks"].append(name)
print(json.dumps({"checked_pages":len(report["checks"]),"error_count":len(report["errors"]),"warning_count":len(report["warnings"]),"errors":report["errors"][:40],"warnings":report["warnings"][:40]},indent=2,ensure_ascii=False))
out=ROOT/"docs/seo/knowledge-library-page-qa.json"
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
sys.exit(1 if report["errors"] else 0)
