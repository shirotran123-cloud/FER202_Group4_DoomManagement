"""
Chuẩn hoá ảnh tour về đúng tỉ lệ khung hiển thị.

VÌ SAO CẦN:
Khung tour dùng `object-cover` ở tỉ lệ 16:9, nên ảnh có tỉ lệ khác sẽ bị trình
duyệt tự cắt — và nó cắt vào giữa, có thể làm mất cửa phòng hoặc mép hành lang.
Cắt sẵn ở đây để kiểm soát được cắt bao nhiêu và cắt phía nào.

CÁCH DÙNG:
    python scripts/prepare-tour-image.py <nguồn> <đích> [--ratio 1.7778] [--width 1920] [--bias 0]

  --ratio  Tỉ lệ rộng/cao mong muốn. Mặc định 16:9.
  --width  Chiều rộng đầu ra. Mặc định 1920.
  --bias   Lệch tâm khi cắt dọc: -1 cắt sát trên, 0 cắt giữa, 1 cắt sát dưới.
           Dùng khi chủ thể không nằm giữa ảnh.

Ví dụ:
    python scripts/prepare-tour-image.py anh-goc.jpg public/assets/dorm-tour/corridor-hallway.jpg
"""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Thiếu Pillow. Cài bằng: pip install Pillow")

# Console Windows mặc định là cp1252 nên in tiếng Việt sẽ lỗi UnicodeEncodeError.
# Ép stdout/stderr sang UTF-8 để script chạy được trên mọi máy.
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass


def main() -> int:
    parser = argparse.ArgumentParser(description="Cắt ảnh về đúng tỉ lệ khung.")
    parser.add_argument("source", help="Đường dẫn ảnh nguồn")
    parser.add_argument("dest", help="Đường dẫn ảnh đích")
    parser.add_argument("--ratio", type=float, default=16 / 9, help="Tỉ lệ rộng/cao (mặc định 16:9)")
    parser.add_argument("--width", type=int, default=1920, help="Chiều rộng đầu ra (mặc định 1920)")
    parser.add_argument("--bias", type=float, default=0.0, help="-1 cắt sát trên, 0 giữa, 1 sát dưới")
    parser.add_argument("--quality", type=int, default=88, help="Chất lượng JPEG (mặc định 88)")
    args = parser.parse_args()

    src = Path(args.source)
    if not src.exists():
        sys.exit(f"Không có file nguồn: {src}")

    img = Image.open(src)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    w, h = img.size
    src_ratio = w / h
    print(f"Nguồn : {w}x{h} · tỉ lệ {src_ratio:.4f} · {src.stat().st_size / 1024:.1f} KB")

    target = args.ratio
    if abs(src_ratio - target) < 0.005:
        print("Đã đúng tỉ lệ, chỉ cần đổi kích thước.")
        crop_box = (0, 0, w, h)
    elif src_ratio > target:
        # Ảnh quá rộng -> cắt hai bên.
        new_w = int(round(h * target))
        left = (w - new_w) // 2
        crop_box = (left, 0, left + new_w, h)
        print(f"Cắt ngang: bỏ {w - new_w}px chiều rộng ({left}px mỗi bên)")
    else:
        # Ảnh quá cao -> cắt trên/dưới, chia theo --bias.
        new_h = int(round(w / target))
        extra = h - new_h
        bias = max(-1.0, min(1.0, args.bias))
        # bias = -1 -> lấy sát trên (top = 0); bias = 1 -> sát dưới (top = extra).
        top = int(round(extra * (bias + 1) / 2))
        top = max(0, min(extra, top))
        crop_box = (0, top, w, top + new_h)
        print(f"Cắt dọc: bỏ {extra}px chiều cao ({top}px phía trên, {extra - top}px phía dưới)")

    img = img.crop(crop_box)

    # Đổi về chiều rộng đích, giữ đúng tỉ lệ.
    if img.width != args.width:
        out_h = int(round(args.width / target))
        img = img.resize((args.width, out_h), Image.LANCZOS)

    dest = Path(args.dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=args.quality, optimize=True, progressive=True)

    print(f"Đích  : {img.width}x{img.height} · tỉ lệ {img.width / img.height:.4f} · {dest.stat().st_size / 1024:.1f} KB")
    print(f"        {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
