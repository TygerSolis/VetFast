#!/usr/bin/env python3
"""Convert referenced PNG assets to WebP and update text references.

Designed for static GitHub Pages projects. Only PNG files that are referenced
by repository text files are replaced and removed after a successful conversion.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTENSIONS = {".html", ".js", ".css", ".json", ".md", ".xml", ".txt"}

def read_text_files():
    for path in ROOT.rglob("*"):
        if path.is_file() and ".git" not in path.parts and path.suffix.lower() in TEXT_EXTENSIONS:
            try:
                yield path, path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue

def main():
    asset_dir = ROOT / "assets"
    pngs = sorted(asset_dir.rglob("*.png"))
    if not pngs:
        print("No PNG assets found.")
        return

    text_files = list(read_text_files())
    converted = 0

    for source in pngs:
        rel = source.relative_to(ROOT).as_posix()
        refs = [rel, f"./{rel}"]
        if not any(any(ref in content for ref in refs) for _, content in text_files):
            continue

        target = source.with_suffix(".webp")
        try:
            with Image.open(source) as image:
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
                image.save(target, "WEBP", quality=82, method=6)
        except Exception as exc:
            print(f"Skipping {rel}: {exc}")
            continue

        for path, content in text_files:
            updated = content
            for ref in refs:
                updated = updated.replace(ref, target.relative_to(ROOT).as_posix())
            if updated != content:
                path.write_text(updated, encoding="utf-8")

        source.unlink()
        converted += 1
        print(f"Converted {rel} -> {target.relative_to(ROOT).as_posix()}")

    print(f"Converted {converted} referenced PNG assets.")

if __name__ == "__main__":
    main()
