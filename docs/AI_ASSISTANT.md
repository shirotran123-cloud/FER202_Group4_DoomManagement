# Trợ lý AI KTX (AI_ASSISTANT)

## Chế độ chạy
1. **Server RAG stub** (`POST /api/ai/chat`): truy hồi 2 tài liệu nội bộ (giới nghiêm, hóa đơn, bảo trì, phòng, khẩn cấp) và trả lời kèm `sources`. Không cần key ngoài.
2. **Function-calling stub**: `{ action: "create_maintenance_ticket" }` hoặc `{ action: "locate_invoice", args: { room, studentId } }`. Server validate và trả kết quả an toàn.
3. **Gemini trực tiếp** (tùy chọn): nhập key ở chatbox, gọi `generativelanguage.googleapis.com`, lỗi thì fallback rule-based.
4. **Rule-based offline** (`answerDormQuestion` trong `src/lib/dorm-ops.ts`): khẩn cấp, giới nghiêm 23:00, báo hỏng kèm ảnh, VietQR, đổi/trả phòng.

## Kiểm duyệt
`moderateText` / server `moderate()`: chặn từ cấm + giới hạn 2000 ký tự.

## Thay LLM thật
Đặt `AI_PROVIDER=openai|gemini`, thêm key vào `.env`, thay `ragAnswer()` bằng retriever Qdrant/Chroma + LLM. Giữ nguyên contract JSON.
