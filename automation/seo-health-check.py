#!/usr/bin/env python3
"""Read-only SEO health audit for LizOn Education. Uses Python stdlib only."""
import datetime, json, re, urllib.request, urllib.error, xml.etree.ElementTree as ET
BASE="https://www.mylizon.com"
SITEMAP=BASE+"/sitemap.xml"
results=[]
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"LizOn-SEO-Health-Check/1.0"})
    with urllib.request.urlopen(req,timeout=18) as resp:
        return resp.status, resp.read(1500000).decode("utf-8",errors="replace"),resp.url
try:
    status,body,_=get(SITEMAP)
    xml=ET.fromstring(body)
    ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls=[n.text for n in xml.findall(".//s:loc",ns) if n.text]
except Exception as e:
    print("Sitemap read failed:",str(e)); raise SystemExit(1)
for url in urls:
    row={"url":url,"status":None,"title":False,"canonical":False,"error":""}
    try:
        status,html,final=get(url)
        row["status"]=status
        row["title"]=bool(re.search(r"<title>[^<]+</title>",html,re.I))
        row["canonical"]=bool(re.search(r'<link[^>]+rel=["\']canonical["\']',html,re.I))
        if final.rstrip("/")!=url.rstrip("/"):row["redirected_to"]=final
    except Exception as e:row["error"]=str(e)[:200]
    results.append(row)
report={"checked_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"sitemap":SITEMAP,"pages":results}
with open("seo-health-report.json","w") as f:json.dump(report,f,indent=2,ensure_ascii=False)
bad=[r for r in results if r["status"]!=200 or not r["title"] or not r["canonical"]]
print(f"Audited {len(results)} URLs; {len(bad)} need attention")
for r in bad:print(r["url"],"status",r["status"],"title",r["title"],"canonical",r["canonical"],r["error"])
if bad:raise SystemExit(1)
