# FixIt Lens — Native SwiftUI iOS App

True native iOS client built with **SwiftUI** and **AVFoundation**. Connects to the existing FastAPI backend — API keys stay in `backend/.env` only.

## Why native SwiftUI?

- Real **FixIt Lens** app on your home screen (not Expo Go)
- Native camera, haptics, blur materials, spring animations
- App Store–ready architecture

## Quick start (Simulator)

```bash
cd fixit-lens
make setup
make seed

# Terminal 1 — backend
make backend

# Terminal 2 — open Xcode
make ios-native-open
```

In **Xcode**:
1. Select **FixIt Lens** scheme
2. Choose **iPhone 16** (or any simulator)
3. Press **Run** (⌘R)

Default API URL: `http://127.0.0.1:8000` (works in Simulator).

## Physical iPhone

1. On Mac: `make backend-lan`
2. Find your Mac LAN IP (e.g. `192.168.1.12`) in **System Settings → Network → Wi‑Fi**
3. Run from Xcode with your iPhone connected (select device, set Signing team)
4. In the app: **Account → Backend connection** → **Edit URL** → enter `http://192.168.1.12:8000` → **Save** → **Test connection**

The saved URL persists across app launches. Tap **Edit URL** again anytime to change it.

## API keys

Add to **`backend/.env`** only (never in the iOS app):

```env
GEMINI_API_KEY=your_key_here
PROVIDER_PRIORITY=gemini,openai,mock
```

Without keys, the backend uses **mock mode** — all demo images work.

## Project structure

```
ios-native/
  FixItLens.xcodeproj      # Generated Xcode project
  FixItLens/
    App/                   # @main entry
    Models/                # API types
    Services/              # APIClient, AppSettings
    ViewModels/            # SessionStore
    Theme/                 # Design tokens
    Components/            # Glass cards, camera, buttons
    Views/                 # All 9 screens
  scripts/
    generate_xcode_project.py
```

## Screens (20+ surfaces)

| Tab | Screens |
|-----|---------|
| **Onboarding** | 3-slide intro (first launch) |
| **Scan** | Camera, Preview, Analyze, Diagnosis hub (Overview/Steps/Sources/Safety), Guided repair, Step detail, Ask issue, Professional handoff |
| **Repairs** | History list (filters), Session detail |
| **Library** | Manual catalog, Upload manual, Source detail, Citation explorer |
| **Insights** | Metrics dashboard, Backend status |
| **Account** | Settings hub, Safety center, Privacy, About |

Professional UI: flat dark theme, single blue accent, SF Pro typography, inset grouped lists.

## Regenerate Xcode project

After adding Swift files:

```bash
make ios-native
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails (path contains `:`) | Build outputs go to `/tmp/fixit-lens-ios-build` automatically (colon in `AI:ML` breaks Xcode dependency files) |
| `libobjc.A.tbd` / Mac Catalyst linker error | Fixed in project via `OTHER_LDFLAGS = -L$(SDKROOT)/usr/lib`. If it persists, remove `LIBRARY_PATH` from your shell profile (often set by dev tools) |
| Simulator runtime mismatch | Use an **iOS 26.5** simulator (e.g. iPhone 17) — Xcode 26 requires matching runtime |
| Cannot reach backend on device | Use LAN IP + `make backend-lan` |
| No API keys | Mock mode works — upload demo images from `backend/data/demo_images/` |

## Demo images (no keys)

From `backend/data/demo_images/`:
- `tp_link_ax55_red_led.png` — router WAN steps
- `bosch_dishwasher_e24.png` — E24 drain
- `microwave_capacitor_warning.png` — blocked (professional required)
- `blurry_router.png` — retake prompt
