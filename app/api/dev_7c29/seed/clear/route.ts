import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function POST() {
    if (!devRoutesEnabled()) return disallowedDevResponse()
    const cookieStore = await cookies()
    const unlocked = cookieStore.get('dev_unlocked')?.value === 'true'

    if (!unlocked) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.info(`[dev-seed-clear] requested at ${new Date().toISOString()}`)
    try {
        const errors: { step: string; detail?: string }[] = []
        const panelsRes = await supabase.from('panels').delete().like('id', 'dev-%')
        if (panelsRes.error) errors.push({ step: 'delete_panels', detail: panelsRes.error.message })
        const dreamsRes = await supabase.from('dreams').delete().like('id', 'dev-%')
        if (dreamsRes.error) errors.push({ step: 'delete_dreams', detail: dreamsRes.error.message })
        const usersRes = await supabase.from('users').delete().like('id', 'dev-user-%')
        if (usersRes.error) errors.push({ step: 'delete_users', detail: usersRes.error.message })

        if (errors.length > 0) {
            console.error('[dev-seed-clear] errors', errors)
            return NextResponse.json({ success: false, errors }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[dev-seed-clear] Error clearing fake data:', error)
        return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
    }
}
