import cron from 'node-cron'
import { Plan } from './models/plan'
import { User } from './models/user'
import connectDB from './mongodb'
import TelegramBot from 'node-telegram-bot-api'

let schedulerInitialized = false
let cronJob: cron.ScheduledTask | null = null

async function sendUserNotification(user: any, plan: any, message: string) {
	try {
		console.log(`📤 Xabar yuborilmoqda: ${user.name} (${user.telegramChatId})`)
		console.log(`🔑 Bot token: ${user.telegramBotToken.substring(0, 10)}...`)
		console.log(`📝 Xabar: ${message}`)

		const bot = new TelegramBot(user.telegramBotToken, { polling: false })

		await bot.sendMessage(user.telegramChatId, message, {
			parse_mode: 'Markdown',
			disable_notification: false,
		})

		// Xabar yuborilganligini belgilash
		plan.notificationSent = true
		await plan.save()

		console.log(
			`✅ Xabar muvaffaqiyatli yuborildi: ${user.name} (${user.telegramChatId})`
		)
		return true
	} catch (error) {
		console.error(
			`❌ Xabar yuborishda xatolik: ${user.name} (${user.telegramChatId})`,
			error
		)
		return false
	}
}

export async function initScheduler() {
	if (schedulerInitialized) {
		console.log('⚠️ Scheduler allaqachon ishga tushirilgan')
		return
	}

	console.log('🚀 Scheduler ishga tushirilmoqda...')

	try {
		// Avvalgi cron job ni to'xtatish
		if (cronJob) {
			cronJob.destroy()
		}

		// Har 30 sekundda tekshirish
		cronJob = cron.schedule('*/30 * * * * *', async () => {
			try {
				await connectDB()
				const now = new Date()
				console.log('⏰ Scheduler ishlayapti:', now.toLocaleString())

				// Barcha faol foydalanuvchilarni olish
				const activeUsers = await User.find({ isActive: true })
				console.log(`👥 ${activeUsers.length} ta faol foydalanuvchi topildi`)

				if (activeUsers.length === 0) {
					console.log('⚠️ Hech qanday faol foydalanuvchi topilmadi')
					return
				}

				const threeMinutesFromNow = new Date(now.getTime() + 3 * 60 * 1000)

				// Keyingi 3 daqiqa ichida bajarilishi kerak bo'lgan va xabar yuborilmagan rejalarni topish
				const upcomingPlans = await Plan.find({
					scheduledTime: {
						$gte: now,
						$lte: threeMinutesFromNow,
					},
					isCompleted: false,
					notificationSent: { $ne: true }, // Faqat xabar yuborilmagan rejalar
				})

				console.log(
					`📋 ${upcomingPlans.length} ta yangi yaqinlashayotgan reja topildi`
				)

				// Har bir reja uchun tegishli foydalanuvchiga xabar yuborish
				for (const plan of upcomingPlans) {
					console.log(`🔍 Reja: "${plan.title}" - User ID: ${plan.userId}`)

					const user = activeUsers.find(
						u => u._id.toString() === plan.userId.toString()
					)

					if (user) {
						const timeLeft = Math.ceil(
							(new Date(plan.scheduledTime).getTime() - now.getTime()) /
								(60 * 1000)
						)
						console.log(`⏱️ ${timeLeft} daqiqa qoldi: ${plan.title}`)

						await sendUserNotification(
							user,
							plan,
							`⚠️ *MUHIM ESLATMA*: "${plan.title}" rejangizni bajarish vaqti ${timeLeft} daqiqa qoldi! Ishni bajarishni boshlang!`
						)
					} else {
						console.log(`❌ Foydalanuvchi topilmadi: ${plan.userId}`)
					}
				}

				// Vaqti o'tib ketgan va bajarilmagan rejalarni tekshirish
				const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000)

				const overduePlans = await Plan.find({
					scheduledTime: {
						$lt: now,
						$gte: oneMinuteAgo,
					},
					isCompleted: false,
					notificationSent: { $ne: true }, // Faqat xabar yuborilmagan rejalar
				})

				console.log(
					`⏰ ${overduePlans.length} ta yangi vaqti o'tgan reja topildi`
				)

				for (const plan of overduePlans) {
					const user = activeUsers.find(
						u => u._id.toString() === plan.userId.toString()
					)

					if (user) {
						console.log(`⏰ Vaqt tugadi: ${plan.title} - ${user.name}`)

						await sendUserNotification(
							user,
							plan,
							`❌ *VAQT TUGADI*: "${plan.title}" rejangizni bajarish vaqti tugadi! Iltimos, tezda bajaring yoki statusini yangilang!`
						)
					}
				}
			} catch (error) {
				console.error('❌ Scheduler xatoligi:', error)
			}
		})

		schedulerInitialized = true
		console.log(
			'✅ Scheduler muvaffaqiyatli ishga tushirildi (har 30 sekundda)'
		)
	} catch (error) {
		console.error('❌ Scheduler ishga tushirishda xatolik:', error)
	}
}

export function stopScheduler() {
	if (cronJob) {
		cronJob.destroy()
		cronJob = null
		schedulerInitialized = false
		console.log("🛑 Scheduler to'xtatildi")
	}
}
