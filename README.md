# Cat Insulin Tracker

A mobile-first web app for households managing a diabetic cat's insulin injections. Built for caregivers who need to track doses, share the responsibility, and never be caught off-guard by a depleted supply.

## The Problem

Managing a diabetic cat's insulin is stressful — missed doses are risky, and running out of insulin or needles unexpectedly is a real danger. When multiple caregivers are involved, coordination adds another layer of difficulty.

## What It Does

- **Schedules injection events** at fixed daily times and tracks their status (upcoming, due, completed, late, missed, skipped)
- **Logging form** that's quick to fill in — pre-filled with defaults, opens directly from the dashboard or calendar
- **Tracks supply** for both insulin bottles and needle packs, decrementing automatically with each logged injection
- **Warns before supplies run out** — in-app alerts at 5 days and 1 day before projected depletion
- **Dashboard** showing the next due injection, supply levels, and active alerts — the primary screen for daily use
- **Injection history** with filtering, editing, and supply recalculation on edits
- **Multi-caregiver safe** — concurrent log attempts are rejected with a clear message

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL · Auth.js v5 · Vercel

## Development Workflow

See [WORKFLOW.md](./WORKFLOW.md) for how to go from PRD → GitHub issues → implementation using the AI agent pipeline.
