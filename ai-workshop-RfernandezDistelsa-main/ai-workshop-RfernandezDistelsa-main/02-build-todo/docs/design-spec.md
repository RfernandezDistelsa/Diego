# Design Spec — Tasky Redesign

## Vision
A playful, ADHD-friendly todo manager that celebrates small wins and reduces decision fatigue through clear visual hierarchy, instant feedback, and motivational cues.

---

## Color Palette

### Primary Colors (Playful & Warm)
- **Accent 1 (Primary Action)**: `#FF8C42` (warm orange)
- **Accent 2 (Success)**: `#4CAF50` (soft green)
- **Accent 3 (Attention)**: `#7C3AED` (vibrant purple)

### Neutrals (Clean & Calm)
- **Background**: `#FAFAF9` (off-white)
- **Surface**: `#FFFFFF` (white)
- **Border**: `#E5E7EB` (light gray)
- **Text Primary**: `#1F2937` (dark gray)
- **Text Secondary**: `#6B7280` (medium gray)

### Priority Colors (Personality)
- **Low**: `#93C5FD` (sky blue) — relaxed, not urgent
- **Med**: `#FBBF24` (amber) — needs attention
- **High**: `#F87171` (coral-red) — time-sensitive

---

## Typography

- **Font Stack**: System font (Tailwind default)
- **Header (h1)**: `text-4xl font-bold text-slate-900`
- **Section Header**: `text-lg font-semibold text-slate-900`
- **Body**: `text-base text-slate-700`
- **Small/Meta**: `text-sm text-slate-500`

---

## Component Specs

### 1. Header
- **Layout**: Flex, space-between, centered vertically
- **Background**: White with subtle bottom border
- **Left**: App title + completion streak/motivation badge
  - Title: "Tasky" in orange (`#FF8C42`), bold, playful font weight
  - Streak: Small badge with 🔥 emoji + count (e.g., "🔥 3 day streak")
- **Right**: "New task" button
  - **Idle state**: Orange background (`#FF8C42`), white text, rounded-lg
  - **Hover**: Slightly darker orange, subtle shadow lift
  - **Keyboard hint**: Show `N` key hint in muted text

### 2. Progress Bar
- **Position**: Below header, full-width background area
- **Visual**: Horizontal bar, rounded ends
  - **Track**: Light gray (`#E5E7EB`)
  - **Fill**: Gradient orange-to-green (`#FF8C42` → `#4CAF50`)
  - **Height**: 8px, rounded-full
- **Label**: Text below/beside bar
  - Format: "5 of 12 tasks done" + visual percentage
  - Color: Slate gray
  - Update in real-time

### 3. Filter + Search Bar
- **Layout**: Row, flex-wrap on mobile
- **Filter Toggle**: Pills for All / Open / Done
  - **Active**: Orange background + white text
  - **Inactive**: Gray background, gray text, hover effect
  - **Rounded**: rounded-full for playful feel
- **Search Bar**: Input field
  - **Placeholder**: "Search or filter by tag..."
  - **Border**: Light gray, rounded-lg
  - **Focus**: Orange ring (2px focus-ring)

### 4. Task Item
- **Layout**: Horizontal flex, gap-3
- **Background**: White card on light background
- **Padding**: `px-4 py-3`
- **Border Radius**: `rounded-xl` (more rounded than current)
- **Border**: Light gray, 1px
- **States**:
  - **Normal**: White bg, slate border
  - **Completed**: Faded gray bg, gray border, text struck-through + muted color
  - **Overdue**: Coral-red tinted bg (`rgba(248, 113, 113, 0.05)`)
  - **Hover**: Subtle shadow, border color brightens

#### Checkbox
- **Size**: h-6 w-6 (slightly larger for easier clicking)
- **Appearance**: Rounded-lg with playful accent color (`accent-orange-500`)
- **On Completed**: Green check with celebration animation (brief scale+rotate)

#### Task Content
- **Title**: Base font, bold-600
  - **Completed**: Strike-through + gray color
  - **Clickable**: On-edit enabled
- **Metadata Row** (below title):
  - **Due Date Badge**: 
    - Normal: Blue background with small icon
    - Overdue: Coral-red background
    - Format: "Due: Mar 15" or "Overdue by 2 days"
  - **Recurrence**: Small text, slate color (e.g., "Weekly")
  - **Tags**: Small pills, gray background
- **Spacing**: gap-2 between elements

#### Priority Badge
- **Position**: Right of task content
- **Size**: Small, px-3 py-1
- **Styling**: Rounded-full with color from priority colors
- **Format**: "Low" / "Med" / "High" in bold

#### Action Buttons
- **Edit**: Text button, slate-400 text, hover to slate-900
- **Delete**: Text button, slate-400 text, hover to rose-500
- **Alignment**: Right side, gap-1

### 5. Task Form Modal
- **Container**: Centered modal with white bg, rounded-xl, shadow-lg
- **Padding**: `p-8`
- **Header**: Title "Create task" or "Edit task" in bold
- **Form Fields**:
  - **Title Input**: Focused by default, rounded-lg, orange ring on focus
  - **Notes Textarea**: 3 rows, rounded-lg, orange ring
  - **Priority Selector**: Dropdown with visual icons/colors
  - **Due Date**: Date picker with calendar icon
  - **Tags**: Tag input with pill display
  - **Recurrence**: Dropdown

- **Buttons**:
  - **Cancel**: Gray background
  - **Save**: Orange background, white text, hover effect

### 6. Completion Celebration
- **Trigger**: On checkbox click for task completion
- **Animation**: 
  - Checkbox: Scale from 1 to 1.2, green color flash, 300ms
  - Task: Fade out to light background, slight upward movement
  - Confetti (optional): Small celebratory animation on screen

### 7. Undo Toast
- **Position**: Bottom-right, fixed
- **Background**: Orange (`#FF8C42`)
- **Text**: White, readable
- **Message**: "Task deleted — undo?"
- **Button**: White text, reverse color scheme
- **Animation**: Slide in from bottom

### 8. Overall Layout
- **Main Container**: Centered, max-w-4xl, py-8, px-4
- **Sections**: Vertical stack with gap-6
- **Breakpoints**: Stack on mobile, horizontal on desktop

---

## Spacing & Sizing

- **Gap between major sections**: `gap-6` (24px)
- **Gap between components within section**: `gap-3` (12px)
- **Padding (containers)**: `px-4 py-6`
- **Button padding**: `px-4 py-2`
- **Corner radius standard**: `rounded-lg` (8px)
- **Corner radius friendly**: `rounded-xl` (12px)
- **Corner radius pill**: `rounded-full`

---

## Interactions & Micro-Animations

1. **Task Completion**: Checkbox animates green, task fades to light background
2. **Button Hovers**: Slight color shift + subtle shadow lift
3. **Filter Pill Click**: Smooth transition between active/inactive
4. **Form Focus**: Orange focus ring appears
5. **Undo Toast**: Slides in, auto-dismisses after 5 seconds (or on click)
6. **Progress Bar**: Smooth update as tasks complete

---

## ADHD-Specific Design Decisions

1. **Reduced Cognitive Load**
   - Checkbox is the ONLY action on task hover (not Edit + Delete together)
   - Priority colors are distinct and memorable
   - Clear visual sections prevent scanning fatigue

2. **Motivation & Feedback**
   - Progress bar shows visual momentum
   - Streak counter celebrates consistency
   - Completion animation provides instant satisfaction

3. **Accessibility**
   - High contrast colors (orange, green, red are accessible)
   - Large clickable areas (checkbox 24x24 minimum)
   - Keyboard shortcuts (N for new, Esc for close)

4. **Visual Clarity**
   - Whitespace around tasks prevents overwhelm
   - Color-coding for priority removes need to read all text
   - Icons (🔥 for streak, 📅 for due date) add visual anchors
