import os
import sys
import subprocess
import json
import shutil
from PIL import Image, ExifTags

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".mp3",
    ".wav",
    ".ogg"
}

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg"}


def print_image_metadata(path):
    print(f"\n--- IMAGE METADATA: {path} ---")

    try:
        with Image.open(path) as img:

            exif = img.getexif()
            if exif:
                print("EXIF:")
                for tag_id, value in exif.items():
                    tag = ExifTags.TAGS.get(tag_id, tag_id)
                    print(f"  {tag}: {value}")
            else:
                print("EXIF: none")

            if img.info:
                print("INFO CHUNKS:")
                for k, v in img.info.items():
                    if isinstance(v, bytes):
                        print(f"  {k}: <{len(v)} bytes>")
                    else:
                        print(f"  {k}: {v}")
            else:
                print("INFO CHUNKS: none")

    except Exception as e:
        print(f"metadata read error: {e}")


def print_audio_metadata(path):
    print(f"\n--- AUDIO METADATA: {path} ---")

    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        path
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)

        if not result.stdout:
            print("no metadata found")
            return

        data = json.loads(result.stdout)

        if "format" in data and "tags" in data["format"]:
            print("FORMAT TAGS:")
            for k, v in data["format"]["tags"].items():
                print(f"  {k}: {v}")

        if "streams" in data:
            for stream in data["streams"]:
                if "tags" in stream:
                    print("STREAM TAGS:")
                    for k, v in stream["tags"].items():
                        print(f"  {k}: {v}")

    except Exception as e:
        print(f"metadata read error: {e}")


def strip_image_metadata(src, dst):
    try:
        with Image.open(src) as img:

            if img.format == "PNG":
                img.save(dst, pnginfo=None, optimize=True)

            elif img.format == "JPEG":
                img.save(
                    dst,
                    quality="keep",
                    subsampling="keep",
                    optimize=True
                )
            else:
                shutil.copy2(src, dst)
                return

        print(f"cleaned image -> {dst}")

    except Exception as e:
        print(f"failed image {src}: {e}")
        shutil.copy2(src, dst)


def strip_audio_metadata(src, dst):

    base, ext = os.path.splitext(dst)

    if ext.lower() == ".ogg":
        tmp = base + "_tmp.ogg"

        cmd = [
            "ffmpeg",
            "-y",
            "-i", src,
            "-map_metadata", "-1",
            "-vn",
            "-c:a", "copy",
            tmp
        ]

    else:
        dst = base + ".ogg"
        tmp = base + "_tmp.ogg"

        cmd = [
            "ffmpeg",
            "-y",
            "-i", src,
            "-map_metadata", "-1",
            "-vn",
            "-c:a", "libvorbis",
            "-q:a", "0",
            tmp
        ]

    try:
        subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

        os.replace(tmp, dst)
        print(f"processed audio -> {dst}")

    except Exception as e:
        print(f"failed audio {src}: {e}")

        if os.path.exists(tmp):
            os.remove(tmp)

        print(f"audio conversion failed, skipping: {src}")


def process_directory(input_dir, output_dir):

    for root, _, files in os.walk(input_dir):

        rel_path = os.path.relpath(root, input_dir)
        target_dir = os.path.join(output_dir, rel_path)

        os.makedirs(target_dir, exist_ok=True)

        for file in files:

            ext = os.path.splitext(file)[1].lower()

            if ext not in SUPPORTED_EXTENSIONS:
                continue

            src = os.path.join(root, file)
            dst = os.path.join(target_dir, file)

            if ext in IMAGE_EXTENSIONS:
                print_image_metadata(src)
                strip_image_metadata(src, dst)

            elif ext in AUDIO_EXTENSIONS:
                print_audio_metadata(src)
                strip_audio_metadata(src, dst)


if __name__ == "__main__":

    if len(sys.argv) != 3:
        print("usage: python removeFileData.py <input_directory> <output_directory>")
        sys.exit(1)

    input_dir = sys.argv[1]
    output_dir = sys.argv[2]

    process_directory(input_dir, output_dir)