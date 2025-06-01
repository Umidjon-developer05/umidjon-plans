import mongoose, { Schema, models } from "mongoose"

export interface IPlan {
  _id?: string
  title: string
  description?: string
  scheduledTime: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

const planSchema = new Schema<IPlan>(
  {
    title: { type: String, required: true },
    description: { type: String },
    scheduledTime: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Plan = models.Plan || mongoose.model<IPlan>("Plan", planSchema)
