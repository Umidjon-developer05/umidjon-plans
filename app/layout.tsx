import type React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/navbar'
import { Toaster } from '@/components/toaster'
import { SchedulerInitializer } from '@/components/scheduler-initializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
	title: 'Reja Planner',
	description: 'Next.js bilan yaratilgan reja planner',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='uz' suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<div className='min-h-screen flex flex-col'>
						<Navbar />
						<main className='flex-1 container mx-auto px-4 py-8'>
							{children}
						</main>
					</div>
					<Toaster />
					<SchedulerInitializer />
				</ThemeProvider>
			</body>
		</html>
	)
}
