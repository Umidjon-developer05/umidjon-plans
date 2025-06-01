import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Plan } from '@/lib/models/plan'
import { User } from '@/lib/models/user'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			)
		}

		await connectDB()
		const plans = await Plan.find({ userId }).sort({ scheduledTime: 1 })
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

		if (!body.title || !body.scheduledTime || !body.userId) {
			return NextResponse.json(
				{ error: 'Title, scheduled time and user ID are required' },
				{ status: 400 }
			)
		}

		await connectDB()

		// Foydalanuvchini topish
		const user = await User.findById(body.userId)
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const newPlan = new Plan({
			title: body.title,
			description: body.description,
			scheduledTime: new Date(body.scheduledTime),
			isCompleted: false,
			userId: body.userId,
			telegramChatId: user.telegramChatId,
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
