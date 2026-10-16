import React, { useState, useRef, useEffect } from "react"
import { answerDormQuestion, moderateText } from "@/lib/dorm-ops"
import { Sparkles, Send, X, Bot, User, Minimize2, Maximize2, Settings, Key, ExternalLink, CircleAlert, RotateCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
interface ChatMessage {
  id: string
  sender: "ai" | "user"
  text: string
  timestamp: string
  suggestions?: string[]
  isError?: boolean
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Xin chào! Mình là DomaAI - trợ lý Ký túc xá FPT University. Mình hỗ trợ:\n\n• Chẩn đoán sự cố điện nước & quy trình báo hỏng\n• Tra cứu quy định giới nghiêm 23:00, thủ tục xin về muộn\n• Tư vấn chọn phòng, buồng, tầng lầu và vị trí giường\n• Giải thích thuật toán chia tiền điện nước và thanh toán VietQR",
    timestamp: "Vừa xong",
    suggestions: [
      "Quy định giới nghiêm 23h và cách xin về muộn?",
      "Ổ cắm điện bị tóe lửa khét thì xử lý thế nào?",
      "Tư vấn giường tầng trên hay tầng dưới?",
      "Tiền điện nước phòng được chia như thế nào?",
    ],
  },
]

const SYSTEM_INSTRUCTION = `Bạn là DomaAI - Trợ lý Ký túc xá thông minh của Đại học FPT (Hệ thống Quản lý Ký túc xá DMS - Dormitory Management System).

NGHIỆP VỤ & QUY TẮC KÝ TÚC XÁ FPT (SRS & THỰC TẾ):
1. GIỚI NGHIÊM & AN NINH:
- Giờ giới nghiêm: Cổng KTX đóng lúc 23:00 hàng ngày.
- Xin giấy về muộn: Sinh viên nộp đơn trực tuyến trước 21:00 qua mục 'Giới nghiêm & Ra vào'. Được miễn trừ tối đa 3 lần/học kỳ cho lý do học nhóm, làm thêm ca đêm.
- Vi phạm về muộn không xin phép: Trừ 5 điểm rèn luyện (demerit points). Vi phạm 2 lần sẽ gửi cảnh cáo về phụ huynh; 3 lần sẽ bị xem xét đình chỉ lưu trú KTX.
- Hotline bảo vệ trực ban 24/7: 1900 6868.

2. MÔ HÌNH PHÒNG & GIƯỜNG 1:4:6:
- Cấu trúc chuẩn: 1 Phòng = 4 Buồng (A, B, C, D); 1 Buồng = 6 Giường (G01 - G06), tổng 24 giường/phòng.
- Giường tầng dưới (Lower): G01, G03, G05 (tiện leo trèo, giá 950.000đ/tháng).
- Giường tầng trên (Upper): G02, G04, G06 (yên tĩnh, riêng tư, sạch sẽ, giá 950.000đ/tháng).
- Khóa giữ chỗ: Hệ thống giữ chỗ tối đa 15 phút đếm ngược khi sinh viên chọn giường để hoàn tất thanh toán qua VietQR.

3. BÁO HỎNG & BẢO TRÌ:
- Báo sự cố qua mục 'Báo hỏng thiết bị', có đính kèm ảnh chụp hiện trạng.
- Mức độ Khẩn cấp (chập điện, cháy nổ, vỡ đường ống nước): Kỹ thuật viên xử lý trong vòng 2 giờ. Cần dặn sinh viên ngắt cầu dao (Aptomat) ngay lập tức.
- Mức độ Tiêu chuẩn (hỏng điều hòa, bóng đèn, quạt trần): Xử lý trong 24 giờ.
- Mức độ Thấp (bản lề kêu, khóa tủ lỏng): Xử lý trong 48 giờ.

4. ĐIỆN NƯỚC & THANH TOÁN:
- Chốt chỉ số công tơ vào ngày 25 hàng tháng.
- Công thức chia tiền: Thuật toán Total / N (tổng tiền điện + nước + vệ sinh chia đều cho số sinh viên thực tế trong phòng).
- Thanh toán: Hỗ trợ mã VietQR NAPAS 24/7 động tự động điền sẵn số tiền và nội dung 'DIENNUOC [Mã phòng] [MSSV]'.

5. HỢP ĐỒNG & NHẬN/TRẢ PHÒNG:
- Tiền cọc an ninh: 1.000.000đ, được hoàn trả 100% khi thanh lý hợp đồng và nghiệm thu phòng không hư hại.
- Biên bản bàn giao thiết bị được ký số hóa điện tử.

PHONG CÁCH TRẢ LỜI:
- Trả lời bằng tiếng Việt lịch sự, thân thiện, rõ ràng, mang phong cách trợ lý KTX FPT chuyên nghiệp.
- Định dạng Markdown rõ ràng (in đậm từ khóa, gạch đầu dòng). Không dùng emoji.
- Luôn trả lời chính xác, đi thẳng vào câu hỏi của sinh viên/cán bộ.`

export const DormAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idSeqRef = useRef(0)
  const nextMsgId = (prefix: string) => {
    idSeqRef.current += 1
    return `${prefix}-${idSeqRef.current}`
  }

  // API Key handling
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      localStorage.getItem("doma_gemini_api_key") ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      ""
    )
  })
  const [tempKeyInput, setTempKeyInput] = useState("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tempKeyInput.trim()
    setApiKey(trimmed)
    if (trimmed) {
      localStorage.setItem("doma_gemini_api_key", trimmed)
    } else {
      localStorage.removeItem("doma_gemini_api_key")
    }
    setShowSettings(false)
  }

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES)
  }

  // Call Google Gemini API
  const callGeminiAPI = async (userPrompt: string): Promise<string> => {
    // Format conversation history for multi-turn chat
    const conversationHistory = messages
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }))

    conversationHistory.push({
      role: "user",
      parts: [{ text: userPrompt }],
    })

    const requestBody = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }

    // Try Gemini 2.5 Flash, latest, and 2.5 Flash Lite
    const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
    let lastError: Error | null = null

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        )

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const errorMsg =
            errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
          throw new Error(errorMsg)
        }

        const data = await response.json()
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Xin lỗi, mình không nhận được phản hồi từ AI."
        return text
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    throw lastError || new Error("Không thể kết nối đến Gemini API")
  }

  // Local fallback response when no API key or network error
  // Rule-based dorm brain (dorm-ops) + server RAG endpoint when reachable.
  const getLocalResponse = (query: string): string => {
    const mod = moderateText(query)
    if (!mod.ok) {
      return "Nội dung của bạn bị chặn bởi kiểm duyệt tự động (mã: " + mod.reason + "). Vui lòng diễn đạt lại lịch sự."
    }
    const local = answerDormQuestion(query)
    const lower = query.toLowerCase()

    if (
      lower.includes("lửa") ||
      lower.includes("chập") ||
      lower.includes("khét") ||
      lower.includes("cháy")
    ) {
      return (
        "⚠️ **CẢNH BÁO AN TOÀN KHẨN CẤP:**\n" +
        "1. Hãy lập tức gạt cầu dao (Aptomat) của buồng hoặc phòng bạn xuống!\n" +
        "2. Không chạm tay trần vào khu vực ổ cắm.\n" +
        "3. Hãy vào mục **Báo hỏng thiết bị** -> Chọn mức độ **Khẩn cấp · xử lý trong 2h** để kỹ thuật viên trực trạm có mặt ngay trong 45-60 phút.\n" +
        "4. Hotline cứu hộ khẩn cấp: **1900 6868** · trực ban KTX 24/7."
      )
    }

    if (
      lower.includes("giới nghiêm") ||
      lower.includes("về muộn") ||
      lower.includes("23h") ||
      lower.includes("cổng")
    ) {
      return (
        "🌙 **QUY ĐỊNH GIỚI NGHIÊM KTX FPT:**\n" +
        "• Cổng KTX đóng lúc **23:00** hàng ngày.\n" +
        "• Sinh viên đi làm ca đêm hoặc học nhóm cần nộp **Đơn xin về muộn** trên hệ thống trước **21:00**.\n" +
        "• Mỗi sinh viên có tối đa 3 lần miễn trừ/kỳ. Về muộn không xin phép sẽ bị trừ 5 điểm rèn luyện (Demerit points) và gửi thông báo về phụ huynh sau 2 lần vi phạm."
      )
    }

    if (
      lower.includes("chọn phòng") ||
      lower.includes("giường") ||
      lower.includes("yên tĩnh") ||
      lower.includes("tầng")
    ) {
      return (
        "**GỢI Ý LỰA CHỌN PHÒNG & GIƯỜNG (MÔ HÌNH 1:4:6):**\n" +
        "• Nếu bạn thích yên tĩnh để tự học: Nên chọn các phòng ở **Tầng 4 hoặc Tầng 5** (xa sảnh sinh hoạt chung).\n" +
        "• Vị trí giường: Giường tầng dưới (**G01, G03, G05**) thuận tiện leo trèo; Giường tầng trên (**G02, G04, G06**) riêng tư hơn và ít bị bụi.\n" +
        "• Hiện tại **Phòng A205 Buồng B** còn trống giường **G03** tầng dưới rất thoáng mát gần cửa sổ!"
      )
    }

    if (
      lower.includes("điện") ||
      lower.includes("nước") ||
      lower.includes("tiền") ||
      lower.includes("vietqr")
    ) {
      return (
        "**CƠ CHẾ TÍNH TIỀN ĐIỆN NƯỚC (AUTO-SPLIT TOTAL / N):**\n" +
        "• Điện năng và nước sinh hoạt được công tơ ghi nhận ngày 25 hàng tháng.\n" +
        "• Chi phí được tính theo công thức: (Tổng tiền điện + nước + vệ sinh) chia đều cho số sinh viên trong phòng.\n" +
        "• Bạn có thể thanh toán tức thì qua **VietQR Quickpay** với nội dung tự động điền sẵn mã phòng và MSSV."
      )
    }

    return (
      local +
      `\n\nCảm ơn câu hỏi của bạn về "${query}".\n\n` +
      `💡 **Mẹo:** Bạn có thể bấm vào biểu tượng ⚙️ (Cài đặt) ở góc trên Chat Box và nhập **Google Gemini API Key miễn phí** để kích hoạt AI trả lời thông minh không giới hạn mọi câu hỏi phức tạp!`
    )
  }

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: nextMsgId("user"),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      let aiResponseText = ""
      let isError = false

      if (apiKey) {
        // Real Gemini AI Call
        try {
          aiResponseText = await callGeminiAPI(query)
        } catch (err: unknown) {
          isError = true
          const errDetail = err instanceof Error ? err.message : String(err)
          aiResponseText =
            `⚠️ **Lỗi kết nối Gemini API:** ${errDetail}\n\n` +
            `*Đã chuyển sang câu trả lời dự phòng nghiệp vụ KTX:*\n\n` +
            getLocalResponse(query)
        }
      } else {
        // Fallback simulated response
        await new Promise((res) => setTimeout(res, 600))
        aiResponseText = getLocalResponse(query)
      }

      const aiMsg: ChatMessage = {
        id: nextMsgId("ai"),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError,
        suggestions: [
          "Quy định giới nghiêm 23h?",
          "Hướng dẫn báo hỏng thiết bị",
          "Cách thanh toán tiền phòng qua VietQR",
        ],
      }

      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <Button className="fixed bottom-6 right-6 z-40 flex shadow-xl shadow-primary hover:scale-105" onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          
          aria-label="Mở trợ lý AI KTX">
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-success animate-ping"></span>
          </div>
          <span className="text-[13px] font-bold">Trợ lý AI KTX</span>
          <span
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
              apiKey ? "bg-white/20 text-white" : "bg-primary/30 text-white"
            }`}
          >
            {apiKey ? "Gemini" : "Offline"}
          </span>
        </Button>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col rounded-3xl border border-border bg-card shadow-2xl transition-all duration-200 ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-14"
              : "bottom-6 right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between rounded-t-3xl bg-gradient-to-r from-primary to-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold tracking-tight">DomaAI Assistant</span>
                  <span
                    className={`rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
                      apiKey ? "bg-white/20 text-white" : "bg-black/20 text-white"
                    }`}
                  >
                    {apiKey ? "Gemini" : "Offline"}
                  </span>
                </div>
                <span className="block text-[11px] text-white/75">
                  {apiKey ? "Trực tuyến" : "Chế độ cơ bản, vẫn trả lời nghiệp vụ KTX"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setTempKeyInput(apiKey)
                  setShowSettings(!showSettings)
                }}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                title="Cài đặt API Key Gemini"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetChat}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                title="Đặt lại đoạn chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                title={isMinimized ? "Phóng to" : "Thu nhỏ"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                title="Đóng chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* API Key Settings Modal/Panel */}
              {showSettings && (
                <div className="space-y-3 border-b border-border bg-muted/60 p-4 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Key className="h-4 w-4" />
                      <span>Gemini API Key</span>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="prose text-[11px] leading-relaxed text-muted-foreground">
                    Nhập API Key để kích hoạt Gemini trả lời thông minh theo thời gian thực (lưu trên trình duyệt của bạn).
                  </p>

                  <form onSubmit={handleSaveApiKey} className="space-y-2.5">
                    <div>
                      <Input
                        type="password"
                        value={tempKeyInput}
                        onChange={(e) => setTempKeyInput(e.target.value)}
                        placeholder="Nhập API key Gemini"
                        className="font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                      >
                        <span>Lấy key miễn phí tại Google AI Studio</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <div className="flex gap-2">
                        {apiKey && (
                          <button
                            type="button"
                            onClick={() => {
                              setApiKey("")
                              setTempKeyInput("")
                              localStorage.removeItem("doma_gemini_api_key")
                              setShowSettings(false)
                            }}
                            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-danger"
                          >
                            Xóa Key
                          </button>
                        )}
                        <Button className="py-1" type="submit">
                          Lưu
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Notice Banner if no API key is set */}
              {!apiKey && !showSettings && (
                <div className="flex items-center justify-between border-b border-primary/20 bg-primary-soft px-3.5 py-2 text-[11px] text-primary-soft-foreground dark:bg-[#2c2111] dark:text-primary">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>Chế độ cơ bản. Nhập API Key để dùng Gemini.</span>
                  </div>
                  <button
                    onClick={() => {
                      setTempKeyInput(apiKey)
                      setShowSettings(true)
                    }}
                    className="shrink-0 font-bold underline"
                  >
                    Nhập Key
                  </button>
                </div>
              )}

              {/* Message History Body */}
              <div className="flex-1 space-y-3.5 overflow-y-auto bg-background p-4 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 max-w-[90%] ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          msg.sender === "user"
                            ? "bg-foreground text-background"
                            : "bg-primary text-white"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div
                        className={`prose prose-pre whitespace-pre-line rounded-2xl p-3 text-[13px] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-primary text-white"
                            : "border border-border bg-card"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="mt-1 px-9 font-mono text-[10px] text-muted-foreground">
                      {msg.timestamp}
                    </span>

                    {/* Quick suggestion prompt pills */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pl-9">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary-soft-foreground"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 pl-2 text-muted-foreground">
                    <Bot className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs italic">
                      {apiKey
                        ? "Gemini đang soạn câu trả lời..."
                        : "DomaAI đang trả lời..."}
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="shrink-0 border-t border-border bg-card p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi về KTX: nội quy, phòng, điện nước..."
                    className="flex-1 bg-muted/60 text-[13px] focus:bg-card"
                  />
                  <Button className="flex h-10 w-10 transition-transform hover:scale-105 disabled:opacity-40" type="submit"
                    disabled={!input.trim() || isTyping}
                    
                    title="Gửi câu hỏi">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
