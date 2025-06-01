import cron from 'node-cron'
import { Plan } from './models/plan'
import connectDB from './mongodb'
import { sendNotification } from './telegram-bot'
import mongoose, { Schema, models } from 'mongoose'

interface IUserSettings {
	_id?: string
	telegramChatId: string
	createdAt: Date
	updatedAt: Date
}

const userSettingsSchema = new Schema<IUserSettings>(
	{
		telegramChatId: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
)

const UserSettings =
	models.UserSettings ||
	mongoose.model<IUserSettings>('UserSettings', userSettingsSchema)

let schedulerInitialized = false
let cronJob: cron.ScheduledTask | null = null

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

		// Har 30 sekundda tekshirish (tezroq test qilish uchun)
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
				})

				console.log(
					`📋 ${upcomingPlans.length} ta yaqinlashayotgan reja topildi`
				)

				// Barcha foydalanuvchilarni olish
				const allUsers = await UserSettings.find()
				console.log(`👥 ${allUsers.length} ta foydalanuvchi topildi`)

				// Agar foydalanuvchi yo'q bo'lsa, localStorage dan olishga harakat qilamiz
				if (allUsers.length === 0) {
					console.log(
						'⚠️ Hech qanday foydalanuvchi topilmadi, environment variable dan foydalaniladi'
					)
					const envChatId = process.env.TELEGRAM_CHAT_ID
					if (envChatId) {
						console.log(`📱 Environment dan chat ID topildi: ${envChatId}`)
						// Environment dan chat ID ni bazaga saqlash
						try {
							const newUser = new UserSettings({ telegramChatId: envChatId })
							await newUser.save()
							console.log('✅ Chat ID bazaga saqlandi')
						} catch (error) {
							console.log('⚠️ Chat ID allaqachon mavjud yoki saqlashda xatolik')
						}
					}
				}

				// Rejalar uchun xabar yuborish
				for (const plan of upcomingPlans) {
					const timeLeft = Math.ceil(
						(new Date(plan.scheduledTime).getTime() - now.getTime()) /
							(60 * 1000)
					)

					// Barcha foydalanuvchilarga yuborish
					for (const user of allUsers) {
						try {
							await sendNotification(
								user.telegramChatId,
								`⚠️ *MUHIM ESLATMA*: "${plan.title}" rejangizni bajarish vaqti ${timeLeft} daqiqa qoldi! Ishni bajarishni boshlang!`
							)
							console.log(
								`✅ Xabar yuborildi: ${user.telegramChatId} - ${plan.title}`
							)
						} catch (error) {
							console.error(
								`❌ Xabar yuborishda xatolik: ${user.telegramChatId}`,
								error
							)
						}
					}

					// Environment variable dan ham yuborish
					const envChatId = process.env.TELEGRAM_CHAT_ID
					if (
						envChatId &&
						!allUsers.some(user => user.telegramChatId === envChatId)
					) {
						try {
							await sendNotification(
								envChatId,
								`⚠️ *MUHIM ESLATMA*: "${plan.title}" rejangizni bajarish vaqti ${timeLeft} daqiqa qoldi! Ishni bajarishni boshlang!`
							)
							console.log(
								`✅ Environment orqali xabar yuborildi: ${envChatId} - ${plan.title}`
							)
						} catch (error) {
							console.error(
								`❌ Environment orqali xabar yuborishda xatolik: ${envChatId}`,
								error
							)
						}
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
					// Barcha foydalanuvchilarga yuborish
					for (const user of allUsers) {
						try {
							await sendNotification(
								user.telegramChatId,
								`❌ *VAQT TUGADI*: "${plan.title}" rejangizni bajarish vaqti tugadi! Iltimos, tezda bajaring yoki statusini yangilang!`
							)
							console.log(
								`⏰ Vaqt tugadi xabari yuborildi: ${user.telegramChatId} - ${plan.title}`
							)
						} catch (error) {
							console.error(
								`❌ Vaqt tugadi xabarini yuborishda xatolik: ${user.telegramChatId}`,
								error
							)
						}
					}

					// Environment variable dan ham yuborish
					const envChatId = process.env.TELEGRAM_CHAT_ID
					if (
						envChatId &&
						!allUsers.some(user => user.telegramChatId === envChatId)
					) {
						try {
							await sendNotification(
								envChatId,
								`❌ *VAQT TUGADI*: "${plan.title}" rejangizni bajarish vaqti tugadi! Iltimos, tezda bajaring yoki statusini yangilang!`
							)
							console.log(
								`⏰ Environment orqali vaqt tugadi xabari yuborildi: ${envChatId} - ${plan.title}`
							)
						} catch (error) {
							console.error(
								`❌ Environment orqali vaqt tugadi xabarini yuborishda xatolik: ${envChatId}`,
								error
							)
						}
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
