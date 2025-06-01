import { type NextRequest, NextResponse } from "next/server"
import { sendNotification } from "@/lib/telegram-bot"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return NextResponse.json({ success: false, error: "Chat ID is required" }, { status: 400 })
    }

    await sendNotification(chatId, "🔔 *Test xabar*: Reja Planner ilovasi sizga eslatmalar yuborish uchun sozlandi!")

    return NextResponse.json({ success: true, message: "Test message sent successfully" })
  } catch (error) {
    console.error("Error sending test message:", error)
    return NextResponse.json({ success: false, error: "Failed to send test message" }, { status: 500 })
  }
}
