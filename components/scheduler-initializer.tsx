'use client'

import { useEffect } from 'react'

export function SchedulerInitializer() {
	useEffect(() => {
		// Scheduler ni ishga tushirish
		const initializeScheduler = async () => {
			try {
				console.log('🚀 Scheduler ni ishga tushirish...')
				const response = await fetch('/api/init')
				const data = await response.json()
				console.log('✅ Scheduler javobi:', data)
			} catch (error) {
				console.error('❌ Scheduler ishga tushirishda xatolik:', error)
			}
		}

		// 3 sekund kutib scheduler ni ishga tushirish
		const timer = setTimeout(initializeScheduler, 3000)

		return () => clearTimeout(timer)
	}, [])

	return null
}
