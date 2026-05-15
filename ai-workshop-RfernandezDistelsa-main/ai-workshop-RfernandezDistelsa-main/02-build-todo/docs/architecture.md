# Architecture: Optional Due Dates with Overdue Highlighting

## Overview

The Optional Due Dates feature adds task scheduling capabilities to the todo app, allowing users to set due dates on tasks and filter to view overdue items. The feature introduces a new data model field (`dueDate`), business logic for date comparison (`isOverdue()` helper), UI components for date input/display, and a new "Overdue" filter option. All persistence and filtering integrates with existing localStorage and filter infrastructure.

---

## 1. Data Model Changes

### `lib/types.ts` — Update Task Interface

**Current:**
```typescript
export interface Task {
  id: string;
  title: string;
  priority: "low" | "med" | "high";
  completed: boolean;
  createdAt: string;
}
```

**Updated:**
```typescript
export interface Task {
  id: string;
  title: string;
  priority: "low" | "med" | "high";
  completed: boolean;
  createdAt: string;
  dueDate?: string; // ISO 8601 date format (YYYY-MM-DD), no time component
}
```

**Rationale for string format:**
- ISO 8601 date format (`YYYY-MM-DD`) is serializable to JSON and localStorage natively
- Sortable lexicographically (string comparison works correctly for date ordering)
- Timezone-agnostic (no time component avoids DST and timezone issues; user's local timezone only)
- Compatible with HTML `<input type="date">` which expects YYYY-MM-DD format
- Backward compatible: tasks without `dueDate` have `undefined` value; deserializes correctly

---

## 2. Business Logic

### `lib/tasks.ts` — Add isOverdue() Helper Function

**New function:**
```typescript
/**
 * Determines if a task is overdue.
 *
 * A task is overdue if:
 * 1. It has a dueDate (not undefined)
 * 2. The due date is before today's date
 * 3. The task is not completed
 *
 * @param task - The task to check
 * @returns true if task is overdue; false otherwise
 *
 * Date comparison strategy:
 * - Uses the user's local timezone (new Date() constructor)
 * - Compares only the date portion (no time component)
 * - Returns false for completed tasks (even if past their due date)
 * - Returns false for tasks with no dueDate
 */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) {
    return false;
  }

  // Parse due date string (YYYY-MM-DD format)
  const dueDate = new Date(task.dueDate + "T00:00:00");

  // Get today's date (user's local timezone, midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compare: overdue if dueDate is before today
  return dueDate < today;
}
```

**Key implementation details:**
- Adds `"T00:00:00"` suffix to ISO date string before parsing (ensures date is interpreted at midnight in local timezone, avoiding timezone offset issues)
- Calls `setHours(0, 0, 0, 0)` on today's date to ensure clean midnight comparison
- Returns `false` if task is completed (completed tasks are never highlighted as overdue)
- Returns `false` if no `dueDate` (optional field)

---

## 3. Storage & Persistence

### `lib/storage.ts` — No Changes Required

**Rationale:**
- localStorage already persists all task properties via JSON serialization
- The `dueDate?: string` field will serialize/deserialize automatically with existing code
- No custom serialization logic needed
- Backward compatible: tasks created before this feature will not have `dueDate` property

**Verification:**
- Existing `saveTasks()` calls `JSON.stringify(tasks)` — includes `dueDate` automatically
- Existing `loadTasks()` calls `JSON.parse()` — reconstructs `dueDate` as string property

---

## 4. Hooks

### `lib/useTasks.ts` — No Changes Required

**Rationale:**
- Hook already accesses all task properties (e.g., `task.priority`, `task.completed`)
- `dueDate` is a plain property on Task interface; no special access logic needed
- Filtering logic (see section 6) lives in components, not in the hook
- Hook remains focused on CRUD operations: `addTask()`, `updateTask()`, `deleteTask()`

---

## 5. Components to Create/Modify

### 5.1 Create `components/DueDateInput.tsx` (~50 lines)

**File:** `components/DueDateInput.tsx`

**Responsibility:** Presentational input for selecting a task due date. Uses native HTML `<input type="date">` element.

**Props:**
```typescript
interface DueDateInputProps {
  value: string | undefined;
  onChange: (date: string | undefined) => void;
  disabled?: boolean;
}
```

**Behavior:**
- Renders an HTML `<input type="date">` element
- Accepts and displays date in `YYYY-MM-DD` format
- `onChange` callback receives new date string or `undefined` (when user clears input)
- Uses Tailwind styling to match existing form inputs (padding, border, focus states)
- Optional `disabled` prop for submission states

**Styling (Tailwind):**
```
px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100
```

**Component structure:**
```typescript
"use client";

interface DueDateInputProps {
  value: string | undefined;
  onChange: (date: string | undefined) => void;
  disabled?: boolean;
}

export function DueDateInput({ value, onChange, disabled }: DueDateInputProps) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
    />
  );
}
```

**Lines:** ~25 lines

---

### 5.2 Modify `components/TaskForm.tsx`

**Changes:**

1. **Import DueDateInput** (line ~5):
   ```typescript
   import { DueDateInput } from "@/components/DueDateInput";
   ```

2. **Add dueDate state** (inside component, after priority state, ~line 18):
   ```typescript
   const [dueDate, setDueDate] = useState<string | undefined>(undefined);
   ```

3. **Add DueDateInput to form** (before submit button, after priority selector):
   ```typescript
   <div className="mb-4">
     <label className="block text-sm font-medium text-slate-700 mb-2">
       Due Date (optional)
     </label>
     <DueDateInput
       value={dueDate}
       onChange={setDueDate}
       disabled={isSubmitting}
     />
   </div>
   ```

4. **Update handleSubmit to include dueDate**:
   ```typescript
   // Inside handleSubmit, when calling onSave:
   onSave({
     title: trimmed,
     priority,
     dueDate,
   });
   ```

5. **Reset dueDate on successful save** (if needed, already handles via state reset):
   - When form clears after submission, `setDueDate(undefined)` in reset logic

**Scope:** ~5–10 lines added

**Note:** TaskForm already handles priority state similarly, so pattern is consistent.

---

### 5.3 Modify `components/TaskItem.tsx`

**Changes:**

1. **Import isOverdue helper** (line ~5):
   ```typescript
   import { isOverdue } from "@/lib/tasks";
   ```

2. **Add due date badge display** (in render, after priority badge):
   ```typescript
   {task.dueDate && (
     <span
       className={`text-xs px-2 py-1 rounded-full ${
         isOverdue(task)
           ? "bg-red-100 text-red-700"
           : "bg-blue-100 text-blue-700"
       }`}
     >
       Due: {new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
       })}
     </span>
   )}
   ```

3. **Add overdue styling to task item container** (if overdue, add left border):
   ```typescript
   <div
     className={`p-4 border rounded-lg flex items-center justify-between ${
       isOverdue(task) ? "border-l-4 border-l-red-500" : ""
     }`}
   >
   ```

**Styling details:**
- Overdue badge: `bg-red-100 text-red-700` (light red background, darker red text)
- Regular due date badge: `bg-blue-100 text-blue-700` (light blue background, darker blue text)
- Overdue task item border: `border-l-4 border-l-red-500` (4px red left border accent)
- Date format: "Due: MMM DD" (e.g., "Due: Mar 15") using `toLocaleDateString()`

**Scope:** ~15–20 lines added

---

### 5.4 Modify `components/FilterToggle.tsx`

**Changes:**

1. **Add "Overdue" to filter options**:
   ```typescript
   const filters: Array<{ label: string; value: FilterType }> = [
     { label: "All", value: "all" },
     { label: "Open", value: "open" },
     { label: "Done", value: "done" },
     { label: "Overdue", value: "overdue" }, // NEW
   ];
   ```

2. **Define FilterType to include "overdue"**:
   ```typescript
   export type FilterType = "all" | "open" | "done" | "overdue"; // ADD "overdue"
   ```

3. **Update component render** (toggle buttons already handle new value):
   - Existing button mapping logic works for new filter
   - No structural changes needed

**Scope:** ~5 lines (one new filter object entry + type update)

**Note:** FilterToggle should export `FilterType` if not already exported; check existing exports.

---

### 5.5 Modify `components/TaskyApp.tsx`

**Changes:**

1. **Import isOverdue** (line ~5):
   ```typescript
   import { isOverdue } from "@/lib/tasks";
   ```

2. **Update filterTasks logic** (find the filter switch/conditional, add case):
   ```typescript
   const filterTasks = (tasks: Task[]): Task[] => {
     switch (filter) {
       case "all":
         return tasks;
       case "open":
         return tasks.filter((t) => !t.completed);
       case "done":
         return tasks.filter((t) => t.completed);
       case "overdue": // NEW
         return tasks.filter((t) => isOverdue(t));
       default:
         return tasks;
     }
   };
   ```

3. **Ensure FilterToggle integration**:
   - TaskyApp already receives filter state from FilterToggle (likely as prop or state)
   - Pass filter value to filterTasks logic
   - Filter dropdown updates state on click

**Scope:** ~3–5 lines (one new case branch)

**Filtering logic note:**
- "Overdue" filter shows only incomplete tasks that are past their due date
- Filter is mutually exclusive (OR logic): user selects one filter at a time
- Overdue filter calls `isOverdue(task)` on each task; `isOverdue()` already checks `!completed`, so logic is clean

---

## 6. Filtering Logic

### Filter Strategy

**Type definition:**
```typescript
type FilterType = "all" | "open" | "done" | "overdue";
```

**Implementation:**
- Filters are mutually exclusive: user clicks one, not multiple
- `filterTasks()` function switches on active filter
- "Overdue" returns only tasks where `isOverdue(task) === true`
- `isOverdue()` helper ensures only incomplete tasks with past due dates are flagged

**Integration with existing filters:**
- All/Open/Done continue to work as before
- Overdue filter is independent; does not layer with other filters in this MVP
- If future enhancement needed (e.g., "Show Open + Overdue"), would require multi-select logic

---

## 7. Styling Summary

### Overdue Badge
```
bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full
```
- Light red background, dark red text
- Same size/shape as priority badge for consistency

### Regular Due Date Badge
```
bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full
```
- Light blue background, dark blue text
- Clearly distinct from overdue state

### Overdue Task Item
```
border-l-4 border-l-red-500
```
- 4px red left border accent on the task card
- Subtle visual cue without overwhelming design

### DueDateInput
```
px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100
```
- Matches existing form input styling
- Standard focus ring for accessibility

---

## 8. Files to Create/Modify

| File | Action | Scope |
|------|--------|-------|
| `components/DueDateInput.tsx` | **Create** | New component (~25 lines) |
| `lib/types.ts` | **Modify** | Add `dueDate?: string` to Task interface (~1 line) |
| `lib/tasks.ts` | **Modify** | Add `isOverdue()` function (~15 lines) |
| `components/TaskForm.tsx` | **Modify** | Add due date state and input (~10 lines) |
| `components/TaskItem.tsx` | **Modify** | Display due date badge and overdue styling (~20 lines) |
| `components/FilterToggle.tsx` | **Modify** | Add "Overdue" filter option (~5 lines) |
| `components/TaskyApp.tsx` | **Modify** | Add overdue filter case (~5 lines) |

---

## 9. Testing Strategy

### 9.1 Unit Tests: `isOverdue()` Function

**File:** `tests/tasks.test.ts`

**Tests:**
1. **Overdue task with past date:**
   - Create task with `dueDate: "2024-01-01"` (past)
   - `isOverdue(task)` should return `true`

2. **Future due date:**
   - Create task with `dueDate: "2099-12-31"` (future)
   - `isOverdue(task)` should return `false`

3. **Today's date:**
   - Create task with `dueDate: today's date`
   - `isOverdue(task)` should return `false` (today is not overdue)

4. **No due date:**
   - Create task with `dueDate: undefined`
   - `isOverdue(task)` should return `false`

5. **Completed overdue task:**
   - Create task with `dueDate: "2024-01-01"` and `completed: true`
   - `isOverdue(task)` should return `false` (completed tasks never overdue)

---

### 9.2 Component Tests: DueDateInput

**File:** `tests/DueDateInput.test.tsx`

**Tests:**
1. **Renders input element:**
   - Component renders `<input type="date">`

2. **Displays value:**
   - Pass `value="2024-03-15"`, input shows "2024-03-15"

3. **onChange callback fired:**
   - User selects new date, `onChange` prop called with YYYY-MM-DD string

4. **Clear date (undefined):**
   - User clears input, `onChange` called with `undefined`

5. **Disabled state:**
   - Pass `disabled={true}`, input has `disabled` attribute

---

### 9.3 Component Tests: TaskItem (with due date)

**File:** `tests/TaskItem.test.tsx` (extend existing)

**New tests:**
1. **Due date badge displays:**
   - Task with `dueDate: "2025-03-15"`, badge shows "Due: Mar 15"

2. **Overdue badge styling:**
   - Task with past `dueDate` and `completed: false`, badge has red styling (`bg-red-100 text-red-700`)

3. **Future date badge styling:**
   - Task with future `dueDate`, badge has blue styling (`bg-blue-100 text-blue-700`)

4. **No due date, no badge:**
   - Task with `dueDate: undefined`, no badge renders

5. **Overdue border accent:**
   - Task with past `dueDate`, item has `border-l-4 border-l-red-500`

---

### 9.4 Component Tests: TaskForm (with due date input)

**File:** `tests/TaskForm.test.tsx` (extend existing)

**New tests:**
1. **DueDateInput renders:**
   - Form displays due date input field

2. **Due date included in submission:**
   - User enters title + due date, clicks Save
   - `onSave` called with object including `dueDate` property

3. **Due date is optional:**
   - User enters title only (no due date), clicks Save
   - `onSave` called with `dueDate: undefined`

4. **Input value updates state:**
   - User selects date in DueDateInput, form state reflects change

---

### 9.5 Component Tests: FilterToggle (with Overdue)

**File:** `tests/FilterToggle.test.tsx` (extend existing)

**New tests:**
1. **"Overdue" button renders:**
   - Filter toggle displays "Overdue" button

2. **Overdue filter is selectable:**
   - User clicks "Overdue" button, filter state updates to "overdue"
   - Button shows as active/selected

3. **Switching filters:**
   - User clicks "Overdue", then "All"
   - Filter state switches; "All" becomes active

---

### 9.6 Integration Tests: TaskyApp (filtering)

**File:** `tests/TaskyApp.test.tsx` (extend existing)

**New tests:**
1. **Overdue filter shows only overdue tasks:**
   - Add tasks: past due (incomplete), future due, no due date, completed past due
   - Select "Overdue" filter
   - Only the incomplete past-due task displays

2. **Overdue filter works with task lifecycle:**
   - Add task with past due date
   - "Overdue" filter shows it
   - Complete the task
   - Task disappears from "Overdue" filter (because `isOverdue()` checks `!completed`)

3. **Filter switching:**
   - Tasks displayed with "Overdue" filter
   - Switch to "All" filter
   - All tasks display again

---

## 10. Dependencies & No New Installs

- **React:** No new dependency (already in project)
- **Tailwind CSS v3:** No new dependency (already styling project)
- **HTML `<input type="date">`:** Native browser API, no dependency
- **Vitest + Testing Library:** No new dependency (already in tests)

**No new npm packages required.**

---

## 11. Edge Cases & Considerations

### 11.1 Timezone Handling
- `dueDate` stored as ISO date string (`YYYY-MM-DD`), no time component
- `isOverdue()` uses user's local timezone only (no server, no UTC conversion)
- Date comparison happens at midnight (00:00:00) in user's timezone
- Avoids DST and timezone offset complications

### 11.2 Completed Overdue Tasks
- `isOverdue()` returns `false` if `task.completed === true`
- Completed tasks never show as overdue in UI (no red badge)
- Completed tasks disappear from "Overdue" filter
- Rationale: user completed the task (even if late); no need to highlight it

### 11.3 Backward Compatibility
- Old tasks without `dueDate` have `dueDate: undefined`
- `isOverdue(task)` returns `false` for these tasks
- No migration needed; localStorage deserializes correctly
- Filters work for mixed old/new task data

### 11.4 Date Input UX
- Native `<input type="date">` has good mobile browser support (date picker UI)
- Format always YYYY-MM-DD (controlled by browser/OS)
- Unsupported browsers (very rare) show text input; user can type manually

### 11.5 Filter Exclusivity
- "Overdue" filter is mutually exclusive with All/Open/Done (current MVP design)
- If future requirement: multi-select filters or compound filters (e.g., "Open + Overdue"), would require:
  - Change FilterType to a bitmask or array
  - Update filterTasks() to handle multiple active filters with AND/OR logic
  - Update FilterToggle UI to allow multiple selections

### 11.6 Today's Date Edge Case
- Task due today is NOT overdue (dueDate === today returns `false`)
- User has until end of day to complete it
- Rationale: common in todo apps (due date is deadline, not a trigger)

### 11.7 Undo & Persistence
- Due date is part of Task model, persisted like any other field
- Undo toast already handles task deletion; due dates go with task
- No special undo logic needed for due date changes

### 11.8 Empty/Null Due Dates
- Frontend never sends `dueDate: null` or `dueDate: ""` to storage
- Always uses `undefined` for no due date
- Prevents accidental null values in localStorage

---

## 12. Acceptance Criteria Checklist

- [ ] Task interface updated with `dueDate?: string` in `lib/types.ts`
- [ ] `isOverdue()` function added to `lib/tasks.ts` with correct timezone logic
- [ ] `DueDateInput` component created with native `<input type="date">`
- [ ] `TaskForm` includes due date input and passes dueDate to onSave
- [ ] `TaskItem` displays due date badge (blue for future, red for overdue)
- [ ] `TaskItem` shows red left-border accent for overdue tasks
- [ ] `FilterToggle` includes "Overdue" filter option
- [ ] `TaskyApp` filterTasks() includes overdue case
- [ ] Overdue filter correctly shows only incomplete past-due tasks
- [ ] Date formatting shows "Due: MMM DD" (e.g., "Due: Mar 15")
- [ ] TypeScript strict mode: no `any`, all types correct
- [ ] No new npm dependencies added
- [ ] Tailwind CSS only (no custom CSS)
- [ ] All tests pass (unit + component + integration)
- [ ] Build succeeds with no type errors
- [ ] Backward compatible with existing tasks (no dueDate)
- [ ] localStorage persists due dates correctly
- [ ] Completed tasks never appear as overdue

---

## 13. Implementation Notes

### Task Form Integration
When users create a new task in TaskForm, they will now fill in:
1. Title (required)
2. Priority (required, defaults to "med")
3. Due Date (optional)

The due date state is independent of the priority selector and follows the same pattern (optional, controlled input).

### isOverdue() Timezone Strategy
The function uses:
```typescript
const dueDate = new Date(task.dueDate + "T00:00:00");
const today = new Date();
today.setHours(0, 0, 0, 0);
return dueDate < today;
```

This ensures:
- Date string "2024-01-15" becomes Jan 15 at 00:00:00 in user's local timezone
- Today's date is set to 00:00:00 in local timezone
- Comparison is clean: midnight-to-midnight comparison (no time component matters)

### FilterToggle and FilterType Export
Ensure that `FilterType` is exported from `components/FilterToggle.tsx` if other components import it (e.g., TaskyApp for type annotations). If not already exported, add to the file.
