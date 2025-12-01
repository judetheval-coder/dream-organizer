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
  // If Clerk is not configured, skip auth logic to avoid breaking deploy previews
  if (!CLERK_ENABLED) {
    return
  }

  // Allow public routes without auth
  if (isPublicRoute(req)) {
    return
  }

  // Protect dashboard and API routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
    // If this is an admin route, only allow in development, from localhost, or if explicitly enabled via env
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')
    const host = req.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    const allowAdmin = isLocalhost || process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
    if (isAdmin && !allowAdmin) {
      // Redirect to site root to avoid exposing admin in production
      return NextResponse.redirect(new URL('/', req.url))
    }
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
