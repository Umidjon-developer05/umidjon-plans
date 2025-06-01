import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
	return (
		<div className='flex flex-col items-center justify-center min-h-[80vh] gap-8'>
			<div className='text-center space-y-4'>
				<h1 className='text-4xl font-bold'>Reja Planner</h1>
				<p className='text-xl text-muted-foreground'>
					Rejalaringizni samarali boshqaring va Telegram orqali eslatmalar oling
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
	)
}
