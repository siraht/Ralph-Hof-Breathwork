# Wim Hof Breathwork App - Implementation Plan

## Tech Stack
- Expo (React Native) + TypeScript for web/iOS/Android.
- React Navigation for app navigation.
- Zustand for state management.
- AsyncStorage for lightweight settings.
- SQLite (expo-sqlite) for session history.
- Expo AV for audio cues and guided voice.
- Expo Haptics for phase-change cues.
- Expo Keep Awake during active sessions.

## Architecture
- src/
  - app/ (screens)
  - components/ (reusable UI)
  - state/ (zustand stores)
  - storage/ (sqlite + async storage)
  - logic/ (breathing session engine)
  - assets/ (audio, fonts)

## Milestones
1. Project Setup [DONE]
   - Create Expo app with TypeScript.
   - Add navigation, fonts, theme tokens, and app structure.

2. Breathing Engine [DONE]
   - Implement session state machine: inhale/exhale cycles, hold, recovery.
   - Integrate timers and haptic/audio hooks.
   - Pause/resume and stop handling.
   - Timeline-based engine with stats tracking.

3. UI Screens [DONE]
   - Home screen with primary CTAs and streak display.
   - Breathing session screen with cadence UI and timers.
   - Summary screen with rating/notes capture.
   - History screen (list with session detail navigation).
   - Session detail screen with full stats breakdown.
   - Settings screen.
   - Safety acknowledgment screen.

4. Persistence [DONE]
   - AsyncStorage for settings via Zustand.
   - SQLite for sessions with CRUD utilities.
   - Session stats helper for streaks/totals.

5. Cold Exposure Timer [DONE]
   - Timer with presets and countdown.
   - Haptic/audio cues and keep-awake.
   - Log as session entry with stats.

6. QA + Polish [DONE]
   - Running logic validation tests via Bun - PASSING (verified 2026-01-22).
   - Accessibility: font scaling and reduced motion support done.
   - Platform-specific storage implemented for web export fix (AsyncStorage fallback on web, SQLite on native).
   - TypeScript compilation passing for Expo SDK 54 compatibility (verified 2026-01-22).
   - Web export verified successfully (`npx expo export --platform web` - verified 2026-01-22).
   - Manual device testing on web/iOS/Android recommended.

## Key Implementation Details
- Breathing state machine should run on a single interval tick to avoid drift.
- Use React Native Reanimated for smooth visual breathing cadence if needed.
- Platform-specific storage: SQLite for iOS/Android, AsyncStorage fallback for web (to avoid expo-sqlite WASM issues).
- Ensure web compatibility for timers/audio with Expo web fallbacks.

## Testing Plan
- Manual test matrix for iOS, Android, and web.
- Unit tests for breathing state machine with deterministic timer.

## Risks + Mitigations
- Timer drift: use high-resolution time diff, not interval count.
- Web audio restrictions: user gesture required to start audio; show prompt.
