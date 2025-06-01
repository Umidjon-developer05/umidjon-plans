import mongoose, { Schema, models } from 'mongoose'

export interface IUser {
	_id?: string
	telegramChatId: string
	telegramBotToken: string
	name?: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

const userSchema = new Schema<IUser>(
	{
		telegramChatId: { type: String, required: true, unique: true },
		telegramBotToken: { type: String, required: true },
		name: { type: String },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
)

export const User = models.User || mongoose.model<IUser>('User', userSchema)
