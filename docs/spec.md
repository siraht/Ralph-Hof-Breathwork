# Wim Hof Breathwork App - Product Specification

## Product Goals
- Provide a safe, guided Wim Hof Method breathwork experience.
- Offer customizable sessions while keeping the flow simple for beginners.
- Track progress and consistency over time.
- Run from one codebase on web, iOS, and Android.

## Target Users
- Beginners who want a guided, safe intro to breathwork.
- Intermediate users who want customization and progress tracking.
- Wellness-minded users who value simple routines and streaks.

## Safety Requirements
- Prominent safety disclaimer before each breathing session: do not practice in water, while driving, or in risky environments.
- Acknowledgement checkbox before first session; reminder before each session start.

## Core Features (MVP)
1. Guided Breathing Session
   - Configurable rounds (1-8), breaths per round (10-60), hold time (0-3 minutes), recovery breath (10-20 seconds).
   - Visual breathing cadence indicator and timer.
   - Optional audio guidance (voice + soft cues).
   - Haptic cue at phase changes (optional).
   - Session pause/resume and early stop.

2. Session Summary
   - Show total time, longest hold, rounds completed.
   - Allow user to rate session difficulty (1-5) and add a short note.

3. History + Streaks
   - Calendar/list view of completed sessions.
   - Streak count for consecutive days with at least one session.

4. Cold Exposure (Lite for MVP)
   - Simple guided timer for cold shower or ice bath.
   - Preset durations and simple countdown.
   - Log completion to history.

5. Settings
   - Default session settings (rounds, breaths, holds).
   - Toggle audio cues and haptics.
   - Units (seconds/minutes display style).

## User Flows
- Onboarding -> safety acknowledgment -> home.
- Home -> start breathing -> safety reminder -> session -> summary -> history.
- Home -> cold exposure -> timer -> summary.
- Settings -> update defaults -> new session uses defaults.

## UX + UI Requirements
- Calm, focused design with bold, intentional visuals.
- Clear phase states: inhale, exhale, hold, recovery.
- Large, readable timers and single primary action per screen.
- Consistent navigation (bottom tabs): Home, History, Settings.

## Data Model (Local)
- Session
  - id, type (breathwork|cold), startedAt, endedAt, roundsCompleted
  - breathConfig { rounds, breaths, holdSec, recoverySec }
  - stats { longestHoldSec, totalDurationSec }
  - notes, rating
- Settings
  - defaults { rounds, breaths, holdSec, recoverySec }
  - toggles { audio, haptics }
  - lastSafetyAcknowledgedAt

## Non-Functional Requirements
- Offline-first, no account required.
- Fast cold-start and smooth timers.
- Accessibility: large text and reduced motion support.

## Out of Scope (for MVP)
- Social/community features.
- Subscription/payments.
- Wearable integrations.
