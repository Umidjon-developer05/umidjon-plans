import { NextResponse } from 'next/server'
import { initBot } from '@/lib/telegram-bot'
import { initScheduler } from '@/lib/scheduler'

export async function GET() {
	try {
		console.log('🚀 Servislar ishga tushirilmoqda...')

		// Telegram botni ishga tushirish
		const bot = initBot()
		if (bot) {
			console.log('✅ Telegram bot ishga tushirildi')
		} else {
			console.log('❌ Telegram bot ishga tushirilmadi')
		}

		// Schedulerni ishga tushirish
		await initScheduler()

		return NextResponse.json({
			message: 'Services initialized successfully',
			timestamp: new Date().toISOString(),
			bot: !!bot,
			scheduler: true,
		})
	} catch (error) {
		console.error('❌ Servislarni ishga tushirishda xatolik:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
