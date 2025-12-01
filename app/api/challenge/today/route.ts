import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        const today = new Date().toISOString().split('T')[0]

        // Get today's challenge
        const { data: challenge, error: challengeError } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('challenge_date', today)
            .single()

        if (challengeError) {
            // Create today's challenge if it doesn't exist
            const prompts = [
                { prompt: 'A dream where you can fly over your hometown', style: 'Arcane', mood: 'Adventurous' },
                { prompt: 'Meeting a mysterious stranger in a foggy forest', style: 'Gothic', mood: 'Mysterious' },
                { prompt: 'Discovering a hidden room in your house', style: 'Retro Comic', mood: 'Curious' },
                { prompt: 'Being chased by something you can never see', style: 'Dark Fantasy', mood: 'Tense' },
                { prompt: 'Finding a portal to another dimension', style: 'Cyberpunk', mood: 'Exciting' },
            ]

            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

            const { data: newChallenge, error: createError } = await supabase
                .from('daily_challenges')
                .insert({ ...randomPrompt, challenge_date: today })
                .select()
                .single()

            if (createError) throw createError

            return NextResponse.json({
                challenge: newChallenge,
                submissions: [],
                hasSubmitted: false
            })
        }

        // Get submissions for this challenge
        const { data: submissions, error: submissionsError } = await supabase
            .from('challenge_submissions')
            .select(`
        *,
        dream:dreams (
          text,
          panels (image_url, description)
        )
      `)
            .eq('challenge_id', challenge.id)
            .order('votes', { ascending: false })
            .limit(20)

        if (submissionsError) throw submissionsError

        // Check if current user has submitted
        const hasSubmitted = userId
            ? submissions?.some(s => s.user_id === userId) || false
            : false

        return NextResponse.json({
            challenge,
            submissions: submissions || [],
            hasSubmitted
        })
    } catch (error) {
        console.error('Error fetching challenge:', error)
        return NextResponse.json(
            { error: 'Internal server error', challenge: null },
            { status: 500 }
        )
    }
}
