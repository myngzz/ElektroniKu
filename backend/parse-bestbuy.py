#!/usr/bin/env python3
"""Filter laptop asli dari dataset terbuka Best Buy menjadi JSON siap import."""
import json
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/bestbuy.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "backend/bestbuy-laptops.json"
USD_IDR = 16000

LAPTOP_CATS = {"Laptops", "PC Laptops", "MacBooks", "2 in 1 Laptops", "Chromebooks", "Gaming Laptops"}

def num(pattern, text, cast=str):
    m = re.search(pattern, text or "", re.I)
    return cast(m.group(1)) if m else None

data = json.load(open(SRC))
out, seen = [], set()
for p in data:
    cats = [c["name"] for c in (p.get("category") or [])]
    if not any(c in LAPTOP_CATS for c in cats):
        continue
    name = (p.get("name") or "").replace("\u00ae", "").replace("\u2122", "").strip()
    brand = p.get("manufacturer") or name.split(" - ")[0]
    price = p.get("price")
    image = p.get("image")
    if not name or not price or not image or name.lower() in seen:
        continue
    seen.add(name.lower())

    blob = f"{name} {p.get('description') or ''}"
    ram = num(r"(\d+)\s*GB\s+(?:Memory|RAM)", blob)
    storage_gb = num(r"(\d+)\s*GB\s+(?:Storage|SSD|Solid State|Flash|eMMC|Hard)", blob)
    storage_tb = num(r"(\d+)\s*TB\s+(?:Storage|SSD|Solid State|Hard)", blob)
    display = num(r'(\d{2}(?:\.\d)?)"', blob)
    cpu = num(r"(Intel\s+(?:Core\s+)?[A-Za-z0-9\s\-]{2,25}?processor|Intel Core (?:i[3579]|M)|AMD [A-Za-z0-9\s\-]{2,20}?processor|Apple M\d)", blob)

    specs = {"brand": brand}
    if cpu: specs["cpu"] = re.sub(r"\s*processor\s*$", "", cpu, flags=re.I).strip()
    if ram: specs["ram"] = ram
    if storage_gb: specs["storage"] = storage_gb
    elif storage_tb: specs["storage"] = str(int(storage_tb) * 1024)
    if display: specs["display"] = f'{display}"'
    if "Chromebooks" in cats: specs["os"] = "Chrome OS"
    elif "MacBooks" in cats or brand == "Apple": specs["os"] = "macOS"
    else: specs["os"] = "Windows"
    if "Refurbished Laptops" in cats: specs["kondisi"] = "Refurbished Bersertifikat"

    desc = re.sub(r"&#\d+;", "", p.get("description") or "")
    out.append({
        "sku": p["sku"],
        "name": name[:200],
        "brand": brand,
        "price": round(price * USD_IDR / 10000) * 10000,
        "image": image,
        "specs": specs,
        "description": f"{name}. {desc}".strip()[:2000],
        "tags": ["laptop", "bestbuy", brand.lower()],
    })

json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print(f"✅ {len(out)} laptop ditulis ke {OUT}")
