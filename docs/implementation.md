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
1. Project Setup
   - Create Expo app with TypeScript.
   - Add navigation, fonts, theme tokens, and app structure.

2. Breathing Engine
   - Implement session state machine: inhale/exhale cycles, hold, recovery.
   - Integrate timers and haptic/audio hooks.
   - Pause/resume and stop handling.

3. UI Screens
   - Home screen with primary CTAs.
   - Breathing session screen with cadence UI and timers.
   - Summary screen.
   - History screen (list + calendar view).
   - Settings screen.

4. Persistence
   - AsyncStorage for settings.
   - SQLite for sessions; CRUD utilities.

5. Cold Exposure Timer
   - Simple timer with presets.
   - Log as session entry.

6. QA + Polish
   - Accessibility pass (font scaling, reduced motion).
   - Performance checks for timers and audio.

## Key Implementation Details
- Breathing state machine should run on a single interval tick to avoid drift.
- Use React Native Reanimated for smooth visual breathing cadence if needed.
- Ensure web compatibility for timers/audio with Expo web fallbacks.

## Testing Plan
- Manual test matrix for iOS, Android, and web.
- Unit tests for breathing state machine with deterministic timer.

## Risks + Mitigations
- Timer drift: use high-resolution time diff, not interval count.
- Web audio restrictions: user gesture required to start audio; show prompt.
