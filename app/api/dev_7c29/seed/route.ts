import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'
import { supabase } from '@/lib/supabase'
import { seedFakeData } from '@/lib/seed-fake-data'

export async function POST() {
  if (!devRoutesEnabled()) return disallowedDevResponse()
  // Check if dev mode is unlocked
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('dev_unlocked')?.value === 'true'

  if (!unlocked) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.info(`[dev-seed] requested at ${new Date().toISOString()}`)
  const result = await seedFakeData(supabase)
  if (result.success) {
    console.info(`[dev-seed] success - inserted: users=${result.inserted?.users.length ?? 0}, dreams=${result.inserted?.dreams.length ?? 0}, panels=${result.inserted?.panels.length ?? 0}`)
    return NextResponse.json({ success: true, inserted: result.inserted })
  }

  console.error('[dev-seed] Error seeding fake data (detailed):', result.errors)
  return NextResponse.json({ error: 'Failed to seed data', errors: result.errors }, { status: 500 })
}