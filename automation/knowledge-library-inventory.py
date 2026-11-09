#!/usr/bin/env python3
"""Read-only inventory of every LizOn IELTS/PTE catalog lesson and its crawlable pages.
Run from repository root: python3 automation/knowledge-library-inventory.py
Optional --live checks the two public classroom APIs; it never publishes pages.
"""
import argparse
import collections
import datetime as dt
import html
import json
import pathlib
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://www.mylizon.com"
IELTS = ROOT / "data/ielts-lessons.json"
PTE = ROOT / "data/pte-lessons.json"
SITEMAP = ROOT / "sitemap.xml"
REPORT = ROOT / "docs/seo/knowledge-library-full-inventory.json"

def slug(value):
    return re.sub(r"(^-+|-+$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))

def ielts_path(lesson):
    if lesson["id"] == "ielts-032":
        return "ielts-true-false-not-given.html"
    return "ielts-lesson-" + lesson["id"][-3:] + "-" + slug(lesson["title"]) + ".html"

def fetch_live(kind):
    url = BASE + "/api/" + kind + "-content"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "LizOn-LibraryAudit/1.0"})
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.load(res)
        return {"checked": True, "url": url, "data": data}
    except (OSError, ValueError, urllib.error.URLError) as exc:
        return {"checked": False, "url": url, "error": str(exc)[:240]}

def extract_live_lessons(data):
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return []
    if isinstance(data.get("lessons"), list):
        return data["lessons"]
    if isinstance(data.get("data"), list):
        return data["data"]
    if isinstance(data.get("data"), dict) and isinstance(data["data"].get("lessons"), list):
        return data["data"]["lessons"]
    return []

def run(check_live=False):
    ielts = json.loads(IELTS.read_text(encoding="utf-8"))["lessons"]
    pte = json.loads(PTE.read_text(encoding="utf-8"))["lessons"]
    locs = {e.text for e in ET.parse(SITEMAP).iter() if e.tag.endswith("loc") and e.text}
    rows = []
    for kind, lessons in (("ielts", ielts), ("pte", pte)):
        for lesson in lessons:
            lid = lesson["id"]
            title = lesson["title"]
            status = lesson.get("status", "unknown")
            path = ielts_path(lesson) if kind == "ielts" else None
            url = BASE + "/" + path if path else None
            content = (ROOT / path).read_text(encoding="utf-8") if path and (ROOT / path).is_file() else ""
            issues = []
            if kind == "pte":
                issues.append("pte_standalone_page_not_mapped")
            if path and not content:
                issues.append("missing_static_page")
            if path and url not in locs:
                issues.append("missing_sitemap_entry")
            if content and ('rel="canonical" href="' + url + '"') not in content:
                issues.append("canonical_needs_check")
            if content and lesson.get("videoId") and lesson["videoId"] not in content:
                issues.append("video_id_not_in_page")
            if not (lesson.get("notes") or "").strip():
                issues.append("repo_notes_blank_check_live_api")
            if status != "published":
                issues.append("not_published")
            # Genuine issue classes only. A generic page can still be useful after editorial review.
            if content and "The goal of <strong>" in content and "Apply independently" in content:
                issues.append("templated_explanation_editorial_review")
            rows.append({"platform": kind.upper(), "id": lid, "section": lesson.get("section"),
                         "title": title, "status": status, "video_id": lesson.get("videoId"),
                         "page": path, "url": url, "notes_in_repo": bool((lesson.get("notes") or "").strip()),
                         "issues": issues})
    result = {
        "generated_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "Repository catalog and static pages; live production remains separately verified",
        "counts": {
            "ielts_catalog": len(ielts),
            "pte_catalog": len(pte),
            "ielts_published_in_repo": sum(x.get("status") == "published" for x in ielts),
            "pte_published_in_repo": sum(x.get("status") == "published" for x in pte),
            "ielts_repo_notes_filled": sum(bool((x.get("notes") or "").strip()) for x in ielts),
            "pte_repo_notes_filled": sum(bool((x.get("notes") or "").strip()) for x in pte),
        },
        "lessons": rows,
        "live_api": {}
    }
    if check_live:
        for kind in ("ielts", "pte"):
            fetched = fetch_live(kind)
            if fetched["checked"]:
                lessons = extract_live_lessons(fetched.pop("data"))
                fetched["extracted_lesson_count"] = len(lessons)
                fetched["notes_filled"] = sum(bool((x.get("notes") or "").strip()) for x in lessons if isinstance(x, dict))
                fetched["ids"] = [x.get("id") for x in lessons if isinstance(x, dict)]
                fetched["schema_unknown"] = not bool(lessons)
            result["live_api"][kind] = fetched
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    counts = collections.Counter(flag for row in rows for flag in row["issues"])
    print("IELTS catalog:", len(ielts), "; PTE catalog:", len(pte))
    print("Flags:", dict(counts))
    if check_live:
        print("Live API:", {k: {key: val for key, val in d.items() if key != "ids"} for k, d in result["live_api"].items()})
    print("Wrote:", REPORT.relative_to(ROOT))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", action="store_true", help="Try public API read; no changes to website")
    run(ap.parse_args().live)
