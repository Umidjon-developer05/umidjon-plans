import { type NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Plan } from '@/lib/models/plan'

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB()

		const updatedPlan = await Plan.findByIdAndUpdate(
			params.id,
			{ $set: { isCompleted: true } },
			{ new: true }
		)

		if (!updatedPlan) {
			return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
		}

		return NextResponse.json(updatedPlan)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
