# Cat Insulin Tracker - Implementation Specification

## Overview

A mobile-first cat insulin tracking application inspired by qrstorage_forgeflow's visual language, translated to a green color system. The design prioritizes calm clarity, gentle reassurance, and practical utility for caregivers managing feline diabetes.

---

## Design System

### Color Palette

#### Brand Colors

- **Brand Green**: `#2F8F63` - Primary CTAs, active states, accents
- **Dark Green**: `#256F4E` - Hover states, darker accents
- **Mint Tint**: `#EEF8F2` - Background tint, muted fills
- **Soft Green Border**: `#D7ECDD` - Card borders, dividers, subtle boundaries

#### Neutrals

- **Text Dark**: `#1C2B22` - Primary text, headings
- **Text Muted**: `#5F7268` - Secondary text, labels, descriptions
- **Input Background**: `#F6FBF7` - Form field backgrounds
- **White**: `#FFFFFF` - Card surfaces, button text

#### Feedback Colors

- **Alert Red**: `#B42318` - Destructive actions, critical warnings
- **Warning Yellow**: `#FFF8E1` (bg), `#8B6914` (text), `#F5E6B3` (border) - Low supply warnings
- **Error Red**: `#FEE` (bg), `#8E1C12` (text), `#F5C6CB` (border) - Missed injections
- **Success Green**: Mint tint with dark green text - Logged injections

### Typography

#### Font Family

- System sans-serif stack (inherits from default)

#### Font Sizes

- **Text XS**: `12px` - Eyebrow labels, badges, metadata
- **Text SM**: `14px` - Body text, form labels, secondary content
- **Text Base**: `16px` - Default, buttons, inputs
- **Text LG**: `18px` - Section headings
- **Text XL**: `20px` - Card titles
- **Text 2XL**: `24px` - Page headings, emphasized values

#### Font Weights

- **Normal**: `400` - Body text, inputs
- **Medium**: `500` - Headings, labels, buttons, emphasized text

#### Line Height

- Default: `1.5` for all text elements

### Spacing & Layout

#### Container

- **Mobile max-width**: `390px` (centered)
- **Padding**: `24px` (1.5rem) on main content areas
- **Gap between sections**: `24px` (1.5rem)

#### Cards

- **Padding**: `20px` (1.25rem)
- **Border radius**: `16px` (rounded-2xl)
- **Border**: `1px solid #D7ECDD`
- **Shadow**: Subtle `shadow-sm`

#### Buttons

- **Padding**: `14px 24px` (py-3.5 px-6)
- **Border radius**: `9999px` (fully rounded/pill-shaped)
- **Full width** by default on mobile

#### Inputs

- **Padding**: `12px 16px` (py-3 px-4)
- **Border radius**: `12px` (rounded-xl)
- **Border**: `1px solid #D7ECDD`
- **Background**: `#F6FBF7`

#### Bottom Navigation

- **Height**: Auto (padding-based)
- **Padding**: `16px`
- **Sticky position**: Fixed to bottom
- **Border top**: `1px solid #D7ECDD`
- **Shadow**: `shadow-lg`

### Border Radius System

- **Small elements** (badges, chips): `9999px` (fully rounded)
- **Form inputs**: `12px` (rounded-xl)
- **Cards**: `16px` (rounded-2xl)
- **Modals**: `24px` top corners (rounded-t-3xl)
- **Buttons**: `9999px` (pill-shaped)

### Background Treatment

- **Page background**: Vertical gradient from `#EEF8F2` (mint tint) to `#FFFFFF` (white)
- **Cards**: Solid `#FFFFFF` with subtle border
- **Input fields**: `#F6FBF7` (very light mint)

---

## Components

### Layout Components

#### PageShell

**Purpose**: Wraps all screens with gradient background and mobile container  
**Props**: `children`, `className?`  
**Features**:

- Min-height 100vh
- Gradient background (mint to white)
- Centers content with max-width 390px

#### Card

**Purpose**: White container for grouped content  
**Props**: `children`, `className?`, `onClick?`  
**Styles**:

- White background
- 16px border radius
- 20px padding
- Border: 1px solid soft green
- Subtle shadow

#### BottomActionBar

**Purpose**: Sticky footer container for CTAs or navigation  
**Props**: `children`  
**Features**:

- Fixed to bottom
- White background with top border
- Max-width 390px centered
- 16px padding
- Shadow-lg

### Typography Components

#### Eyebrow

**Purpose**: Small uppercase labels above content  
**Props**: `children`, `className?`  
**Styles**:

- 12px uppercase
- Tracking-wide
- Muted text color (#5F7268)
- Medium weight
- 4px bottom margin

### Button Components

#### PrimaryButton

**Purpose**: Main CTAs  
**Props**: `children`, `onClick?`, `className?`, `type?`, `disabled?`  
**Styles**:

- Full width
- Brand green background (#2F8F63)
- White text
- Pill-shaped (fully rounded)
- 14px vertical, 24px horizontal padding
- Hover: Dark green (#256F4E)
- Disabled: 50% opacity

#### SecondaryButton

**Purpose**: Alternative/cancel actions  
**Props**: Same as PrimaryButton  
**Styles**:

- White background
- Dark text (#1C2B22)
- 1px soft green border
- Pill-shaped
- Hover: Very light mint background (#F6FBF7)

#### DestructiveButton

**Purpose**: Delete/remove actions  
**Props**: Same as PrimaryButton  
**Styles**:

- Alert red background (#B42318)
- White text
- Pill-shaped
- Hover: Darker red (#8E1C12)

### Form Components

#### TextInput

**Purpose**: Single-line text entry  
**Props**: `label`, `value`, `onChange`, `placeholder?`, `type?`  
**Features**:

- Label above input
- Light mint background
- Soft green border
- 12px border radius
- Focus ring: Brand green, 2px
- Placeholder: Muted text

#### NumberInput

**Purpose**: Numeric input with step controls  
**Props**: `label`, `value`, `onChange`, `placeholder?`, `min?`, `max?`, `step?`  
**Styles**: Same as TextInput

#### TimePicker

**Purpose**: Time selection  
**Props**: `label`, `value`, `onChange`  
**Styles**: Same as TextInput with native time picker

#### Select

**Purpose**: Dropdown selection  
**Props**: `label`, `value`, `onChange`, `options: {value, label}[]`  
**Styles**: Same as TextInput with native select

### Status & Display Components

#### StatusBadge

**Purpose**: Show injection/supply status  
**Props**: `status: 'pending' | 'logged' | 'missed' | 'late' | 'low' | 'critical'`, `children`  
**Status Styles**:

- **Pending**: Yellow background, dark yellow text
- **Logged**: Mint background, dark green text
- **Missed**: Light red background, dark red text
- **Late**: Light yellow background, brown text
- **Low**: Yellow background, dark yellow text
- **Critical**: Light red background, dark red text
- All have pill shape, 12px text, medium weight

#### SupplyLevelCard

**Purpose**: Display remaining supplies with warnings  
**Props**: `title`, `remaining`, `unit`, `daysRemaining?`, `warning?: 'low' | 'critical'`  
**Layout**:

- Card wrapper
- Eyebrow title
- Large number (24px) + small unit label
- Days remaining text (muted)
- Optional warning badge (top right)

#### CalendarEventChip

**Purpose**: Clickable injection event in list  
**Props**: `time`, `status`, `dosage?`, `onClick?`  
**Layout**:

- White background, rounded-xl
- Soft green border
- Horizontal flex: time + status badge + dosage
- Hover: Light mint background
- 12px padding

#### InlineAlert

**Purpose**: Contextual messages/warnings  
**Props**: `variant: 'warning' | 'error' | 'info'`, `children`  
**Variant Styles**:

- **Warning**: Yellow background, dark yellow text
- **Error**: Light red background, dark red text
- **Info**: Mint background, dark green text
- All have 16px padding, rounded-xl, matching border

#### EmptyState

**Purpose**: Placeholder for empty lists  
**Props**: `icon?`, `title`, `description?`  
**Layout**:

- Centered column
- Large emoji icon (text-5xl)
- Medium title
- Muted description (max-width 320px)
- 48px vertical padding

---

## Screens

### 1. Sign In

**Route**: Initial screen  
**Purpose**: Authentication entry point  
**Layout**:

- Centered card in viewport
- Cat emoji (🐱) at top
- Heading: "Cat Insulin Tracker" (24px, medium)
- Supporting text (14px, muted)
- Primary button: "Sign in with Google"

**Spacing**:

- 24px gap between elements
- 24px padding around card

---

### 2. Setup Wizard

**Route**: After sign-in, before first use  
**Purpose**: Collect initial cat & schedule information  
**Steps**: 5 total

#### Progress Indicator

- 5 horizontal bars
- Active steps: Brand green
- Inactive steps: Soft green border color
- 8px height, rounded-full, flex-1 width

#### Step 1: Cat Name

- Cat emoji (🐱)
- Heading: "What's your cat's name?"
- Text input: "Cat's name"
- Placeholder: "e.g., Whiskers"

#### Step 2: Start Date

- Calendar emoji (📅)
- Heading: "When did insulin treatment start?"
- Date input: "Start date"

#### Step 3: Injection Times

- Clock emoji (⏰)
- Heading: "Set injection times"
- Supporting text: "Most cats receive insulin twice daily"
- Time picker: "Morning injection" (default 08:00)
- Time picker: "Evening injection" (default 20:00)

#### Step 4: Dosage Settings

- Syringe emoji (💉)
- Heading: "Default dosage settings"
- Number input: "Default dosage (units)" - step 0.5
- Number input: "Due window (minutes)" - step 5
- Helper text explaining due window

#### Step 5: Review

- Checkmark emoji (✅)
- Heading: "Review your settings"
- Summary card (light mint background):
  - Cat's name
  - Start date
  - Morning time
  - Evening time
  - Default dosage
  - Due window
- Each row: label left, value right

#### Navigation

- Primary button: "Continue" (steps 1-4) or "Complete setup" (step 5)
- Secondary button: "Back" (steps 2-5 only)
- Buttons disabled if step incomplete

---

### 3. Dashboard (Home)

**Route**: Main screen after setup  
**Purpose**: At-a-glance status and quick actions

#### Header

- Cat name (24px, medium)
- Current date (14px, muted)
- 32px top padding

#### Content Sections (24px gaps)

**1. Supply Warning** (if applicable)

- Inline alert (warning variant)
- Bold supply type + days remaining

**2. Next Injection Card**

- Eyebrow: "Next injection"
- Large time display (24px)
- Dosage below (14px, muted)
- Due window (right aligned)
- Primary button: "Log injection now"

**3. Today's Injections**

- Section heading (14px, medium)
- CalendarEventChip per injection
- Shows time, status badge, dosage

**4. Supply Grid**

- 2 columns
- SupplyLevelCard for insulin
- SupplyLevelCard for needles
- Warning badges if low/critical

**5. Upcoming Events**

- Card with eyebrow "Upcoming"
- List of next injections (simple rows)
- Link to calendar (brand green, center aligned)

#### Bottom Navigation

- 4 tabs: Home 🏠 | Calendar 📅 | Supplies 📦 | Settings ⚙️
- Active tab: Brand green text, medium weight
- Inactive tabs: Muted text

---

### 4. Calendar

**Route**: Navigation from dashboard  
**Purpose**: View injection history and schedule

#### Header

- Heading: "Calendar"
- Toggle: Week/Month view
  - Pill-shaped toggle buttons
  - Active: Brand green background, white text
  - Inactive: White background, border

#### Calendar Grid (Week View)

- Card container
- Month/year heading (14px, medium)
- "This week" label (12px, muted)
- 7-column grid for days (Sun-Sat)
- Day squares:
  - Aspect ratio 1:1
  - Rounded-xl
  - Light mint background (default)
  - Brand green background + white text (today)
  - Day number at top
  - 2 dots below showing injection status (green = logged, yellow = pending)

#### Today's Injections Section

- Same as Dashboard

#### Yesterday's Injections Section

- Same list format
- Shows previous day's logged injections

#### Bottom Navigation

- Same as Dashboard (Calendar tab active)

---

### 5. Log Injection Modal

**Route**: Overlay from Dashboard  
**Purpose**: Record injection details quickly

#### Layout

- Slides up from bottom (0.3s ease-out animation)
- Fixed overlay (black/40% opacity background)
- White card with top-rounded corners (24px)
- 390px max-width

#### Header

- "Log injection" heading (left)
- X close button (right, 24px, muted → dark on hover)

#### Form Fields (16px gaps)

**1. Scheduled Time**

- Read-only display in light mint box
- Shows current time

**2. Dosage**

- Number input
- Pre-filled with default
- Step: 0.5

**3. Needles Used**

- Number input
- Default: 1
- Step: 1

**4. Injection Site**

- Select dropdown
- Options: Left shoulder, Right shoulder, Left hip, Right hip

**5. Notes (optional)**

- Textarea
- 3 rows
- Placeholder: "Any observations about your cat..."
- No resize

#### Actions

- Primary button: "Confirm injection"
- Secondary button: "Cancel"

---

### 6. Supplies

**Route**: Navigation from dashboard  
**Purpose**: Track insulin vials and needle inventory

#### Header

- Heading: "Supplies"
- Supporting text: "Track insulin and needle inventory"

#### Supply Warning

- Inline alert if any supply low
- "Insulin running low — Consider ordering..."

#### Supply Overview Grid

- 2 columns
- SupplyLevelCard for each supply type
- Shows remaining, days left, warning status

#### Current Insulin Vial Card

- Eyebrow: "Current insulin vial"
- Detail rows:
  - Opened date
  - Initial amount
  - Remaining
  - Est. depletion
- Secondary button: "Record new vial"

#### Needle Inventory Card

- Eyebrow: "Needle inventory"
- Detail rows:
  - Last restock
  - Pack size
  - Remaining
  - Est. depletion
- Secondary button: "Record new pack"

#### Supply History Card

- Eyebrow: "Supply history"
- List of past additions
- Each row: Action + amount (left), date (right)
- Border between rows

#### Bottom Navigation

- Same as Dashboard (Supplies tab active)

---

### 7. Settings

**Route**: Navigation from dashboard  
**Purpose**: Edit cat info, schedule, and preferences

#### Header

- Heading: "Settings"
- Supporting text: "Manage your cat's insulin schedule"

#### Cat Information Card

- Eyebrow: "Cat information"
- Text input: Cat's name (editable)
- Read-only display: Treatment start date (light mint box)

#### Injection Schedule Card

- Eyebrow: "Injection schedule"
- Time picker: Morning injection
- Time picker: Evening injection

#### Dosage Settings Card

- Eyebrow: "Dosage settings"
- Number input: Default dosage
- Number input: Due window
- Helper text explaining due window

#### Notifications Card

- Eyebrow: "Notifications"
- Toggle row: "Injection reminders" + description
- Toggle row: "Low supply alerts" + description
- Toggle switches (green when active, white knob)

#### Actions

- Primary button: "Save changes"
- Secondary button: "Cancel"

#### Bottom Navigation

- Same as Dashboard (Settings tab active)

---

## States & Interactions

### Button States

- **Default**: Base color
- **Hover**: Darker shade, subtle transition
- **Active/Pressed**: Same as hover
- **Disabled**: 50% opacity, no pointer cursor
- **Focus**: 2px brand green ring (outline)

### Input States

- **Default**: Light mint background, soft green border
- **Focus**: 2px brand green ring, border transparent
- **Error**: Red border, red helper text below
- **Disabled**: Reduced opacity, no pointer

### Card States

- **Default**: Static
- **Clickable**: Cursor pointer
- **Hover** (if clickable): Very light mint background

### Injection Status States

1. **Pending**: Due soon, not logged yet
2. **Logged**: Successfully recorded
3. **Missed**: Past due window, not logged
4. **Late**: Within extended window but delayed

### Supply Warning States

1. **Normal**: >5 days remaining
2. **Low**: ≤5 days remaining (yellow warning)
3. **Critical**: ≤1 day remaining (red alert)

### Modal States

- **Entering**: Slide up animation (0.3s)
- **Exiting**: Fade out (instant on close)
- **Background**: Dark overlay, dismisses on click

### Toggle Switch States

- **Off**: Gray background, knob left
- **On**: Brand green background, knob right
- Smooth transition (0.2s)

---

## Interaction Patterns

### Navigation Flow

1. Sign In → Setup Wizard (5 steps) → Dashboard
2. Dashboard ↔ Calendar/Supplies/Settings (via bottom nav)
3. Any screen → Log Injection Modal (overlay)

### Form Validation

- Real-time for setup wizard (button disabled if incomplete)
- Required fields: Cat name, start date
- No error states shown (prevention over correction)

### Time-Based Behavior

- "Next injection" card shows morning or evening based on current time
- Calendar highlights today with distinct color
- Due window applies ± minutes from scheduled time

### Responsive Behavior

- Fixed 390px mobile viewport
- Centered on larger screens
- Bottom navigation sticky/fixed
- Modals slide from bottom (mobile pattern)

### Accessibility Notes

- Form labels always visible
- Focus states on all interactive elements
- Semantic HTML (buttons, labels, inputs)
- Sufficient color contrast (AA compliant)
- Touch targets ≥44px (iOS guideline)

---

## Animation Specifications

### Modal Slide-Up

```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
Duration: 0.3s
Easing: ease-out
```

### Button Hover

- Transition: `colors` property
- Duration: Default (150ms)
- Easing: Default

### All Transitions

- Keep subtle and fast (≤300ms)
- No decorative animations
- Performance over flash

---

## File Structure

### Screens (`src/app/screens/`)

- `SignIn.tsx`
- `SetupWizard.tsx`
- `Dashboard.tsx`
- `Calendar.tsx`
- `LogInjectionModal.tsx`
- `Supplies.tsx`
- `Settings.tsx`

### Components (`src/app/components/`)

- `PageShell.tsx`
- `Card.tsx`
- `Eyebrow.tsx`
- `Buttons.tsx` (Primary, Secondary, Destructive)
- `Inputs.tsx` (Text, Number, Time, Select)
- `StatusBadge.tsx`
- `SupplyLevelCard.tsx`
- `CalendarEventChip.tsx`
- `BottomActionBar.tsx`
- `InlineAlert.tsx`
- `EmptyState.tsx`

### Styles (`src/styles/`)

- `theme.css` - Color tokens, animations
- `fonts.css` - Font imports (empty by default)
- `globals.css` - Global styles
- `tailwind.css` - Tailwind directives
- `index.css` - Entry point

---

## Data Model

### SetupData Interface

```typescript
{
  catName: string;
  startDate: string; // ISO date
  morningTime: string; // HH:MM
  eveningTime: string; // HH:MM
  defaultDosage: string; // units
  dueWindow: string; // minutes
}
```

### Injection Record (implied)

```typescript
{
  timestamp: string;
  dosage: number;
  needlesUsed: number;
  site: 'left-shoulder' | 'right-shoulder' | 'left-hip' | 'right-hip';
  notes?: string;
  status: 'logged' | 'missed' | 'late';
}
```

### Supply Record (implied)

```typescript
{
  type: 'insulin' | 'needles';
  remaining: number;
  unit: string;
  daysRemaining?: number;
  warning?: 'low' | 'critical';
}
```

---

## Key Design Principles

1. **Calm over clever**: No flashy animations, no dark mode, no neon
2. **Utility-first**: Prioritize function over decoration
3. **Gentle reassurance**: Green = healthy, trustworthy, organized
4. **Mobile-first**: 390x844 primary viewport, expandable to desktop
5. **Soft & polished**: Rounded cards, pill buttons, subtle shadows
6. **High readability**: Clear hierarchy, generous spacing, strong contrast
7. **Low friction**: Fast logging, clear status, obvious next actions

---

## Production Considerations

### Future Enhancements

- Backend integration (Supabase/similar)
- Push notifications for injection reminders
- Data export (PDF reports, CSV)
- Multi-cat support
- Glucose level tracking
- Vet visit scheduling
- Photo diary (injection sites)

### Performance

- Lazy load screens
- Optimize re-renders (React.memo on components)
- Use local state for form inputs
- Debounce search/filter if added

### Testing Focus Areas

- Form validation in wizard
- Date/time calculations for "next injection"
- Supply depletion projections
- Modal open/close animations
- Bottom nav active states
- Responsive layout 320px-1200px

---

_Specification compiled from Cat Insulin Tracker prototype, May 2026_
