#!/usr/bin/env python3
"""Parse /tmp/amazon-tvs.jsonl -> backend/amazon-tvs.json siap import.
Filter refurbished/aksesori, ekstrak spesifikasi TV, USD->IDR, urutkan terbaru+terpopuler.
Usage: python3 parse-amazon-tvs.py <in> <out> [limit]
"""
import json
import re
import sys

USD_IDR = 16000

EXCLUDE_RE = re.compile(r"\b(renewed|refurbished|mount|bracket|stand only|remote|protector|frames?|bezel|compatible only)\b", re.IGNORECASE)
BAD_STORES = {"amazon renewed", "generic", "unknown", "", "frame my tv", "smartguard"}

def short_name(title):
    t = re.sub(r"\s+", " ", title).strip()
    for sep in [",", " - ", " – ", " | ", " with ", " With ", " w/"]:
        idx = t.find(sep)
        if 15 <= idx <= 95:
            return t[:idx].strip()
    return t[:95].rstrip(" -,")

def main():
    src, dst = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 500

    out, seen = [], set()
    with open(src) as f:
        for line in f:
            p = json.loads(line)
            title, store = p["title"], (p.get("store") or "").strip()
            if store.lower() in BAD_STORES:
                continue
            if EXCLUDE_RE.search(title):
                continue
            try:
                usd = float(p["price"])
            except (TypeError, ValueError):
                continue
            if not 70 <= usd <= 10000:
                continue
            if (p.get("rating_count") or 0) < 5:
                continue

            name = short_name(title)
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)

            d = p["details"]
            text = f"{title} {' '.join(p.get('features') or [])}"
            year = None
            m = re.search(r"(20\d\d)", d.get("Date First Available", ""))
            if m:
                year = int(m.group(1))

            cats = [c.lower() for c in (p.get("categories") or [])]
            if any("oled" in c for c in cats) or re.search(r"\bOLED\b", title):
                panel = "OLED"
            elif any("qled" in c for c in cats) or re.search(r"\bQLED\b", text, re.I):
                panel = "QLED"
            else:
                panel = "LED"

            specs = {"Panel": panel}
            m = re.search(r"(\d{2,3})[-\s\"”]*(?:inch|in\b|\")", title, re.I)
            if m and 19 <= int(m.group(1)) <= 100:
                specs["Ukuran Layar"] = f'{m.group(1)} inci'
            if re.search(r"\b8K\b", text):
                specs["Resolusi"] = "8K"
            elif re.search(r"\b4K\b|ultra hd|uhd", text, re.I):
                specs["Resolusi"] = "4K UHD"
            elif re.search(r"1080p|full hd", text, re.I):
                specs["Resolusi"] = "Full HD 1080p"
            elif re.search(r"720p", text, re.I):
                specs["Resolusi"] = "HD 720p"
            for rx, platform in [
                (r"roku", "Roku TV"), (r"fire tv", "Fire TV"),
                (r"google tv|android tv", "Google TV"),
                (r"tizen", "Tizen"), (r"webos|web os", "webOS"),
            ]:
                if re.search(rx, text, re.I):
                    specs["Smart Platform"] = platform
                    break
            m = re.search(r"(\d{2,3})\s*Hz", text)
            if m:
                specs["Refresh Rate"] = f"{m.group(1)} Hz"
            if re.search(r"dolby vision", text, re.I):
                specs["HDR"] = "Dolby Vision"
            elif re.search(r"\bHDR10\+?\b|\bHDR\b", text):
                specs["HDR"] = re.search(r"HDR10\+?|HDR", text).group(0)
            for src_key, label in [("Refresh Rate", "Refresh Rate"), ("Display Technology", "Teknologi Layar"),
                                   ("Item Weight", "Berat"), ("Item model number", "Nomor Model")]:
                if d.get(src_key) and label not in specs:
                    specs[label] = str(d[src_key])[:80]

            desc = (p.get("description") or " | ".join((p.get("features") or [])[:4]))[:900]
            if not desc:
                desc = f"{name} dari {store}."

            out.append({
                "name": name,
                "brand": store,
                "price": round(usd * USD_IDR / 10000) * 10000,
                "asin": p["asin"],
                "year": year,
                "specs": specs,
                "description": desc,
                "images": p["images"][:3],
                "rating": p.get("rating"),
                "rating_count": p.get("rating_count") or 0,
                "tags": ["smart-tv", "amazon", store.lower(), panel.lower()],
            })

    out.sort(key=lambda x: (-(x["year"] or 0), -x["rating_count"]))
    out = out[:limit]

    with open(dst, "w") as f:
        json.dump(out, f, ensure_ascii=False)

    from collections import Counter
    years = Counter(x["year"] for x in out)
    panels = Counter(x["specs"]["Panel"] for x in out)
    brands = Counter(x["brand"] for x in out)
    print(f"✅ {len(out)} TV disimpan ke {dst}")
    print("Tahun:", dict(sorted(years.items(), key=lambda kv: str(kv[0]), reverse=True)[:10]))
    print("Panel:", dict(panels.most_common()))
    print("Brand teratas:", brands.most_common(12))

if __name__ == "__main__":
    main()
