import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
  // Allow public routes without auth
  if (isPublicRoute(req)) {
    return
  }

  // Protect dashboard and API routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(req)) {
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
