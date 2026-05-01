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
Single household, one or more caregivers sharing one account. No multi-tenancy required in v1.

---

## Features

### 1. Scheduled Injection Events
The app pre-populates daily injection events at fixed times configured by the user (e.g. 08:00 and 20:00). Events repeat indefinitely from a configured start date. Each event has one of three statuses: pending, logged, or missed. An event becomes missed if it passes without a log entry.

### 2. Calendar View
A monthly and weekly calendar displays all injection events colour-coded by status. The user can navigate between months and weeks. Clicking a pending or due event opens the injection logging form.

### 3. Injection Logging
When an event is due (within a configurable time window around the scheduled time), a "Log Injection" button becomes active on that event. Tapping it opens a form with the following fields: dosage in units (required), number of needles used (required, defaults to 1), injection site chosen from a predefined list (scruff-left, scruff-right, side-left, side-right), and free-text notes (optional). The timestamp defaults to now but is editable. On submission the event is marked as logged.

### 4. Supply Tracking
The user can record when a new insulin bottle or needle pack is opened, specifying the initial quantity (units for insulin, count for needles). The app tracks remaining supply by subtracting amounts from each logged injection. The current remaining quantity for each supply type is visible on the dashboard.

### 5. Low-Supply Notifications
The app calculates projected depletion based on average daily usage over the last 7 days. When projected depletion is 5 days away, an in-app warning notification appears on the dashboard. When projected depletion is 1 day away, an urgent notification appears. Notifications persist until dismissed or a new supply is recorded. Both supply types (insulin and needles) are tracked independently.

### 6. Dashboard
The dashboard shows today's injection events with their current status, a "Log Injection" shortcut for any due event, and supply level widgets for insulin and needles including depletion warnings.

### 7. Settings
The user can configure the cat's name, the scheduled injection times, the default dosage, and the time window during which an event is considered "due" and the log button activates.

---

## Data Concepts
- A **scheduled event** belongs to a recurrence rule and has a status and an optional linked log entry
- An **injection log** records dosage, needles used, injection site, notes, and the actual timestamp
- A **supply record** has a type (insulin or needles), a start date, and an initial quantity; remaining quantity is derived from logs
- **Settings** store injection times, default dosage, and the active-window duration

---

## API Surface
- Fetching the calendar returns all events in a date range with their status and any linked log summary
- Submitting a log entry marks the associated event as logged and returns the updated event
- Creating a supply record stores the opening details and returns current remaining quantity
- Fetching dashboard data returns today's events and current supply levels with notification flags
- Updating settings persists new injection times and defaults and regenerates future scheduled events accordingly

---

## Edge Cases & Error Handling
- If a log is submitted outside the active time window (e.g. retroactive entry), it is accepted but flagged as late
- If no injections have been logged yet, supply depletion is calculated using the configured default dosage
- If two caregivers attempt to log the same event simultaneously, the second submission is rejected with a clear message that the event is already logged
- If settings change the injection times, only future unlogged events are updated; past events are preserved as-is
- Empty states on the calendar and dashboard include guidance to configure injection times if none are set

---

## Non-Functional Requirements
- The app must be usable on mobile (primary use case is a caregiver standing next to the cat)
- All pages must load in under 2 seconds on a standard mobile connection
- Auth is required; sessions persist across browser closes
- All form inputs are validated client- and server-side
- No PII beyond a username/email for login

---

## Scope

**In scope:** calendar, injection logging, supply tracking, in-app low-supply notifications, dashboard, settings, single-household auth

**Out of scope (v1):** push notifications, email/SMS alerts, multiple cats, multiple households, data export, offline support
