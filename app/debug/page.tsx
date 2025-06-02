'use client'

import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Send, RefreshCw, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import Navbar from '@/components/navbar'

interface DebugData {
	currentTime: string
	currentTimeLocal: string
	upcomingPlans: number
	totalUsers: number
	totalPlans: number
	users: any[]
	plans: any[]
	upcomingPlansDetails: any[]
}

export default function DebugPage() {
	const { user } = useAuth()
	const [debugData, setDebugData] = useState<DebugData | null>(null)
	const [loading, setLoading] = useState(false)
	const [testLoading, setTestLoading] = useState(false)
	const [resetLoading, setResetLoading] = useState(false)

	async function fetchDebugData() {
		try {
			setLoading(true)
			const response = await fetch('/api/debug/scheduler')
			const data = await response.json()
			setDebugData(data)
		} catch (error) {
			console.error('Error fetching debug data:', error)
			toast.error("Debug ma'lumotlarini olishda xatolik")
		} finally {
			setLoading(false)
		}
	}

	async function sendTestNotification() {
		if (!user) return

		try {
			setTestLoading(true)
			const response = await fetch('/api/test/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user._id,
					message: `🧪 *Test xabar*: ${new Date().toLocaleString()} da yuborildi!`,
				}),
			})

			const data = await response.json()

			if (data.success) {
				toast.success('Test xabar muvaffaqiyatli yuborildi!')
			} else {
				toast.error(`Test xabar yuborishda xatolik: ${data.error}`)
			}
		} catch (error) {
			console.error('Error sending test notification:', error)
			toast.error('Test xabar yuborishda xatolik')
		} finally {
			setTestLoading(false)
		}
	}

	async function resetNotificationFlags() {
		try {
			setResetLoading(true)
			const response = await fetch('/api/debug/reset-notifications', {
				method: 'POST',
			})

			const data = await response.json()

			if (data.success) {
				toast.success(`${data.count} ta reja yangilandi!`)
				fetchDebugData()
			} else {
				toast.error(`Xatolik: ${data.error}`)
			}
		} catch (error) {
			console.error('Error resetting notification flags:', error)
			toast.error('Xatolik yuz berdi')
		} finally {
			setResetLoading(false)
		}
	}

	useEffect(() => {
		fetchDebugData()
	}, [])

	return (
		<AuthGuard>
			<Navbar />
			<main className='flex-1 container mx-auto px-4 py-8'>
				<div className='space-y-6'>
					<div className='flex items-center justify-between'>
						<h1 className='text-3xl font-bold'>Debug Panel</h1>
						<div className='flex gap-2'>
							<Button onClick={fetchDebugData} disabled={loading}>
								{loading ? (
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
								) : (
									<RefreshCw className='h-4 w-4 mr-2' />
								)}
								Yangilash
							</Button>
							<Button
								onClick={sendTestNotification}
								disabled={testLoading}
								variant='outline'
							>
								{testLoading ? (
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
								) : (
									<Send className='h-4 w-4 mr-2' />
								)}
								Test xabar
							</Button>
							<Button
								onClick={resetNotificationFlags}
								disabled={resetLoading}
								variant='destructive'
							>
								{resetLoading ? (
									<Loader2 className='h-4 w-4 animate-spin mr-2' />
								) : (
									<RotateCcw className='h-4 w-4 mr-2' />
								)}
								Xabar bayroqlarini tiklash
							</Button>
						</div>
					</div>

					{debugData && (
						<div className='grid gap-6'>
							<Card>
								<CardHeader>
									<CardTitle>Umumiy ma'lumotlar</CardTitle>
								</CardHeader>
								<CardContent className='space-y-2'>
									<p>
										<strong>Joriy vaqt:</strong> {debugData.currentTimeLocal}
									</p>
									<p>
										<strong>Jami foydalanuvchilar:</strong>{' '}
										{debugData.totalUsers}
									</p>
									<p>
										<strong>Jami rejalar:</strong> {debugData.totalPlans}
									</p>
									<p>
										<strong>Yaqinlashayotgan rejalar:</strong>{' '}
										{debugData.upcomingPlans}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Foydalanuvchilar</CardTitle>
									<CardDescription>
										{debugData.users.length} ta foydalanuvchi
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-2'>
										{debugData.users.map((user, index) => (
											<div key={index} className='p-3 border rounded'>
												<p>
													<strong>Ism:</strong> {user.name}
												</p>
												<p>
													<strong>Chat ID:</strong> {user.chatId}
												</p>
												<p>
													<strong>Holat:</strong>{' '}
													{user.isActive ? '✅ Faol' : '❌ Faol emas'}
												</p>
												<p>
													<strong>Bot token:</strong>{' '}
													{user.hasToken ? '✅ Mavjud' : "❌ Yo'q"}
												</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Yaqinlashayotgan rejalar</CardTitle>
									<CardDescription>
										{debugData.upcomingPlansDetails.length} ta reja
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-2'>
										{debugData.upcomingPlansDetails.length === 0 ? (
											<p className='text-muted-foreground'>
												Yaqinlashayotgan rejalar yo'q
											</p>
										) : (
											debugData.upcomingPlansDetails.map((plan, index) => (
												<div key={index} className='p-3 border rounded'>
													<p>
														<strong>Reja:</strong> {plan.title}
													</p>
													<p>
														<strong>Vaqt:</strong>{' '}
														{new Date(plan.scheduledTime).toLocaleString()}
													</p>
													<p>
														<strong>Qolgan vaqt:</strong> {plan.minutesLeft}{' '}
														daqiqa
													</p>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Barcha rejalar</CardTitle>
									<CardDescription>
										{debugData.plans.length} ta reja
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-2 max-h-96 overflow-y-auto'>
										{debugData.plans.map((plan, index) => (
											<div key={index} className='p-3 border rounded'>
												<p>
													<strong>Reja:</strong> {plan.title}
												</p>
												<p>
													<strong>Vaqt:</strong> {plan.scheduledTimeLocal}
												</p>
												<p>
													<strong>Holat:</strong>{' '}
													{plan.isCompleted ? '✅ Bajarilgan' : '⏳ Kutilmoqda'}
												</p>
												<p>
													<strong>Qolgan vaqt:</strong> {plan.minutesLeft}{' '}
													daqiqa
												</p>
												<p>
													<strong>Xabar yuborilgan:</strong>{' '}
													{plan.notificationSent ? '✅ Ha' : "❌ Yo'q"}
												</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</main>
		</AuthGuard>
	)
}
