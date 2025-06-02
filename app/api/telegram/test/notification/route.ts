import { type NextRequest, NextResponse } from 'next/server'
import { sendNotification } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { chatId, message } = body

		if (!chatId || !message) {
			return NextResponse.json(
				{ error: 'chatId and message are required' },
				{ status: 400 }
			)
		}

		const success = await sendNotification(chatId, message)

		return NextResponse.json({
			success,
			message: success
				? 'Notification sent successfully'
				: 'Failed to send notification',
			chatId,
			sentMessage: message,
		})
	} catch (error) {
		console.error('Test notification error:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
