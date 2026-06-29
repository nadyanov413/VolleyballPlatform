# Requirements Document

## Introduction

This feature adds a Questions management tab to the coach interface of the Volleyball Club Management System. Coaches will be able to create, edit, delete, and reorder the practice questions that players receive after each session. Coaches will also be able to toggle whether player responses are collected anonymously. Currently, four questions are hardcoded in `data/practice-questions.json` and are read-only. This feature makes the question set fully configurable through the UI.

## Glossary

- **Coach_Interface**: The web interface accessible at `/coach/*` used by coaching staff to manage teams, players, practices, and now questions.
- **Questions_Page**: The new `/coach/questions` page added to the coach navigation as a dedicated tab.
- **Question**: A text prompt presented to players after a practice session, stored in `data/practice-questions.json` with an `id`, `question` text, and `order` field.
- **Question_Settings**: A configuration object stored in `data/question-settings.json` that holds global settings for the question feature, including the anonymity toggle.
- **Questions_API**: The API layer at `/api/practice-questions` that provides CRUD operations for questions and read/write access to question settings.
- **Player_Response_Form**: The player-facing form at `/player/practices/[id]/respond` where players answer the active question set after a practice.
- **Anonymity_Mode**: A setting that, when enabled, causes the system to omit player identity information when presenting responses to the coach.

---

## Requirements

### Requirement 1: Questions Management Tab

**User Story:** As a coach, I want a dedicated Questions tab in the coach navigation, so that I can manage practice questions without leaving the coach interface.

#### Acceptance Criteria

1. THE Coach_Interface SHALL display a "Questions" navigation link alongside the existing Dashboard, Teams, Players, Practices, and Summaries links.
2. WHEN a coach clicks the Questions navigation link, THE Coach_Interface SHALL navigate to the Questions_Page at `/coach/questions`.
3. THE Questions_Page SHALL display the current list of practice questions in their configured order.

---

### Requirement 2: Add a Practice Question

**User Story:** As a coach, I want to add new practice questions, so that I can tailor post-practice reflection to what matters for my team.

#### Acceptance Criteria

1. THE Questions_Page SHALL provide an input field and a submit control to create a new question.
2. WHEN a coach submits a new question with non-empty text, THE Questions_API SHALL persist the new question to `data/practice-questions.json` and assign it the next sequential order value.
3. WHEN a coach submits an empty or whitespace-only question, THE Questions_API SHALL return a 400 error and THE Questions_Page SHALL display a validation message without saving.
4. WHEN a new question is successfully saved, THE Questions_Page SHALL refresh the question list to include the newly added question.

---

### Requirement 3: Edit a Practice Question

**User Story:** As a coach, I want to edit existing practice questions, so that I can improve or update them over time.

#### Acceptance Criteria

1. THE Questions_Page SHALL provide an edit control for each question in the list.
2. WHEN a coach activates the edit control for a question, THE Questions_Page SHALL display an editable input pre-filled with the current question text.
3. WHEN a coach saves an edited question with non-empty text, THE Questions_API SHALL update the question text in `data/practice-questions.json` while preserving its `id` and `order`.
4. WHEN a coach saves an edited question with empty or whitespace-only text, THE Questions_API SHALL return a 400 error and THE Questions_Page SHALL display a validation message without saving.
5. WHEN a coach cancels an in-progress edit, THE Questions_Page SHALL discard the changes and restore the original question text.

---

### Requirement 4: Delete a Practice Question

**User Story:** As a coach, I want to delete practice questions that are no longer relevant, so that players are only asked questions that matter.

#### Acceptance Criteria

1. THE Questions_Page SHALL provide a delete control for each question in the list.
2. WHEN a coach activates the delete control for a question, THE Questions_Page SHALL display a confirmation prompt before deleting.
3. WHEN a coach confirms deletion, THE Questions_API SHALL remove the question from `data/practice-questions.json` and THE Questions_Page SHALL remove it from the displayed list.
4. WHEN a coach cancels the deletion prompt, THE Questions_Page SHALL retain the question unchanged.
5. WHEN the last remaining question is deleted, THE Questions_API SHALL permit the deletion, leaving an empty question list.

---

### Requirement 5: Reorder Practice Questions

**User Story:** As a coach, I want to reorder practice questions, so that players see them in the most logical sequence.

#### Acceptance Criteria

1. THE Questions_Page SHALL provide up and down reorder controls for each question.
2. WHEN a coach uses a reorder control to move a question up, THE Questions_API SHALL update the `order` values in `data/practice-questions.json` so the selected question is positioned one place earlier and the displaced question is positioned one place later.
3. WHEN a coach uses a reorder control to move a question down, THE Questions_API SHALL update the `order` values in `data/practice-questions.json` so the selected question is positioned one place later and the displaced question is positioned one place earlier.
4. WHILE a question is already the first in the list, THE Questions_Page SHALL disable the move-up control for that question.
5. WHILE a question is already the last in the list, THE Questions_Page SHALL disable the move-down control for that question.
6. WHEN reorder changes are saved, THE Questions_Page SHALL display the updated question order immediately.

---

### Requirement 6: Anonymity Setting

**User Story:** As a coach, I want to toggle whether player responses are anonymous, so that I can choose the level of transparency appropriate for my team's culture.

#### Acceptance Criteria

1. THE Questions_Page SHALL display a clearly labeled toggle control for the anonymity setting.
2. THE Questions_Page SHALL load the current anonymity setting from the Questions_API when the page is rendered.
3. WHEN a coach changes the anonymity toggle, THE Questions_API SHALL persist the updated setting to `data/question-settings.json` immediately.
4. WHILE Anonymity_Mode is enabled, THE Coach_Interface SHALL display player responses without attributing them to specific players by name.
5. WHILE Anonymity_Mode is disabled, THE Coach_Interface SHALL display player responses with the corresponding player name visible.
6. THE Player_Response_Form SHALL not display the anonymity setting to players; the setting is coach-only.

---

### Requirement 7: Question Data Persistence

**User Story:** As a coach, I want all question changes to be saved automatically to persistent storage, so that updates survive server restarts.

#### Acceptance Criteria

1. THE Questions_API SHALL read and write questions exclusively to `data/practice-questions.json` using the existing DataAccess class patterns.
2. THE Questions_API SHALL read and write anonymity settings exclusively to `data/question-settings.json` using the existing DataAccess class patterns.
3. IF a write operation to `data/practice-questions.json` fails, THEN THE Questions_API SHALL return a 500 error with a descriptive message and leave the file in its previous state.
4. IF a write operation to `data/question-settings.json` fails, THEN THE Questions_API SHALL return a 500 error with a descriptive message and leave the file in its previous state.
5. THE Questions_API SHALL return all questions sorted by their `order` field in ascending order.

---

### Requirement 8: Player Experience Consistency

**User Story:** As a player, I want the questions I see after practice to reflect the coach's current configuration, so that the feedback I give is always relevant.

#### Acceptance Criteria

1. WHEN a player navigates to the response form for a practice, THE Player_Response_Form SHALL fetch the current question list from the Questions_API and display all active questions in their configured order.
2. WHEN the question list is empty, THE Player_Response_Form SHALL display an informational message indicating no questions are currently configured.
