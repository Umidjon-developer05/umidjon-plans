import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Plan } from '@/lib/models/plan'

export async function GET() {
	try {
		await connectDB()
		const plans = await Plan.find().sort({ scheduledTime: 1 })
		return NextResponse.json(plans)
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

		if (!body.title || !body.scheduledTime) {
			return NextResponse.json(
				{ error: 'Title and scheduled time are required' },
				{ status: 400 }
			)
		}

		await connectDB()
		const newPlan = new Plan({
			title: body.title,
			description: body.description,
			scheduledTime: new Date(body.scheduledTime),
			isCompleted: false,
		})

		await newPlan.save()
		return NextResponse.json(newPlan, { status: 201 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
