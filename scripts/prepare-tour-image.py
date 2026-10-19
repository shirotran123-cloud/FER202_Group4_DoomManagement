"""
Chuẩn hoá ảnh tour: cắt về đúng tỉ lệ khung, HOẶC chỉ đổi kích thước.

VÌ SAO CẦN:
Khung tour dùng `object-cover` ở tỉ lệ 16:9, nên ảnh có tỉ lệ khác sẽ bị trình
duyệt tự cắt — và nó cắt vào giữa, có thể làm mất chủ thể. Cắt sẵn ở đây để
kiểm soát được cắt bao nhiêu và cắt phía nào.

Với ảnh DỌC, cắt về 16:9 thường mất hơn nửa ảnh. Trường hợp đó nên dùng
`--fit` để giữ trọn ảnh và để giao diện tự xử lý (nền mờ phía sau).

CÁCH DÙNG:
    python scripts/prepare-tour-image.py <nguồn> <đích> [tuỳ chọn]

  --ratio   Tỉ lệ rộng/cao mong muốn. Mặc định 16:9.
  --width   Chiều rộng đầu ra. Mặc định 1920.
  --bias    Lệch tâm khi cắt dọc: -1 sát trên, 0 giữa, 1 sát dưới.
  --fit     KHÔNG cắt. Chỉ đổi kích thước cho vừa trong khung, giữ trọn ảnh.
  --quality Chất lượng JPEG (mặc định 88).

Ví dụ:
    # Ảnh ngang: cắt về 16:9
    python scripts/prepare-tour-image.py anh.jpg public/assets/dorm-tour/x.jpg

    # Ảnh dọc: giữ trọn ảnh, chỉ giới hạn chiều cao
    python scripts/prepare-tour-image.py anh-doc.jpg public/assets/dorm-tour/y.jpg --fit --width 900
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
    parser = argparse.ArgumentParser(description="Chuẩn hoá ảnh cho khung tour.")
    parser.add_argument("source", help="Đường dẫn ảnh nguồn")
    parser.add_argument("dest", help="Đường dẫn ảnh đích")
    parser.add_argument("--ratio", type=float, default=16 / 9, help="Tỉ lệ rộng/cao (mặc định 16:9)")
    parser.add_argument("--width", type=int, default=1920, help="Chiều rộng đầu ra (mặc định 1920)")
    parser.add_argument("--bias", type=float, default=0.0, help="-1 cắt sát trên, 0 giữa, 1 sát dưới")
    parser.add_argument("--fit", action="store_true", help="Không cắt, giữ trọn ảnh")
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

    if args.fit:
        # Giữ trọn ảnh: chỉ thu nhỏ nếu ảnh rộng hơn giới hạn.
        if img.width > args.width:
            new_h = int(round(img.height * (args.width / img.width)))
            img = img.resize((args.width, new_h), Image.LANCZOS)
            print(f"Thu nhỏ giữ trọn ảnh -> {img.width}x{img.height} (không cắt)")
        else:
            print("Ảnh đã nhỏ hơn giới hạn, giữ nguyên (không cắt)")
    else:
        target = args.ratio
        if abs(src_ratio - target) < 0.005:
            print("Đã đúng tỉ lệ, chỉ cần đổi kích thước.")
            crop_box = (0, 0, w, h)
        elif src_ratio > target:
            # Ảnh quá rộng -> cắt hai bên.
            new_w = int(round(h * target))
            left = (w - new_w) // 2
            crop_box = (left, 0, left + new_w, h)
            pct = (w - new_w) / w * 100
            print(f"Cắt ngang: bỏ {w - new_w}px ({pct:.0f}% chiều rộng, {left}px mỗi bên)")
        else:
            # Ảnh quá cao -> cắt trên/dưới, chia theo --bias.
            new_h = int(round(w / target))
            extra = h - new_h
            bias = max(-1.0, min(1.0, args.bias))
            top = int(round(extra * (bias + 1) / 2))
            top = max(0, min(extra, top))
            crop_box = (0, top, w, top + new_h)
            pct = extra / h * 100
            print(
                f"Cắt dọc: bỏ {extra}px ({pct:.0f}% chiều cao — "
                f"{top}px trên, {extra - top}px dưới)"
            )
            if pct > 40:
                print("  CẢNH BÁO: mất hơn 40% ảnh. Cân nhắc dùng --fit để giữ trọn ảnh.")

        img = img.crop(crop_box)

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
