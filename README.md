# 🌟 Dream Organizer

AI-powered dream tracking and comic generation platform that transforms your dreams into visual stories.

## ✨ Features

- 📝 **Dream Tracking**: Record and organize your dreams with rich metadata
- 🎨 **AI Comic Generation**: Transform dream text into AI-generated comic panels
- 🏆 **Achievements System**: Unlock badges as you track your dreams
- 📅 **Calendar View**: Visualize your dream journey over time
- 💾 **Local Persistence**: All data stored in browser localStorage
- 🖼️ **Image Caching**: Generated images persist across sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for local Stable Diffusion server)
- ~15GB disk space for AI model

## Developer UX: Avoid 'Keep Edits' prompts in VS Code

If you edit files in the repository while the workspace is running external scripts, VS Code may show the "This file has changed on disk" banner with "Keep" and "Undo" buttons. To avoid needing to click "Keep" every time:

- Enable Auto Save in VS Code (File -> Auto Save) or set the following in user/workspace settings:
  - "files.autoSave": "afterDelay"
  - "files.autoSaveDelay": 500
- We added a recommended workspace setting at `.vscode/settings.json` to enable auto-save and hot exit behavior. Please accept or merge this into your workspace settings if you want the behavior applied.
  - Note: If you prefer different behavior, adjust your VS Code user settings instead.

### Installation

1. **Install Dependencies**
```powershell
cd C:\Users\Levi\dream-organizer
npm install
```

2. **Set up Python Environment**
```powershell
python -m venv sd_env --copies
.\sd_env\Scripts\python.exe -m pip install --upgrade pip
.\sd_env\Scripts\python.exe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
.\sd_env\Scripts\python.exe -m pip install diffusers transformers accelerate safetensors
```

### Running the App

**Terminal 1 - Next.js Dev Server:**
```powershell
cd C:\Users\Levi\dream-organizer
npm run dev
```

**Terminal 2 - Stable Diffusion Server:**
```powershell
cd C:\Users\Levi\dream-organizer
.\sd_env\Scripts\python.exe .\sd_server.py
```

Then open http://localhost:3000

## 🎯 Usage

### Creating Dream Comics

1. Navigate to the **Comic Creator** (home page)
2. Enter your dream description in the textarea
3. Click **🎨 Generate Panels** to split into scenes
4. Click **✨ Generate Image** on each panel
5. Images are generated with retry logic and cached locally

### Image Generation

The app uses a **dual-fallback strategy**:
1. First tries internal `/api/generate-image` endpoint
2. Falls back to local Stable Diffusion server on port 3001
3. Retries up to 5 times with exponential backoff
4. All generated images persist in `localStorage`

### Managing Dreams

- **Dashboard**: View stats and recent activity
- **Dreams Page**: Browse all tracked dreams
- **Dream Details**: Add notes, milestones, delete dreams
- **Calendar**: See dreams by date
- **Achievements**: Track unlocked badges

## 🔧 Configuration

### localStorage Keys

- `dream-organizer-dreams` - All dream entries
- `dream-organizer-panels` - Comic panel text
- `dream-organizer-panel-images` - Generated images (base64)
- `dream-organizer-settings` - User preferences
- `dream-organizer-user` - User profile

### SD Server Settings

Edit `sd_server.py`:
```python
PORT = 3001  # Server port
MODEL_ID = "nitrosocke/mo-di-diffusion"  # AI model
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI**: Stable Diffusion (Mo-Di Diffusion model)
- **Storage**: Browser localStorage
- **Server**: Python HTTP server

## 📝 Development

### File Structure
```
app/
  ├── page.jsx              # Comic creator
  ├── dashboard/            # Stats dashboard
  ├── dreams/               # Dream management
  │   └── [id]/             # Individual dream details
  ├── achievements/         # Badge system
  ├── calendar/             # Date view
  └── settings/             # User preferences
components/
  ├── Panel.tsx             # Comic panel with AI generation
  ├── ErrorBoundary.tsx     # Error handling
  ├── Sidebar.tsx           # Navigation
  └── TopBar.tsx            # Header
lib/
  └── store.ts              # localStorage utilities
```

### Key Components

**Panel.tsx**: Self-contained comic panel with:
- Image generation with retry logic
- localStorage persistence
- Abort controller for cleanup
- Manual/regenerate controls

**ErrorBoundary.tsx**: Catches React errors gracefully

## 🐛 Troubleshooting

### npm run dev fails
- Ensure you're in the project directory
- Run `npm install` first
- Check Node.js version: `node -v` (need 18+)

### SD server won't start
- Verify Python packages: `.\sd_env\Scripts\python.exe -m pip list`
- Check port 3001 isn't in use
- Ensure ~15GB free disk space for model download

### Images not generating
- Confirm SD server is running: http://localhost:3001/api/sd-status
- Check browser console for errors
- Verify localStorage isn't full (quota ~10MB)

### Emojis display wrong
- Files should be UTF-8 encoded
- Run `.\fix-emojis.ps1` to repair encoding

## 📄 License

MIT

## 🙏 Credits

- UI Design: Custom gradient-based dark theme
- AI Model: [Mo-Di Diffusion](https://huggingface.co/nitrosocke/mo-di-diffusion)
- Icons: Emoji
