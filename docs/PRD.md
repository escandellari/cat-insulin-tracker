# PRD: Cat Insulin Tracker

## Problem Statement

Managing a diabetic cat's insulin injections is error-prone and stressful. Caregivers need a reliable way to know when injections are due, log what was administered, and get advance warning before supplies run out — reducing the risk of missed doses or running out of insulin or needles unexpectedly.

## Goals

- Zero missed injections due to forgetting
- Supply depletion never comes as a surprise
- Any caregiver in the household can log an injection without coordination overhead

---

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL (Supabase or Neon) · Auth.js v5 · react-hook-form · zod · Vercel

---

## Users

Single household, one or more caregivers sharing one account. No multi-tenancy required in v1. Each injection log records who submitted it so caregivers can see what has already been given.

---

## Scope

**In scope:** calendar, injection logging, supply tracking, in-app low-supply notifications, dashboard, settings, single-household auth, history/log view

**Out of scope (v1):** push/email/SMS notifications, multiple cats, multiple households, barcode scanning, blood glucose integration, offline support, native mobile apps, CSV export (optional stretch goal)

---

## Features

### 1. Scheduled Injection Events

The app pre-populates injection events at fixed times configured by the user (e.g. 08:00 and 20:00). Events repeat indefinitely from a configured start date. Each event has one of the following statuses:

| Status | Meaning |
|--------|---------|
| Upcoming | Before the tracking window opens |
| Due | Within the configurable tracking window |
| Completed | A log entry has been submitted |
| Late | Logged after the tracking window closed |
| Missed | Tracking window passed with no log |
| Skipped | Manually marked by caregiver |
| Partial | Logged with reduced dosage |

The Track button becomes available 30 minutes before the scheduled time (configurable) and remains active until the missed threshold (default 12 hours after scheduled time, configurable).

When settings change injection times, only future unlogged events are updated; past events are preserved as-is.

### 2. Calendar View

A monthly and weekly calendar displays all injection events colour-coded by status. The user can navigate between months and weeks. Clicking any event opens its detail view; clicking a due event opens the injection logging form directly.

Empty states include guidance to configure injection times if none are set.

### 3. Injection Logging

When an event is due, a **Track** button is active on:
- The calendar event detail
- The dashboard
- Any in-app notification

The form fields are:

| Field | Type | Required | Default |
|-------|------|----------|---------|
| Scheduled event | Read-only | — | Linked event |
| Actual date/time | Datetime | Yes | Now (editable) |
| Dosage given | Decimal number | Yes | Default dosage from settings |
| Needles used | Integer ≥ 0 | Yes | 1 |
| Injection site | Select + custom | No | — |
| Outcome/status | Select | Yes | Completed |
| Notes | Free text | No | — |

**Injection sites:** Left shoulder · Right shoulder · Left flank · Right flank · Scruff · Other

**Outcome values:** Completed · Partial dose · Skipped · Missed · Other

**Validation:**
- Dosage ≥ 0; needles ≥ 0
- If Completed or Partial, dosage should normally be > 0 (warn but do not block)
- If dosage exceeds a configurable threshold above the default, show a confirmation warning

**On submission:**
- Injection log is created
- Linked event is marked with the appropriate status
- Active needle pack and insulin bottle are decremented
- Supply run-out dates are recalculated
- Notification schedule is updated if projections change

**Concurrent logging:** If two caregivers attempt to log the same event simultaneously, the second submission is rejected with a clear message that the event is already logged.

**Retroactive entries:** A log submitted outside the active time window is accepted but flagged as late.

If an event is missed, the user can either log a late injection or mark it as skipped/missed.

### 4. Supply Tracking

**Needle packs and insulin bottles are tracked independently.** The user records when a new supply is opened. Only one of each type is active at a time; starting a new one deactivates the previous.

**Needle pack fields:** label (optional) · start date · total needles · starting remaining count · notes

**Insulin bottle fields:** label (optional) · insulin name · start date · total amount · unit (default: units) · starting remaining amount · notes

The dashboard shows remaining quantity and estimated run-out date for each active supply.

### 5. Supply Depletion Calculation

Run-out projections use a **7-day rolling average** of actual usage. If fewer than 7 days of logs exist, the fallback rate is the number of scheduled daily injections multiplied by the default quantity per injection.

Remaining needles equal the starting count minus total needles used across all logs since the pack's start date. Estimated needle run-out is today plus the result of dividing remaining needles by average daily needle usage. Insulin remaining and insulin run-out are calculated the same way using dosage values.

**Edge cases:**
- If estimated daily usage is 0 → show "insufficient usage data"
- If remaining ≤ 0 → show "depleted"
- Editing or deleting a past log triggers full recalculation from the active supply's start date
- If a new supply is opened with a past start date, prompt user whether to apply historical logs from that date

### 6. Low-Supply Notifications

In-app notifications only (v1). Notifications persist until dismissed or a new supply is recorded.

| Trigger | Message |
|---------|---------|
| 5 days before projected run-out | "⚠ Needle pack / insulin bottle expected to run out in 5 days." |
| 1 day before projected run-out | "🚨 Needle pack / insulin bottle expected to run out tomorrow." |
| Projected run-out date | "🚨 Needle pack / insulin bottle expected to run out today." |

Duplicate notifications for the same threshold and same supply item are suppressed. If the projection changes, the notification schedule is recalculated and previously-sent warnings may be re-triggered if the new projection crosses a threshold that was not previously reached.

### 7. Dashboard

The dashboard is the primary screen. It shows:

- Next scheduled injection (time and status)
- **Track** button if an injection is currently due
- Last completed injection summary
- Active needle pack: remaining count + estimated run-out date
- Active insulin bottle: remaining amount + estimated run-out date
- Active low-supply alerts
- Quick actions: Track injection · Start new needle pack · Start new insulin bottle · View history

### 8. Injection History

Chronological list of all injection logs (reverse chronological order). Each entry shows: scheduled time · actual time · dosage · needles used · injection site · status · notes · logged by.

Filtering by date range, status, and injection site. Editing a past log recalculates supply usage. Deleting a log (with confirmation) also recalculates. CSV export is a stretch goal for v1.

### 9. Settings

| Setting | Description |
|---------|-------------|
| Cat name | Display name |
| Injection times | One or more times of day (e.g. 08:00, 20:00) |
| Time zone | Used for scheduling and display |
| Schedule start date | First event date |
| Default dosage | Pre-filled in the logging form |
| Default needles per injection | Pre-filled in the logging form |
| Tracking window | Minutes before scheduled time the Track button activates |
| Missed threshold | Hours after scheduled time before event is marked missed |
| Injection site list | Configurable list + custom entry |
| Supply defaults | Default pack size / bottle size |

---

## Key User Flows

### First-Time Setup

1. User opens app and signs in
2. Enter cat name
3. Configure injection schedule (times, default dosage, default needles)
4. Enter current needle pack details
5. Enter current insulin bottle details
6. App generates upcoming calendar events
7. User lands on dashboard

### Track a Due Injection

1. User opens dashboard or receives in-app notification
2. Sees due injection event
3. Clicks Track
4. Form opens pre-filled with scheduled time, current time, default dosage, default needles
5. User confirms or edits fields
6. User submits
7. App marks event completed, updates supply inventory, recalculates run-out dates, shows confirmation

### Start a New Supply

1. User clicks Start New Needle Pack / Start New Insulin Bottle
2. Enters start date and initial quantity
3. Saves → app activates new supply, deactivates previous, recalculates forecasts

---

## Data Model

A **User** has an email address, display name, and a configured time zone. A **Cat** belongs to one User and has a name. An **InjectionSchedule** belongs to a Cat and records the configured injection times, default dosage, default needles per injection, and whether it is currently active. An **InjectionEvent** belongs to a Cat and a Schedule; it represents one scheduled injection occurrence and carries a status (Upcoming, Due, Completed, Late, Missed, Skipped, or Partial). An **InjectionLog** belongs to a Cat and an Event and records the actual time, dosage given, needles used, injection site, outcome, notes, and which caregiver submitted it. A **NeedlePack** belongs to a Cat and tracks label, start date, starting quantity, current remaining quantity, active flag, and estimated run-out date; only one pack is active at a time. An **InsulinBottle** belongs to a Cat and tracks the same fields plus insulin name and unit; only one bottle is active at a time. A **NotificationRecord** belongs to a Cat and records a scheduled in-app alert (types: injection due, injection missed, needles/insulin at 5-day, 1-day, and final-day thresholds) along with its scheduled time, sent time, and status.

---

## API Surface

- `GET /calendar?from=&to=` — all events in range with status and log summary
- `POST /logs` — submit injection log; marks event, decrements supply, recalculates forecasts
- `POST /supplies/needles` / `POST /supplies/insulin` — open new supply record
- `GET /dashboard` — today's events + supply levels + notification flags
- `PUT /settings` — persist new schedule config, regenerate future events

---

## Edge Cases & Error Handling

- Log outside active window → accepted, flagged as late
- No logs yet → supply depletion falls back to schedule × default quantity
- Concurrent log submission → second is rejected with "already logged" message
- Settings change injection times → only future unlogged events updated
- Empty calendar/dashboard → prompt to configure injection times
- Estimated daily usage = 0 → show "insufficient usage data" instead of a date
- Remaining supply ≤ 0 → show "depleted"
- New supply opened with past start date → prompt whether to apply historical logs

---

## Non-Functional Requirements

- **Mobile-first.** Primary use case is a caregiver standing next to the cat. Large buttons, minimal taps for key actions.
- **Performance.** Dashboard and calendar load under 2 seconds on a standard mobile connection. Calendar supports 12+ months of generated events without lag.
- **Reliability.** Injection and supply logs must not be lost. Form submissions are idempotent to prevent duplicate logs.
- **Security.** Auth required; sessions persist across browser closes. All inputs validated client- and server-side. No medical data exposed publicly. Support account deletion.
- **Time zones.** Store all timestamps in UTC. Display in user's configured time zone. Handle daylight saving correctly.
- **Accessibility.** High-contrast status labels, large tap targets, keyboard-accessible forms, screen-reader-friendly labels, clear error messages.

---

## Risks & Considerations

| Risk | Mitigation |
|------|-----------|
| Duplicate dosing by two caregivers | Completed events are highly visible; concurrent submission is rejected |
| Notification reliability (in-app only) | Dashboard always shows next injection and supply alerts |
| Supply forecast inaccuracy | Label projected run-out dates clearly as estimates |
| Medical safety | App must not recommend dosage. Include disclaimer: tracking and reminder tool only, not a substitute for veterinary advice |

---

## Future Enhancements (Post-v1)

- Push notifications (browser), email, SMS
- Multi-pet support
- Multi-household / role-based access (Owner · Caregiver · Viewer)
- Blood glucose and weight tracking
- Injection site rotation recommendations
- Vet report / PDF export
- CSV import/export
- Photo attachments on notes
- Native mobile app
- Calendar integration (Google, Apple, Outlook)

---

## MVP Acceptance Criteria

**Calendar**
- Given a configured schedule, upcoming injection events appear at the correct times
- Given an event is due, a Track button is available
- Given an event is logged, it appears as completed on the calendar

**Tracking form**
- Form opens pre-filled with scheduled time, default dosage, default needles
- Valid submission creates a log and marks the event completed
- Invalid input shows a validation error

**Supplies**
- Logging an injection decrements the active needle pack and insulin bottle
- Editing or deleting a log recalculates remaining supply and run-out dates

**Notifications**
- 5-day warning fires when projection reaches 5 days
- Final-day warning fires on projected run-out date
- Same threshold does not fire twice for the same supply item

**History**
- Past logs shown in reverse chronological order
- Editing a past log updates supply calculations
