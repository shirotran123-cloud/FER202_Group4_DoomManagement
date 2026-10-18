/**
 * ExpandableText — chữ dài bị cắt "…" thì có nút bấm để xem toàn bộ.
 *
 * VÌ SAO CẦN:
 * Toàn bộ giao diện đang theo luật "mỗi câu nằm gọn trên một dòng" (xem
 * `src/index.css`): chữ dài bị cắt bằng dấu ba chấm. Luật đó giữ bố cục thẳng
 * hàng, nhưng lại giấu mất nội dung. Component này là lối thoát: mặc định vẫn
 * một dòng, nhưng nếu chữ THỰC SỰ bị cắt thì hiện nút "Xem thêm"; bấm vào thì
 * mở rộng và cho phép xuống dòng để đọc trọn nội dung.
 *
 * ĐIỂM QUAN TRỌNG — nút chỉ hiện khi chữ bị cắt thật:
 * Không thể biết trước một chuỗi có bị cắt hay không, vì còn phụ thuộc bề rộng
 * cột, cỡ chữ và phông. Nên sau khi render, component đo `scrollWidth` so với
 * `clientWidth`. Chữ ngắn không có nút, tránh nút thừa làm rối giao diện.
 * Phép đo chạy lại khi bề rộng vùng chứa đổi (dùng ResizeObserver) chứ không
 * chỉ một lần lúc mount — nếu không, xoay màn hình hay đổi kích thước cửa sổ sẽ
 * làm nút hiện sai.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "cn"

export interface ExpandableTextProps {
  /** Nội dung cần hiển thị. */
  children: string
  /** Class cho khối chứa, ví dụ để chỉnh cỡ chữ và màu. */
  className?: string
  /** Class riêng cho phần chữ (áp cho cả trạng thái thu gọn lẫn mở rộng). */
  textClassName?: string
  /** Chữ trên nút mở rộng. */
  expandLabel?: string
  /** Chữ trên nút thu gọn. */
  collapseLabel?: string
  /**
   * Số dòng tối đa khi đã mở rộng. Bỏ trống nghĩa là hiện trọn vẹn, không giới hạn.
   * Dùng khi nội dung có thể rất dài (ví dụ mô tả sự cố) mà vẫn muốn chặn trên.
   */
  maxLinesWhenExpanded?: number
}

/**
 * Đo xem phần tử chữ có bị tràn (tức đang bị cắt bằng dấu ba chấm) hay không.
 * `scrollWidth` lớn hơn `clientWidth` một chút là do làm tròn điểm ảnh, nên trừ
 * hao một pixel để không hiện nút thừa ở những chuỗi vừa khít.
 */
function isOverflowing(el: HTMLElement | null): boolean {
  if (!el) return false
  return el.scrollWidth - el.clientWidth > 1
}

export function ExpandableText({
  children,
  className,
  textClassName,
  expandLabel = "Xem thêm",
  collapseLabel = "Thu gọn",
  maxLinesWhenExpanded,
}: ExpandableTextProps) {
  const textRef = useRef<HTMLSpanElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  /** Đo lại và cập nhật trạng thái tràn. Bỏ qua khi đang mở rộng: lúc đó chữ đã
   *  xuống dòng nên phép đo một dòng không còn ý nghĩa, và ta phải giữ nút
   *  "Thu gọn" để người dùng đóng lại được. */
  const measure = useCallback(() => {
    if (expanded) return
    setOverflowing(isOverflowing(textRef.current))
  }, [expanded])

  // useLayoutEffect để đo trước khi trình duyệt vẽ, tránh thấy nút "nhảy" vào.
  useLayoutEffect(() => {
    measure()
  }, [measure, children])

  // Đo lại khi bề rộng vùng chứa đổi (đổi cỡ cửa sổ, đổi bố cục cột).
  useEffect(() => {
    const el = textRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(el)
    // Phông chữ tải xong muộn cũng làm số đo đổi, nên đo lại khi phông sẵn sàng.
    document.fonts?.ready.then(() => measure()).catch(() => undefined)
    return () => observer.disconnect()
  }, [measure])

  /**
   * Khi mở rộng, bỏ luật một dòng của CSS toàn cục bằng class `prose` (đã có sẵn
   * cơ chế miễn trừ trong `src/index.css`) để chữ được xuống dòng.
   */
  const collapsedClasses = "block truncate whitespace-nowrap"
  const expandedClasses = "prose block"

  return (
    <span className={cn("block min-w-0", className)}>
      <span
        ref={textRef}
        className={cn(expanded ? expandedClasses : collapsedClasses, textClassName)}
        style={
          expanded && maxLinesWhenExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLinesWhenExpanded,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {children}
      </span>

      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 shrink-0" />
              {collapseLabel}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 shrink-0" />
              {expandLabel}
            </>
          )}
        </button>
      )}
    </span>
  )
}
