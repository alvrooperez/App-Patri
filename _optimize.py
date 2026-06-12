"""
Optimiza las fotos de assets/pool/ -> assets/pool/_opt/
Las deja en tamano maximo 1600x1600 (suficiente para movil/retina) y JPEG q.82.
Crea tambien un manifest.json con los nombres para que la app los pueda listar.

USO: python _optimize.py
"""
import os
import json
import glob
from PIL import Image, ImageOps

POOL = r"C:\Users\aborb\.minimax-agent\projects\app-novia\assets\pool"
OUT = os.path.join(POOL, "_opt")
os.makedirs(OUT, exist_ok=True)

MAX_DIM = 1600
QUALITY = 82

results = []
total_in = 0
total_out = 0

extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.heic")
files = []
for ext in extensions:
    files.extend(glob.glob(os.path.join(POOL, ext)))

for f in sorted(files):
    name = os.path.basename(f)
    name_no_ext = os.path.splitext(name)[0]
    in_size = os.path.getsize(f)
    total_in += in_size

    try:
        img = Image.open(f)
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass
        if img.mode in ("RGBA", "P", "LA"):
            bg = Image.new("RGB", img.size, (255, 247, 244))
            if img.mode == "P":
                img = img.convert("RGBA")
            bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        w, h = img.size
        if w > MAX_DIM or h > MAX_DIM:
            if w >= h:
                new_w = MAX_DIM; new_h = round(h * MAX_DIM / w)
            else:
                new_h = MAX_DIM; new_w = round(w * MAX_DIM / h)
        else:
            new_w, new_h = w, h

        img = img.resize((new_w, new_h), Image.LANCZOS)
        out_path = os.path.join(OUT, f"{name_no_ext}.jpg")
        img.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        out_size = os.path.getsize(out_path)
        total_out += out_size

        img_thumb = img.copy()
        img_thumb.thumbnail((200, 200), Image.LANCZOS)
        thumb_path = os.path.join(OUT, f"{name_no_ext}_thumb.jpg")
        img_thumb.save(thumb_path, "JPEG", quality=70, optimize=True)

        results.append({
            "id": name_no_ext,
            "name": name,
            "src": f"assets/pool/_opt/{name_no_ext}.jpg",
            "thumb": f"assets/pool/_opt/{name_no_ext}_thumb.jpg",
            "width": new_w,
            "height": new_h,
            "origKb": round(in_size / 1024),
            "optKb": round(out_size / 1024),
        })
        print(f"  {name}: {round(in_size/1024)}KB -> {round(out_size/1024)}KB ({new_w}x{new_h})")
    except Exception as e:
        print(f"  ERROR con {name}: {e}")

with open(os.path.join(POOL, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump({"photos": results, "totalIn": total_in, "totalOut": total_out}, f, indent=2, ensure_ascii=False)

print(f"\nTotal: {round(total_in/1024/1024, 1)}MB -> {round(total_out/1024/1024, 1)}MB")
print(f"Manifest: {os.path.join(POOL, 'manifest.json')}")
print(f"Recarga index.html para ver los cambios")
