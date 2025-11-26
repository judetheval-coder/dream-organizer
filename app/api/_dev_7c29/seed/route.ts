import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { seedFakeData } from '@/lib/seed-fake-data'

export async function POST(request: Request) {
  // Check if dev mode is unlocked
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('dev_unlocked')?.value === 'true'

  if (!unlocked) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await seedFakeData(supabase)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error seeding fake data:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}