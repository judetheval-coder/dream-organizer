# Dream Organizer - AI Coding Instructions

## Architecture Overview

**Dream Organizer** is a Next.js 16 full-stack web app that transforms dreams into AI-generated comic panels. The system has three main components:

1. **Frontend (Next.js React)**: Dashboard for dream entry, comic generation, and viewing
2. **Backend API Routes**: Image generation orchestration and user sync
3. **Python Stable Diffusion Server**: Local ML model running on port 3001 for image generation

### Key Data Flow
- User writes dream text → Split into scenes (via OpenAI API) → Generate image per scene via Python SD server → Display as comic panels in UI → Store dreams/panels in Supabase

### Critical Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Auth**: Clerk (handles sign-up/sign-in)
- **Database**: Supabase (PostgreSQL) for dreams, panels, users
- **Storage**: Supabase Storage for generated images
- **AI**: OpenAI (text analysis), Stable Diffusion (image generation)
- **Python**: Diffusers library, PyTorch (runs locally)

---

## Essential Developer Workflows

### Launch Development Environment
```powershell
# One-command startup (runs both servers in background):
cd C:\Users\Levi\dream-organizer
powershell -ExecutionPolicy Bypass -File .\start-servers.ps1
# Open browser: http://localhost:3000
```

**What this does:**
- Activates Python venv (sd_env)
- Starts Stable Diffusion server on port 3001 (background)
- Starts Next.js dev server on port 3000 (foreground)

### Manual Server Startup (if needed)
```powershell
# Terminal 1 - Next.js:
npm run dev

# Terminal 2 - Stable Diffusion:
cd sd_env/Scripts
.\Activate.ps1
cd ../..
python sd_server.py
```

### Build & Deploy
```powershell
npm run build    # Creates optimized Next.js build
npm start        # Runs production server (port 3000)
npm run lint     # ESLint check
```

### Environment Variables Required
```
# .env.local (authentication & database)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...

# Python optional (sd_server.py):
SD_MODEL_ID=nitrosocke/Arcane-Diffusion  # Default (good for comics)
```

---

## Architecture Patterns & Conventions

### Frontend State Management
- **useDreams hook** (`hooks/useDreams.ts`): Central state for all dreams, panels, user tier
  - Syncs user to Supabase on mount
  - Manages loading/error states
  - Handles dream CRUD operations
  - Example: `const { dreams, addDream, generateComic, loading } = useDreams()`

- **Context**: Minimal—only `ToastContext.tsx` for toast notifications
- **No Redux/Zustand**: Direct Supabase queries via hooks

### API Route Pattern
All routes in `app/api/*/route.ts` follow this structure:
```typescript
// Example: app/api/generate-image/route.ts
export async function POST(req: Request) {
  // 1. Validate Clerk auth
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // 2. Parse request body
  const { dream_id, scene_number, prompt, modelId, steps, guidance } = await req.json()
  
  // 3. Call Python server or external API
  const response = await fetch('http://localhost:3001/generate', { ... })
  
  // 4. Store result in Supabase
  await supabase.from('panels').update({ image_url: imageUrl }).eq('id', panel.id)
  
  // 5. Return response
  return NextResponse.json({ image_url: imageUrl })
}
```

### Component Structure
- **Smart components**: Pages and sections (handle data, business logic)
- **Dumb components**: Reusable UI (Panel.tsx, StatCard.tsx, etc.)
- **File naming**: PascalCase (React component) or camelCase (utilities)

### Database Schema Key Patterns
- **dreams**: `id, user_id, text, style, mood, created_at`
- **panels**: `id, dream_id, description, image_url, scene_number, created_at`
- **users**: `id (Clerk ID), subscription_tier, created_at`
- All timestamps use UTC, accessed via Supabase queries with nested selects

### Image Generation Pipeline
1. **Prompt Enhancement** (OpenAI): Expand user's dream text into detailed scene descriptions
2. **Panel Split**: Break narrative into 2-4 panels (logic in API route)
3. **Sequential Generation**: Queue-based system—one panel at a time to SD server
4. **Upload & Store**: Convert base64 to file, upload to Supabase Storage, save URL to DB

---

## Project-Specific Conventions

### Styling
- **Framework**: TailwindCSS v4 + custom PostCSS
- **Dark Mode**: Toggle via state, uses `dark:` prefix
- **Color Palette** (from `lib/colors.ts`):
  - Purple (#7c3aed) - Primary actions
  - Cyan (#06b6d4) - Secondary/accents
  - Pink (#ec4899) - Highlights
  - Background: #0a0118 (dark), #f8fafc (light)
- **Responsive**: Mobile-first, use `sm:`, `md:`, `lg:` prefixes

### File Organization
```
app/                      # Next.js 16 app router
├── layout.tsx           # Root layout (ClerkProvider wrapper)
├── page.tsx             # Home/dashboard
├── api/                 # All API routes
│   ├── generate-image/
│   ├── analyze-dream/
│   └── sync-user/
└── [pages]/             # Dynamic routes (dreams, calendar, etc.)

components/
├── sections/            # Feature-specific sections
├── ui/                  # Reusable UI atoms
├── Panel.tsx            # Comic panel frame (critical)
├── DreamEditor.tsx      # Dream entry form
└── Sidebar.tsx          # Navigation

lib/
├── supabase.ts          # DB client + all queries
├── supabase-storage.ts  # Image upload/delete
├── colors.ts            # Design system tokens
└── subscription-tiers.ts # Tier definitions (free/pro/etc.)

hooks/
├── useDreams.ts         # Main state management
└── useKeyboardShortcuts.ts

contexts/
└── ToastContext.tsx     # Toast notifications only

```

### Naming Conventions
- **Dream-related**: `dream`, `dreamId`, `getDreams`, `useDreams`
- **Panel-related**: `panel`, `panelId`, `panels`, `Panel` (component)
- **API calls**: `fetchImage`, `generateComic`, `syncUser`
- **State**: `isLoading`, `hasError`, `selectedStyle`

---

## Critical Integration Points

### Supabase Row-Level Security (RLS)
- Dreams: Users can only access/modify their own dreams
- Panels: Inherited from dream ownership
- **Always** include `user_id` in WHERE clause or RLS policy blocks access

### Stable Diffusion Server Health Check
- Server health endpoint: `http://localhost:3001/status`
- Response: `{ "ready": true/false, "error": null/string, "progress": "..." }`
- On failure, frontend should show graceful error and offer retry

### External API Limits
- **OpenAI**: Rate limits (check error for `429` responses)
- **Supabase Storage**: File size limits (~5MB per image is safe)
- **Stable Diffusion**: GPU memory (~6GB needed for small-sd model)

### Image Quality Settings
- **Steps**: 20-50 (default 30, higher = quality but slower)
- **Guidance Scale**: 7.5-15 (default 10, higher = prompt adherence)
- **Model Selection**: `SD_MODEL_ID` env var or API parameter
  - `nitrosocke/Arcane-Diffusion` (default, best for comics)
  - `segmind/small-sd` (faster, smaller)
  - `prompthero/openjourney-v4` (higher quality)

---

## Common Development Tasks

### Add a New Dream Feature
1. Extend `Dream` type in `lib/supabase.ts`
2. Add DB column via Supabase migration
3. Update `useDreams.ts` to fetch/update new field
4. Add UI component in `components/DreamEditor.tsx` or new component
5. Ensure RLS policies allow the new column access

### Fix Comic Generation Issues
1. Check Python server logs: `sd_server.py` output in Terminal 2
2. Verify prompt quality: Test prompt in OpenAI playground
3. Check image URL: Ensure Supabase Storage path is correct
4. Debug API route: Add console logs in `app/api/generate-image/route.ts`

### Deploy to Vercel
1. Push to GitHub
2. Vercel auto-deploys (main branch)
3. Ensure env vars set in Vercel dashboard (Clerk, Supabase, OpenAI)
4. Python SD server must run locally (Vercel doesn't support it)—use Replicate API fallback

---

## Quick Debugging Checklist

| Issue | Check |
|-------|-------|
| Comic won't generate | SD server running? Check port 3001 status endpoint |
| Images not showing | Supabase Storage URL valid? CORS enabled? |
| Dream not saving | Clerk user ID captured? RLS policy allowing insert? |
| UI looks broken | TailwindCSS build ran? Check `npm run dev` output |
| Auth redirect loop | Clerk keys in .env.local correct? URLs match Clerk config |

---

## Useful References

- **Next.js 16 Docs**: App router, API routes, middleware
- **Supabase Docs**: Row-level security, real-time subscriptions, storage
- **Clerk Docs**: useUser() hook, auth state management
- **Stable Diffusion**: Diffusers library, model cards on Hugging Face
- **Key Files**: `IMPLEMENTATION_SUMMARY.md`, `QUICK_START.md`
