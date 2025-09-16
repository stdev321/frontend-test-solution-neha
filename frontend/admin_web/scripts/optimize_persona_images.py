"""
Requirements:
    pip install pillow

Usage:
    python scripts/optimize_persona_images.py

This script processes all PNG images in frontend/public/persona_images (ignoring subfolders).
For each _high.png image, it creates:
    1. A medium version (256x256px, suffix: _medium.png)
    2. A tiny version (96x96px, suffix: _tiny.png)
"""
import os
from PIL import Image

# Config
IMAGE_DIR = "frontend/public/persona_images"
MEDIUM_SIZE = (256, 256)
TINY_SIZE = (96, 96)
HIGH_SUFFIX = "_high.png"
MEDIUM_SUFFIX = "_medium.png"
TINY_SUFFIX = "_tiny.png"

# Ignore subfolders
def is_png_file(filename):
    return filename.lower().endswith('.png')

def main():
    for fname in os.listdir(IMAGE_DIR):
        fpath = os.path.join(IMAGE_DIR, fname)
        if not os.path.isfile(fpath):
            continue
        if not is_png_file(fname):
            continue
        # Only process _high.png files
        if not fname.endswith(HIGH_SUFFIX):
            continue
        # Skip if already processed (medium and tiny versions)
        if fname.endswith(MEDIUM_SUFFIX) or fname.endswith(TINY_SUFFIX):
            continue
        try:
            with Image.open(fpath) as img:
                base_name = fname[:-len(HIGH_SUFFIX)]  # Remove _high.png suffix
                
                # 1. Medium version (256x256)
                medium = img.copy()
                medium.thumbnail(MEDIUM_SIZE)
                medium_path = os.path.join(
                    IMAGE_DIR, base_name + MEDIUM_SUFFIX)
                medium.save(medium_path, optimize=True, quality=85)

                # 2. Tiny version (96x96)
                tiny = img.copy()
                tiny.thumbnail(TINY_SIZE)
                tiny_path = os.path.join(
                    IMAGE_DIR, base_name + TINY_SUFFIX)
                tiny.save(tiny_path, optimize=True, quality=70)

                print(f"Processed: {fname}")
        except Exception as e:
            print(f"Error processing {fname}: {e}")

if __name__ == "__main__":
    main() 