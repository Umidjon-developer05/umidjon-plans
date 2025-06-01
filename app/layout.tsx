import type React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/navbar'
import { Toaster } from '@/components/toaster'
import { SchedulerInitializer } from '@/components/scheduler-initializer'
import { AuthProvider } from '@/lib/auth-context'

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
					<AuthProvider>
						<div className='min-h-screen flex flex-col'>
							<main className='flex-1 container mx-auto px-4 py-8'>
								{children}
							</main>
						</div>
						<Toaster />
						<SchedulerInitializer />
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
