# 🚀 Quick Start: Viral Features Setup

## Step 1: Run Database Migration

Open your Supabase SQL Editor and run:

```sql
-- Copy and paste contents from supabase-viral-schema.sql
-- This creates all tables needed for viral features
```

Or run this command:
```bash
psql $DATABASE_URL < supabase-viral-schema.sql
```

---

## Step 2: Test the New Features

### 1. Daily Challenges (http://localhost:3000/challenges)
- Auto-creates today's challenge on first visit
- Users can submit dreams
- Voting system enabled
- Top 3 submissions show medals

### 2. Leaderboard (http://localhost:3000/leaderboard)
- Shows top dreamers by shares/likes/views
- Timeframe filters: All Time, Month, Week
- Accessible from sidebar

### 3. Referral System (Dashboard → "Invite Friends" tab)
- Each user gets unique referral code
- Share link: `localhost:3000/sign-up?ref=XXXXX`
- Track referral count and rewards

### 4. Badges (Dashboard → "My Badges" tab)
- Auto-awarded on milestones
- 15 total badges available
- Color-coded by rarity

### 5. Share Buttons (DreamList)
- Every dream now has "🚀 Share" button
- Platforms: Twitter, Facebook, Reddit, WhatsApp
- Download image option
- Copy link to clipboard

### 6. Public Dream Pages (/dream/[id])
- Make dream public first (publish button)
- Visit: `localhost:3000/dream/[dreamId]`
- Beautiful public view with OG meta tags
- Social share buttons included

---

## Step 3: Verify Sidebar Navigation

New tabs added to dashboard:
- 🏆 **Daily Challenges** → /challenges page
- 🥇 **Leaderboard** → /leaderboard page
- 🎁 **Invite Friends** → Referral system component
- 🏅 **My Badges** → Badge showcase

---

## Step 4: Test Sharing Flow

1. Create a dream with panels
2. Go to "My Dreams" tab
3. Click "🚀 Share" button on any dream
4. Select a platform (e.g., Twitter)
5. Verify share is tracked (check `share_count` in database)

---

## Step 5: Test Challenge Submission

1. Go to `/challenges`
2. Note today's prompt
3. Click "Create Your Entry"
4. Create a dream matching the prompt
5. Submit to challenge
6. Vote on other submissions

---

## Database Tables Created

| Table | Purpose |
|-------|---------|
| `dream_likes` | Track likes on public dreams |
| `user_badges` | Store earned badges per user |
| `referrals` | Track who invited whom |
| `daily_challenges` | One challenge per day |
| `challenge_submissions` | Link dreams to challenges |

**Columns Added to `dreams` table**:
- `is_public` - Boolean, default false
- `share_count` - Integer, increments on share
- `view_count` - Integer, increments on public view

---

## Monitoring Viral Growth

### Check Share Analytics:
```sql
SELECT id, text, share_count, view_count
FROM dreams
WHERE is_public = true
ORDER BY share_count DESC
LIMIT 10;
```

### Check Referral Stats:
```sql
SELECT referrer_user_id, COUNT(*) as referrals
FROM referrals
GROUP BY referrer_user_id
ORDER BY referrals DESC;
```

### Check Badge Distribution:
```sql
SELECT badge_type, COUNT(*) as users
FROM user_badges
GROUP BY badge_type
ORDER BY users DESC;
```

### Check Challenge Engagement:
```sql
SELECT c.prompt, COUNT(s.id) as submissions
FROM daily_challenges c
LEFT JOIN challenge_submissions s ON c.id = s.challenge_id
GROUP BY c.id, c.prompt
ORDER BY c.challenge_date DESC;
```

---

## Next Actions

1. ✅ Run database migration
2. ✅ Test all new features locally
3. ✅ Deploy to production
4. ✅ Announce new features to users
5. ✅ Start tracking metrics

---

## Deployment Notes

When deploying to Vercel:
1. Database migrations run automatically via Supabase
2. All environment variables already configured
3. New routes will be automatically detected
4. No additional setup needed!

---

## Support

All viral features are now live! 🎉

- **Documentation**: See `VIRAL_FEATURES.md` for complete guide
- **Database Schema**: `supabase-viral-schema.sql`
- **Components**: All in `/components/` folder
- **API Routes**: All in `/app/api/` folder
