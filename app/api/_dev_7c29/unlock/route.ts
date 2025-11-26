import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const DEV_SECRET = process.env.DEV_STEALTH_SECRET

export async function GET() {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('dev_unlocked')?.value === 'true'
  return NextResponse.json({ unlocked })
}

export async function POST(request: Request) {
  const { secret } = await request.json()

  if (secret === DEV_SECRET) {
    const response = NextResponse.json({ unlocked: true })
    response.cookies.set('dev_unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    return response
  }

  return NextResponse.json({ unlocked: false }, { status: 401 })
}