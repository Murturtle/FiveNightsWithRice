import os
import re
import base64
import mimetypes
import sys

MIME_EXTENSION_MAP = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg"
}

DATA_URL_PATTERN = re.compile(
    r'"(?P<key>[^"]+)":\s*"data:(?P<mime>[^;]+);base64,(?P<data>[^"]+)"'
)

def camel_to_filename(name: str) -> str:
    return name

def decode_assets(ts_file: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

    with open(ts_file, "r", encoding="utf-8") as f:
        content = f.read()

    matches = DATA_URL_PATTERN.finditer(content)

    for match in matches:
        key = match.group("key")
        mime = match.group("mime")
        data = match.group("data")

        if mime not in MIME_EXTENSION_MAP:
            print(f"Skipping unknown MIME type: {mime}")
            continue

        ext = MIME_EXTENSION_MAP[mime]
        filename = camel_to_filename(key) + ext
        output_path = os.path.join(output_dir, filename)

        binary = base64.b64decode(data)

        with open(output_path, "wb") as out:
            out.write(binary)

        print(f"wrote {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("usage: python extract_assets.py <assetStore.ts> <output_dir>")
        sys.exit(1)

    decode_assets(sys.argv[1], sys.argv[2])