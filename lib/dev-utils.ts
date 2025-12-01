import { NextResponse } from 'next/server'

export function devRoutesEnabled(): boolean {
    // Enable dev routes only when explicitly in development or via env toggle
    const allow = (process.env.NODE_ENV === 'development') || (process.env.NEXT_PUBLIC_ENABLE_DEV_ROUTES === 'true')
    if (allow) console.log('[dev-utils] devRoutesEnabled: true')
    return allow
}

export function disallowedDevResponse() {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
