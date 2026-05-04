# PRD: Cat Insulin Tracker

## Problem Statement

Managing a diabetic cat's insulin schedule is stressful and error-prone. Caregivers need a simple way to know what is due now, record what was given, and avoid running out of insulin or needles.

## Product Direction

Cat Insulin Tracker is a mobile-first web app for a single household caring for one cat in v1. The product should feel calm, clear, and low-friction. The visual direction is defined by `docs/PROTOTYPE_SPEC.md`: soft green palette, rounded cards, pill buttons, strong spacing, clear hierarchy, and a centered mobile shell.

## Goals

- Make the next required action obvious
- Reduce missed or duplicate injections
- Make supply depletion visible before it becomes urgent
- Keep logging fast enough to use while standing next to the cat

## Users

One household sharing one account. Multiple caregivers may use the same login. The app should show enough history and status to avoid coordination mistakes.

## Scope

### In scope for current MVP roadmap

- Auth + first-time setup
- Dashboard with next injection, today, upcoming, and supply summary
- Injection logging
- Supply tracking
- Calendar view
- Settings for schedule/defaults/preferences

### Out of scope for current MVP roadmap

- Push/email/SMS reminders
- Automated notification delivery engine
- Multi-cat support
- Multi-household roles/permissions
- Blood glucose tracking
- Native mobile apps
- CSV/PDF export
- Offline mode
- Full history editing workflow

## Guiding Decisions

- Use the current `app/` + `features/` structure; do not reorganize to match the prototype's suggested file layout.
- Derive transient event UI states like `due`, `late`, and `missed` at read time.
- Persist durable records like scheduled events, settings, logs, and supplies.
- Keep setup and settings UI fixed to exactly two injection times in v1: morning and evening.
- Store notification preferences only for now; do not build a full alerting engine in this MVP.
- Use one generic supply model with a `type` field rather than separate top-level product concepts.

## Design Requirements

- Mobile-first, centered max-width mobile container
- Mint-to-white background treatment
- White card surfaces with soft green borders
- Pill primary/secondary actions
- Visible labels, visible focus states, accessible validation
- Reusable shared shell/components across all routes

## Core Product Requirements

### 1. Sign-in and first-time setup

After sign-in, a user with no configured cat is sent to `/setup`. The setup experience should match the prototype style and collect:

- cat name
- treatment start date
- morning injection time
- evening injection time
- default dosage
- due window in minutes

The setup flow should be multi-step, mobile-friendly, and include a final review step. On completion, the app creates the cat, schedule, and future injection events, then redirects to `/dashboard`.

### 2. Dashboard

The dashboard is the primary home screen. It should show:

- cat name and current date
- next injection card
- today's injections
- upcoming events
- supply summary cards
- bottom navigation

If no setup exists, the user should be redirected to `/setup`.

### 3. Event status model

Scheduled injection events are persisted. UI-facing status is derived at read time from:

- `scheduledAt`
- current time
- schedule tracking window / due window
- whether a log exists

The product must support these user-facing states:

- pending/upcoming
- due
- late
- missed
- logged

### 4. Injection logging

Caregivers must be able to log a due injection quickly from dashboard and calendar flows.

The logging experience should be a modal/sheet-style flow in the prototype style. It should capture:

- scheduled event reference
- actual timestamp
- dosage
- needles used
- injection site
- optional notes

Submission creates exactly one log for the event. Duplicate concurrent submissions must be rejected cleanly.

### 5. Supply tracking

The app must track insulin and needle inventory. Users can record a new vial or pack, see remaining quantity, and see projected depletion.

For v1, inline supply warnings on dashboard/supplies are enough. A full notification engine is not required.

### 6. Calendar

The app must provide a calendar view for browsing injection schedule and history. It should support week/month navigation and reuse the same event-state and logging logic as dashboard.

### 7. Settings

Users must be able to edit:

- cat name
- treatment start date display
- morning/evening times
- default dosage
- due window
- notification preferences

Changing schedule settings should update future behavior without corrupting past logged history.

## Data Model Direction

- **User**: account identity, timezone, notification preferences
- **Cat**: belongs to one user; stores name and treatment start date
- **InjectionSchedule**: belongs to cat; stores morning/evening schedule defaults and due window settings
- **InjectionEvent**: one scheduled occurrence; persists schedule linkage and `scheduledAt`
- **InjectionLog**: one submitted log linked to an event; stores actual dose details
- **SupplyRecord**: generic supply entity with `type` (`insulin` or `needles`), starting amount, remaining amount, active flag, and projection data

## Scheduling and Time Rules

- Store timestamps in UTC
- Display in the user's configured timezone
- Persist future scheduled events
- Recompute only future unlogged events when schedule settings change
- Support DST safely when generating future scheduled events

## Validation Rules

- Cat name required
- Morning and evening times required
- Default dosage must be non-negative
- Due window must be non-negative
- Treatment start date must be a real date and not more than one year in the past
- Validation errors must be visible inline and accessible

## Phase Plan

1. Foundation + sign-in/setup parity
2. Dashboard + event status layer
3. Injection logging
4. Supply tracking
5. Calendar
6. Settings + schedule editing

The PRD and `docs/PROTOTYPE_SPEC.md` are the product source of truth for implementation.

## Non-Functional Requirements

- Mobile-first UX
- Fast route loads and low-friction logging
- Idempotent logging submissions
- Server- and client-side validation
- Accessible forms, labels, and focus states
- Reliable persisted data for logs and supplies

## Risks

- Duplicate caregiver actions -> mitigate with visible status and idempotent log creation
- Timezone/DST mistakes -> centralize schedule generation and read logic
- Supply forecast inaccuracy -> label projections clearly as estimates

## Success Criteria

- A first-time user can sign in, complete setup, and reach a useful dashboard
- A caregiver can identify the next injection and log it quickly
- The app shows enough supply state to prevent surprise depletion
- Schedule changes affect future behavior without damaging history
