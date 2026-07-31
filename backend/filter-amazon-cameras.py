#!/usr/bin/env python3
"""Stream-filter meta_Electronics.jsonl (stdin) -> kamera (bukan aksesori) ke stdout jsonl.
Usage: curl -s <url> | python3 filter-amazon-cameras.py > /tmp/amazon-cameras.jsonl
"""
import json
import sys

CAMERA_CATS = ("dslr cameras", "mirrorless cameras", "point & shoot digital cameras",
               "sports & action video cameras", "instant cameras", "digital cameras",
               "camcorders", "film cameras")
EXCLUDE_CATS = ("accessories", "lenses", "bags", "cases", "tripods", "batteries",
                "chargers", "flashes", "filters", "remote controls", "mounts",
                "cables", "straps", "cleaning")
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
    if not any(cc in c for c in cats for cc in CAMERA_CATS):
        continue
    if any(ex in c for c in cats for ex in EXCLUDE_CATS):
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

print(f"Selesai: {seen} baris, {kept} kamera disimpan", file=sys.stderr)
