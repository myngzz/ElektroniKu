#!/usr/bin/env python3
"""Stream-filter meta_Electronics.jsonl (stdin) -> headphone/earphone rows (stdout jsonl).
Usage: curl -s <url> | python3 filter-amazon-headphones.py > /tmp/amazon-headphones.jsonl
"""
import json
import sys

KEYWORDS = ("headphones", "earbud", "earbuds", "earphone", "earphones", "headsets")
kept = 0
seen = 0

for line in sys.stdin:
    seen += 1
    if seen % 200000 == 0:
        print(f"  ...{seen} baris diproses, {kept} cocok", file=sys.stderr)
    try:
        p = json.loads(line)
    except json.JSONDecodeError:
        continue
    cats = [c.lower() for c in (p.get("categories") or [])]
    if not any(k in c for c in cats for k in KEYWORDS):
        continue
    if not p.get("price") or not p.get("images") or not p.get("title"):
        continue
    out = {
        "title": p["title"],
        "store": p.get("store"),
        "price": p["price"],
        "categories": p.get("categories"),
        "features": (p.get("features") or [])[:8],
        "description": " ".join(p.get("description") or [])[:1000],
        "details": p.get("details") or {},
        "images": [img.get("hi_res") or img.get("large") for img in p["images"][:4] if img.get("hi_res") or img.get("large")],
        "rating": p.get("average_rating"),
        "rating_count": p.get("rating_number"),
        "asin": p.get("parent_asin"),
    }
    if not out["images"]:
        continue
    print(json.dumps(out))
    kept += 1

print(f"Selesai: {seen} baris, {kept} headphone/earphone disimpan", file=sys.stderr)
