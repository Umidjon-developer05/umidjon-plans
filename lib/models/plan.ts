import mongoose, { Schema, models } from 'mongoose'

export interface IPlan {
	_id?: string
	title: string
	description?: string
	scheduledTime: Date
	isCompleted: boolean
	userId: string
	telegramChatId: string
	notificationSent: boolean // Xabar yuborilganligini saqlash uchun
	createdAt: Date
	updatedAt: Date
}

const planSchema = new Schema<IPlan>(
	{
		title: { type: String, required: true },
		description: { type: String },
		scheduledTime: { type: Date, required: true },
		isCompleted: { type: Boolean, default: false },
		userId: { type: String, required: true },
		telegramChatId: { type: String, required: true },
		notificationSent: { type: Boolean, default: false }, // Xabar yuborilganligini saqlash uchun
	},
	{ timestamps: true }
)

// Index qo'shish tez qidirish uchun
planSchema.index({ userId: 1 })
planSchema.index({ telegramChatId: 1 })

export const Plan = models.Plan || mongoose.model<IPlan>('Plan', planSchema)
