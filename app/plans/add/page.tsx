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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import Navbar from '@/components/navbar'

export default function AddPlanPage() {
	const router = useRouter()
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [time, setTime] = useState('12:00')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!title || !date || !user) {
			toast.error('Reja nomi va vaqtini kiriting')
			return
		}

		try {
			setLoading(true)

			// Sana va vaqtni birlashtirish
			const [hours, minutes] = time.split(':').map(Number)
			const scheduledTime = new Date(date)
			scheduledTime.setHours(hours, minutes)

			const response = await fetch('/api/plans', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title,
					description,
					scheduledTime,
					userId: user._id,
				}),
			})

			if (!response.ok) {
				throw new Error("Reja qo'shishda xatolik yuz berdi")
			}

			toast.success("Reja muvaffaqiyatli qo'shildi")
			router.push('/plans')
			router.refresh()
		} catch (error) {
			console.error('Error adding plan:', error)
			toast.error("Reja qo'shishda xatolik yuz berdi")
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthGuard>
			<Navbar />
			<main className='flex-1 container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<h1 className='text-3xl font-bold mb-6'>Yangi reja qo'shish</h1>

					<form onSubmit={handleSubmit}>
						<Card>
							<CardHeader>
								<CardTitle>Reja ma'lumotlari</CardTitle>
								<CardDescription>
									Rejangiz haqida ma'lumotlarni kiriting va vaqtini belgilang
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='title'>Reja nomi</Label>
									<Input
										id='title'
										placeholder='Reja nomini kiriting'
										value={title}
										onChange={e => setTitle(e.target.value)}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='description'>Tavsif (ixtiyoriy)</Label>
									<Textarea
										id='description'
										placeholder="Reja haqida qo'shimcha ma'lumot"
										value={description}
										onChange={e => setDescription(e.target.value)}
										rows={3}
									/>
								</div>

								<div className='space-y-2'>
									<Label>Sana</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'w-full justify-start text-left font-normal',
													!date && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{date ? format(date, 'PPP') : 'Sanani tanlang'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={date}
												onSelect={setDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='time'>Vaqt</Label>
									<Input
										id='time'
										type='time'
										value={time}
										onChange={e => setTime(e.target.value)}
										required
									/>
								</div>
							</CardContent>
							<CardFooter className='flex justify-between'>
								<Button
									type='button'
									variant='outline'
									onClick={() => router.push('/plans')}
								>
									Bekor qilish
								</Button>
								<Button type='submit' disabled={loading}>
									{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
									Rejani saqlash
								</Button>
							</CardFooter>
						</Card>
					</form>
				</div>
			</main>
		</AuthGuard>
	)
}
