'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import type { IPlan } from '@/lib/models/plan'
import PlanItem from '@/components/plan-item'
import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import Navbar from '@/components/navbar'
import { SchedulerInitializer } from '@/components/scheduler-initializer'

export default function PlansPage() {
	const { user } = useAuth()
	const [plans, setPlans] = useState<IPlan[]>([])
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('all')

	useEffect(() => {
		if (user) {
			fetchPlans()
		}
	}, [user])

	async function fetchPlans() {
		if (!user) return

		try {
			setLoading(true)
			const response = await fetch(`/api/plans?userId=${user._id}`)
			const data = await response.json()
			setPlans(data)
		} catch (error) {
			console.error('Error fetching plans:', error)
		} finally {
			setLoading(false)
		}
	}

	async function handleStatusChange(id: string, isCompleted: boolean) {
		try {
			const endpoint = isCompleted
				? `/api/plans/${id}/complete`
				: `/api/plans/${id}/incomplete`
			await fetch(endpoint, {
				method: 'PUT',
			})
			fetchPlans()
		} catch (error) {
			console.error('Error updating plan status:', error)
		}
	}

	async function handleDelete(id: string) {
		try {
			await fetch(`/api/plans/${id}`, {
				method: 'DELETE',
			})
			fetchPlans()
		} catch (error) {
			console.error('Error deleting plan:', error)
		}
	}

	const completedPlans = plans.filter(plan => plan.isCompleted)
	const incompletePlans = plans.filter(plan => !plan.isCompleted)

	return (
		<AuthGuard>
			<Navbar />
			<main className='flex-1 container mx-auto px-4 py-8'>
				<div className='space-y-6'>
					<div className='flex items-center justify-between'>
						<h1 className='text-3xl font-bold'>Rejalar</h1>
						<Button asChild>
							<Link href='/plans/add'>
								<Plus className='h-4 w-4 mr-1' />
								Yangi reja
							</Link>
						</Button>
					</div>

					<Tabs
						defaultValue='all'
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='all'>Barcha rejalar</TabsTrigger>
							<TabsTrigger value='completed'>Bajarilgan</TabsTrigger>
							<TabsTrigger value='incomplete'>Bajarilmagan</TabsTrigger>
						</TabsList>

						{loading ? (
							<div className='flex justify-center py-12'>
								<Loader2 className='h-8 w-8 animate-spin text-primary' />
							</div>
						) : (
							<>
								<TabsContent value='all' className='space-y-4 mt-4'>
									{plans.length === 0 ? (
										<Card>
											<CardContent className='py-8 text-center'>
												<p className='text-muted-foreground'>
													Hech qanday reja topilmadi
												</p>
												<Button asChild className='mt-4'>
													<Link href='/plans/add'>Yangi reja qo'shish</Link>
												</Button>
											</CardContent>
										</Card>
									) : (
										plans.map(plan => (
											<PlanItem
												key={plan._id}
												plan={plan}
												onStatusChange={handleStatusChange}
												onDelete={handleDelete}
											/>
										))
									)}
								</TabsContent>

								<TabsContent value='completed' className='space-y-4 mt-4'>
									{completedPlans.length === 0 ? (
										<Card>
											<CardContent className='py-8 text-center'>
												<p className='text-muted-foreground'>
													Bajarilgan rejalar yo'q
												</p>
											</CardContent>
										</Card>
									) : (
										completedPlans.map(plan => (
											<PlanItem
												key={plan._id}
												plan={plan}
												onStatusChange={handleStatusChange}
												onDelete={handleDelete}
											/>
										))
									)}
								</TabsContent>

								<TabsContent value='incomplete' className='space-y-4 mt-4'>
									{incompletePlans.length === 0 ? (
										<Card>
											<CardContent className='py-8 text-center'>
												<p className='text-muted-foreground'>
													Bajarilmagan rejalar yo'q
												</p>
											</CardContent>
										</Card>
									) : (
										incompletePlans.map(plan => (
											<PlanItem
												key={plan._id}
												plan={plan}
												onStatusChange={handleStatusChange}
												onDelete={handleDelete}
											/>
										))
									)}
								</TabsContent>
							</>
						)}
					</Tabs>
				</div>
			</main>
			<SchedulerInitializer />
		</AuthGuard>
	)
}
