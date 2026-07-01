# FixIt Lens — iOS build guide

This app is an **Expo (React Native) iOS app** with a **FastAPI backend**. The phone never holds API keys — only your Mac (or server) runs Gemini/OpenAI via `backend/.env`.

## Quick start (Simulator — no keys)

```bash
cd fixit-lens
make setup
make seed
make test

# Terminal 1
make backend

# Terminal 2
make ios          # opens iOS Simulator
```

Simulator can use `http://127.0.0.1:8000` (default in `mobile/.env.example`).

## Physical iPhone (same Wi‑Fi as your Mac)

1. Find your Mac's LAN IP: **System Settings → Network → Wi‑Fi → Details** (e.g. `192.168.1.12`).
2. Create `mobile/.env`:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.12:8000
   ```
3. Start the backend on all interfaces:
   ```bash
   make backend-lan
   ```
4. In the app: **Settings → Backend connection** → paste the same URL → **Save** → **Test**.
5. Launch on device:
   ```bash
   make ios
   ```
   Scan the QR code with the **Camera** app, or press `i` in the Expo terminal if a simulator is not desired.

`app.json` already sets `NSAllowsLocalNetworking` so HTTP to your Mac on the LAN works during development.

## Standalone iOS app (Xcode)

For a native build on your phone without Expo Go:

```bash
make setup
make assets              # regenerate icon + splash
make ios-prebuild        # generates mobile/ios/
```

Then:

1. Open `mobile/ios/FixItLens.xcworkspace` in **Xcode**.
2. Select the **FixIt Lens** target → **Signing & Capabilities** → choose your Apple ID team.
3. Set **Bundle Identifier** if needed (default: `com.fixitlens.app`).
4. Connect your iPhone → select it as the run destination → **Run** (⌘R).

Before running on device, ensure `mobile/.env` uses your Mac's LAN IP and `make backend-lan` is running.

## Enable real cloud vision (Gemini)

1. Create a key: [Google AI Studio](https://aistudio.google.com/apikey) → **Create API key**.
2. Add to `backend/.env` (never commit this file):
   ```env
   GEMINI_API_KEY=your_key_here
   PROVIDER_PRIORITY=gemini,openai,mock
   ```
3. Restart the backend. The app will automatically use Gemini for image understanding and diagnosis when the key is present.

Optional OpenAI: set `OPENAI_API_KEY` in the same file.

## Demo scenarios (no API keys)

Upload or photograph images from `backend/data/demo_images/`:

| Image | Expected result |
|-------|-----------------|
| `tp_link_ax55_red_led.png` | Router WAN issue, safe cited steps |
| `bosch_dishwasher_e24.png` | E24 drain, water caution |
| `lg_washer_oe.png` | OE drain error |
| `laptop_fan_noise.png` | External vent checks |
| `microwave_capacitor_warning.png` | **Blocked** — professional required |
| `blurry_router.png` | Retake — low quality |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Could not reach backend" on iPhone | Use LAN IP + `make backend-lan`, not `127.0.0.1` |
| Camera permission denied | iOS Settings → FixIt Lens → Camera |
| Expo can't find backend | Mac firewall: allow Python/Uvicorn on port 8000 |
| Typecheck fails | `cd mobile && npm run typecheck` |

## App identity

- **Name:** FixIt Lens  
- **Bundle ID:** `com.fixitlens.app`  
- **URL scheme:** `fixitlens://`  
- **Icon / splash:** `mobile/assets/` (regenerate with `make assets`)
