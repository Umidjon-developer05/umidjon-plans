'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from './mode-toggle'
import { CalendarCheck, ListTodo, Plus, Settings } from 'lucide-react'

export default function Navbar() {
	const pathname = usePathname()

	return (
		<header className='border-b'>
			<div className='container mx-auto px-4 py-3 flex items-center justify-between'>
				<Link href='/' className='flex items-center gap-2'>
					<CalendarCheck className='h-6 w-6' />
					<span className='font-bold text-xl'>Reja Planner</span>
				</Link>

				<nav className='hidden md:flex items-center gap-6'>
					<Link
						href='/plans'
						className={`flex items-center gap-1 ${
							pathname === '/plans' ? 'font-medium' : 'text-muted-foreground'
						}`}
					>
						<ListTodo className='h-4 w-4' />
						<span>Rejalar</span>
					</Link>
					<Link
						href='/plans/add'
						className={`flex items-center gap-1 ${
							pathname === '/plans/add'
								? 'font-medium'
								: 'text-muted-foreground'
						}`}
					>
						<Plus className='h-4 w-4' />
						<span>Yangi reja</span>
					</Link>
					<Link
						href='/settings'
						className={`flex items-center gap-1 ${
							pathname === '/settings' ? 'font-medium' : 'text-muted-foreground'
						}`}
					>
						<Settings className='h-4 w-4' />
						<span>Sozlamalar</span>
					</Link>
				</nav>

				<div className='flex items-center gap-2'>
					<ModeToggle />
					<Button asChild size='sm' className='hidden md:flex'>
						<Link href='/plans/add'>
							<Plus className='h-4 w-4 mr-1' />
							Yangi reja
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
