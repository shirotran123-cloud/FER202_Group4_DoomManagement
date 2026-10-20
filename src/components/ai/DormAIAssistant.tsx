import React, { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Settings,
  Key,
  ExternalLink,
  AlertCircle,
  RotateCcw,
} from "lucide-react"

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
    text: "Xin chào! Mình là DomaAI - Trợ lý Ký túc xá FPT University được trang bị Google Gemini LLM. Mình có thể giải đáp chi tiết mọi vấn đề:\n\n• Chẩn đoán sự cố điện nước & quy trình báo hỏng\n• Tư vấn chọn phòng, buồng, tầng lầu và vị trí giường\n• Giải thích thuật toán chia tiền điện nước và thanh toán VietQR",
    timestamp: "Vừa xong",
    suggestions: [
      "Quy định giờ giấc ra vào KTX?",
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
- Giờ mở cổng linh hoạt phục vụ nhu cầu học tập và sinh hoạt của sinh viên.
- Hotline bảo vệ trực ban 24/7: 1900 6868.

2. CẤU TRÚC PHÒNG & GIƯỜNG:
- Cấu trúc chuẩn: 1 Phòng = 4 Buồng (A, B, C, D); 1 Buồng = 6 Giường (G01 - G06), tổng 24 giường/phòng.
- Giường tầng dưới (Lower): G01, G03, G05 (tiện leo trèo, giá 950.000đ/tháng).
- Giường tầng trên (Upper): G02, G04, G06 (yên tĩnh, riêng tư, sạch sẽ, giá 950.000đ/tháng).
- Khóa giữ chỗ: Hệ thống giữ chỗ tối đa 15 phút đếm ngược khi sinh viên chọn giường để hoàn tất thanh toán qua VietQR.

3. BÁO HỎNG & BẢO TRÌ:
- Báo sự cố qua mục 'Báo hỏng thiết bị', có đính kèm ảnh chụp hiện trạng.
- Mức độ Khẩn cấp (chập điện, cháy nổ, vỡ đường ống nước): Kỹ thuật viên Tòa A xử lý ngay lập tức. Cần dặn sinh viên ngắt cầu dao (Aptomat) ngay lập tức.
- Mức độ Tiêu chuẩn (hỏng điều hòa, bóng đèn, quạt trần): Xử lý trong 24 giờ.
- Mức độ Thấp (bản lề kêu, khóa tủ lỏng): Xử lý trong 48 giờ.

4. ĐIỆN NƯỚC & THANH TOÁN:
- Chốt chỉ số công tơ vào ngày 25 hàng tháng.
- Công thức chia tiền: Thuật toán Total / N (tổng tiền điện + nước + vệ sinh chia đều cho số sinh viên thực tế trong phòng).
- Thanh toán: Hỗ trợ mã VietQR NAPAS 24/7 động tự động điền sẵn số tiền và nội dung 'DIENNUOC [Mã phòng] [MSSV]'.

5. HỢP ĐỒNG & NHẬN/TRẢ PHÒNG:
- Tiền đặt cọc: 0đ (Ký túc xá hoàn toàn không thu tiền đặt cọc, chỉ nộp tiền thuê phòng theo kỳ và tiền điện nước thực tế).
- Biên bản bàn giao thiết bị được ký số hóa điện tử.

PHONG CÁCH TRẢ LỜI:
- Trả lời bằng tiếng Việt lịch sự, thân thiện, rõ ràng, mang phong cách trợ lý KTX FPT chuyên nghiệp.
- Định dạng Markdown sinh động (in đậm từ khóa, gạch đầu dòng rõ ràng, dùng emoji thích hợp).
- Luôn trả lời chính xác, đi thẳng vào câu hỏi của sinh viên/cán bộ.`

export const DormAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  const getLocalResponse = (query: string): string => {
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
        "3. Hãy vào mục **Báo hỏng thiết bị** -> Chọn mức độ **Khẩn cấp** để kỹ thuật viên trực trạm có mặt ngay trong 45-60 phút.\n" +
        "4. Hotline cứu hộ khẩn cấp: **1900 6868** (Trực ban KTX 24/7)."
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
        "• Sinh viên ra vào cổng an ninh tự do và văn minh, tuân thủ hướng dẫn của BQL."
      )
    }

    if (
      lower.includes("chọn phòng") ||
      lower.includes("giường") ||
      lower.includes("yên tĩnh") ||
      lower.includes("tầng")
    ) {
      return (
        "🏢 **GỢI Ý LỰA CHỌN PHÒNG & GIƯỜNG (TIÊU CHUẨN):**\n" +
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
        "⚡ **CƠ CHẾ TÍNH TIỀN ĐIỆN NƯỚC (AUTO-SPLIT TOTAL / N):**\n" +
        "• Điện năng và nước sinh hoạt được công tơ ghi nhận ngày 25 hàng tháng.\n" +
        "• Chi phí được tính theo công thức: (Tổng tiền điện + nước + vệ sinh) chia đều cho số sinh viên trong phòng.\n" +
        "• Bạn có thể thanh toán tức thì qua **VietQR Quickpay** với nội dung tự động điền sẵn mã phòng và MSSV."
      )
    }

    return (
      `Cảm ơn câu hỏi của bạn về "${query}".\n\n` +
      `💡 **Mẹo:** Bạn có thể bấm vào biểu tượng ⚙️ (Cài đặt) ở góc trên Chat Box và nhập **Google Gemini API Key miễn phí** để kích hoạt AI trả lời thông minh không giới hạn mọi câu hỏi phức tạp!`
    )
  }

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
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
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError,
        suggestions: [
          "Quy định giờ giấc ra vào KTX?",
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
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-sky-950 text-white shadow-2xl hover:bg-slate-800 dark:hover:bg-sky-900 transition-all hover:scale-105 border border-slate-700 dark:border-sky-700 group"
          aria-label="Mở trợ lý AI KTX"
        >
          <div className="relative">
            <Bot className="h-5 w-5 text-sky-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">Trợ lý AI KTX</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              apiKey
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
            }`}
          >
            {apiKey ? "Gemini LLM" : "Chế độ mẫu"}
          </span>
        </button>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white dark:bg-[#161e23] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-14"
              : "bottom-6 right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-t-2xl border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight">DomaAI Assistant</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      apiKey ? "bg-emerald-400" : "bg-cyan-400"
                    }`}
                    title={apiKey ? "Đã kết nối Gemini API" : "Chưa có API Key"}
                  ></span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      apiKey
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                        : "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50"
                    }`}
                  >
                    {apiKey ? "Gemini 2.5 Flash" : "Local Mode"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {apiKey ? "Google Gemini LLM Trực Tuyến" : "Chưa nhập API Key"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => {
                  setTempKeyInput(apiKey)
                  setShowSettings(!showSettings)
                }}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                title="Cài đặt API Key Gemini"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                title="Đặt lại đoạn chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
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
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
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
                <div className="p-4 bg-slate-900 border-b border-slate-800 text-white text-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sky-400">
                      <Key className="h-4 w-4" />
                      <span>Cấu Hình Google Gemini API Key</span>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Nhập API Key để kích hoạt trí tuệ nhân tạo Gemini phản hồi thông minh, linh
                    hoạt mọi câu hỏi theo thời gian thực (lưu an toàn trên trình duyệt của bạn).
                  </p>

                  <form onSubmit={handleSaveApiKey} className="space-y-2.5">
                    <div>
                      <input
                        type="password"
                        value={tempKeyInput}
                        onChange={(e) => setTempKeyInput(e.target.value)}
                        placeholder="Dán AIzaSy... vào đây"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium"
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
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-950 text-blue-400 border border-slate-700 text-[11px] font-semibold"
                          >
                            Xóa Key
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-3.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px]"
                        >
                          Lưu Cài Đặt
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Notice Banner if no API key is set */}
              {!apiKey && !showSettings && (
                <div className="bg-cyan-50 dark:bg-cyan-950/40 border-b border-cyan-200 dark:border-cyan-900/60 px-3.5 py-2 text-[11px] flex items-center justify-between text-cyan-800 dark:text-cyan-300">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    <span>Đang ở chế độ mẫu. Nhập API Key để trả lời chuẩn 100%.</span>
                  </div>
                  <button
                    onClick={() => {
                      setTempKeyInput(apiKey)
                      setShowSettings(true)
                    }}
                    className="font-bold underline shrink-0 hover:text-cyan-950 dark:hover:text-cyan-200"
                  >
                    Nhập Key
                  </button>
                </div>
              )}

              {/* Message History Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-xs">
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
                        className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                          msg.sender === "user"
                            ? "bg-slate-900 dark:bg-sky-600 text-white"
                            : "bg-sky-600 dark:bg-sky-500 text-white"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                          msg.sender === "user"
                            ? "bg-slate-900 dark:bg-sky-600 text-white rounded-tr-xs"
                            : "bg-white dark:bg-[#1c262c] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xs rounded-tl-xs"
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
                            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-[#1c262c] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 transition-colors shadow-2xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pl-2">
                    <Bot className="h-4 w-4 text-sky-600 animate-spin" />
                    <span className="text-xs italic">
                      {apiKey
                        ? "Gemini đang suy nghĩ & soạn câu trả lời chuẩn..."
                        : "DomaAI đang trả lời..."}
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 bg-white dark:bg-[#161e23] border-t border-slate-200 dark:border-slate-800 shrink-0">
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
                    placeholder="Hỏi bất kỳ điều gì về KTX (quy định, phòng, điện nước...)..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="h-8 w-8 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                    title="Gửi câu hỏi"
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
