import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { Plan } from "@/lib/models/plan"

export async function POST() {
  try {
    await connectDB()

    // Barcha rejalarni yangilash
    const result = await Plan.updateMany({}, { $set: { notificationSent: false } })

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} ta reja yangilandi`,
    })
  } catch (error) {
    console.error("Reset notifications error:", error)
    return NextResponse.json({ error: "Internal Server Error"}, { status: 500 })
  }
}
