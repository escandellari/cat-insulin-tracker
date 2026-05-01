# Product Requirements Document: Cat Insulin Injection Tracker Web App

## 1. Product Overview

### Product Name

Cat Insulin Tracker

### Purpose

Create a simple web app that helps caregivers reliably track scheduled insulin injections for a cat, record each completed injection, monitor insulin and needle supply usage, and receive timely notifications before supplies run out.

### Primary Goal

Help caregivers ensure insulin injections are given on time, accurately logged, and supported by proactive supply reminders.

### Target Users

- Cat owners or caregivers responsible for administering insulin injections.
- Households with multiple caregivers who need a shared record of what has been given and when.

### Key Outcomes

- Users can view upcoming insulin injection reminders on a calendar.
- Users can track an injection when it becomes due.
- Users can record dosage, needle usage, injection location, and notes.
- Users can log when a new needle pack or insulin bottle is started.
- The app estimates supply depletion based on usage.
- The app sends notifications 5 days before supplies are expected to run out and again on the expected final day.

---

## 2. Scope

### In Scope

- Web app with responsive design for mobile and desktop.
- Calendar view with prepopulated insulin injection events.
- Injection reminder events at fixed scheduled times.
- Track button available when an injection event is due.
- Injection logging form.
- Needle pack tracking.
- Insulin bottle tracking.
- Supply depletion calculations.
- Notifications for due injections and low supplies.
- Basic history/log view.
- Settings for schedule, dosage units, supply quantities, and notification preferences.

### Out of Scope for MVP

- Veterinary diagnosis or dosing recommendations.
- Automatic medical advice.
- Integration with veterinary systems.
- Barcode scanning.
- Native iOS/Android apps.
- Blood glucose monitoring integration.
- Multi-pet support, unless easy to support in the data model.
- Complex inventory forecasting beyond simple usage-based estimation.

---

## 3. User Stories

### Injection Schedule

1. As a caregiver, I want to see all upcoming insulin injection times on a calendar so that I know when the cat needs an injection.
2. As a caregiver, I want injection reminders to be prepopulated at specific times so that I do not need to manually create each event.
3. As a caregiver, I want to configure the injection schedule so that it matches the vet-prescribed routine.

### Injection Tracking

4. As a caregiver, I want a Track button to appear when an injection is due so that I can log the injection immediately.
5. As a caregiver, I want to enter the dosage given so that the app can keep an accurate medication record.
6. As a caregiver, I want to record how many needles were used so that the app can track remaining needle supply.
7. As a caregiver, I want to record the injection location so that I can rotate injection sites and maintain a clear history.
8. As a caregiver, I want to add free-form notes so that I can document anything unusual.
9. As a caregiver, I want to see whether an injection was completed, missed, skipped, or late.

### Supply Tracking

10. As a caregiver, I want to record when I started a new pack of needles so that the app can calculate how many needles remain.
11. As a caregiver, I want to record how many needles are in a pack so that the app can forecast when the pack will run out.
12. As a caregiver, I want to record when I started a new bottle of insulin so that the app can calculate remaining insulin.
13. As a caregiver, I want to enter the total insulin volume or available units in a bottle so that depletion can be estimated.
14. As a caregiver, I want to receive a notification 5 days before needles or insulin are expected to run out.
15. As a caregiver, I want to receive another notification on the expected final day of supply.

### History and Review

16. As a caregiver, I want to view past injections so that I can confirm what was given and when.
17. As a caregiver, I want to filter or search the injection history so that I can find previous records quickly.
18. As a caregiver, I want to export or copy the injection history so that I can share it with a vet if needed.

---

## 4. Core Features

## 4.1 Calendar and Injection Events

### Description

The app should show a calendar containing insulin injection events. Events are automatically generated from the user’s configured injection schedule.

### Requirements

- Display calendar in at least monthly and daily/agenda view.
- Prepopulate events based on recurring schedule settings.
- Each event should show:
  - Event title, e.g. “Cat insulin injection”
  - Scheduled date and time
  - Status: Upcoming, Due, Completed, Missed, Skipped, Late

- Events should be generated from schedule configuration rather than manually created one by one.
- Users should be able to configure:
  - Injection frequency, e.g. once daily, twice daily, custom times
  - Specific injection times, e.g. 08:00 and 20:00
  - Time zone
  - Start date

- Events should continue to appear into the future.
- Calendar should visually distinguish completed, missed, and upcoming events.

### Event Status Logic

- Upcoming: Current time is before the due window.
- Due: Current time is within the configurable due window.
- Completed: A tracking form has been submitted for the event.
- Late: Event was completed after the due window.
- Missed: Event was not completed by the end of the missed threshold.
- Skipped: User manually marks the event as skipped.

### Suggested Defaults

- Due window starts at scheduled time.
- Track button becomes available 30 minutes before scheduled time and remains available until the missed threshold.
- Missed threshold defaults to 12 hours after scheduled time.
- All timing thresholds should be configurable in settings.

---

## 4.2 Due Injection Track Button

### Description

When an injection event is due, the user should see a prominent Track button.

### Requirements

- Track button should appear on:
  - Calendar event detail view
  - Today dashboard
  - Notification action, where supported

- Track button should be enabled when:
  - Event is within the configured tracking window
  - Event has not already been completed

- If an event is completed, the button should change to View/Edit Log.
- If the event is not yet due, show the scheduled time and optionally disable the Track button.
- If the event is missed, allow the user to either:
  - Log late injection
  - Mark as skipped/missed

---

## 4.3 Injection Tracking Form

### Description

The form records what was administered and relevant details.

### Form Fields

1. **Scheduled event**
   - Auto-linked to the calendar event.
   - Read-only display of scheduled date/time.

2. **Actual injection date and time**
   - Defaults to current date/time.
   - Editable.
   - Required.

3. **Dosage given**
   - Numeric input.
   - Required.
   - Unit configurable, default: insulin units.
   - Must allow decimals if needed.

4. **Needles used**
   - Numeric input.
   - Required.
   - Default: 1.
   - Must be a positive integer.

5. **Injection location**
   - Required or optional based on settings; default optional but encouraged.
   - Should support predefined options and custom entries.
   - Suggested options:
     - Left shoulder
     - Right shoulder
     - Left flank
     - Right flank
     - Scruff
     - Other

6. **Notes**
   - Free-form text area.
   - Optional.
   - Examples: cat resisted, partial dose, unusual behavior, needle bent, fur shot suspected.

7. **Outcome/status**
   - Completed
   - Partial dose
   - Skipped
   - Missed
   - Other

### Validation

- Dosage must be greater than or equal to 0.
- Needles used must be greater than or equal to 0.
- If status is Completed or Partial dose, dosage should normally be greater than 0.
- If status is Skipped or Missed, dosage and needles used may be 0.
- If entered dosage exceeds normal expected amount, show a confirmation warning but do not block submission.

### Submission Result

On submit:

- Create an injection log entry.
- Mark the linked event as completed, skipped, missed, partial, or late.
- Deduct insulin amount from active insulin bottle.
- Deduct needles used from active needle pack.
- Recalculate projected supply end dates.
- Trigger supply notifications if thresholds are met.

---

## 4.4 Supply Tracking: Needles

### Description

Users can start a new pack of needles and track depletion based on logged needle usage.

### Requirements

- User can create a new needle pack record.
- Fields:
  - Pack name or label, optional, e.g. “Needle pack May 2026”
  - Start date
  - Total needles in pack
  - Starting remaining count, default equal to total needles
  - Notes, optional

- Only one needle pack should be active by default.
- Starting a new needle pack should deactivate the previous pack or prompt the user to confirm.
- Each injection log deducts the number of needles used from the active pack.
- App should show:
  - Needles remaining
  - Average needles used per day
  - Estimated run-out date

### Needle Depletion Calculation

- Remaining needles = starting remaining count - sum of needles used since pack start.
- Average daily needle usage can be calculated from actual usage since pack start.
- If there is insufficient history, use scheduled injections multiplied by default needles per injection.
- Estimated run-out date = current date + remaining needles / estimated daily needle usage.

### Notifications

- Notify 5 days before expected needle pack depletion.
- Notify on expected final day.
- Avoid duplicate notifications for the same threshold and same pack.
- If projected run-out date changes due to usage, update notification schedule.

---

## 4.5 Supply Tracking: Insulin Bottle

### Description

Users can start a new insulin bottle and track depletion based on dosage logged.

### Requirements

- User can create a new insulin bottle record.
- Fields:
  - Bottle name or label, optional, e.g. “Insulin bottle May 2026”
  - Start date
  - Total amount available
  - Unit of measurement, default: insulin units
  - Starting remaining amount, default equal to total amount
  - Insulin type/name, optional
  - Notes, optional

- Only one insulin bottle should be active by default.
- Starting a new bottle should deactivate the previous active bottle or prompt the user to confirm.
- Each injection log deducts dosage from the active bottle.
- App should show:
  - Insulin remaining
  - Average insulin used per day
  - Estimated run-out date

### Insulin Depletion Calculation

- Remaining insulin = starting remaining amount - sum of dosages given since bottle start.
- Average daily insulin usage can be calculated from actual usage since bottle start.
- If there is insufficient history, use scheduled injections multiplied by default dosage per injection.
- Estimated run-out date = current date + remaining insulin / estimated daily insulin usage.

### Notifications

- Notify 5 days before expected insulin bottle depletion.
- Notify on expected final day.
- Avoid duplicate notifications for the same threshold and same bottle.
- If projected run-out date changes due to usage, update notification schedule.

---

## 4.6 Notifications

### Notification Types

1. Injection due reminder.
2. Injection missed reminder.
3. Needle pack 5-day warning.
4. Needle pack final-day warning.
5. Insulin bottle 5-day warning.
6. Insulin bottle final-day warning.

### Requirements

- Users can enable or disable notifications.
- Support browser push notifications where available.
- Support in-app notifications as a fallback.
- Email notifications may be optional for MVP.
- Notification messages should be clear and actionable.

### Example Messages

- “Insulin injection due for your cat at 8:00 AM.”
- “Needle pack expected to run out in 5 days.”
- “Insulin bottle expected to run out today.”

### Notification Rules

- Injection reminders should be based on scheduled event times.
- Supply reminders should be based on projected run-out date.
- Send low-supply notification 5 calendar days before projected run-out date.
- Send final-day notification on projected run-out date.
- If projection changes, future notifications should be recalculated.
- Do not send the same threshold notification more than once per active supply item unless the projection changes significantly and the user has not already acted.

---

## 4.7 Dashboard

### Description

The dashboard should give users a quick overview of what matters today.

### Dashboard Components

- Next scheduled injection.
- Track button if injection is due.
- Last completed injection summary.
- Active needle pack status.
- Active insulin bottle status.
- Alerts for low or depleted supplies.
- Quick actions:
  - Track injection
  - Start new needle pack
  - Start new insulin bottle
  - View history

---

## 4.8 History / Logs

### Description

Users should be able to review previous injection records.

### Requirements

- Show a chronological list of injection logs.
- Each log should include:
  - Scheduled date/time
  - Actual date/time
  - Dosage
  - Needles used
  - Injection location
  - Notes
  - Status
  - Caregiver/user who logged it, if multi-user support exists

- Allow filtering by:
  - Date range
  - Status
  - Injection location

- Allow editing of past entries.
- Editing a log should recalculate supply usage.
- Allow deleting a log, with confirmation.
- Deleting a log should recalculate supply usage.
- Optional MVP feature: export to CSV.

---

## 4.9 Settings

### Settings Fields

- Cat name.
- Injection schedule:
  - Frequency
  - Injection times
  - Start date
  - Time zone

- Default dosage.
- Default needles per injection.
- Injection tracking window.
- Missed threshold.
- Injection location list.
- Notification preferences:
  - Browser push
  - In-app
  - Email, optional
  - Reminder lead time

- Supply defaults:
  - Needles per pack
  - Insulin bottle amount
  - Insulin unit

---

## 5. Data Model

## 5.1 User

```json
{
  "id": "string",
  "email": "string",
  "displayName": "string",
  "createdAt": "datetime",
  "timezone": "string"
}
```

## 5.2 Cat

```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "createdAt": "datetime"
}
```

## 5.3 InjectionSchedule

```json
{
  "id": "string",
  "catId": "string",
  "startDate": "date",
  "times": ["08:00", "20:00"],
  "timezone": "Europe/London",
  "defaultDosage": 2,
  "dosageUnit": "units",
  "defaultNeedlesPerInjection": 1,
  "isActive": true,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 5.4 InjectionEvent

Events may be generated dynamically from the schedule or persisted as event instances.

```json
{
  "id": "string",
  "catId": "string",
  "scheduleId": "string",
  "scheduledAt": "datetime",
  "status": "upcoming | due | completed | late | missed | skipped | partial",
  "logId": "string | null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 5.5 InjectionLog

```json
{
  "id": "string",
  "catId": "string",
  "eventId": "string",
  "scheduledAt": "datetime",
  "actualAt": "datetime",
  "dosageGiven": 2,
  "dosageUnit": "units",
  "needlesUsed": 1,
  "injectionLocation": "Left shoulder",
  "status": "completed | partial | skipped | missed | other",
  "notes": "string",
  "createdBy": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 5.6 NeedlePack

```json
{
  "id": "string",
  "catId": "string",
  "label": "Needle pack May 2026",
  "startDate": "date",
  "totalNeedles": 100,
  "startingRemainingNeedles": 100,
  "currentRemainingNeedles": 83,
  "isActive": true,
  "estimatedRunOutDate": "date",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 5.7 InsulinBottle

```json
{
  "id": "string",
  "catId": "string",
  "label": "Insulin bottle May 2026",
  "insulinName": "string",
  "startDate": "date",
  "totalAmount": 300,
  "startingRemainingAmount": 300,
  "currentRemainingAmount": 250,
  "unit": "units",
  "isActive": true,
  "estimatedRunOutDate": "date",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 5.8 NotificationRecord

```json
{
  "id": "string",
  "catId": "string",
  "type": "injection_due | injection_missed | needles_5_day | needles_final_day | insulin_5_day | insulin_final_day",
  "relatedEntityId": "string",
  "scheduledFor": "datetime",
  "sentAt": "datetime | null",
  "status": "scheduled | sent | cancelled | failed",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 6. Key User Flows

## 6.1 First-Time Setup

1. User opens app.
2. User enters cat name.
3. User configures injection schedule:
   - Times of day.
   - Default dosage.
   - Default needles per injection.

4. User enters current needle pack details.
5. User enters current insulin bottle details.
6. User enables notifications.
7. App generates upcoming calendar events.
8. User lands on dashboard.

## 6.2 Track a Due Injection

1. User receives reminder or opens dashboard.
2. User sees injection event due.
3. User clicks Track.
4. App opens injection tracking form.
5. Form is prefilled with scheduled time, current time, default dosage, and default needles used.
6. User confirms or edits dosage.
7. User enters needles used.
8. User selects injection location.
9. User adds notes if needed.
10. User submits form.
11. App marks event as completed.
12. App updates insulin and needle inventory.
13. App recalculates run-out dates.
14. App shows confirmation.

## 6.3 Start a New Needle Pack

1. User clicks Start New Needle Pack.
2. User enters pack start date and total needle count.
3. User saves.
4. App makes this pack active.
5. Previous active pack is deactivated.
6. App recalculates supply forecasts.

## 6.4 Start a New Insulin Bottle

1. User clicks Start New Insulin Bottle.
2. User enters bottle start date, amount available, and unit.
3. User saves.
4. App makes this bottle active.
5. Previous active bottle is deactivated.
6. App recalculates supply forecasts.

## 6.5 Low Supply Notification

1. User logs injections over time.
2. App recalculates estimated run-out dates.
3. If current date is 5 days before expected run-out, app sends warning.
4. If current date is expected final day, app sends final-day warning.
5. User starts a new pack or bottle.
6. App resets notification tracking for the new supply item.

---

## 7. Business Logic

## 7.1 Supply Forecasting

### Needles

```text
needles_remaining = starting_remaining_needles - sum(needles_used in logs linked to active pack period)
```

```text
estimated_daily_needle_usage = max(actual_average_daily_needle_usage, scheduled_daily_injections * default_needles_per_injection)
```

```text
estimated_needle_runout_date = today + floor(needles_remaining / estimated_daily_needle_usage)
```

### Insulin

```text
insulin_remaining = starting_remaining_amount - sum(dosage_given in logs linked to active bottle period)
```

```text
estimated_daily_insulin_usage = max(actual_average_daily_insulin_usage, scheduled_daily_injections * default_dosage)
```

```text
estimated_insulin_runout_date = today + floor(insulin_remaining / estimated_daily_insulin_usage)
```

### Edge Cases

- If estimated daily usage is 0, do not calculate run-out date; show “insufficient usage data.”
- If remaining supply is 0 or below, show “depleted.”
- If dosage or needle usage is edited later, recalculate from all logs after the active supply start date.
- If a user starts a new pack or bottle with a past start date, include logs from that start date onward if appropriate, or ask user whether to apply past logs.

---

## 8. Permissions and Multi-Caregiver Considerations

### MVP Option

Single account only.

### Future Option

Shared household support:

- Owner can invite other caregivers.
- Each log records who submitted it.
- All caregivers can see completed injections to avoid duplicate dosing.
- Optional role permissions:
  - Owner
  - Caregiver
  - Viewer

---

## 9. UX Requirements

### Design Principles

- Mobile-first.
- Fast logging with minimal taps.
- Clear status indicators.
- Prominent due injection action.
- Avoid clutter.
- Make accidental duplicate logging difficult.

### Important Screens

1. Dashboard / Today view.
2. Calendar view.
3. Injection event detail.
4. Track injection form.
5. Injection history.
6. Supplies page.
7. Start new needle pack form.
8. Start new insulin bottle form.
9. Settings.
10. Notification permissions screen.

### Accessibility

- Large buttons for key actions.
- High contrast status labels.
- Keyboard-accessible forms.
- Screen-reader-friendly labels.
- Clear error messages.

---

## 10. Non-Functional Requirements

### Reliability

- Injection and supply logs must not be lost.
- Form submissions should be idempotent to prevent duplicate logs.
- App should handle offline or poor connectivity gracefully if possible.

### Performance

- Dashboard should load in under 2 seconds on a typical mobile connection.
- Calendar should support at least 12 months of generated events without noticeable lag.

### Security and Privacy

- User data should require authentication.
- Data should be stored securely.
- Do not expose personal or pet medical logs publicly.
- Support account deletion and data export if feasible.

### Time Zone Handling

- Store timestamps in UTC.
- Display times in the user’s configured time zone.
- Handle daylight saving changes correctly.

---

## 11. MVP Acceptance Criteria

### Calendar

- Given a configured injection schedule, when the user opens the calendar, then upcoming injection events appear at the configured times.
- Given an injection event is due, when the user views it, then a Track button is available.
- Given an event has been tracked, when the user views the calendar, then the event appears as completed.

### Tracking Form

- Given the user clicks Track, when the form opens, then scheduled time, default dosage, and default needles used are prefilled.
- Given the user submits a valid form, then an injection log is created and the event is marked completed.
- Given the user enters invalid dosage or needle count, then the app shows a validation error.

### Supplies

- Given an active needle pack exists, when an injection log records needles used, then the remaining needle count decreases.
- Given an active insulin bottle exists, when an injection log records dosage, then the remaining insulin amount decreases.
- Given usage changes, when the app recalculates, then projected run-out dates update.

### Notifications

- Given supplies are projected to run out in 5 days, when notification checks run, then the user receives a 5-day warning.
- Given supplies are projected to run out today, when notification checks run, then the user receives a final-day warning.
- Given the same supply item has already triggered a 5-day warning, when notification checks run again, then the duplicate warning is not sent.

### History

- Given the user has logged injections, when they open history, then previous logs are shown in reverse chronological order.
- Given a user edits a past log, when they save, then supply calculations update.

---

## 12. Suggested Tech Implementation Notes for AI Builder

### Frontend

- Responsive web app.
- Calendar library or custom calendar component.
- Dashboard-first navigation.
- Forms with client-side validation.

### Backend

- Authenticated API.
- Database tables matching the data model above.
- Scheduled jobs for notification checks.
- Server-side recalculation for supplies to avoid client-side inconsistencies.

### Notification Architecture

- Browser push notifications for supported browsers.
- In-app notification center.
- Scheduled job runs at least daily for supply notifications.
- Injection reminders should be scheduled precisely around injection times.

### Recommended Recalculation Strategy

Whenever an injection log, needle pack, or insulin bottle changes:

1. Recalculate active needle supply.
2. Recalculate active insulin supply.
3. Recalculate projected run-out dates.
4. Cancel obsolete future supply notifications.
5. Schedule new supply notifications if needed.

---

## 13. Risks and Considerations

### Medical Safety

The app must not recommend insulin dosage. Dosage values are entered by the user based on veterinary guidance. The app should include a disclaimer that it is a tracking and reminder tool only and not a substitute for veterinary advice.

### Duplicate Dosing Risk

The app should make completed injections highly visible to reduce the chance of two caregivers giving duplicate injections.

### Notification Reliability

Browser notifications can be unreliable if permissions are denied or the browser is closed. The app should show in-app reminders and make upcoming injections visible on the dashboard.

### Supply Forecast Accuracy

Supply depletion is an estimate based on recorded usage. The app should clearly label projected run-out dates as estimates.

---

## 14. Future Enhancements

- Multi-pet support.
- Multi-caregiver household accounts.
- Blood glucose tracking.
- Weight tracking.
- Vet report export as PDF.
- CSV export/import.
- Photo attachment for notes.
- Injection site rotation recommendations.
- Medication refill ordering links.
- Native mobile app.
- Integration with Apple Calendar, Google Calendar, or Outlook Calendar.
- Smart notifications via SMS, WhatsApp, or email.

---

## 15. AI Builder Prompt

Use this PRD to build a responsive web app called Cat Insulin Tracker. The app should help a caregiver manage scheduled insulin injections for a cat, track completed injections, monitor active needle and insulin supplies, and send notifications before supplies run out. Prioritize a mobile-first dashboard, calendar-based injection events, a fast injection tracking form, reliable supply calculations, and clear status indicators. The app must not provide medical dosing advice; it should only record user-entered information and remind users based on their configured schedule.
