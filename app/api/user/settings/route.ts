import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import mongoose, { Schema, models } from 'mongoose'

interface IUserSettings {
	_id?: string
	telegramChatId: string
	createdAt: Date
	updatedAt: Date
}

const userSettingsSchema = new Schema<IUserSettings>(
	{
		telegramChatId: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
)

const UserSettings =
	models.UserSettings ||
	mongoose.model<IUserSettings>('UserSettings', userSettingsSchema)

export async function GET() {
	try {
		await connectDB()
		const settings = await UserSettings.find()
		return NextResponse.json(settings)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		if (!body.telegramChatId) {
			return NextResponse.json(
				{ error: 'Telegram Chat ID is required' },
				{ status: 400 }
			)
		}

		await connectDB()

		// Mavjud bo'lsa yangilash, yo'q bo'lsa yangi yaratish
		const settings = await UserSettings.findOneAndUpdate(
			{ telegramChatId: body.telegramChatId },
			{ telegramChatId: body.telegramChatId },
			{ upsert: true, new: true }
		)

		return NextResponse.json(settings, { status: 201 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
