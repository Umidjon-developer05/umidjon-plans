'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2, Bot, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function LoginPage() {
	const router = useRouter()
	const { login } = useAuth()
	const [loading, setLoading] = useState(false)
	const [telegramChatId, setTelegramChatId] = useState('')
	const [telegramBotToken, setTelegramBotToken] = useState('')
	const [name, setName] = useState('')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!telegramChatId || !telegramBotToken) {
			toast.error("Barcha maydonlarni to'ldiring")
			return
		}

		try {
			setLoading(true)

			const success = await login(telegramChatId, telegramBotToken, name)

			if (success) {
				toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
				router.push('/plans')
			} else {
				toast.error("Ro'yxatdan o'tishda xatolik yuz berdi")
			}
		} catch (error) {
			console.error('Login error:', error)
			toast.error("Ro'yxatdan o'tishda xatolik yuz berdi")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
			<div className='max-w-md w-full mx-4'>
				<div className='text-center mb-8'>
					<Bot className='h-16 w-16 mx-auto text-blue-600 mb-4' />
					<h1 className='text-3xl font-bold'>Reja Planner</h1>
					<p className='text-muted-foreground mt-2'>
						Telegram bot bilan rejalaringizni boshqaring
					</p>
				</div>

				<Alert className='mb-6'>
					<MessageCircle className='h-4 w-4' />
					<AlertTitle>Qanday boshlash kerak?</AlertTitle>
					<AlertDescription className='space-y-2'>
						<p>1. Telegram da @BotFather ga o'ting</p>
						<p>2. /newbot buyrug'i bilan yangi bot yarating</p>
						<p>3. Bot token ni oling</p>
						<p>4. @ChatidTelegramBot dan o'z Chat ID ni oling</p>
					</AlertDescription>
				</Alert>

				<form onSubmit={handleSubmit}>
					<Card>
						<CardHeader>
							<CardTitle>Ro'yxatdan o'tish</CardTitle>
							<CardDescription>
								Telegram bot ma'lumotlaringizni kiriting
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Ismingiz (ixtiyoriy)</Label>
								<Input
									id='name'
									placeholder='Ismingizni kiriting'
									value={name}
									onChange={e => setName(e.target.value)}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='chatId'>Telegram Chat ID</Label>
								<Input
									id='chatId'
									placeholder='123456789'
									value={telegramChatId}
									onChange={e => setTelegramChatId(e.target.value)}
									required
								/>
								<p className='text-xs text-muted-foreground'>
									@userinfobot dan oling
								</p>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='botToken'>Telegram Bot Token</Label>
								<Input
									id='botToken'
									type='password'
									placeholder='1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'
									value={telegramBotToken}
									onChange={e => setTelegramBotToken(e.target.value)}
									required
								/>
								<p className='text-xs text-muted-foreground'>
									@BotFather dan oling
								</p>
							</div>
						</CardContent>
						<CardFooter>
							<Button type='submit' disabled={loading} className='w-full'>
								{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Ro'yxatdan o'tish
							</Button>
						</CardFooter>
					</Card>
				</form>
			</div>
		</div>
	)
}
