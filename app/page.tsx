'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import Navbar from '@/components/navbar'

export default function Home() {
	const { user } = useAuth()

	if (!user) {
		return (
			<div className='min-h-screen flex flex-col'>
				<div className='flex flex-col items-center justify-center flex-1 gap-8'>
					<div className='text-center space-y-4'>
						<h1 className='text-4xl font-bold'>Reja Planner</h1>
						<p className='text-xl text-muted-foreground'>
							Rejalaringizni samarali boshqaring va Telegram orqali eslatmalar
							oling
						</p>
					</div>
					<div className='flex gap-4'>
						<Button asChild size='lg'>
							<Link href='/login'>Boshlash</Link>
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<AuthGuard>
			<Navbar />
			<main className='flex-1 container mx-auto px-4 py-8'>
				<div className='flex flex-col items-center justify-center min-h-[60vh] gap-8'>
					<div className='text-center space-y-4'>
						<h1 className='text-4xl font-bold'>Xush kelibsiz, {user.name}!</h1>
						<p className='text-xl text-muted-foreground'>
							Rejalaringizni boshqaring va Telegram orqali eslatmalar oling
						</p>
					</div>
					<div className='flex gap-4'>
						<Button asChild size='lg'>
							<Link href='/plans'>Rejalarni ko'rish</Link>
						</Button>
						<Button asChild size='lg' variant='outline'>
							<Link href='/plans/add'>Yangi reja qo'shish</Link>
						</Button>
					</div>
				</div>
			</main>
		</AuthGuard>
	)
}
