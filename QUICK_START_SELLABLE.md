# Quick Start: Make It Sellable in 2 Weeks

## Week 1: Core Infrastructure

### Day 1-2: Add User Authentication with Clerk

**Install Clerk:**
```bash
npm install @clerk/nextjs
```

**Setup `.env.local`:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

**Wrap app in `app/layout.tsx`:**
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Add sign-in page** `app/sign-in/[[...sign-in]]/page.tsx`:
```typescript
import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return <SignIn />
}
```

**Protect routes:**
```typescript
import { auth } from "@clerk/nextjs"

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  // ... rest of code
}
```

---

### Day 3-4: Set Up Supabase Database

**Install Supabase:**
```bash
npm install @supabase/supabase-js
```

**Create `lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Database Schema (SQL in Supabase):**
```sql
-- Users table (auto-synced with Clerk)
create table users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  email text,
  created_at timestamp default now()
);

-- Dreams table
create table dreams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  text text not null,
  style text,
  mood text,
  created_at timestamp default now()
);

-- Panels table
create table panels (
  id uuid primary key default uuid_generate_v4(),
  dream_id uuid references dreams(id) on delete cascade,
  description text,
  image_url text,
  scene_number int,
  created_at timestamp default now()
);

-- Subscriptions table
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  plan text, -- 'free', 'pro', 'premium'
  status text, -- 'active', 'canceled', 'past_due'
  stripe_subscription_id text,
  current_period_end timestamp,
  created_at timestamp default now()
);
```

**Replace localStorage with Supabase in your code:**
```typescript
// OLD: localStorage
const dreams = JSON.parse(localStorage.getItem('dream-archives') || '[]')

// NEW: Supabase
const { data: dreams } = await supabase
  .from('dreams')
  .select('*, panels(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

---

### Day 5-6: Add Stripe Payments

**Install Stripe:**
```bash
npm install stripe @stripe/stripe-js
```

**Create Stripe products in dashboard:**
- Free: $0/mo (default)
- Pro: $9.99/mo
- Premium: $19.99/mo

**Create `app/api/create-checkout/route.ts`:**
```typescript
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { userId } = auth()
  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: { userId }
  })

  return Response.json({ url: session.url })
}
```

**Add pricing page `app/pricing/page.tsx`:**
```typescript
export default function PricingPage() {
  const plans = [
    { name: 'Free', price: 0, dreams: 5, panels: 1 },
    { name: 'Pro', price: 9.99, dreams: 50, panels: 4, priceId: 'price_xxx' },
    { name: 'Premium', price: 19.99, dreams: -1, panels: 8, priceId: 'price_xxx' }
  ]

  async function handleSubscribe(priceId: string) {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId })
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {plans.map(plan => (
        <div key={plan.name} className="p-6 rounded-xl border">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <p className="text-4xl">${plan.price}<span>/mo</span></p>
          <ul>
            <li>{plan.dreams === -1 ? 'Unlimited' : plan.dreams} dreams/month</li>
            <li>{plan.panels} panels per dream</li>
          </ul>
          <button onClick={() => handleSubscribe(plan.priceId)}>
            Subscribe
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

### Day 7: Add Usage Limits

**Create `lib/usage.ts`:**
```typescript
export async function checkUsageLimit(userId: string) {
  // Get user's subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()

  const plan = sub?.plan || 'free'

  // Get this month's dream count
  const { count } = await supabase
    .from('dreams')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const limits = {
    free: 5,
    pro: 50,
    premium: Infinity
  }

  return {
    used: count || 0,
    limit: limits[plan as keyof typeof limits],
    canCreate: (count || 0) < limits[plan as keyof typeof limits]
  }
}
```

**Use in your create dream function:**
```typescript
const usage = await checkUsageLimit(userId)
if (!usage.canCreate) {
  return { error: 'Usage limit reached. Upgrade to continue!' }
}
```

---

## Week 2: Polish & Launch

### Day 8-9: Legal Pages

**Use templates from Termly.io or copy these:**

**`app/privacy/page.tsx`** - Privacy Policy
**`app/terms/page.tsx`** - Terms of Service  
**`app/cookies/page.tsx`** - Cookie Policy

### Day 10: Email System

**Install Resend:**
```bash
npm install resend
```

**Send welcome email:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Dream Organizer <hello@lucidlaboratories.net>',
  to: user.email,
  subject: 'Welcome to Dream Organizer! ✨',
  html: '<h1>Welcome!</h1><p>Start creating your first dream comic...</p>'
})
```

### Day 11-12: Testing & Bug Fixes

- Test all user flows
- Test payment process
- Check mobile responsive
- Fix any bugs

### Day 13: Analytics Setup

**Add Posthog:**
```bash
npm install posthog-js
```

**Track key events:**
```typescript
posthog.capture('dream_created', { style, mood })
posthog.capture('subscription_upgraded', { plan })
```

### Day 14: Launch!

1. Deploy to Vercel ✅
2. Post on ProductHunt
3. Share on Twitter/X
4. Post in r/SideProject
5. Email friends for feedback

---

## Environment Variables Needed

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI (already have)
OPENAI_API_KEY=

# Resend Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_URL=https://lucidlaboratories.net
```

---

## Cost Breakdown

**Development (Week 1-2):**
- Your time: Free (or priceless!)
- Services: All have free tiers ✅

**Launch:**
- Clerk: Free for 5000 users
- Supabase: Free tier
- Stripe: 2.9% + 30¢ per transaction
- Vercel: Free hobby or $20/mo pro
- Domain: $12/year
- **Total**: ~$0-20/mo to start

**Scale (100 users):**
- Clerk: Still free
- Supabase: $25/mo
- Vercel Pro: $20/mo
- OpenAI: ~$100/mo
- **Total**: ~$145/mo
- **Revenue**: ~$1000/mo
- **Profit**: ~$855/mo 💰

---

## 🎯 Key Success Metrics

Track these from day 1:
1. **Signups** - How many people try it?
2. **Activation** - Created their first dream?
3. **Conversion** - Free → Paid %
4. **Retention** - Still using after 30 days?
5. **Revenue** - MRR (Monthly Recurring Revenue)

---

**You're 2 weeks away from having a real sellable product!** 🚀

Ready to start? Pick Day 1 and let's build! 💪
