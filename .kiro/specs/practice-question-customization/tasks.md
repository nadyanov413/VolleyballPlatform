# Implementation Plan: Practice Question Customization

## Overview

Implement full CRUD management for practice questions and an anonymity toggle in the coach interface. This covers: new API routes, DataAccess extensions, a new `/coach/questions` page, updates to the coach nav, the player response form guard, and anonymity rendering in the summaries page.

## Tasks

- [x] 1. Extend types and DataAccess
  - [x] 1.1 Add new types to `lib/types.ts`
    - Add `QuestionSettings`, `CreateQuestionRequest`, `UpdateQuestionRequest`, `ReorderQuestionsRequest`, `UpdateQuestionSettingsRequest` interfaces
    - _Requirements: 6.1, 7.1, 7.2_
  - [x] 1.2 Add question and settings methods to `lib/data-access.ts`
    - Add `createPracticeQuestion`, `updatePracticeQuestion`, `deletePracticeQuestion`, `savePracticeQuestions` methods
    - Add `getQuestionSettings` and `saveQuestionSettings` methods using direct `fs.readFile`/`fs.writeFile` (singleton object, not array)
    - Default `getQuestionSettings` to `{ anonymityEnabled: false }` when file is absent
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 1.3 Write unit tests for DataAccess question methods
    - Test `createPracticeQuestion` assigns correct order, persists data
    - Test `updatePracticeQuestion` preserves `id` and `order`
    - Test `deletePracticeQuestion` removes exactly one item
    - Test `getQuestionSettings` returns default when file missing
    - _Requirements: 2.2, 3.3, 4.3, 6.2_

- [x] 2. Implement `/api/practice-questions` API route
  - [x] 2.1 Replace the existing read-only handler in `app/api/practice-questions/route.ts` with full CRUD
    - `GET`: return all questions sorted by `order` asc
    - `POST`: validate non-empty text, assign `order = max + 1`, generate UUID, persist
    - `PUT`: validate non-empty text and matching `id`, update `question` field only
    - `DELETE`: accept `id` query param, remove matching question
    - Return 400 for empty/whitespace text, 404 for unknown id, 500 for write failures
    - _Requirements: 2.2, 2.3, 3.3, 3.4, 4.3, 7.1, 7.3, 7.5_
  - [x] 2.2 Add `PUT /api/practice-questions/reorder` endpoint (`app/api/practice-questions/reorder/route.ts`)
    - Accept `ReorderQuestionsRequest` body, atomically write full reordered array
    - _Requirements: 5.2, 5.3, 7.1_
  - [ ]* 2.3 Write property test: GET always returns questions sorted by order asc
    - **Property 1: Questions are always returned in ascending order**
    - Generate shuffled question arrays, write to file, call GET, verify ascending order
    - `// Feature: practice-question-customization, Property 1: Questions are always returned in ascending order`
    - **Validates: Requirements 7.5, 1.3, 8.1**
  - [ ]* 2.4 Write property test: new question receives max-plus-one order
    - **Property 2: New question receives max-plus-one order**
    - Generate existing lists, POST a new question, check assigned `order` equals previous max + 1
    - `// Feature: practice-question-customization, Property 2: New question receives max-plus-one order`
    - **Validates: Requirements 2.2**
  - [ ]* 2.5 Write property test: whitespace-only submissions are rejected
    - **Property 3: Whitespace-only questions are rejected**
    - Generate whitespace strings via `fc.string({ unit: 'grapheme' }).filter(s => s.trim() === '')`, POST and PUT, assert 400 and unchanged list
    - `// Feature: practice-question-customization, Property 3: Whitespace-only questions are rejected`
    - **Validates: Requirements 2.3, 3.4**
  - [ ]* 2.6 Write property test: PUT preserves id and order
    - **Property 4: Edit preserves id and order**
    - Generate questions and update texts, verify `id` and `order` unchanged after PUT
    - `// Feature: practice-question-customization, Property 4: Edit preserves id and order`
    - **Validates: Requirements 3.3**
  - [ ]* 2.7 Write property test: DELETE removes exactly one question
    - **Property 5: Delete removes exactly the targeted question**
    - Generate lists, delete a random item by id, verify result contains all originals except deleted one with other fields unchanged
    - `// Feature: practice-question-customization, Property 5: Delete removes exactly the targeted question`
    - **Validates: Requirements 4.3**
  - [ ]* 2.8 Write property test: reorder swaps adjacent order values
    - **Property 6: Reorder swaps order values of adjacent questions**
    - Generate lists of ≥2 questions, swap adjacent items, verify only those two order values changed
    - `// Feature: practice-question-customization, Property 6: Reorder swaps order values of adjacent questions`
    - **Validates: Requirements 5.2, 5.3**

- [x] 3. Implement `/api/question-settings` API route
  - [x] 3.1 Create `app/api/question-settings/route.ts`
    - `GET`: return current `QuestionSettings`; default to `{ anonymityEnabled: false }` if file missing
    - `PUT`: accept `{ anonymityEnabled: boolean }`, persist to `data/question-settings.json`
    - Return 500 on write failures
    - _Requirements: 6.2, 6.3, 7.2, 7.4_
  - [ ]* 3.2 Write property test: anonymity setting round-trips correctly
    - **Property 7: Anonymity setting round-trips correctly**
    - Generate `fc.boolean()`, PUT then GET, assert returned value equals written value
    - `// Feature: practice-question-customization, Property 7: Anonymity setting round-trips correctly`
    - **Validates: Requirements 6.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build the `/coach/questions` page
  - [x] 5.1 Create `app/coach/questions/page.tsx` as a client component
    - Fetch questions from `GET /api/practice-questions` and settings from `GET /api/question-settings` on mount
    - Render question list sorted by `order` with inline edit, delete (with confirmation prompt), and up/down reorder controls
    - Disable move-up for the first question; disable move-down for the last question
    - Render "Add question" input + submit button
    - Render labeled anonymity toggle at the top
    - On mutation success, refresh local state without full page reload
    - Show inline validation message on 400 responses; show error banner on 500
    - _Requirements: 1.3, 2.1, 2.3, 2.4, 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3_
  - [ ]* 5.2 Write unit test: anonymity toggle renders and calls settings API
    - Test that the toggle is present and that changing it calls `PUT /api/question-settings`
    - _Requirements: 6.1, 6.3_
  - [ ]* 5.3 Write unit test: delete shows confirmation before removing
    - Test that clicking delete shows a confirmation prompt and only removes the item after confirmation
    - _Requirements: 4.2, 4.4_
  - [ ]* 5.4 Write unit test: canceling edit restores original text
    - Test that activating edit then canceling leaves the question text unchanged
    - _Requirements: 3.5_
  - [ ]* 5.5 Write property test: every question has edit and delete controls
    - **Property 10: Each question in the list has edit and delete controls**
    - Generate arbitrary non-empty question lists, render the page, assert each item has an edit control and a delete control in the DOM
    - `// Feature: practice-question-customization, Property 10: Each question in the list has edit and delete controls`
    - **Validates: Requirements 3.1, 4.1**

- [x] 6. Add "Questions" link to coach navigation
  - [x] 6.1 Update `app/coach/layout.tsx` to add `<Link href="/coach/questions">Questions</Link>` nav item alongside existing links
    - _Requirements: 1.1, 1.2_
  - [ ]* 6.2 Write unit test: nav renders the "Questions" link
    - Assert the Questions nav link is present and points to `/coach/questions`
    - _Requirements: 1.1_

- [x] 7. Update player response form
  - [x] 7.1 Update `app/player/practices/[id]/respond/page.tsx`
    - Add guard: if the fetched question list is empty, display an informational message and do not render the form
    - _Requirements: 8.1, 8.2_
  - [ ]* 7.2 Write unit test: empty question list shows informational message
    - Mock `GET /api/practice-questions` returning `[]`, assert the informational message renders and the form does not
    - _Requirements: 8.2_

- [x] 8. Update summaries page with anonymity support
  - [x] 8.1 Update `app/coach/summaries/page.tsx`
    - Fetch `GET /api/question-settings` on mount
    - When `anonymityEnabled` is `true`, replace each player name with "Anonymous Player"
    - When `anonymityEnabled` is `false`, display the actual player name
    - _Requirements: 6.4, 6.5, 6.6_
  - [ ]* 8.2 Write property test: anonymity=true hides all player names
    - **Property 8: Anonymity mode hides player names in responses view**
    - Generate player + response combos, render summaries with `anonymityEnabled: true`, assert no player `name` field appears in output
    - `// Feature: practice-question-customization, Property 8: Anonymity mode hides player names in responses view`
    - **Validates: Requirements 6.4**
  - [ ]* 8.3 Write property test: anonymity=false shows all player names
    - **Property 9: Non-anonymity mode shows player names in responses view**
    - Generate player + response combos, render summaries with `anonymityEnabled: false`, assert each player's `name` field is visible
    - `// Feature: practice-question-customization, Property 9: Non-anonymity mode shows player names in responses view`
    - **Validates: Requirements 6.5**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check (already installed) with a minimum of 100 iterations per property
- Each property test file includes the comment `// Feature: practice-question-customization, Property N: <text>`
- `data/question-settings.json` is a singleton object (not an array); use direct `fs.readFile`/`fs.writeFile` in `DataAccess`
- The reorder endpoint writes the full array atomically, avoiding partial mutations
