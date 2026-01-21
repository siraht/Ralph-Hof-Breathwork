# Agent Notes

## Project Summary
- Build a cross-platform Wim Hof Method breathwork app (web, iOS, Android) with breathing sessions, cold exposure guidance, and progress tracking.

## Decisions Log
- 2026-01-21: Chose Expo + React Native + TypeScript for a single codebase targeting web/iOS/Android.
- 2026-01-21: Plan to use local-first persistence (AsyncStorage + SQLite) for settings and session history; no backend in MVP.
- 2026-01-21: Audio guidance via Expo AV, haptics via Expo Haptics, and keep-awake during sessions.
- 2026-01-21: Set base navigation as bottom tabs with a Home stack and a light glacier palette using Space Grotesk + Space Mono typography.
- 2026-01-21: Implemented a timeline-based breathing engine and Zustand stores for session + settings, plus a safety acknowledgment screen and per-session reminder gate.
- 2026-01-21: Added SQLite-backed session history with streak stats, cold exposure timer logging, and audio/haptic cues with keep-awake during active sessions.
- 2026-01-21: Added a bun-run logic validation script for breathing engine + streak stats (scripts/validate-logic.ts) to keep deterministic checks in repo.
- 2026-01-21: Added SessionDetailScreen with full session stats (rounds, longest hold, breathing config, reflection), History stack navigation, and pressable list items for drill-down into session details.

## Needed Manual Human Interventions
- None.
