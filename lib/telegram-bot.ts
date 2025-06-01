import TelegramBot from 'node-telegram-bot-api'

let bot: TelegramBot | null = null

export function initBot() {
	if (!bot) {
		const token = process.env.TELEGRAM_BOT_TOKEN
		if (!token) {
			console.error('❌ TELEGRAM_BOT_TOKEN is not defined')
			return null
		}

		try {
			bot = new TelegramBot(token, { polling: false })
			console.log('✅ Telegram bot initialized')
		} catch (error) {
			console.error('❌ Telegram bot initialization error:', error)
			return null
		}
	}
	return bot
}

export async function sendNotification(chatId: string, message: string) {
	const bot = initBot()
	if (!bot) {
		console.error('❌ Bot not initialized')
		return false
	}

	try {
		console.log(`📤 Xabar yuborilmoqda: ${chatId}`)
		console.log(`📝 Xabar matni: ${message}`)

		// Markdown formatini qo'llab xabarni yuborish
		await bot.sendMessage(chatId, message, {
			parse_mode: 'Markdown',
			disable_notification: false, // Ovozli bildirishnoma yuborish
		})
		console.log(`✅ Xabar muvaffaqiyatli yuborildi: ${chatId}`)
		return true
	} catch (error) {
		console.error(`❌ Xabar yuborishda xatolik: ${chatId}`, error)
		return false
	}
}
