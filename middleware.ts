import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let schedulerInitialized = false

export async function middleware(request: NextRequest) {
	// Scheduler faqat productionda ishga tushadi
	if (!schedulerInitialized && process.env.NODE_ENV === 'production') {
		try {
			await fetch(new URL('/api/init', request.url))
			schedulerInitialized = true
			console.log('✅ Scheduler middleware orqali ishga tushirildi')
		} catch (error) {
			console.error('❌ Scheduler ishga tushirishda xatolik:', error)
		}
	}

	// Cookie orqali telegramChatId ni olish
	const telegramChatId = request.cookies.get('telegramChatId')?.value

	// Agar /debug sahifasiga request bo‘lsa va chatId mos kelmasa => redirect
	if (
		request.nextUrl.pathname === '/debug' &&
		telegramChatId !== '6038292163'
	) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
