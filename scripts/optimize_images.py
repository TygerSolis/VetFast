#!/usr/bin/env python3
"""Convert referenced PNG assets to WebP and update all text references.

Safe to run repeatedly. It first fixes references for WebP files that already
exist, then converts any remaining referenced PNG files one by one.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTENSIONS = {".html", ".js", ".css", ".json", ".md", ".xml", ".txt"}

def text_files():
    for path in ROOT.rglob("*"):
        if path.is_file() and ".git" not in path.parts and path.suffix.lower() in TEXT_EXTENSIONS:
            try:
                yield path
            except OSError:
                continue

def convert_png(source: Path, target: Path) -> None:
    with Image.open(source) as image:
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(target, "WEBP", quality=82, method=6)

def main():
    asset_dir = ROOT / "assets"
    files = list(text_files())
    replacements = {}

    # Repair references for WebP assets that were already generated.
    for webp in asset_dir.rglob("*.webp"):
        source = webp.with_suffix(".png")
        if source.exists():
            replacements[source.relative_to(ROOT).as_posix()] = webp.relative_to(ROOT).as_posix()
        else:
            # The PNG may already be gone; if a corresponding WebP exists,
            # existing references can still be safely migrated.
            replacements[source.relative_to(ROOT).as_posix()] = webp.relative_to(ROOT).as_posix()

    updated = 0
    for path in files:
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            new_content = new_content.replace(f"./{old}", new)
        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            updated += 1

    # Convert any PNG assets that remain in the repository.
    converted = 0
    for source in sorted(asset_dir.rglob("*.png")):
        rel = source.relative_to(ROOT).as_posix()
        target = source.with_suffix(".webp")
        if target.exists():
            source.unlink()
            continue

        try:
            convert_png(source, target)
        except Exception as exc:
            print(f"Skipping {rel}: {exc}")
            continue

        old = rel
        new = target.relative_to(ROOT).as_posix()
        for path in files:
            try:
                content = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            new_content = content.replace(old, new).replace(f"./{old}", new)
            if new_content != content:
                path.write_text(new_content, encoding="utf-8")
        source.unlink()
        converted += 1
        print(f"Converted {old} -> {new}")

    print(f"Updated references in {updated} text files; converted {converted} PNG assets.")

if __name__ == "__main__":
    main()
