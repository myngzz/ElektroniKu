#!/usr/bin/env python3
"""Parse dataset CSV GSMArena (foykes/gsm-arena-dataset) menjadi JSON bersih untuk import."""
import ast
import csv
import json
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/gsmarena.csv"
OUT = sys.argv[2] if len(sys.argv) > 2 else "backend/gsmarena-products.json"
LIMIT = int(sys.argv[3]) if len(sys.argv) > 3 else 500

def clean(v):
    """Nilai CSV berupa repr bytes Python: b'...' -> string utf-8."""
    if not v:
        return ""
    v = v.strip()
    if v.startswith(("b'", 'b"')):
        try:
            return ast.literal_eval(v).decode("utf-8", "replace").strip()
        except Exception:
            return v[2:-1].strip()
    return v

def num(pattern, text, cast=int):
    m = re.search(pattern, text or "")
    return cast(m.group(1)) if m else None

def parse_price_idr(text):
    """'About 130 EUR' / '$ 199.99' / 'About 250 USD' -> IDR."""
    if not text:
        return None
    rates = {"EUR": 18000, "USD": 16000, "GBP": 21000, "INR": 195}
    m = re.search(r"(?:About\s+)?([\d,.]+)\s*(EUR|USD|GBP|INR)", text)
    if m:
        val = float(m.group(1).replace(",", ""))
        return round(val * rates[m.group(2)] / 10000) * 10000
    m = re.search(r"\$\s*([\d,.]+)", text)
    if m:
        return round(float(m.group(1).replace(",", "")) * rates["USD"] / 10000) * 10000
    return None

def parse_year(text):
    m = re.search(r"(19|20)\d{2}", text or "")
    return int(m.group(0)) if m else None

products, seen = [], set()
with open(SRC, newline="", encoding="utf-8", errors="replace") as f:
    rows = list(csv.DictReader(f))

# Urutkan terbaru dulu supaya limit mengambil HP paling baru
rows.sort(key=lambda r: parse_year(clean(r.get("Announced"))) or 0, reverse=True)

for r in rows:
    if len(products) >= LIMIT:
        break
    brand = clean(r.get("Brand")).title()
    name = clean(r.get("Model Name"))
    image = clean(r.get("Model Image"))
    if not brand or not name or name.lower() in seen:
        continue

    chipset = clean(r.get("Chipset"))
    internal = clean(r.get("Internal"))       # "64GB 4GB RAM, 128GB 4GB RAM"
    battery = clean(r.get("Type_1"))          # "Li-Po 5000 mAh, ..."
    disp_type = clean(r.get("Type"))          # "IPS LCD, 450 nits"
    disp_size = clean(r.get("Size"))          # "6.67 inches, ..."
    resolution = clean(r.get("Resolution"))
    os_ = clean(r.get("OS"))
    cam = clean(r.get("Single")) or clean(r.get("Triple")) or clean(r.get("Quad")) or clean(r.get("Dual"))
    year = parse_year(clean(r.get("Announced")))
    price = parse_price_idr(clean(r.get("Price")))

    storage = num(r"(\d+)GB", internal)
    ram = num(r"(\d+)GB RAM", internal)
    batt_mah = num(r"(\d+)\s*mAh", battery)
    cam_mp = num(r"(\d+(?:\.\d+)?)\s*MP", cam, float)
    size_in = num(r"([\d.]+)\s*inches", disp_size, float)

    # Hanya ambil baris dengan data inti lengkap
    if not (chipset and ram and storage and batt_mah and price and year and year >= 2016):
        continue

    seen.add(name.lower())
    specs = {
        "cpu": chipset,
        "ram": str(ram),
        "storage": str(storage),
        "battery": str(batt_mah),
        "display": f'{size_in}" {disp_type.split(",")[0]}' if size_in else disp_type.split(",")[0],
        "os": os_ or "-",
        "network": "5G" if clean(r.get("5G bands")) else ("4G LTE" if clean(r.get("4G bands")) else "3G"),
        "nfc": "Ya" if clean(r.get("NFC")).lower().startswith("yes") else "Tidak",
        "released": str(year),
    }
    if cam_mp:
        specs["camera"] = str(int(cam_mp))
    if resolution:
        m = re.search(r"(\d+ x \d+)", resolution)
        if m:
            specs["resolution"] = m.group(1)
    weight = num(r"(\d+(?:\.\d+)?)\s*g", clean(r.get("Weight")), float)
    if weight:
        specs["weight"] = f"{weight:g}g"

    products.append({
        "name": name,
        "brand": brand,
        "price": max(price, 500000),
        "year": year,
        "image": image if image.startswith("http") else None,
        "specs": specs,
        "description": (
            f"{name} dirilis tahun {year} dengan chipset {chipset}, RAM {ram}GB, "
            f"dan penyimpanan {storage}GB. Baterai {batt_mah}mAh"
            + (f', layar {specs["display"]}' if size_in else "")
            + (f', kamera {int(cam_mp)}MP' if cam_mp else "")
            + f". Menjalankan {os_ or 'OS bawaan'}. Data spesifikasi bersumber dari GSMArena."
        ),
    })

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=1)
print(f"✅ {len(products)} produk ditulis ke {OUT}")
