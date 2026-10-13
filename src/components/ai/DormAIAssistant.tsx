import React, { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react"

interface ChatMessage {
  id: string
  sender: "ai" | "user"
  text: string
  timestamp: string
  suggestions?: string[]
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Xin chào! Mình là DomaAI - Trợ lý Ký túc xá FPT University. Mình có thể hỗ trợ bạn:\n\n• Chẩn đoán sự cố & hướng dẫn tạo phiếu báo hỏng khẩn cấp\n• Tra cứu quy định giới nghiêm 23:00 & xin giấy về muộn\n• Tư vấn chọn phòng/buồng/giường tầng phù hợp\n• Hướng dẫn nộp tiền điện nước qua VietQR",
    timestamp: "Vừa xong",
    suggestions: [
      "Ổ cắm bị tóe lửa, phải làm sao?",
      "Quy định giới nghiêm 23h như thế nào?",
      "Tư vấn giường yên tĩnh để học bài",
      "Tiền điện nước tính theo chỉ số nào?",
    ],
  },
]

export const DormAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // AI Response Simulation with domain rules
    setTimeout(() => {
      let aiResponseText = ""
      let suggestions: string[] = []
      const lower = query.toLowerCase()

      if (lower.includes("lửa") || lower.includes("chập") || lower.includes("khét") || lower.includes("cháy")) {
        aiResponseText =
          "⚠️ **CẢNH BÁO AN TOÀN KHẨN CẤP:**\n1. Hãy lập tức gạt cầu dao (Aptomat) của buồng hoặc phòng bạn xuống!\n2. Không chạm tay trần vào khu vực ổ cắm.\n3. Hãy vào mục **Báo hỏng thiết bị** -> Chọn mức độ **Khẩn cấp (2h)** để kỹ thuật viên trực trạm có mặt ngay trong 45-60 phút.\n4. Hotline cứu hộ khẩn cấp: **1900 6868** (Trực ban KTX 24/7)."
        suggestions = ["Mở trang Báo hỏng thiết bị", "Số điện thoại bảo vệ trực ban"]
      } else if (lower.includes("giới nghiêm") || lower.includes("về muộn") || lower.includes("23h") || lower.includes("cổng")) {
        aiResponseText =
          "🌙 **QUY ĐỊNH GIỚI NGHIÊM KTX FPT:**\n• Cổng KTX đóng lúc **23:00** hàng ngày.\n• Sinh viên đi làm ca đêm hoặc học nhóm cần nộp **Đơn xin về muộn** trên hệ thống trước **21:00**.\n• Mỗi sinh viên có tối đa 3 lần miễn trừ/kỳ. Về muộn không xin phép sẽ bị trừ 5 điểm rèn luyện (Demerit points) và gửi thông báo về phụ huynh sau 2 lần vi phạm."
        suggestions = ["Làm đơn xin về muộn", "Xem lịch sử điểm rèn luyện"]
      } else if (lower.includes("chọn phòng") || lower.includes("giường") || lower.includes("yên tĩnh")) {
        aiResponseText =
          "🏢 **GỢI Ý LỰA CHỌN PHÒNG & GIƯỜNG:**\n• Nếu bạn thích yên tĩnh để tự học: Nên chọn các phòng ở **Tầng 4 hoặc Tầng 5** (xa sảnh sinh hoạt chung).\n• Vị trí giường: Giường tầng dưới (**G01, G03, G05**) thuận tiện leo trèo; Giường tầng trên (**G02, G04, G06**) riêng tư hơn và ít bị bụi.\n• Hiện tại **Phòng A205 Buồng B** còn trống giường **G03** tầng dưới rất thoáng mát gần cửa sổ!"
        suggestions = ["Xem sơ đồ đặt phòng 1:4:6", "Bảng giá thuê phòng"]
      } else if (lower.includes("điện") || lower.includes("nước") || lower.includes("tiền") || lower.includes("vietqr")) {
        aiResponseText =
          "⚡ **CƠ CHẾ TÍNH TIỀN ĐIỆN NƯỚC (AUTO-SPLIT):**\n• Điện năng và nước sinh hoạt được công tơ IoT ghi nhận ngày 25 hàng tháng.\n• Chi phí buồng cá nhân tính riêng cho buồng; chi phí khu vực chung (WC, ban công) được chia đều cho các thành viên trong phòng.\n• Bạn có thể thanh toán tức thì qua **VietQR Quickpay** với nội dung tự động điền sẵn mã phòng và MSSV."
        suggestions = ["Kiểm tra hóa đơn phòng A205", "Quét mã VietQR"]
      } else {
        aiResponseText = `Cảm ơn câu hỏi của bạn về "${query}". Với hệ thống DMS KTX FPT University, bạn có thể thực hiện mọi nghiệp vụ trực tuyến từ đặt giường, báo hỏng đến thanh toán. Bạn cần mình hỗ trợ chi tiết phần nào?`
        suggestions = ["Quy định giới nghiêm 23h", "Báo hỏng khẩn cấp", "Xem tiền điện nước"]
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        suggestions,
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 800)
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 border border-slate-700 group"
          aria-label="Mở trợ lý AI KTX"
        >
          <div className="relative">
            <Bot className="h-5 w-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">Trợ lý AI KTX</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            LLM v2
          </span>
        </button>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-14"
              : "bottom-6 right-6 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-t-2xl border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight">DomaAI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-slate-400">Tư vấn quy định & Hỗ trợ kỹ thuật</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white rounded-md transition-colors"
                title={isMinimized ? "Phóng to" : "Thu nhỏ"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded-md transition-colors"
                title="Đóng chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-slate-800 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[88%] ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                          msg.sender === "user"
                            ? "bg-slate-900 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>

                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-slate-900 text-white rounded-tr-xs"
                            : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-9 font-mono">
                      {msg.timestamp}
                    </span>

                    {/* Quick suggestion prompt pills */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-9">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-2xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 pl-2">
                    <Bot className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-xs italic">DomaAI đang trả lời...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về báo hỏng, giờ giới nghiêm, phòng ở..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
