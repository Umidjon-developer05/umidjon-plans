'use client'

import type { IPlan } from '@/lib/models/plan'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Trash, XCircle, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useState, useEffect } from 'react'

interface PlanItemProps {
	plan: IPlan
	onStatusChange: (id: string, isCompleted: boolean) => void
	onDelete: (id: string) => void
}

export default function PlanItem({
	plan,
	onStatusChange,
	onDelete,
}: PlanItemProps) {
	const [now, setNow] = useState(new Date())
	const isOverdue = new Date(plan.scheduledTime) < now && !plan.isCompleted
	const scheduledTime = new Date(plan.scheduledTime)
	const minutesLeft = differenceInMinutes(scheduledTime, now)
	const isUrgent = minutesLeft <= 3 && minutesLeft > 0 && !plan.isCompleted

	// Real vaqtda yangilanish uchun
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date())
		}, 30000) // Har 30 sekundda yangilanadi

		return () => clearInterval(timer)
	}, [])

	return (
		<Card
			className={`${
				plan.isCompleted
					? 'bg-muted/30'
					: isUrgent
					? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
					: ''
			}`}
		>
			<CardContent className='p-4'>
				<div className='flex items-start justify-between'>
					<div className='space-y-1'>
						<div className='flex items-center gap-2'>
							<h3
								className={`font-medium text-lg ${
									plan.isCompleted ? 'line-through text-muted-foreground' : ''
								}`}
							>
								{plan.title}
							</h3>
							{plan.isCompleted ? (
								<Badge
									variant='outline'
									className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
								>
									✅ Bajarilgan
								</Badge>
							) : isOverdue ? (
								<Badge
									variant='outline'
									className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
								>
									❌ Bajarilmagan
								</Badge>
							) : isUrgent ? (
								<Badge
									variant='outline'
									className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 animate-pulse'
								>
									<AlertTriangle className='h-3 w-3 mr-1' />
									{minutesLeft} daqiqa qoldi!
								</Badge>
							) : (
								<Badge
									variant='outline'
									className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
								>
									⏳ Kutilmoqda
								</Badge>
							)}
						</div>
						{plan.description && (
							<p
								className={`text-sm ${
									plan.isCompleted ? 'text-muted-foreground' : ''
								}`}
							>
								{plan.description}
							</p>
						)}
						<div className='flex items-center gap-1 text-xs text-muted-foreground'>
							<Clock className='h-3 w-3' />
							<span>
								{format(scheduledTime, 'd-MMM yyyy, HH:mm')} (
								{formatDistanceToNow(scheduledTime, {
									addSuffix: true,
									locale: uz,
								})}
								)
							</span>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className='p-4 pt-0 flex justify-end gap-2'>
				{!plan.isCompleted ? (
					<Button
						size='sm'
						variant='outline'
						className='text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700'
						onClick={() => onStatusChange(plan._id!, true)}
					>
						<CheckCircle className='h-4 w-4 mr-1' />
						Bajarildi
					</Button>
				) : (
					<Button
						size='sm'
						variant='outline'
						onClick={() => onStatusChange(plan._id!, false)}
					>
						<XCircle className='h-4 w-4 mr-1' />
						Bajarilmadi
					</Button>
				)}
				<Button
					size='sm'
					variant='outline'
					className='text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700'
					onClick={() => onDelete(plan._id!)}
				>
					<Trash className='h-4 w-4 mr-1' />
					O'chirish
				</Button>
			</CardFooter>
		</Card>
	)
}
