import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { submissionId } = await req.json()

        if (!submissionId) {
            return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
        }

        // Increment vote count
        const { error } = await supabase
            .from('challenge_submissions')
            .update({ votes: supabase.raw('votes + 1') })
            .eq('id', submissionId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error voting:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
