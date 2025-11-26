import { auth, currentUser } from '@clerk/nextjs/server'
import { captureException } from '@/lib/sentry'
import { syncUserToSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    const result = await syncUserToSupabase(userId, email)

    return NextResponse.json({ success: true, demoCreated: (result as any)?.demoCreated ?? false })
  } catch (error) {
    captureException(error)
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
