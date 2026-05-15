# Feature Spec: Tags, Search, and Recurring Tasks

This spec covers three new features for the Tasky todo manager:
1. **Tags** — Free-form, color-coded task labels with tag-based filtering
2. **Search** — Live text search across task titles and tags
3. **Recurring Tasks** — Daily, Weekly, Monthly task repetition with auto-reset on completion

All features coexist with existing functionality: priority levels, due dates, filters, undo, and persistence.

---

## Feature 1: Tags

### 1.1 User Stories & Problem Statement

**As a** todo app user  
**I want to** tag tasks with multiple free-form labels and filter by tag  
**So that** I can organize related work across multiple dimensions (not just by priority or status)

Tasks currently have only priority and due date for organization. Tags provide a lightweight way to group related tasks (e.g., `work`, `personal`, `urgent`, `home`) without rigid category structure. Multi-tag support allows a task to belong to multiple contexts.

### 1.2 Functional Requirements

#### 1.2.1 Tag Creation & Storage
- Tags are **free-form text** (user types them in; no predefined list)
- Tags are **case-insensitive** for filtering (stored as lowercase in filters)
- A task can have **zero to many tags** (optional feature)
- Tags are entered in TaskForm as a comma-separated or space-separated list, or one-by-one as pills
- Each tag is stored in the Task type as a string array
- Tags persist in localStorage via existing `lib/storage.ts`

#### 1.2.2 Tag Display on TaskItem
- Tags display as **colored pills** (Tailwind badge/chip styling) below the task title
- Each pill shows the tag name
- Pills have a **background color** (e.g., `bg-blue-100 text-blue-700`) and optional hover state
- Color assignment is **deterministic** based on tag name (e.g., hash of tag string → color index from a palette)
- If a task has no tags, no pills are shown
- Clicking a pill **filters tasks by that tag** (see section 1.2.3)

#### 1.2.3 Tag-Based Filtering
- Tags are clickable on TaskItem pills
- Clicking a tag adds it to the active filter
- **Multiple tags can be selected** (OR logic: show tasks with any of the selected tags)
- A visual indicator shows which tags are currently selected (e.g., "Filtered by: `work`, `urgent`")
- A clear button resets tag filters
- Tag filtering works **alongside** existing Status filters (All/Open/Done) and Search
- **Filtering interaction:** Task must match Status AND Tags AND Search (all must be true)

#### 1.2.4 TaskForm Tag Input
- TaskForm includes a **tag input field** labeled "Tags"
- Input accepts free-form text; user can type multiple tags separated by commas or spaces
- **UI option A:** Text input with comma/space delimiter → convert to pills on blur
- **UI option B:** Dedicated tag pill input (user types tag + Enter/comma → adds pill)
- When editing a task, the field shows the task's existing tags
- User can remove tags individually (click X on pill) or clear all
- Tag input is **optional**; form can be submitted without tags

#### 1.2.5 Data Structure
- Extend Task type in `lib/types.ts` to include `tags: string[]`
- Example: `tags: ["work", "urgent", "home"]`
- Empty array if task has no tags
- Tags are stored lowercase for consistent filtering

#### 1.2.6 Tag Color Palette
- Define a **fixed palette** of Tailwind colors (e.g., 8–12 colors)
- Example palette: `blue`, `green`, `red`, `yellow`, `purple`, `pink`, `indigo`, `cyan`
- Assign colors **deterministically** based on tag name hash
- Example function: `hashTagToColor(tag: string): string` → returns Tailwind class (e.g., `"bg-blue-100"`)

### 1.3 UI/UX Specifics

#### 1.3.1 Tag Pill Styling
```
┌─────────────┐
│ 🏷 work     │  ← Clickable pill, deterministic color
└─────────────┘
```
- Padding: `px-3 py-1` (Tailwind)
- Font size: `text-sm` (Tailwind)
- Border radius: `rounded-full` (fully rounded)
- Cursor: `cursor-pointer` on hover
- Example classes: `bg-blue-100 text-blue-700 hover:bg-blue-200`

#### 1.3.2 Tag Filter Indicator
- When tags are selected, show a chip or banner in the app header
- Example: "Filtered by: `work` `urgent` [✕ Clear]"
- Positioned near the search input (see Feature 2) or above task list
- Clicking the X clears all tag filters

#### 1.3.3 TaskForm Tag Input Field
- **Text input** with label "Tags"
- Placeholder: "Enter tags (comma-separated, e.g., work, urgent)"
- Width: full width or constrained to match other form fields
- Display: Show entered tags as pills below the input field
- Each pill has an X button to remove it

#### 1.3.4 Tag Pill Click Behavior
- Clicking a tag pill on a TaskItem **filters to show only tasks with that tag**
- All other filters reset (or AND with existing filters per logic in 1.2.3)
- Visual feedback: Selected tag pills appear highlighted or with a check mark

### 1.4 Edge Cases

#### 1.4.1 Special Characters in Tags
- Allow alphanumeric characters, hyphens, underscores
- Trim whitespace before and after tag name
- Reject empty tags (if user enters "work, , urgent", only "work" and "urgent" are saved)
- If tag contains comma or space, treat as delimiter (no multi-word tags without quotes)

#### 1.4.2 Duplicate Tags
- If user enters "work, WORK, Work", normalize to lowercase and deduplicate
- Store only one instance: `["work"]`

#### 1.4.3 Tag Filtering with Other Filters
- When Tag filter is active with Status filter:
  - Show tasks matching both (AND logic with Status filter)
  - Example: "Done" + "work" tag → show completed tasks with "work" tag
- When Tag filter is active with Search:
  - Show tasks matching both (AND logic with Search, see Feature 2)
  - Search text applies to title and tag names

#### 1.4.4 Deleting a Task with Tags
- Undo restores tags correctly (existing undo mechanism should handle this)

#### 1.4.5 Tag Persistence
- Tags are part of the Task object, persisted in localStorage
- No separate "tags database" needed

### 1.5 Success Criteria

- [ ] Task type includes `tags: string[]` field (`lib/types.ts`)
- [ ] TaskForm includes a tag input field that accepts comma/space-separated tags
- [ ] Tags display as color-coded pills on TaskItem
- [ ] Colors are assigned deterministically based on tag name
- [ ] Tag pills are clickable and filter tasks by that tag
- [ ] Multiple tags can be selected (OR logic)
- [ ] Tag filtering works alongside Status and Search filters (AND logic)
- [ ] Tag filter indicator shows selected tags with a clear button
- [ ] Tags are case-insensitive for filtering (stored lowercase)
- [ ] Duplicate tags are deduplicated
- [ ] Empty tags are rejected
- [ ] Tags persist in localStorage
- [ ] Undo works correctly with tag changes and deletions
- [ ] TypeScript strict mode: no `any`, proper typing
- [ ] No new npm dependencies
- [ ] Tailwind CSS styling only
- [ ] All existing tests pass; new tests for tag logic
- [ ] Build succeeds with no type errors

---

## Feature 2: Search

### 2.1 User Stories & Problem Statement

**As a** todo app user  
**I want to** search tasks by title and tags in real-time  
**So that** I can quickly find tasks without scrolling through the entire list

Users need to locate tasks by keyword without manually filtering through all tasks. Live search provides instant feedback as the user types.

### 2.2 Functional Requirements

#### 2.2.1 Search Input
- Add a **search input field** in the app header (top of page, above or below the "Tasky" title)
- Input is labeled "Search" with a placeholder: "Search tasks..."
- Search is **case-insensitive**
- Search **applies in real-time** (as user types)
- No form submission needed; filtering is instant

#### 2.2.2 Search Scope
- Search looks at **task titles** and **tag names** (not notes or other fields)
- A task matches if:
  - Title contains the search text (case-insensitive), OR
  - Any of the task's tags contain the search text
- Search text can be a partial match (e.g., "wo" matches "work" and "workout")

#### 2.2.3 Search & Filter Interaction
- Search works **alongside existing filters** (Status, Tags, see Feature 1)
- **AND logic:** Task must match all active filters:
  - Status (All/Open/Done/Overdue) AND
  - Search text AND
  - Selected Tags (if any)
- If Status = "Open" and Search = "urgent", show open tasks with "urgent" in title or tags
- If Status = "All" and Search = "", show all tasks (no search restriction)

#### 2.2.4 Clear Search
- Include a **clear button** (X icon or "Clear" button) next to the search input
- Clicking clear resets search text to empty string
- Alternatively, user can manually clear the input field

#### 2.2.5 Search State
- Current search text is **not persisted** in localStorage (search clears on page refresh)
- Search state is **stored in React component state** (transient, per session)

### 2.3 UI/UX Specifics

#### 2.3.1 Search Input Layout
```
┌─────────────────────────────────┐
│ Tasky                           │
├─────────────────────────────────┤
│ 🔍 [Search tasks...       ] [X] │
├─────────────────────────────────┤
│ [All] [Open] [Done] [Overdue]   │
├─────────────────────────────────┤
│ Filtered by: [work] [urgent][✕] │
└─────────────────────────────────┘
```
- Search input appears in the header, above or integrated with FilterToggle
- Input width: full width or constrained to content area
- Icon: Optional search icon (`🔍`) to the left of input
- Clear button: X icon aligned to the right of input

#### 2.3.2 Search Input Styling
- Tailwind classes: `border`, `rounded`, `px-3`, `py-2`, `text-sm`
- Placeholder color: `placeholder-gray-400`
- Focus state: `outline-none`, `ring-2`, `ring-blue-500`
- Example: `className="w-full px-3 py-2 border rounded text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500"`

#### 2.3.3 Clear Button
- Small "X" icon or text button aligned right inside the input or next to it
- Appears only when search text is non-empty
- Cursor: `cursor-pointer`
- Example: `<button aria-label="Clear search">✕</button>`

#### 2.3.4 No Results State
- If search returns zero tasks, show existing empty state message
- No additional messaging needed (reuse existing "No tasks" state)

### 2.4 Edge Cases

#### 2.4.1 Empty Search
- If search text is empty string, no search filtering is applied
- All tasks shown (subject to other filters: Status, Tags)

#### 2.4.2 Search with Tags
- If user searches "work" and has "work" tag selected, show tasks matching:
  - (Title contains "work" OR tag="work") AND (selected tags include "work")
  - This may result in a subset of tasks with "work" tag (only those whose title also contains "work")

#### 2.4.3 Special Characters in Search
- Allow any printable character in search text
- No regex or advanced search syntax
- Treat search as literal substring match (e.g., searching "abc" matches "abc" and "abcdef", not "a.c")

#### 2.4.4 Whitespace Handling
- Search text is trimmed of leading/trailing whitespace
- Search "work  " is treated as "work"
- Spaces within search text are preserved (search "my task" matches "my important task")

#### 2.4.5 Search & Completed Tasks
- Search applies to both open and completed tasks
- If Status = "Done", search still filters completed tasks by title/tags
- If Status = "All", search filters all tasks regardless of completion

### 2.5 Success Criteria

- [ ] Search input field added to app header
- [ ] Search filters tasks by title and tag names in real-time
- [ ] Search is case-insensitive and supports partial matching
- [ ] Clear button resets search text
- [ ] Search works alongside Status and Tag filters (AND logic)
- [ ] Task matches if title OR any tag contains search text
- [ ] Empty search shows all tasks (subject to other filters)
- [ ] Search state is transient (clears on page refresh)
- [ ] No results state uses existing empty state UI
- [ ] TypeScript strict mode: proper typing on search state and callbacks
- [ ] No new npm dependencies
- [ ] Tailwind CSS styling only
- [ ] All existing tests pass; new tests for search logic
- [ ] Build succeeds with no type errors

---

## Feature 3: Recurring Tasks

### 3.1 User Stories & Problem Statement

**As a** todo app user  
**I want to** set recurring tasks that reset on completion (daily, weekly, monthly)  
**So that** I don't need to manually recreate repetitive tasks and can see the next occurrence date

Users have tasks that repeat regularly (e.g., "Pay rent" monthly, "Review goals" weekly). Instead of recreating tasks manually, recurring tasks automatically reset with a new next-occurrence date when marked complete.

### 3.2 Functional Requirements

#### 3.2.1 Recurrence Patterns
- Three recurrence patterns: **Daily**, **Weekly**, **Monthly**
- Daily: Task resets the next calendar day (e.g., "2025-03-15" → "2025-03-16")
- Weekly: Task resets 7 days later (e.g., "2025-03-15" → "2025-03-22")
- Monthly: Task resets on the same day of the next calendar month (e.g., "2025-03-15" → "2025-04-15")
- Recurrence is **optional**; tasks can be non-recurring (one-time)

#### 3.2.2 Recurrence Toggle in TaskForm
- TaskForm includes a **recurrence toggle/select** field labeled "Repeats"
- Options: `"none" | "daily" | "weekly" | "monthly"`
- Default: `"none"` (no recurrence)
- When creating a task, user selects the recurrence pattern
- When editing a task, user can change or disable recurrence

#### 3.2.3 Next Occurrence Date
- Recurring tasks store a **next occurrence date** (ISO date string, e.g., `"2025-03-15"`)
- This is distinct from and complements the `dueDate` field (if both exist, both are stored)
- When a recurring task is **marked complete**, the system:
  1. Records the completion
  2. Calculates the next occurrence date based on the pattern
  3. Resets the task to incomplete (toggles `completed: false`)
  4. Updates the date to the new next occurrence
  5. Clears `completedAt` timestamp

#### 3.2.4 Next Occurrence Display
- TaskItem shows the **next occurrence date** in a label: **"Next: MMM DD"** (e.g., "Next: Mar 22")
- For recurring tasks, display "Next:" instead of "Due:" (if no separate due date is set)
- If a recurring task also has a distinct due date, show both (if applicable) or prioritize next occurrence
- Display **below or near the task title**, similar to due date display

#### 3.2.5 Recurrence & Completion Behavior
- When user marks a recurring task complete (clicks the checkbox):
  1. Task is marked as completed
  2. After marking complete, the system immediately resets:
     - `completed: false`
     - `nextOccurrence` is updated to the next date
     - `completedAt: null`
  3. Task reappears in the list as an open task with the new next occurrence date
- **Alternative UX:** Show a confirmation or toast: "Task reset for [Next date]. Undo to cancel."
- User can **undo** the reset and return to the completed state (see section 3.2.7)

#### 3.2.6 Disable Recurrence
- User can edit a recurring task and toggle recurrence to "none"
- This **stops the recurrence** and keeps the task as a one-time task
- The task remains in its current completion state (does not reset)

#### 3.2.7 Undo with Recurring Tasks
- When a recurring task completes and resets, an **undo toast** appears (reuse existing `UndoToast` component)
- Undo restores:
  - `completed: true`
  - `completedAt` timestamp restored
  - `nextOccurrence` reverted to its previous value
- User sees: "Task completed. [Undo]"

#### 3.2.8 Delete & Undo with Recurring Tasks
- When a recurring task is deleted, the undo mechanism restores it with its recurrence settings intact
- No special handling needed; existing undo should cover this

#### 3.2.9 Data Structure
- Extend Task type in `lib/types.ts`:
  ```typescript
  export type Recurrence = "none" | "daily" | "weekly" | "monthly";
  
  export interface Task {
    id: string;
    title: string;
    notes: string;
    priority: Priority;
    dueDate?: string; // ISO date (YYYY-MM-DD)
    nextOccurrence?: string; // ISO date (YYYY-MM-DD) for recurring tasks
    recurrence: Recurrence; // "none" | "daily" | "weekly" | "monthly"
    completed: boolean;
    createdAt: string;
    completedAt: string | null;
  }
  ```
- `recurrence` defaults to `"none"` for non-recurring tasks
- `nextOccurrence` is undefined/null if `recurrence === "none"`
- `nextOccurrence` is set when task is created with recurrence pattern

#### 3.2.10 Date Calculation Logic
- Implement a utility function `getNextOccurrence(currentDate: string, pattern: Recurrence): string`
  - Input: current date (ISO date string) and recurrence pattern
  - Output: next occurrence date (ISO date string)
  - Daily: add 1 day
  - Weekly: add 7 days
  - Monthly: add 1 month (same day; handle edge cases like Jan 31 → Feb 28/29)
- Timezone: Use **local browser date** (no UTC conversion)

### 3.3 UI/UX Specifics

#### 3.3.1 Recurrence Select in TaskForm
```
┌─────────────────────────┐
│ Repeats:                │
│ [None ▼]                │
│  ☐ Daily                │
│  ☐ Weekly               │
│  ☐ Monthly              │
└─────────────────────────┘
```
- Dropdown or radio buttons
- Options: None, Daily, Weekly, Monthly
- Default: None
- Styling matches other TaskForm fields (Tailwind)

#### 3.3.2 Next Occurrence Display
```
[Task Title]
Next: Mar 22  ← Shown for recurring tasks
[Priority Badge] [Tag Pills]
```
- Format: "Next: MMM DD" (e.g., "Next: Mar 22")
- Position: Below task title, similar to due date
- Color: Normal text (not highlighted unless overdue, but next occurrence is not overdue/overdue logic)
- If task has both due date and next occurrence, clarify which is shown or show both

#### 3.3.3 Completion UX
- Clicking the checkbox on a recurring task marks it complete
- System immediately resets the task (within same event loop or next render)
- Toast appears: "Task reset for [Next date]. [Undo]"
- Task reappears with `completed: false` and new `nextOccurrence`

#### 3.3.4 Undo Toast
- Reuse existing `UndoToast` component
- Message: "Task reset for [date]. [Undo]"
- Clicking Undo restores completed state and previous next occurrence

### 3.4 Edge Cases

#### 3.4.1 Month-End Edge Case
- Task due Jan 31, recurring monthly:
  - Next occurrence: Feb 28 (or Feb 29 in leap year)
  - Next occurrence after that: Mar 28 (same day as Feb occurrence, or Mar 31? **Define**: keep it to the last day of month)
  - **Decision:** For simplicity, if current month doesn't have the day, use last day of month

#### 3.4.2 Task with Both Due Date and Next Occurrence
- If a task has both `dueDate` and `recurrence !== "none"`, both fields are stored
- Display priority: Show `nextOccurrence` for recurring tasks (the actionable date)
- `dueDate` may represent the original due date (for reference); optional to display

#### 3.4.3 Disabling Recurrence
- User edits task, changes recurrence from "Weekly" to "None"
- Task becomes a one-time task; `nextOccurrence` is cleared (set to undefined)
- If task is currently completed, it remains completed (no reset occurs)

#### 3.4.4 Creating a Recurring Task
- When creating a task with recurrence pattern:
  - If user sets `nextOccurrence` manually (or it's calculated from today), use that date
  - Default behavior: If task is created on March 15 with "Weekly" recurrence, `nextOccurrence = "2025-03-15"` (today)
  - User can adjust the next occurrence date in TaskForm if needed

#### 3.4.5 Filter Interaction with Recurring Tasks
- Recurring tasks are included in "All" and "Open" filters normally
- When a recurring task is reset, it moves from "Done" to "Open" filter
- No special filter for recurring tasks (no "Recurring only" filter needed for MVP)

#### 3.4.6 Deletion & Undo
- Deleting a recurring task shows undo toast (existing UndoToast)
- Undo restores all fields: `recurrence`, `nextOccurrence`, completion state

#### 3.4.7 Timezone & Date Boundaries
- Use **browser local date** for all date calculations
- Recurrence patterns are based on calendar days, not elapsed time
- "Daily" means the next calendar day at midnight (local time), not 24 hours from now

### 3.5 Success Criteria

- [ ] Task type includes `recurrence: Recurrence` and `nextOccurrence?: string` fields
- [ ] TaskForm includes a recurrence select field (None / Daily / Weekly / Monthly)
- [ ] Recurring tasks display "Next: MMM DD" on TaskItem
- [ ] Marking a recurring task complete automatically resets it to the next occurrence
- [ ] `getNextOccurrence()` utility function correctly calculates next dates
- [ ] Daily: next date is +1 day
- [ ] Weekly: next date is +7 days
- [ ] Monthly: next date is same day next month (or last day if month shorter)
- [ ] Undo toast appears after task reset
- [ ] Undo restores completed state and previous next occurrence
- [ ] Disabling recurrence stops task reset behavior
- [ ] Recurrence settings persist in localStorage
- [ ] Timezone: All calculations use local browser date
- [ ] TypeScript strict mode: no `any`, proper typing
- [ ] No new npm dependencies
- [ ] Tailwind CSS styling only
- [ ] All existing tests pass; new tests for recurrence logic
- [ ] Build succeeds with no type errors

---

## Integration & Cross-Feature Interactions

### 4.1 All Filters Together

When all features are active, filtering uses **AND logic**:
- Task must match Status (All/Open/Done/Overdue)
- AND match Search text (title or tags)
- AND match selected Tags (if any)
- Recurring tasks are treated as normal tasks in filters

### 4.2 Example Scenarios

**Scenario 1: Search + Tag Filter**
- Status: All
- Search: "urgent"
- Selected Tags: "work"
- Result: Show all tasks where (title contains "urgent" OR has "urgent" tag) AND (task has "work" tag)

**Scenario 2: Recurring Task with Tags**
- User creates a weekly recurring task "Team standup" with tags ["work", "meeting"]
- Every Monday (next occurrence), task shows "Next: [next Monday]"
- When task is marked complete, it resets to the following Monday

**Scenario 3: Overdue + Recurring**
- Task: "Pay rent", monthly recurring, originally due March 15, now it's March 20
- Status: "Overdue" filter shows it (if `nextOccurrence` is used to determine overdue)
- When marked complete, it resets to April 15
- Note: Clarify whether `nextOccurrence` or `dueDate` is used for overdue checking (recommend `nextOccurrence` for recurring tasks)

### 4.3 Out of Scope

- Notification or reminder system for recurring tasks
- Bulk tag operations
- Advanced search syntax (regex, operators)
- Custom tag colors (deterministic colors only)
- Importing/exporting task data
- Sorting tasks by any field other than creation/user-defined order

---

## Success Criteria (All Features)

### Feature 1: Tags
- Task type includes `tags: string[]`
- TaskForm tag input with comma/space delimiter
- Tag pills display with deterministic colors
- Tag filtering (click pill to filter)
- Coexists with Status and Search filters (AND logic)

### Feature 2: Search
- Search input in header
- Real-time filtering by title and tags
- Clear button to reset search
- Works alongside all other filters (AND logic)

### Feature 3: Recurring Tasks
- Task type includes `recurrence: Recurrence` and `nextOccurrence?: string`
- TaskForm recurrence select (None / Daily / Weekly / Monthly)
- Next occurrence display on TaskItem
- Marking complete resets to next occurrence
- Undo restores completed state

### Overall
- All three features coexist and integrate (no feature breaks another)
- All existing functionality (priority, due dates, filters, undo) still works
- TypeScript strict mode compliant
- No new dependencies
- Tailwind CSS only
- All tests pass (old + new)
- Build succeeds
- Ready to demo at `localhost:3000`
