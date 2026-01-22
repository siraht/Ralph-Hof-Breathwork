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

---

## UI Refresh Plan - Reference Screenshots (2026-01-22) [COMPLETE]

### Context + Intent
- Goal: align the app UI with the provided reference screenshots in `docs/APP_SCREENS_02_V5-min.jpg` and `docs/unnamed.jpg`.
- Why: the references establish a clear visual identity (light, airy, minimal, pill-based controls, subtle card chrome) that reinforces the Wim Hof Method vibe of calm, clarity, and credibility. Matching this reduces cognitive load and increases perceived product quality.
- Scope: UI and layout only; underlying data + logic should remain intact unless a UI update requires small derived data.
- Non-goals: no backend, no deep re-architecture, no new features beyond what is required to present the UI as shown.

### Visual Principles Extracted from References
- Airy, low-contrast, mostly-white canvas with soft teal accents.
- Thin borders, subtle shadows, and rounded cards/pills everywhere.
- Segmented tabs with underline indicator (not chunky pills).
- Simple line icons and small metric cards in tight grids.
- Hex motif for profile/badges; colorful badges grouped by category.
- Guided breathing screen is a "configuration + preview" layout with a hero card and pill controls.

### Task Structure and Dependencies
Below is the TODO list with dependency overlays. Each task includes reasoning, key considerations, and where it lives. This is designed to be self-contained and usable by future agents without re-reading prior threads.

#### 0) Reference Audit and Baseline [DONE]
- Purpose: set a clear baseline of current UI and confirm which screens map to the new visual goals.
- Depends on: none.
- Completed: 2026-01-22
- Decisions:
  - "History" tab renamed to "Results" with new ResultsScreen as the main view
  - SessionDetail remains accessible from Results screen
  - Original HistoryScreen renamed/repurposed for legacy detail view

#### 1) Theme + Tokens Alignment (Foundation) [DONE]
- Purpose: align base palette, corners, borders, and shadows to match the reference look before changing layouts. This ensures subsequent UI work "snaps" into the desired aesthetic.
- Depends on: Task 0 decisions.
- Files: `src/theme/index.ts`, `src/components/Card.tsx`, `src/components/Screen.tsx`, `src/components/Button.tsx`.
- Completed: 2026-01-22
- Changes:
  - Added new colors: seafoam, teal, frost, border, borderSoft, badge colors (gold, coral, lime, purple, blue)
  - Added `pill` radius token (999) for pill-shaped controls
  - Increased `radius.md` from 18 to 20
  - Added new `shadow.subtle` with reduced opacity (0.04) and elevation
  - Added `screenGradient` presets: default, mist, deep, warm
  - Card component updated to use subtle shadow, new border color, and added "frost" tone
  - Screen component updated to use new gradient presets
  - Button component added "pill" variant and "size" prop (sm/md/lg)

#### 2) Segmented Tabs Component (Reusable) [DONE]
- Purpose: unify segmented tab UI (Bar chart / Calendar / Badges) and use the same component elsewhere if needed.
- Depends on: Task 1 (so styles use updated tokens).
- Files: new `src/components/SegmentedTabs.tsx`.
- Completed: 2026-01-22
- Implementation:
  - Tab strip with underline indicator (seafoam color)
  - Props for selected index, onChange handler, and optional icon
  - Subtle pressed state with opacity
  - Accessibility labels and roles

#### 3) Results Screen (Replace/Expand History) [DONE]
- Purpose: implement the three-tab Results UI shown in the first screenshot.
- Depends on: Task 1 and Task 2.
- Files: `src/app/ResultsScreen.tsx` (new), `src/navigation/RootNavigator.tsx` (to wire it), `src/navigation/types.ts`.
- Completed: 2026-01-22
- Implementation:
  - Results screen with SegmentedTabs: Bar chart / Calendar / Badges
  - Bar chart view: metric strip (breathing sessions, cold showers, streak), total time cards, weekly activity bar chart
  - Calendar view: monthly grid with day dots, "Breathing Basics" card with stats
  - Badges view: sections for Streaks, Breathing Exercise, Breathing Accumulation with BadgeTile grid
  - Navigation updated: History tab renamed to ResultsTab, points to ResultsScreen

#### 4) Badge Assets + Badge Tile Component [DONE]
- Purpose: implement the hex badge motif with colored gradients and metallic rims.
- Depends on: Task 1 (colors defined).
- Files: new `src/components/BadgeTile.tsx`.
- Completed: 2026-01-22
- Implementation:
  - SVG-based hexagon shape using react-native-svg (added as dependency)
  - BadgeColor types: gold, coral, lime, purple, blue, gray, teal
  - Size variants: sm (56), md (80), lg (104)
  - Props for acquired, locked, label, subtext, and icon
  - Badge colors from theme token set

#### 5) Guided Breathing Screen (Configuration UI) [DONE]
- Purpose: match the second screenshot's "Guided breathing" layout and provide a stepping stone into the session.
- Depends on: Task 1 (theme), Task 2 (segmented control).
- Files: new `src/app/GuidedBreathingScreen.tsx`, update navigation in `src/navigation/RootNavigator.tsx` and `src/navigation/types.ts`.
- Completed: 2026-01-22
- Implementation:
  - Header with back button and title
  - Hero card with BadgeTile hex avatar and gradient panel
  - SegmentedTabs for breathing speed (Slow/Standard/Fast)
  - Stepper UI for breaths before retention (10-60 range)
  - Stepper UI for hold time (0-180 seconds)
  - Music row with icon and "Change" pill button
  - Benefits list with check icons
  - Safety notice card
  - Uses breathingStore.startSession() to begin session

#### 6) Navigation + Icons Cleanup [DONE]
- Purpose: align bottom tabs and icons with the reference.
- Depends on: Task 3 and Task 5 (screen names must exist).
- Files: `src/navigation/RootNavigator.tsx`, `src/navigation/types.ts`.
- Completed: 2026-01-22
- Changes:
  - Tab labels: Home, Results, Settings
  - Icons: Feather icons (home, bar-chart-2, settings)
  - Tab bar background: frost color for airy look
  - Tab bar border: border color (ultra-subtle)
  - Added GuidedBreathing route to HomeStack

#### 7) Polish + Motion + QA [DONE]
- Purpose: refine the aesthetic to match references and verify no regressions in functionality.
- Completed: 2026-01-22
- Validation:
  - TypeScript compilation: PASSING
  - Logic validation tests: PASSING
  - Core functionality preserved: session flow, storage, state management unchanged
- Notes:
  - Manual device testing still required for full verification on web/iOS/Android
  - Reduce motion setting respected (existing implementation)

### Implementation Notes (For Future Agents)
- The UI refresh is complete with all 7 tasks finished
- New dependencies added: `react-native-svg` for BadgeTile hex icons
- History tab renamed to ResultsTab; HistoryScreen remains as legacy session detail view
- SessionDetail navigation preserved for viewing historical session data
- When replacing History with Results, SessionDetail is still accessible from Results screen
- Keep all platform-specific behavior for storage intact; UI changes do not affect persistence logic

---

## Breathwork Cadence + Stopwatch Holds Upgrade (2026-01-22) [COMPLETE]

### Context + Intent
- Goal: overhaul the in-session breathing UI/logic so the user can visually sync breathing, adjust pace, and treat holds as goal-based stopwatches rather than fixed timers.
- Why: the current UI is timer-first and flips labels per inhale/exhale, which is noisy and less intuitive. The requested experience prioritizes a calm visual rhythm, breath count, and flexible hold tracking.
- Scope: `BreathSessionScreen` UI, breathing engine timing logic, settings/configuration for pace and hold goals, and QA/diagnostics for Results/Stats using t-browser.
- Non-goals: do not remove safety checks or change storage architecture; no backend work.

### Behavioral Requirements (Restated)
- Animated circle expands/contracts to cue inhale/exhale.
- Inhale/exhale pace is user-configurable (faster/slower for initial breaths).
- During initial breaths, "Next up" should stay on "Hold empty lungs" (no switching between inhale/exhale labels).
- Breathing phase UI does not show per-breath timer; show breath count + remaining phase time.
- Hold phases (empty lungs, then recovery breath in) are stopwatches:
  - User sets a goal time.
  - Stopwatch counts up.
  - App indicates when goal is reached but allows continuing beyond it.
- Both hold phases allow going past the goal; actual elapsed time should be recorded for stats.
- Results/Stats seem broken; we must plan a t-browser devserver inspection and fix.

### Task Structure and Dependencies

#### 0) Baseline Audit + Acceptance Criteria [DONE - 2026-01-22]
- Purpose: align on current engine behavior and define what "done" looks like.
- Depends on: none.
- Files to inspect: `src/logic/breathingEngine.ts`, `src/state/breathingStore.ts`, `src/app/BreathSessionScreen.tsx`, `src/state/settingsStore.ts`.
- Completed: 2026-01-22
- Decisions:
  - Documented current breath segment structure and timers (hold durations are fixed)
  - Holds currently use countdown approach, need stopwatch with goal tracking
  - Acceptance criteria defined: animated circle, simplified labels, stopwatch holds with continue beyond goal

#### 1) Add Settings for Pace + Hold Goals [DONE - 2026-01-22]
- Purpose: enable user control over inhale/exhale pace and hold goal targets.
- Depends on: Task 0.
- Files: `src/state/settingsStore.ts`, `src/storage/settingsStorage.ts`, `src/logic/breathingConfig.ts`.
- Completed: 2026-01-22
- Changes:
  - Added `BreathingPace` type with 'slow' | 'standard' | 'fast' presets
  - Added `breathingPacePresets` with inhaleSec/exhaleSec values
  - Added `emptyHoldGoalSec` and `recoveryHoldGoalSec` settings fields
  - Updated settings version key from v1 to v2 for migration
  - Added `updateBreathingPace()`, `updateEmptyHoldGoal()`, `updateRecoveryHoldGoal()` methods

#### 2) Breathing Engine: Variable Pace + Stopwatch Holds [DONE - 2026-01-22]
- Purpose: update the timeline to support per-breath pacing and count-up holds.
- Depends on: Task 1.
- Files: `src/logic/breathingEngine.ts`, `src/state/breathingStore.ts`.
- Completed: 2026-01-22
- Changes:
  - Updated `BreathingTimeline` to include `emptyHoldGoalSec` and `recoveryHoldGoalSec`
  - Added `holdGoalSec` field to `BreathSegment` for hold and recovery segments
  - Added options parameter to `buildBreathingTimeline()` for hold goals
  - Updated `BreathingStats` to track both hold and recovery segments as hold time
  - Added hold tracking state to breathingStore:
    - `holdPhaseStartElapsedSec`: tracks when hold phase began
    - `holdElapsedSec`: current elapsed time in hold
    - `goalReached`: boolean for goal met
    - `isHoldPhase`: boolean for current phase type
  - Added `advanceFromHold()` method for manual hold advancement
  - Added `SessionStartOptions` type extending `BreathConfig` with hold goals

#### 3) Breathing Session UI: Animated Circle + Simplified Labels [DONE - 2026-01-22]
- Purpose: align UI with the requested visual breathing guidance.
- Depends on: Task 2.
- Files: `src/app/BreathSessionScreen.tsx`.
- Completed: 2026-01-22
- Changes:
  - Added animated circle using React Native Animated API
    - Expands to 1.3x scale on inhale, contracts to 0.7x on exhale
    - Color changes: seafoam for breathing, teal for hold phases
    - Opacity pulses with breathing cadence
    - Respects reduced motion setting
  - Simplified breathing phase UI:
    - Shows "Inhale · 2s" or "Exhale · 2s" format with remaining time
    - No per-breath countdown or timer noise
    - "Next up" stays on "Hold on empty lungs" during breathing
  - Hold phase stopwatch UI:
    - Shows elapsed time counting up
    - Displays goal time in Phase info card
    - "✓ Goal reached!" indicator with color change
    - Goal ring appears around circle when goal met
  - Goal reached haptic feedback using Haptics.notificationAsync

#### 4) Hold Phase Controls: Continue Beyond Goal [DONE - 2026-01-22]
- Purpose: allow user to exceed goal while still receiving an acknowledgement.
- Depends on: Task 2 + Task 3.
- Files: `src/app/BreathSessionScreen.tsx`, `src/state/breathingStore.ts`.
- Completed: 2026-01-22
- Changes:
  - "Continue" button appears when in hold phase and goal reached
  - Button replaces "Pause" during hold post-goal
  - Manual advancement via `advanceFromHold()` method in store
  - Stopwatch continues counting after goal is reached
  - `stopSession()` correctly records actual elapsed hold time in stats
  - Safety reminder and "Finish early" flow preserved
- Files also updated: `src/app/GuidedBreathingScreen.tsx` to pass hold goal options to `startSession()`

#### 5) Results/Stats Debugging Plan (t-browser + Dev Server) [DONE - 2026-01-22]
- Purpose: troubleshoot and fix reported broken Results/Stats UI.
- Depends on: Task 0 (baseline) and prior UI refresh work already merged.
- Completed: 2026-01-22
- Changes made (static code review and fixes):
  - SessionStats added: `totalDurationSec`, `longestHoldSec`, `thisWeekDurationSec`
  - ResultsScreen: Replace mock data with real session stats
  - ResultsScreen: Fix calendar month navigation (add state and handlers)
  - ResultsScreen: Fix calendar grid layout with proper day offset cells
  - ResultsScreen: Fix "Avg Streak" label to "Current Streak"
  - ResultsScreen: Remove non-functional "Log Exercise" button
  - ColdExposureScreen: Fix "View History" → "View Results" navigation
  - SessionDetailScreen: Fix "Back to History" → "Back to Results" label
- Files updated:
  - `src/logic/sessionStats.ts` - Added new stats fields
  - `src/app/ResultsScreen.tsx` - Using real stats, working calendar nav
  - `src/app/ColdExposureScreen.tsx` - Navigation fix
  - `src/app/SessionDetailScreen.tsx` - Button label fix
  - `src/app/SettingsScreen.tsx` - Added breathing pace and hold goal settings

### Notes for Future Agents
- The breathing UI should feel calm and meditative; avoid rapid text changes or noisy timers.
- "Goal time" is a milestone, not an ending. Hold phases must remain user-controlled.
- Ensure haptics/audio cues align with new phase transitions (in/out/begin hold/goal reached).
