# ✨ ASTRO — pixel-RPG astrology for iPhone

Your Sun, Moon & Rising (plus every planet), calculated on your phone with real astronomy math.
Daily horoscopes in **Serious** or **Unhinged** mode. Works offline after the first open.

## Install (same GitHub Pages method as before)
1. github.com → **+** → **New repository** → name it `astro` → **Public** → Create.
2. **Add file → Upload files** → drag in EVERYTHING from this folder (including the `icons` folder) → **Commit**.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**.
4. Wait ~1 minute, then open `https://YOUR-USERNAME.github.io/astro/` in **Safari**.
5. Tap **Share** → **Add to Home Screen** → **Add**.
6. Open it from the home screen once while online (this caches it + the pixel fonts). Offline after that.

## Data sources
- Charts: on-device (Meeus algorithms + JPL orbital elements). No internet needed.
- Serious daily text: CosmyDay free API (no key), falls back to Free Horoscope API, then to Astro's own engine.
- City search: Open-Meteo geocoding (no key) + built-in offline city list.
