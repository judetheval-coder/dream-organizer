import { auth, currentUser } from '@clerk/nextjs/server'
import { captureException } from '@/lib/sentry'
import { syncUserToSupabase, processReferral } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    // Check for referral code in cookie
    const cookieStore = await cookies()
    const referralCode = cookieStore.get('referral_code')?.value

    if (referralCode) {
      // Process the referral (credits the referrer)
      await processReferral(userId, referralCode)
      
      // Clear the referral cookie
      cookieStore.delete('referral_code')
    }

    const demoCreated = (result as unknown as { demoCreated?: boolean })?.demoCreated ?? false
    return NextResponse.json({ success: true, demoCreated })
  } catch (error) {
    captureException(error)
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
