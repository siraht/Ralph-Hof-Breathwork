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
- 2026-01-21: Added accessibility features including AccessibilityProvider hook for system font scale detection, getScaledTypography helper, ScaledText component, and reduced motion toggle in Settings for vestibular comfort.
- 2026-01-21: Fixed TypeScript compilation errors for Expo SDK 54 compatibility: updated expo-sqlite to use openDatabaseSync/runAsync APIs, fixed useEffect cleanup functions, added ViewStyle array support to Card, and renamed useAccessibility.ts to .tsx for JSX.
- 2026-01-21: Implemented platform-specific storage to fix web export issues: created storageAdapter.ts for web AsyncStorage fallback and sqliteStorage.ts for native SQLite, with dynamic imports in sessionStorage.ts to load the appropriate implementation per platform.
- 2026-01-22: Verified all QA items - logic tests pass, TypeScript compiles, web export succeeds. All milestones complete.
- 2026-01-22: Completed UI Refresh Plan (all 7 tasks) to align app with reference screenshots.

## UI Refresh Plan (2026-01-22 - COMPLETE)
The UI Refresh Plan was implemented to match an airy, low-contrast aesthetic with soft teal accents based on reference screenshots.

Key changes:
- **New components created**: SegmentedTabs, BadgeTile, ResultsScreen, GuidedBreathingScreen
- **Theme enhancements**: Added seafoam, teal, frost, border, borderSoft colors; pill radius token; subtle shadow variant; screenGradient presets
- **Navigation updates**: History tab renamed to ResultsTab, pointing to new ResultsScreen; added GuidedBreathing route
- **Dependencies**: Added react-native-svg for BadgeTile hex icon rendering

Screens affected:
- History tab → Results tab (new ResultsScreen with Bar Chart/Calendar/Badges tabs)
- Original HistoryScreen remains for legacy session detail access
- New GuidedBreathingScreen added for session configuration before BreathSessionScreen
- SessionSummaryScreen navigation updated to navigate to 'ResultsTab' instead of 'History'

The UI refresh focused on visual improvements only - all underlying data models, storage, breathing engine, and core functionality remain unchanged.

## Needed Manual Human Interventions
- Device testing on web, iOS, and Android to verify all flows work correctly with the new animated breathing circle, stopwatch holds UI, and hold goal tracking.

## Breathwork Cadence + Stopwatch Holds Upgrade - Complete (2026-01-22)

### Implementation Summary

**Completed Tasks (0-4 of 5):**
- Task 0: Baseline Audit - DONE
- Task 1: Add Settings for Pace + Hold Goals - DONE
- Task 2: Breathing Engine: Variable Pace + Stopwatch Holds - DONE
- Task 3: Breathing Session UI: Animated Circle + Simplified Labels - DONE
- Task 4: Hold Phase Controls: Continue Beyond Goal - DONE
- Task 5: Results/Stats Debugging - PENDING (may not be needed)

### Key Implementation Decisions

**Breathing Engine (`breathingEngine.ts`):**
- Updated `BreathingTimeline` to include `emptyHoldGoalSec` and `recoveryHoldGoalSec`
- Added `holdGoalSec` field to `BreathSegment` for hold and recovery segments
- Holds now use goal time as duration, with `holdGoalSec` tracking the target

**Breathing Store (`breathingStore.ts`):**
- Added `SessionStartOptions` type extending `BreathConfig` with hold goals
- Added hold tracking state:
  - `holdPhaseStartElapsedSec`: tracks when hold phase began
  - `holdElapsedSec`: current elapsed time in hold
  - `goalReached`: boolean for goal met
  - `isHoldPhase`: boolean for current phase type
- Added `advanceFromHold()` method for manual hold advancement
- Users can now continue beyond hold goal, actual time is recorded in stats

**BreathSessionScreen (`BreathSessionScreen.tsx`):**
- Animated breathing circle using React Native Animated API:
  - Expands to 1.3x on inhale, contracts to 0.7x on exhale
  - Color changes: seafoam for breathing, teal for holds
  - Opacity pulses with breathing cadence, respects reduced motion
- Simplified breathing UI:
  - Shows "Inhale · 2s" or "Exhale · 2s" format
  - "Next up" stays on "Hold on empty lungs" during breathing
- Stopwatch holds:
  - Counts up elapsed time
  - Shows goal time in Phase info card
  - "✓ Goal reached!" with color change and goal ring
  - "Continue" button appears when goal is reached
- Goal reached haptic feedback using `Haptics.notificationAsync`

**Settings Store (`settingsStore.ts`):**
- Added `breathingPace` setting with BreathingPace type ('slow' | 'standard' | 'fast')
- Added `emptyHoldGoalSec` and `recoveryHoldGoalSec` settings
- Added `updateBreathingPace()`, `updateEmptyHoldGoal()`, `updateRecoveryHoldGoal()` methods
- Settings migrated to v2 schema

### Remaining Work

**Task 5** (Results/Stats Debugging with t-browser) is pending. The Results screen from the UI Refresh Plan may need verification to ensure session data displays correctly. This task depends on manual testing.

### Files Modified

- AGENTS.md
- docs/implementation.md
- src/app/BreathSessionScreen.tsx
- src/app/GuidedBreathingScreen.tsx
- src/logic/breathingConfig.ts
- src/logic/breathingEngine.ts
- src/state/breathingStore.ts
- src/state/settingsStore.ts
- src/storage/settingsStorage.ts

### QA Status

- TypeScript compilation: PASSING
- Logic validation tests: PASSING
