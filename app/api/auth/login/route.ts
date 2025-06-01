import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/user'
import TelegramBot from 'node-telegram-bot-api'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { telegramChatId, telegramBotToken, name } = body

		if (!telegramChatId || !telegramBotToken) {
			return NextResponse.json(
				{ error: 'Telegram Chat ID va Bot Token talab qilinadi' },
				{ status: 400 }
			)
		}

		// Bot token ni tekshirish
		try {
			const bot = new TelegramBot(telegramBotToken, { polling: false })
			await bot.getMe() // Bot ma'lumotlarini olish orqali token ni tekshirish
		} catch (error) {
			return NextResponse.json(
				{ error: "Noto'g'ri Bot Token" },
				{ status: 400 }
			)
		}

		await connectDB()

		// Foydalanuvchini topish yoki yaratish
		let user = await User.findOne({ telegramChatId })

		if (user) {
			// Mavjud foydalanuvchini yangilash
			user.telegramBotToken = telegramBotToken
			if (name) user.name = name
			user.isActive = true
			await user.save()
		} else {
			// Yangi foydalanuvchi yaratish
			user = new User({
				telegramChatId,
				telegramBotToken,
				name: name || `Foydalanuvchi ${telegramChatId}`,
				isActive: true,
			})
			await user.save()
		}

		// Test xabar yuborish
		try {
			const bot = new TelegramBot(telegramBotToken, { polling: false })
			await bot.sendMessage(
				telegramChatId,
				`🎉 *Xush kelibsiz!*\n\nSiz Reja Planner ilovasiga muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nEndi o'z rejalaringizni yaratishingiz va eslatmalar olishingiz mumkin.`,
				{ parse_mode: 'Markdown' }
			)
		} catch (error) {
			console.error('Test message error:', error)
			// Test xabar yuborilmasa ham davom etamiz
		}

		return NextResponse.json({
			success: true,
			user: {
				_id: user._id,
				telegramChatId: user.telegramChatId,
				name: user.name,
				isActive: user.isActive,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		})
	} catch (error) {
		console.error('Login error:', error)
		return NextResponse.json(
			{ error: 'Ichki server xatoligi' },
			{ status: 500 }
		)
	}
}
