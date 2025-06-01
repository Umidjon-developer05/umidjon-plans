'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function SettingsPage() {
	const [chatId, setChatId] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		// Saqlangan chat ID ni olish
		const savedChatId = localStorage.getItem('TELEGRAM_CHAT_ID') || ''
		setChatId(savedChatId)
	}, [])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!chatId) {
			toast.error('Telegram Chat ID ni kiriting')
			return
		}

		try {
			setLoading(true)

			// Chat ID ni serverga saqlash
			const response = await fetch('/api/user/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					telegramChatId: chatId,
				}),
			})

			if (!response.ok) {
				throw new Error('Sozlamalarni saqlashda xatolik')
			}

			// LocalStorage ga ham saqlash
			localStorage.setItem('TELEGRAM_CHAT_ID', chatId)

			// Test xabar yuborish
			try {
				const testResponse = await fetch(`/api/telegram/test?chatId=${chatId}`)
				if (!testResponse.ok) {
					throw new Error('Test xabar yuborishda xatolik')
				}
				const data = await testResponse.json()
				if (data.success) {
					toast.success('Sozlamalar saqlandi va test xabar yuborildi!')
				} else {
					toast.error('Test xabar yuborishda xatolik: ' + data.error)
				}
			} catch (error) {
				console.error('Error sending test message:', error)
				toast.error('Test xabar yuborishda xatolik')
			}

			toast.success('Telegram sozlamalari muvaffaqiyatli saqlandi')
		} catch (error) {
			console.error('Error saving settings:', error)
			toast.error('Sozlamalarni saqlashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='max-w-2xl mx-auto'>
			<h1 className='text-3xl font-bold mb-6'>Sozlamalar</h1>

			<Alert className='mb-6'>
				<AlertTriangle className='h-4 w-4' />
				<AlertTitle>Muhim ma'lumot</AlertTitle>
				<AlertDescription>
					Telegram orqali eslatmalar olish uchun, avval botimizga start bering
					va Chat ID ni kiriting.
				</AlertDescription>
			</Alert>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Telegram bot sozlamalari</CardTitle>
						<CardDescription>
							Telegram bot orqali eslatmalar olish uchun sozlamalarni kiriting
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='chatId'>Telegram Chat ID</Label>
							<Input
								id='chatId'
								placeholder='Telegram Chat ID ni kiriting (masalan: 123456789)'
								value={chatId}
								onChange={e => setChatId(e.target.value)}
								required
							/>
							<p className='text-xs text-muted-foreground'>
								Chat ID ni olish uchun Telegram da @userinfobot ga /start
								yuboring va o'z ID ingizni oling
							</p>
						</div>
					</CardContent>
					<CardFooter className='flex gap-4'>
						<Button type='submit' disabled={loading}>
							{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Saqlash va test qilish
						</Button>
						<Button
							type='button'
							variant='outline'
							disabled={loading || !chatId}
							onClick={async () => {
								try {
									setLoading(true)
									const response = await fetch(
										`/api/telegram/test?chatId=${chatId}`
									)
									if (!response.ok) {
										throw new Error('Test xabar yuborishda xatolik')
									}
									const data = await response.json()
									if (data.success) {
										toast.success('Test xabar muvaffaqiyatli yuborildi!')
									} else {
										toast.error('Test xabar yuborishda xatolik: ' + data.error)
									}
								} catch (error) {
									console.error('Error sending test message:', error)
									toast.error('Test xabar yuborishda xatolik')
								} finally {
									setLoading(false)
								}
							}}
						>
							Faqat test xabar yuborish
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	)
}
