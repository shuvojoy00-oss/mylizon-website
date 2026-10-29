#!/usr/bin/env python3
"""Audit all IELTS Free Class lesson pages against sitemap and metadata. Stdlib only."""
import json,re,sys,urllib.request,urllib.error,xml.etree.ElementTree as ET,datetime
from pathlib import Path
BASE="https://www.mylizon.com"
lessons=json.loads(Path("data/ielts-lessons.json").read_text())["lessons"]
sitemap=ET.fromstring(Path("sitemap.xml").read_text())
locs={x.text for x in sitemap.iter() if x.tag.endswith("loc") and x.text}
def slug(s):
 return re.sub(r"(^-+|-+$)","",re.sub("[^a-z0-9]+","-",s.lower()))
results=[]
for l in lessons:
 path="ielts-true-false-not-given.html" if l["id"]=="ielts-032" else f'ielts-lesson-{l["id"][-3:]}-{slug(l["title"])}.html'
 url=BASE+"/"+path
 p=Path(path)
 row={"id":l["id"],"title":l["title"],"url":url,"exists":p.exists(),"sitemap":url in locs,"issues":[]}
 if not row["exists"]:row["issues"].append("missing_page")
 else:
  html=p.read_text(encoding="utf-8")
  for label,pat in [("title",r"<title>[^<]+</title>"),("description",r'<meta name="description" content="[^"]+'),("canonical",r'<link rel="canonical" href="'+re.escape(url)+'"'),("video",re.escape(l["videoId"])),("viewport",r'name="viewport"'),("main",r"<main(?:\s|>)"),("language",r'<html[^>]+lang='),("structured_data",r'application/ld\+json')]:
   if not re.search(pat,html,re.I):row["issues"].append("missing_"+label)
  if l["id"]!="ielts-032" and not ("ob.observe(el)})();</script>" in html or "els.forEach(el=>io.observe(el))" in html):row["issues"].append("animation_js_unexpected")
 if not row["sitemap"]:row["issues"].append("not_in_sitemap")
 results.append(row)
issue_count=sum(bool(r["issues"]) for r in results)
report={"checked_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"lessons":len(results),"failed":issue_count,"results":results}
Path("ielts-library-source-audit.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(f"IELTS library: {len(results)} lessons; {issue_count} pages require attention")
for r in results:
 if r["issues"]:print(r["id"],", ".join(r["issues"]))
sys.exit(1 if issue_count else 0)
