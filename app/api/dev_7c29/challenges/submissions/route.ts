import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get submissions for a specific challenge
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const challengeId = searchParams.get('challenge_id')

        if (!challengeId) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
        }

        const { data: submissions, error } = await supabase
            .from('challenge_submissions')
            .select(`
        *,
        dream:dreams (
          id,
          text,
          style,
          mood,
          panels (id, image_url, description, scene_number)
        )
      `)
            .eq('challenge_id', challengeId)
            .order('votes', { ascending: false })

        if (error) throw error

        // Get user info for each submission
        const userIds = [...new Set(submissions?.map(s => s.user_id) || [])]

        const { data: users } = await supabase
            .from('users')
            .select('id, email')
            .in('id', userIds)

        const userMap: Record<string, { id: string; email: string }> = {}
        users?.forEach(u => { userMap[u.id] = u })

        const submissionsWithUsers = submissions?.map(s => ({
            ...s,
            user: userMap[s.user_id] || { id: s.user_id, email: 'Unknown' }
        }))

        return NextResponse.json({ submissions: submissionsWithUsers || [] })
    } catch (error) {
        console.error('Error fetching submissions:', error)
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }
}

// DELETE - Remove a submission
export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('challenge_submissions')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting submission:', error)
        return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
    }
}
