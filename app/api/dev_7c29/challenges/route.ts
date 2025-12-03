import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all challenges with submissions count
export async function GET() {
    try {
        // Get all challenges
        const { data: challenges, error } = await supabase
            .from('daily_challenges')
            .select('*')
            .order('challenge_date', { ascending: false })
            .limit(50)

        if (error) throw error

        // Get submission counts for each challenge
        const challengeIds = challenges?.map(c => c.id) || []

        const { data: submissionCounts, error: countError } = await supabase
            .from('challenge_submissions')
            .select('challenge_id')

        if (countError) throw countError

        // Count submissions per challenge
        const counts: Record<string, number> = {}
        submissionCounts?.forEach(s => {
            counts[s.challenge_id] = (counts[s.challenge_id] || 0) + 1
        })

        // Merge counts with challenges
        const challengesWithCounts = challenges?.map(c => ({
            ...c,
            submission_count: counts[c.id] || 0
        }))

        return NextResponse.json({ challenges: challengesWithCounts || [] })
    } catch (error) {
        console.error('Error fetching challenges:', error)
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
    }
}

// POST - Create a new challenge
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { prompt, style, mood, challenge_date, bonus_xp } = body

        if (!prompt || !challenge_date) {
            return NextResponse.json({ error: 'Prompt and date are required' }, { status: 400 })
        }

        // Check if challenge already exists for this date
        const { data: existing } = await supabase
            .from('daily_challenges')
            .select('id')
            .eq('challenge_date', challenge_date)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Challenge already exists for this date' }, { status: 400 })
        }

        const { data: challenge, error } = await supabase
            .from('daily_challenges')
            .insert({
                prompt,
                style: style || 'Arcane',
                mood: mood || 'Mysterious',
                challenge_date,
                bonus_xp: bonus_xp || 100
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ challenge })
    } catch (error) {
        console.error('Error creating challenge:', error)
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
    }
}

// PATCH - Update a challenge or pick winner
export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, prompt, style, mood, winner_id, action } = body

        if (!id) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
        }

        if (action === 'pick_winner' && winner_id) {
            // Update challenge with winner
            const { data, error } = await supabase
                .from('daily_challenges')
                .update({ winner_id })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            // Award badge to winner (if user_badges table exists)
            try {
                await supabase
                    .from('user_badges')
                    .upsert({
                        user_id: winner_id,
                        badge_id: 'challenge_champion',
                        earned_at: new Date().toISOString()
                    }, { onConflict: 'user_id,badge_id' })
            } catch {
                // Badge table might not exist, continue
            }

            return NextResponse.json({ challenge: data, message: 'Winner selected!' })
        }

        // Regular update
        const updateData: Record<string, string> = {}
        if (prompt) updateData.prompt = prompt
        if (style) updateData.style = style
        if (mood) updateData.mood = mood

        const { data, error } = await supabase
            .from('daily_challenges')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ challenge: data })
    } catch (error) {
        console.error('Error updating challenge:', error)
        return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 })
    }
}

// DELETE - Delete a challenge
export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
        }

        // First delete submissions
        await supabase
            .from('challenge_submissions')
            .delete()
            .eq('challenge_id', id)

        // Then delete challenge
        const { error } = await supabase
            .from('daily_challenges')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting challenge:', error)
        return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 })
    }
}
