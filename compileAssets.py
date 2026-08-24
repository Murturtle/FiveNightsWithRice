import os
import base64
import mimetypes
import sys

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".mp3",
    ".wav",
    ".ogg"
}

def to_camel_case(name: str) -> str:
    parts = name.replace("-", "_").split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])

def file_to_data_url(path: str) -> str:
    mime_type, _ = mimetypes.guess_type(path)
    if not mime_type:
        raise ValueError(f"Unknown MIME type for {path}")

    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")

    return f"data:{mime_type};base64,{encoded}"

def generate_ts(directory: str):
    image_entries = []
    sound_entries = []

    for root, _, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            full_path = os.path.join(root, file)
            key_name = to_camel_case(os.path.splitext(file)[0])
            data_url = file_to_data_url(full_path)

            entry = f'        "{key_name}": "{data_url}"'

            if ext in [".png", ".jpg", ".jpeg"]:
                image_entries.append(entry)
            else:
                sound_entries.append(entry)

    lines = []
    lines.append("export class AssetStore {")
    lines.append("    public static images: { [key: string]: string } = {")
    lines.append(",\n".join(image_entries))
    lines.append("    };")
    lines.append("")
    lines.append("    public static sounds: { [key: string]: string } = {")
    lines.append(",\n".join(sound_entries))
    lines.append("    };")
    lines.append("}")

    with open("./src/assetStore.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print("wrote to ./src/assetStore.ts")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("directory is arg 2")
        sys.exit(1)

    generate_ts(sys.argv[1])