import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Plan } from '@/lib/models/plan'
import mongoose, { models } from 'mongoose'

const UserSettings =
	models.UserSettings ||
	mongoose.model(
		'UserSettings',
		new mongoose.Schema(
			{
				telegramChatId: { type: String, required: true, unique: true },
			},
			{ timestamps: true }
		)
	)

export async function GET() {
	try {
		await connectDB()

		const now = new Date()
		const threeMinutesFromNow = new Date(now.getTime() + 3 * 60 * 1000)

		// Yaqinlashayotgan rejalarni topish
		const upcomingPlans = await Plan.find({
			scheduledTime: {
				$gte: now,
				$lte: threeMinutesFromNow,
			},
			isCompleted: false,
		})

		// Barcha foydalanuvchilarni olish
		const allUsers = await UserSettings.find()

		// Barcha rejalarni olish
		const allPlans = await Plan.find().sort({ scheduledTime: 1 })

		return NextResponse.json({
			currentTime: now.toISOString(),
			currentTimeLocal: now.toLocaleString(),
			threeMinutesFromNow: threeMinutesFromNow.toISOString(),
			upcomingPlans: upcomingPlans.length,
			totalUsers: allUsers.length,
			totalPlans: allPlans.length,
			environmentChatId: process.env.TELEGRAM_CHAT_ID ? '✅ Mavjud' : "❌ Yo'q",
			telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
				? '✅ Mavjud'
				: "❌ Yo'q",
			plans: allPlans.map(plan => ({
				title: plan.title,
				scheduledTime: plan.scheduledTime,
				scheduledTimeLocal: new Date(plan.scheduledTime).toLocaleString(),
				isCompleted: plan.isCompleted,
				minutesLeft: Math.ceil(
					(new Date(plan.scheduledTime).getTime() - now.getTime()) / (60 * 1000)
				),
			})),
			users: allUsers.map(user => ({ chatId: user.telegramChatId })),
			upcomingPlansDetails: upcomingPlans.map(plan => ({
				title: plan.title,
				scheduledTime: plan.scheduledTime,
				minutesLeft: Math.ceil(
					(new Date(plan.scheduledTime).getTime() - now.getTime()) / (60 * 1000)
				),
			})),
		})
	} catch (error) {
		console.error('Debug API error:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
