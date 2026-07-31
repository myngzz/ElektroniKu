#!/usr/bin/env python3
"""Parse /tmp/amazon-headphones.jsonl -> backend/amazon-headphones.json siap import.
Filter aksesori (case/earpads/kabel dll), ekstrak spesifikasi, konversi USD->IDR,
urutkan terbaru+terpopuler. Usage: python3 parse-amazon-headphones.py <in> <out> [limit]
"""
import json
import re
import sys

USD_IDR = 16000

ACCESSORY_RE = re.compile(
    r"\b(case|cases|cover|covers|skin|sleeve|pouch|bag|tips|ear ?pads?|earpads?|"
    r"cushions?|foam|replacement|repair|parts?|cable|cord|wire|adapter|splitter|"
    r"stand|holder|hanger|hook|mount|strap|keychain|lanyard|protector|charger|"
    r"charging dock|cleaning|cleaner|sticker|decal|attachment|extension|clips?|"
    r"renewed|refurbished|repl\.)\b",
    re.IGNORECASE,
)
BAD_STORES = {"generic", "amazon renewed", "geekria", "art-strap", "nickston",
              "alxcd", "defean", "yunyiyi", "ydybzb", "unknown"}

FORM_MAP = [
    (re.compile(r"true wireless|earbud|airpod", re.I), "True Wireless Earbuds"),
    (re.compile(r"in[- ]?ear|earphone|ear ?phone", re.I), "In-Ear"),
    (re.compile(r"over[- ]?ear", re.I), "Over-Ear"),
    (re.compile(r"on[- ]?ear", re.I), "On-Ear"),
    (re.compile(r"neckband", re.I), "Neckband"),
    (re.compile(r"bone conduction", re.I), "Bone Conduction"),
    (re.compile(r"headset|gaming", re.I), "Headset"),
]

def short_name(title):
    t = re.sub(r"\s+", " ", title).strip()
    for sep in [",", " - ", " – ", " | ", " with ", " With "]:
        idx = t.find(sep)
        if 12 <= idx <= 90:
            return t[:idx].strip()
    return t[:90].rstrip(" -,")

def year_of(details):
    m = re.search(r"(20\d\d)", details.get("Date First Available", ""))
    return int(m.group(1)) if m else None

def detect_form(p, text):
    ff = p["details"].get("Form Factor", "")
    for rx, label in FORM_MAP:
        if rx.search(ff) or rx.search(text):
            return label
    return "Headphone"

def main():
    src, dst = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 1000

    out, seen = [], set()
    with open(src) as f:
        for line in f:
            p = json.loads(line)
            title, store = p["title"], (p.get("store") or "").strip()
            if not store or store.lower() in BAD_STORES:
                continue
            if ACCESSORY_RE.search(title):
                continue
            try:
                usd = float(p["price"])
            except (TypeError, ValueError):
                continue
            if not 8 <= usd <= 1500:
                continue
            if (p.get("rating_count") or 0) < 10:
                continue

            d = p["details"]
            text = f"{title} {' '.join(p.get('features') or [])}"
            form = detect_form(p, text)
            year = year_of(d)

            name = short_name(title)
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)

            specs = {"Tipe": form}
            for src_key, label in [
                ("Connectivity Technology", "Konektivitas"),
                ("Noise Control", "Noise Control"),
                ("Color", "Warna"),
                ("Item Weight", "Berat"),
                ("Model Name", "Model"),
                ("Charging Time", "Waktu Pengisian"),
                ("Item model number", "Nomor Model"),
            ]:
                if d.get(src_key):
                    specs[label] = str(d[src_key])[:80]
            m = re.search(r"(\d{1,3})\s*(?:hours?|hrs?|h)\b.{0,20}(?:battery|playtime|play ?time)", text, re.I) \
                or re.search(r"(?:battery|playtime|play ?time).{0,25}?(\d{1,3})\s*(?:hours?|hrs?|h)\b", text, re.I)
            if m:
                specs["Baterai"] = f"{m.group(1)} jam"
            if re.search(r"\bANC\b|active noise cancel", text, re.I):
                specs.setdefault("Noise Control", "Active Noise Cancellation")
            if re.search(r"\bIPX?[4-8]\b", text):
                specs["Tahan Air"] = re.search(r"\bIPX?[4-8]\b", text).group(0)

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
                "tags": ["headphone", "amazon", store.lower(), form.lower().replace(" ", "-")],
            })

    out.sort(key=lambda x: (-(x["year"] or 0), -x["rating_count"]))
    out = out[:limit]

    with open(dst, "w") as f:
        json.dump(out, f, ensure_ascii=False)

    from collections import Counter
    years = Counter(x["year"] for x in out)
    forms = Counter(x["form"] for x in out)
    brands = Counter(x["brand"] for x in out)
    print(f"✅ {len(out)} headphone/earphone disimpan ke {dst}")
    print("Tahun:", dict(sorted(years.items(), key=lambda kv: str(kv[0]), reverse=True)[:8]))
    print("Tipe:", dict(forms.most_common()))
    print("Brand teratas:", brands.most_common(12))

if __name__ == "__main__":
    main()
