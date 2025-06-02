import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Plan } from '@/lib/models/plan'
import { User } from '@/lib/models/user'

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
		const allUsers = await User.find()

		// Barcha rejalarni olish
		const allPlans = await Plan.find().sort({ scheduledTime: 1 })

		return NextResponse.json({
			currentTime: now.toISOString(),
			currentTimeLocal: now.toLocaleString(),
			threeMinutesFromNow: threeMinutesFromNow.toISOString(),
			upcomingPlans: upcomingPlans.length,
			totalUsers: allUsers.length,
			totalPlans: allPlans.length,
			users: allUsers.map(user => ({
				id: user._id,
				chatId: user.telegramChatId,
				name: user.name,
				isActive: user.isActive,
				hasToken: !!user.telegramBotToken,
			})),
			plans: allPlans.map(plan => ({
				id: plan._id,
				title: plan.title,
				scheduledTime: plan.scheduledTime,
				scheduledTimeLocal: new Date(plan.scheduledTime).toLocaleString(),
				isCompleted: plan.isCompleted,
				userId: plan.userId,
				minutesLeft: Math.ceil(
					(new Date(plan.scheduledTime).getTime() - now.getTime()) / (60 * 1000)
				),
				notificationSent: plan.notificationSent || false,
			})),
			upcomingPlansDetails: upcomingPlans.map(plan => ({
				id: plan._id,
				title: plan.title,
				scheduledTime: plan.scheduledTime,
				userId: plan.userId,
				minutesLeft: Math.ceil(
					(new Date(plan.scheduledTime).getTime() - now.getTime()) / (60 * 1000)
				),
				notificationSent: plan.notificationSent || false,
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
