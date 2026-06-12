"""Genera los mipmaps de Android a partir de icon-512.png.
Lo usa el workflow de GitHub Actions para no tener codigo embebido en YAML.
"""
import os
import sys
from PIL import Image

src_path = 'dist/assets/icon/icon-512.png'
if not os.path.exists(src_path):
    print(f'ERROR: {src_path} no existe')
    sys.exit(1)

src = Image.open(src_path)
sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

for d, s in sizes.items():
    out_dir = f'android/app/src/main/res/mipmap-{d}'
    os.makedirs(out_dir, exist_ok=True)
    img = src.resize((s, s), Image.LANCZOS)
    img.save(f'{out_dir}/ic_launcher.png')
    img.save(f'{out_dir}/ic_launcher_round.png')
    print(f'Generado {d} {s}x{s}')

print('OK')
