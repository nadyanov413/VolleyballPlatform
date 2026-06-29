# Design Document: Practice Question Customization

## Overview

This feature adds full CRUD management for practice questions to the coach interface, plus a per-team anonymity toggle that controls whether player names appear when the coach reviews responses. Currently, four questions are hardcoded in `data/practice-questions.json` and read-only. This design makes that set fully configurable through a new `/coach/questions` page backed by new API routes, with minimal changes to the existing player response form and summaries view.

The design follows the same patterns already established in the codebase: Next.js 14 App Router pages, API routes under `app/api/`, the `DataAccess` class in `lib/data-access.ts`, and local JSON files in `data/`.

---

## Architecture

```mermaid
graph TD
    A[Coach Browser] -->|CRUD + reorder + toggle| B[/coach/questions page]
    B -->|GET/POST/PUT/DELETE| C[/api/practice-questions]
    B -->|GET/PUT| D[/api/question-settings]
    C --> E[DataAccess]
    D --> E
    E -->|read/write| F[data/practice-questions.json]
    E -->|read/write| G[data/question-settings.json]

    H[Player Browser] -->|loads form| I[/player/practices/id/respond]
    I -->|GET questions| C

    J[Coach Summaries Page] -->|GET settings| D
    J -->|GET responses| K[/api/practices/id/responses]
```

The new `/api/practice-questions` route replaces the current read-only route with full CRUD. The new `/api/question-settings` route handles the anonymity setting. Both routes delegate persistence to the existing `DataAccess` class. The player response form and summaries page are updated to call these routes — no structural changes, just additional fetches.

---

## Components and Interfaces

### New: `/coach/questions` page (`app/coach/questions/page.tsx`)

A client component (`'use client'`) that renders:

- The question list sorted by `order`, with inline edit, delete (with confirmation), and up/down reorder controls
- An "Add question" input + submit button at the bottom of the list
- A labeled toggle for the anonymity setting at the top of the page

State managed locally with `useState`. Data fetched on mount with `useEffect`. All mutations call the API routes and refresh local state on success. No full page reload needed.

### Updated: `app/coach/layout.tsx`

Add a "Questions" `<Link href="/coach/questions">` nav item alongside the existing five links.

### New: `/api/practice-questions` route (`app/api/practice-questions/route.ts`)

Replaces the current read-only GET handler with:

| Method | Behaviour |
|--------|-----------|
| `GET` | Return all questions sorted by `order` asc |
| `POST` | Validate non-empty text, assign `order = max + 1`, generate UUID, persist |
| `PUT` | Validate non-empty text and matching `id`, update `question` field only (preserve `id`, `order`) |
| `DELETE` | Accept `id` query param, remove the matching question |

A separate `PUT /api/practice-questions/reorder` endpoint accepts the full reordered array and writes it atomically — simpler than individual order patches when swapping adjacent items.

### New: `/api/question-settings` route (`app/api/question-settings/route.ts`)

| Method | Behaviour |
|--------|-----------|
| `GET` | Return current `QuestionSettings`; if file missing, return default `{ anonymityEnabled: false }` |
| `PUT` | Accept `{ anonymityEnabled: boolean }`, persist to `data/question-settings.json` |

### Updated: `app/player/practices/[id]/respond/page.tsx`

Already fetches from `/api/practice-questions` (see existing code). The only addition needed is a guard: if the returned question list is empty, show an informational message instead of rendering the form.

### Updated: `app/coach/summaries/page.tsx`

Fetch `GET /api/question-settings` on mount. Pass `anonymityEnabled` down to wherever player names are rendered. When `anonymityEnabled` is `true`, replace each player name with "Anonymous Player".

---

## Data Models

### `PracticeQuestion` (existing, unchanged)

```typescript
interface PracticeQuestion {
  id: string;      // UUID
  question: string; // non-empty text
  order: number;   // 1-based, sequential
}
```

### `QuestionSettings` (new, add to `lib/types.ts`)

```typescript
interface QuestionSettings {
  anonymityEnabled: boolean;
}
```

Default when `data/question-settings.json` does not exist: `{ anonymityEnabled: false }`.

### New API request types (add to `lib/types.ts`)

```typescript
interface CreateQuestionRequest {
  question: string;
}

interface UpdateQuestionRequest {
  id: string;
  question: string;
}

interface ReorderQuestionsRequest {
  questions: { id: string; order: number }[];
}

interface UpdateQuestionSettingsRequest {
  anonymityEnabled: boolean;
}
```

### `data/question-settings.json` (new file, created on first PUT)

```json
{
  "anonymityEnabled": false
}
```

Note: unlike the array-based JSON files, this file stores a single object. `DataAccess` already has generic `readData` / `writeData` methods that work on arrays; for this singleton we add two dedicated methods: `getQuestionSettings()` and `saveQuestionSettings()` that use `fs.readFile` / `fs.writeFile` directly (same pattern, no array wrapper).

### `DataAccess` additions (`lib/data-access.ts`)

```typescript
async getQuestionSettings(): Promise<QuestionSettings>
async saveQuestionSettings(settings: QuestionSettings): Promise<void>
async savePracticeQuestions(questions: PracticeQuestion[]): Promise<void>  // bulk write for reorder
async createPracticeQuestion(question: PracticeQuestion): Promise<PracticeQuestion>
async updatePracticeQuestion(id: string, text: string): Promise<PracticeQuestion>
async deletePracticeQuestion(id: string): Promise<boolean>
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Questions are always returned in ascending order

*For any* question list stored in `data/practice-questions.json` (in any file order), `GET /api/practice-questions` SHALL return the questions sorted by `order` ascending.

**Validates: Requirements 7.5, 1.3, 8.1**

### Property 2: New question receives max-plus-one order

*For any* existing question list and any non-empty question text, after a successful `POST /api/practice-questions`, the newly created question's `order` value SHALL equal the previous maximum `order` value plus one.

**Validates: Requirements 2.2**

### Property 3: Whitespace-only questions are rejected

*For any* string composed entirely of whitespace characters (including the empty string), submitting it as a question text via `POST` or `PUT` SHALL result in a 400 response and the question list SHALL remain unchanged.

**Validates: Requirements 2.3, 3.4**

### Property 4: Edit preserves id and order

*For any* question in the list and any valid (non-empty, non-whitespace) replacement text, a `PUT` update SHALL change only the `question` field; the `id` and `order` fields SHALL be identical to their pre-update values.

**Validates: Requirements 3.3**

### Property 5: Delete removes exactly the targeted question

*For any* question list containing at least one question, deleting a question by its `id` SHALL result in a list that contains every original question except the deleted one, with all other questions' `id`, `question`, and `order` fields unchanged.

**Validates: Requirements 4.3**

### Property 6: Reorder swaps order values of adjacent questions

*For any* question list with at least two questions, moving question at position *i* up (or down) SHALL swap its `order` value with the adjacent question at position *i-1* (or *i+1*), leaving all other questions' order values unchanged.

**Validates: Requirements 5.2, 5.3**

### Property 7: Anonymity setting round-trips correctly

*For any* boolean value written via `PUT /api/question-settings`, a subsequent `GET /api/question-settings` SHALL return the same boolean value.

**Validates: Requirements 6.3**

### Property 8: Anonymity mode hides player names in responses view

*For any* set of practice responses and player records, when `anonymityEnabled` is `true`, the rendered responses view SHALL contain no string that matches any player's `name` field from the players data.

**Validates: Requirements 6.4**

### Property 9: Non-anonymity mode shows player names in responses view

*For any* set of practice responses with associated players, when `anonymityEnabled` is `false`, the rendered responses view SHALL display each responding player's `name` field.

**Validates: Requirements 6.5**

### Property 10: Each question in the list has edit and delete controls

*For any* non-empty question list rendered on the Questions page, every question item SHALL have both an edit control and a delete control present in the DOM.

**Validates: Requirements 3.1, 4.1**

---

## Error Handling

| Scenario | API Response | UI Behaviour |
|----------|-------------|--------------|
| Submit empty / whitespace question | 400 `{ error: "Question text cannot be empty" }` | Inline validation message, no save |
| `id` not found on PUT or DELETE | 404 `{ error: "Question not found" }` | Toast / error banner |
| File write failure (questions or settings) | 500 `{ error: "Failed to write data: <details>" }` | Error banner; previous state preserved |
| `GET /api/question-settings` when file absent | 200 with default `{ anonymityEnabled: false }` | Toggle renders in off state |
| Player visits response form with empty question list | 200 with `data: []` | Informational message displayed; form not rendered |

All API routes wrap handlers in `try/catch`. Write failures must not partially mutate files — the `DataAccess` write methods already write atomically via `fs.writeFile` (full-file replace), so a throw before the write leaves the file untouched.

---

## Testing Strategy

### Unit / Example-Based Tests

Focus on concrete behaviors that don't benefit from randomized input:

- Nav renders the "Questions" link
- Questions page renders the anonymity toggle
- Clicking delete shows confirmation before removing
- Canceling edit restores original text
- Summaries page shows "Anonymous Player" instead of names when anonymity is on
- Write failure returns 500 and leaves data unchanged (mocked `fs.writeFile` throws)
- Empty question list on player form shows informational message

### Property-Based Tests

Use a property-based testing library (e.g., **fast-check** for TypeScript) with a minimum of **100 iterations per property**.

Each test is tagged with a comment in the format:
`// Feature: practice-question-customization, Property N: <property text>`

Properties to implement (one test each):

1. `GET /api/practice-questions` returns questions sorted by `order` asc — generate shuffled arrays, write to file, verify GET response order
2. New question gets `max(order) + 1` — generate existing lists, POST a new question, check assigned order
3. Whitespace-only submission returns 400 — generate whitespace strings via `fc.string({ unit: 'grapheme' }).filter(s => s.trim() === '')` 
4. PUT preserves `id` and `order` — generate questions and update texts, verify structural fields unchanged
5. DELETE removes exactly one question — generate lists, delete a random item, verify result set
6. Reorder swaps adjacent order values — generate lists of ≥2, swap adjacent, verify only those two values changed
7. Anonymity setting round-trips — generate `fc.boolean()`, PUT then GET, assert equality
8. Anonymity=true hides all player names — generate player+response combos, render, assert no name present
9. Anonymity=false shows all player names — generate player+response combos, render, assert all names visible
10. Every question has edit and delete controls — generate question lists, render, assert control presence per item
