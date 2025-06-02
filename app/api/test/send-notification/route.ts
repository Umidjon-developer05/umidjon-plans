import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/user'
import { Plan } from '@/lib/models/plan'
import TelegramBot from 'node-telegram-bot-api'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { userId, message, planId } = body

		if (!userId || !message) {
			return NextResponse.json(
				{ error: 'userId and message are required' },
				{ status: 400 }
			)
		}

		await connectDB()

		// Foydalanuvchini topish
		const user = await User.findById(userId)
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		console.log(
			`📤 Test xabar yuborilmoqda: ${user.name} (${user.telegramChatId})`
		)
		console.log(`🔑 Bot token: ${user.telegramBotToken.substring(0, 10)}...`)

		try {
			const bot = new TelegramBot(user.telegramBotToken, { polling: false })

			// Bot ma'lumotlarini olish
			const botInfo = await bot.getMe()
			console.log(`🤖 Bot: ${botInfo.username}`)

			await bot.sendMessage(user.telegramChatId, message, {
				parse_mode: 'Markdown',
				disable_notification: false,
			})

			console.log(`✅ Test xabar muvaffaqiyatli yuborildi`)

			// Agar planId berilgan bo'lsa, rejani yangilash
			if (planId) {
				const plan = await Plan.findById(planId)
				if (plan) {
					plan.notificationSent = true
					await plan.save()
					console.log(
						`✅ Reja notificationSent = true ga yangilandi: ${planId}`
					)
				}
			}

			return NextResponse.json({
				success: true,
				message: 'Test notification sent successfully',
				user: {
					name: user.name,
					chatId: user.telegramChatId,
				},
				botInfo: {
					username: botInfo.username,
					firstName: botInfo.first_name,
				},
			})
		} catch (botError) {
			console.error(`❌ Bot xatoligi:`, botError)
			return NextResponse.json(
				{
					success: false,
					error: 'Bot error',
				},
				{ status: 400 }
			)
		}
	} catch (error) {
		console.error('Test notification error:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
