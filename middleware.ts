import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dreams(.*)',
  '/calendar(.*)',
  '/settings(.*)',
  '/achievements(.*)',
  '/api/generate-image(.*)',
  '/api/analyze-dream(.*)',
  '/api/enhance-story(.*)',
  '/api/sync-user(.*)',
  '/api/create-checkout(.*)',
  // admin routes should be blocked from production by default
  '/admin(.*)'
])

// Public routes that don't need auth at all
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy',
  '/terms',
  '/pricing',
  '/api/webhooks/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Capture referral codes from URL and store in cookie
  const { searchParams } = new URL(req.url)
  const refCode = searchParams.get('ref')
  
  let response: NextResponse | undefined

  if (refCode) {
    // Store referral code in a cookie for later processing during sign-up
    response = NextResponse.next()
    response.cookies.set('referral_code', refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }

  // If Clerk is not configured, skip auth logic to avoid breaking deploy previews
  if (!CLERK_ENABLED) {
    return response
  }

  // Allow public routes without auth
  if (isPublicRoute(req)) {
    return response
  }

  // Protect dashboard and API routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
    // Admin routes require authentication - role check happens in the component/API
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
