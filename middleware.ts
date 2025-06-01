import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let schedulerInitialized = false

export async function middleware(request: NextRequest) {
	// Scheduler ni faqat bir marta ishga tushirish
	if (!schedulerInitialized && process.env.NODE_ENV === 'production') {
		try {
			// Scheduler ni ishga tushirish
			await fetch(new URL('/api/init', request.url))
			schedulerInitialized = true
			console.log('✅ Scheduler middleware orqali ishga tushirildi')
		} catch (error) {
			console.error('❌ Scheduler ishga tushirishda xatolik:', error)
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
}
