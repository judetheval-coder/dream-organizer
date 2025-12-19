import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

// GET - Fetch comments for a dream
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const dreamId = searchParams.get('dreamId')

        if (!dreamId) {
            return NextResponse.json({ error: 'dreamId required' }, { status: 400 })
        }

        const supabase = getClient()

        const { data: comments, error } = await supabase
            .from('comments')
            .select(`
                id,
                content,
                user_id,
                created_at,
                users (email)
            `)
            .eq('dream_id', dreamId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            // If comments table doesn't exist, return empty array
            if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
                return NextResponse.json({ comments: [] })
            }
            console.error('[API comments] Error fetching:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Format comments with usernames
        const formattedComments = (comments || []).map(comment => ({
            id: comment.id,
            content: comment.content,
            userId: comment.user_id,
            username: (comment.users as { email?: string })?.email?.split('@')[0] || 'Dreamer',
            createdAt: comment.created_at,
        }))

        return NextResponse.json({ comments: formattedComments })
    } catch (err) {
        console.error('[API comments] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Add a comment to a dream
export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { dreamId, content } = await req.json()

        if (!dreamId || !content?.trim()) {
            return NextResponse.json(
                { error: 'dreamId and content required' },
                { status: 400 }
            )
        }

        // Limit comment length
        const trimmedContent = content.trim().slice(0, 500)

        const supabase = getClient()

        // Insert comment
        const { data: comment, error } = await supabase
            .from('comments')
            .insert({
                dream_id: dreamId,
                user_id: userId,
                content: trimmedContent,
            })
            .select()
            .single()

        if (error) {
            console.error('[API comments] Error inserting:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Update comment count on published_dreams - fetch and increment
        try {
            const { data: pubDream } = await supabase
                .from('published_dreams')
                .select('comment_count')
                .eq('dream_id', dreamId)
                .single()

            if (pubDream) {
                await supabase
                    .from('published_dreams')
                    .update({ comment_count: (pubDream.comment_count || 0) + 1 })
                    .eq('dream_id', dreamId)
            }
        } catch {
            // Comment count update is best-effort
        }

        return NextResponse.json({
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                userId: comment.user_id,
                createdAt: comment.created_at,
            }
        })
    } catch (err) {
        console.error('[API comments] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Remove a comment
export async function DELETE(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const commentId = searchParams.get('commentId')

        if (!commentId) {
            return NextResponse.json({ error: 'commentId required' }, { status: 400 })
        }

        const supabase = getClient()

        // Delete only if user owns the comment
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', userId)

        if (error) {
            console.error('[API comments] Error deleting:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[API comments] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
