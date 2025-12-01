import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { name, feedback, email, category } = await req.json()

        if (!feedback?.trim()) {
            return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
        }

        // Store feedback in Supabase
        const { error } = await supabase
            .from('feedback')
            .insert([{
                name: name?.trim() || 'Anonymous',
                email: email?.trim() || null,
                feedback: feedback.trim(),
                category: category || 'general',
                created_at: new Date().toISOString()
            }])

        if (error) {
            // If table doesn't exist, just log to console (graceful fallback)
            console.log('[Feedback received]', { name, email, category, feedback: feedback.slice(0, 100) })
        }

        // In production, you could also send an email notification here
        // using Resend, SendGrid, or similar service

        return NextResponse.json({ success: true, message: 'Feedback received!' })
    } catch (err) {
        console.error('Feedback API error:', err)
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }
}
