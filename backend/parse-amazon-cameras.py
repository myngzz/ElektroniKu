#!/usr/bin/env python3
"""Parse /tmp/amazon-cameras.jsonl -> backend/amazon-cameras.json siap import.
Filter aksesori/refill film, ekstrak spesifikasi, USD->IDR, urutkan terbaru+terpopuler.
Usage: python3 parse-amazon-cameras.py <in> <out> [limit]
"""
import json
import re
import sys

USD_IDR = 16000

ACCESSORY_RE = re.compile(
    r"\b(film pack|instant film|film twin|sheets?|zink paper|photo paper|refill|"
    r"case|bag|strap|tripod|batter(y|ies)|charger|lens cap|lens only|adapter|"
    r"mount|cable|memory card|sd card|cleaning|kit only|albums?|frames?|stickers?|"
    r"renewed|refurbished|single[- ]use|disposable)\b",
    re.IGNORECASE,
)
BAD_STORES = {"amazon renewed", "generic", "unknown", ""}

FORM_MAP = [
    ("dslr cameras", "DSLR"), ("slr cameras", "DSLR"),
    ("mirrorless cameras", "Mirrorless"),
    ("sports & action video cameras", "Action Camera"),
    ("instant cameras", "Kamera Instan"),
    ("camcorders", "Camcorder"),
    ("point & shoot digital cameras", "Point & Shoot"),
    ("digital cameras", "Kamera Digital"),
    ("film cameras", "Kamera Film"),
    ("medium & large-format cameras", "Medium Format"),
]

def short_name(title):
    t = re.sub(r"\s+", " ", title).strip()
    for sep in [",", " - ", " – ", " | ", " with ", " With ", " w/"]:
        idx = t.find(sep)
        if 12 <= idx <= 90:
            return t[:idx].strip()
    return t[:90].rstrip(" -,")

def main():
    src, dst = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 800

    out, seen = [], set()
    with open(src) as f:
        for line in f:
            p = json.loads(line)
            title, store = p["title"], (p.get("store") or "").strip()
            if store.lower() in BAD_STORES:
                continue
            if ACCESSORY_RE.search(title):
                continue
            try:
                usd = float(p["price"])
            except (TypeError, ValueError):
                continue
            if not 25 <= usd <= 8000:
                continue
            if (p.get("rating_count") or 0) < 10:
                continue

            cats = [c.lower() for c in (p.get("categories") or [])]
            form = next((label for key, label in FORM_MAP if any(key in c for c in cats)), "Kamera Digital")

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

            specs = {"Tipe": form}
            for src_key, label in [
                ("Video Capture Resolution", "Resolusi Video"),
                ("Optical Zoom", "Zoom Optik"),
                ("Image Stabilization", "Stabilisasi"),
                ("Connectivity Technology", "Konektivitas"),
                ("Color", "Warna"),
                ("Item Weight", "Berat"),
                ("Item model number", "Nomor Model"),
            ]:
                if d.get(src_key):
                    specs[label] = str(d[src_key])[:80]
            m = re.search(r"(\d{1,3}(?:\.\d)?)\s*(?:MP|megapixels?)", text, re.I)
            if m:
                specs["Resolusi"] = f"{m.group(1)} MP"
            if re.search(r"\b4K\b", text) and "Resolusi Video" not in specs:
                specs["Resolusi Video"] = "4K"
            m = re.search(r"\b(\d{1,3})x\s*(?:optical )?zoom", text, re.I)
            if m and "Zoom Optik" not in specs:
                specs["Zoom Optik"] = f"{m.group(1)}x"
            if re.search(r"waterproof|water[- ]resistant", text, re.I):
                specs["Tahan Air"] = "Ya"

            desc = (p.get("description") or " | ".join((p.get("features") or [])[:4]))[:900]
            if not desc:
                desc = f"{name} dari {store}."

            out.append({
                "name": name,
                "brand": store,
                "price": round(usd * USD_IDR / 10000) * 10000,
                "asin": p["asin"],
                "year": year,
                "form": form,
                "specs": specs,
                "description": desc,
                "images": p["images"][:3],
                "rating": p.get("rating"),
                "rating_count": p.get("rating_count") or 0,
                "tags": ["kamera", "amazon", store.lower(), form.lower().replace(" ", "-").replace("&", "dan")],
            })

    out.sort(key=lambda x: (-(x["year"] or 0), -x["rating_count"]))

    # kuota per tipe agar camcorder generik tidak mendominasi katalog
    FORM_CAP = {"Camcorder": 120, "Action Camera": 150, "Kamera Film": 40}
    counts, balanced = {}, []
    for x in out:
        cap = FORM_CAP.get(x["form"], limit)
        if counts.get(x["form"], 0) >= cap:
            continue
        counts[x["form"]] = counts.get(x["form"], 0) + 1
        balanced.append(x)
    out = balanced[:limit]

    with open(dst, "w") as f:
        json.dump(out, f, ensure_ascii=False)

    from collections import Counter
    years = Counter(x["year"] for x in out)
    forms = Counter(x["form"] for x in out)
    brands = Counter(x["brand"] for x in out)
    print(f"✅ {len(out)} kamera disimpan ke {dst}")
    print("Tahun:", dict(sorted(years.items(), key=lambda kv: str(kv[0]), reverse=True)[:10]))
    print("Tipe:", dict(forms.most_common()))
    print("Brand teratas:", brands.most_common(12))

if __name__ == "__main__":
    main()
