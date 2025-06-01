'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import type { IUser } from './models/user'

interface AuthContextType {
	user: IUser | null
	login: (
		telegramChatId: string,
		telegramBotToken: string,
		name?: string
	) => Promise<boolean>
	logout: () => void
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<IUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// LocalStorage dan foydalanuvchi ma'lumotlarini olish
		const savedUser = localStorage.getItem('currentUser')
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser))
			} catch (error) {
				console.error('Error parsing saved user:', error)
				localStorage.removeItem('currentUser')
			}
		}
		setIsLoading(false)
	}, [])

	const login = async (
		telegramChatId: string,
		telegramBotToken: string,
		name?: string
	): Promise<boolean> => {
		try {
			setIsLoading(true)

			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					telegramChatId,
					telegramBotToken,
					name,
				}),
			})

			if (!response.ok) {
				throw new Error('Login failed')
			}

			const userData = await response.json()
			setUser(userData.user)
			localStorage.setItem('currentUser', JSON.stringify(userData.user))
			return true
		} catch (error) {
			console.error('Login error:', error)
			return false
		} finally {
			setIsLoading(false)
		}
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('currentUser')
	}

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
