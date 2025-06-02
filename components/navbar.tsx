'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from './mode-toggle'
import { CalendarCheck, ListTodo, Plus, LogOut, User, Bug } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
	const pathname = usePathname()
	const { user, logout } = useAuth()

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
						href='/debug'
						className={`flex items-center gap-1 ${
							pathname === '/debug' ? 'font-medium' : 'text-muted-foreground'
						}`}
					>
						<Bug className='h-4 w-4' />
						<span>Debug</span>
					</Link>
				</nav>

				<div className='flex items-center gap-2'>
					<ModeToggle />

					{user && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='outline' size='sm'>
									<User className='h-4 w-4 mr-1' />
									{user.name || user.telegramChatId}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={logout}>
									<LogOut className='h-4 w-4 mr-2' />
									Chiqish
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

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
