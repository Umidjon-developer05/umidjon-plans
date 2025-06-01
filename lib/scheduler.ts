import cron from 'node-cron'
import { Plan } from './models/plan'
import { User } from './models/user'
import connectDB from './mongodb'
import TelegramBot from 'node-telegram-bot-api'

let schedulerInitialized = false
let cronJob: cron.ScheduledTask | null = null

async function sendUserNotification(user: any, message: string) {
	try {
		const bot = new TelegramBot(user.telegramBotToken, { polling: false })
		await bot.sendMessage(user.telegramChatId, message, {
			parse_mode: 'Markdown',
			disable_notification: false,
		})
		console.log(`✅ Xabar yuborildi: ${user.telegramChatId} - ${user.name}`)
		return true
	} catch (error) {
		console.error(`❌ Xabar yuborishda xatolik: ${user.telegramChatId}`, error)
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

				const threeMinutesFromNow = new Date(now.getTime() + 3 * 60 * 1000)

				// Keyingi 3 daqiqa ichida bajarilishi kerak bo'lgan rejalarni topish
				const upcomingPlans = await Plan.find({
					scheduledTime: {
						$gte: now,
						$lte: threeMinutesFromNow,
					},
					isCompleted: false,
				}).populate('userId')

				console.log(
					`📋 ${upcomingPlans.length} ta yaqinlashayotgan reja topildi`
				)

				// Har bir reja uchun foydalanuvchiga xabar yuborish
				for (const plan of upcomingPlans) {
					const user = await User.findById(plan.userId)
					if (user && user.isActive) {
						const timeLeft = Math.ceil(
							(new Date(plan.scheduledTime).getTime() - now.getTime()) /
								(60 * 1000)
						)
						await sendUserNotification(
							user,
							`⚠️ *MUHIM ESLATMA*: "${plan.title}" rejangizni bajarish vaqti ${timeLeft} daqiqa qoldi! Ishni bajarishni boshlang!`
						)
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
				})

				console.log(`⏰ ${overduePlans.length} ta vaqti o'tgan reja topildi`)

				for (const plan of overduePlans) {
					const user = await User.findById(plan.userId)
					if (user && user.isActive) {
						await sendUserNotification(
							user,
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
