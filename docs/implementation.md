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
