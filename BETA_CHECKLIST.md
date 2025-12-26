# Beta Testing Checklist for Visnoctis

## What Was Fixed

### Critical Issues (Blocking)

1. **Dream Saving/Loading**
   - Added retry logic with exponential backoff for network failures
   - Improved error messages to be more specific
   - Added proper validation before save

2. **Subscription Tier Enforcement**
   - Now enforced on the SERVER (not just client-side)
   - Checks `dreams_count_this_month` before allowing new dreams
   - Returns clear error messages when limits are reached
   - Enforces panel limits per tier

3. **Database Schema Updates**
   - Created migration: `scripts/migrations/002-add-monthly-limits-and-published-dreams.sql`
   - Added `dreams_count_this_month` column to users
   - Created `published_dreams` table for public gallery
   - Added `referral_signups` table for referral tracking
   - Seeded initial dream groups so they aren't empty

### UI/UX Issues

4. **Onboarding Tour**
   - Added animated bouncing arrow pointer to highlighted elements
   - Added retry logic to find elements (handles slow page loads)
   - Spotlight now properly highlights sidebar navigation items
   - All `data-onboarding` attributes are in place

5. **Insights Tab**
   - Fixed messaging: "No Dreams Yet" with clear CTA when empty
   - Shows "Click Run analysis" prompt when dreams exist but analysis hasn't run
   - Better visual states with icons

6. **Public Gallery**
   - Created `/api/publish-dream` endpoint for publishing dreams
   - Gallery correctly queries `published_dreams` table
   - Added publish/unpublish functionality

### Error Handling

7. **Global Error Handling**
   - ErrorBoundary component catches React errors
   - Sentry integration for error reporting
   - API routes have consistent try/catch patterns

---

## Database Setup Required

**Before beta testing, run these SQL scripts in Supabase SQL Editor:**

1. `supabase-schema.sql` - Core tables (users, dreams, panels)
2. `supabase-viral-schema.sql` - Social features (likes, badges, referrals)
3. `scripts/migrations/002-add-monthly-limits-and-published-dreams.sql` - Monthly limits + public gallery

---

## Environment Variables Required

Ensure these are set in your `.env.local` and Vercel:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (for image generation + analysis)
OPENAI_API_KEY=sk-...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Analytics (optional but recommended)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
SENTRY_DSN=https://...@sentry.io/...
```

---

## Beta Testing Checklist

### Core Functionality

- [ ] **Sign Up / Sign In**
  - [ ] Can create new account with email
  - [ ] Can sign in with existing account
  - [ ] OAuth works (Google, GitHub, Apple if configured)

- [ ] **Dream Creation**
  - [ ] Can type dream description
  - [ ] Can select style and mood
  - [ ] "Enhance with AI" button works
  - [ ] "Create Comic" saves the dream
  - [ ] Panels are generated correctly
  - [ ] Images are generated for each panel (may take time)
  - [ ] Dream appears in "My Dreams" list

- [ ] **Dream Management**
  - [ ] Can view dream details
  - [ ] Can delete dreams
  - [ ] Deleted dreams remove from list

- [ ] **Subscription Limits**
  - [ ] Free tier: Limited to 5 dreams/month, 4 panels/dream
  - [ ] Shows upgrade prompt when limit reached
  - [ ] Upgrading unlocks more dreams/panels

### Social Features

- [ ] **Public Gallery**
  - [ ] Can publish a dream to gallery
  - [ ] Published dreams appear in gallery
  - [ ] Can unpublish own dreams
  - [ ] Can react to dreams (like, love, etc.)

- [ ] **Leaderboard**
  - [ ] Shows top creators
  - [ ] Counts update when dreams are created/liked

- [ ] **Referrals**
  - [ ] Referral code is generated
  - [ ] Can share referral link
  - [ ] New signups via link are tracked

### UI/UX

- [ ] **Onboarding Tour**
  - [ ] Tour starts for new users after welcome screen
  - [ ] Each step highlights the correct UI element
  - [ ] Arrow pointer bounces to draw attention
  - [ ] Can skip tour at any time
  - [ ] "Start Tour" button works from sidebar

- [ ] **Dashboard**
  - [ ] Stats show correct counts
  - [ ] Activity feed shows recent dreams
  - [ ] Insights analysis works

- [ ] **Responsive Design**
  - [ ] Works on mobile (sidebar collapses)
  - [ ] Works on tablet
  - [ ] Works on desktop

### Error Handling

- [ ] **Network Errors**
  - [ ] Shows retry option when network fails
  - [ ] Doesn't crash on API failures

- [ ] **Validation Errors**
  - [ ] Shows clear message when submitting empty dream
  - [ ] Shows message when exceeding limits

---

## Known Limitations

1. **Image Generation** - Uses DALL-E 3 which can take 10-30 seconds per image
2. **Rate Limiting** - Image generation is limited to 10 requests per 5 minutes
3. **Voice Input** - Requires browser with Web Speech API support
4. **Push Notifications** - Service worker is set up but backend push not implemented

---

## Future Improvements (Post-Beta)

- [ ] Redis/Vercel KV for rate limiting (instead of in-memory)
- [ ] Real-time updates via Supabase subscriptions
- [ ] Email notifications
- [ ] Mobile app (React Native or PWA installable)
- [ ] Internationalization (i18n)
- [ ] Accessibility audit (WCAG 2.1)

---

## Reporting Issues

Beta testers should report issues with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser/device info

Submit issues to: [Your issue tracker URL]
