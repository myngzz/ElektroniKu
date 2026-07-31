#!/usr/bin/env python3
"""Parse dataset GSMArena terbaru (i-debug/GSMArena-Scrape, JSON per brand)
menjadi JSON siap import. Fokus HP baru (default >= 2022)."""
import glob
import json
import re
import sys

SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/gsm-new"
OUT = sys.argv[2] if len(sys.argv) > 2 else "backend/gsmarena-new-products.json"
MIN_YEAR = int(sys.argv[3]) if len(sys.argv) > 3 else 2022

BRAND_MAP = {"iphone": "Apple", "pixel": "Google", "transsion": None}  # transsion: pakai kata pertama nama

def num(pattern, text, cast=int):
    m = re.search(pattern, text or "", re.I)
    return cast(m.group(1)) if m else None

def price_idr(text):
    """'$ 629.27 / C$ 999.00 / £ 636.00 / € 754.00' -> IDR dari USD/EUR."""
    if not text:
        return None
    m = re.search(r"\$\s*([\d,]+(?:\.\d+)?)", text.replace("\u2009", " "))
    rate = 16000
    if not m:
        m = re.search(r"\u20ac\s*([\d,]+(?:\.\d+)?)", text.replace("\u2009", " "))
        rate = 18000
    if not m:
        return None
    return round(float(m.group(1).replace(",", "")) * rate / 10000) * 10000

def img_url(page_url):
    """https://www.gsmarena.com/apple_iphone_17-14050.php -> slug bigpic CDN."""
    m = re.search(r"gsmarena\.com/([a-z0-9_().+-]+)-\d+\.php", page_url or "")
    if not m:
        return None
    slug = m.group(1).replace("_", "-").replace("(", "").replace(")", "").replace("+", "-plus").replace("--", "-")
    return f"https://fdn2.gsmarena.com/vv/bigpic/{slug}.jpg"

out, seen = [], set()
for f in sorted(glob.glob(f"{SRC_DIR}/*.json")):
    fname = f.rsplit("/", 1)[-1].replace(".json", "").replace("_phones", "")
    for p in json.load(open(f)):
        s = p.get("specifications", {})
        launch, body, disp = s.get("LAUNCH", {}), s.get("BODY", {}), s.get("DISPLAY", {})
        plat, mem, batt, misc = s.get("PLATFORM", {}), s.get("MEMORY", {}), s.get("BATTERY", {}), s.get("MISC", {})
        cam = s.get("MAIN CAMERA", {})
        name = (p.get("full_name") or p.get("name") or "").strip()
        if not name or name.lower() in seen:
            continue

        year = num(r"(20\d\d)", launch.get("Announced", ""))
        if not year or year < MIN_YEAR:
            continue
        if "Cancelled" in launch.get("Status", ""):
            continue

        price = price_idr(misc.get("Price", ""))
        chipset = (plat.get("Chipset") or "").strip()
        internal = mem.get("Internal", "")
        ram = num(r"(\d+)GB RAM", internal)
        storage = num(r"(\d+)(?:GB|TB)", internal)
        if "TB" in (re.search(r"\d+(GB|TB)", internal or "") or [""])[0] if False else False:
            pass
        m_tb = re.match(r"(\d+)TB", internal or "")
        if m_tb:
            storage = int(m_tb.group(1)) * 1024
        batt_mah = num(r"(\d{4,5})\s*mAh", batt.get("Type", ""))
        size_in = num(r"([\d.]+)\s*inches", disp.get("Size", ""), float)
        cam_mp = num(r"(\d+(?:\.\d+)?)\s*MP", cam.get("Single") or cam.get("Dual") or cam.get("Triple") or cam.get("Quad") or "", float)
        image = img_url(p.get("url"))

        if not (chipset and ram and storage and batt_mah and price and image):
            continue
        seen.add(name.lower())

        brand = BRAND_MAP.get(fname, fname.title())
        if brand is None:
            brand = name.split()[0]

        specs = {
            "cpu": chipset,
            "ram": str(ram),
            "storage": str(storage),
            "battery": str(batt_mah),
            "os": (plat.get("OS") or "-").strip(),
            "network": "5G" if s.get("NETWORK", {}).get("5G bands") else "4G LTE",
            "nfc": "Ya" if str(s.get("COMMS", {}).get("NFC", "")).lower().startswith("yes") else "Tidak",
            "released": str(year),
        }
        if size_in:
            specs["display"] = f'{size_in}" {disp.get("Type", "").split(",")[0]}'.strip()
        if cam_mp:
            specs["camera"] = str(int(cam_mp))
        m_res = re.search(r"(\d+ x \d+)", disp.get("Resolution", ""))
        if m_res:
            specs["resolution"] = m_res.group(1)
        m_w = re.search(r"([\d.]+)\s*g", body.get("Weight", ""))
        if m_w:
            specs["weight"] = f"{float(m_w.group(1)):g}g"

        out.append({
            "name": name[:200],
            "brand": brand,
            "price": max(price, 500000),
            "year": year,
            "image": image,
            "specs": specs,
            "description": (
                f"{name} dirilis tahun {year} dengan chipset {chipset}, RAM {ram}GB, "
                f"dan penyimpanan {storage}GB. Baterai {batt_mah}mAh"
                + (f', layar {specs["display"]}' if size_in else "")
                + (f", kamera {int(cam_mp)}MP" if cam_mp else "")
                + f". Menjalankan {specs['os']}. Data spesifikasi bersumber dari GSMArena."
            ),
        })

out.sort(key=lambda x: -x["year"])
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
from collections import Counter
print(f"✅ {len(out)} HP (>= {MIN_YEAR}) ditulis ke {OUT}")
print("per tahun:", dict(sorted(Counter(p['year'] for p in out).items())))
print("per brand:", Counter(p['brand'] for p in out).most_common())
