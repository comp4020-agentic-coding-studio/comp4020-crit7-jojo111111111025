# Process — Crit 7

## Concept

For Crit 7, I built a small slice of an ANU system that I would personally find useful: an **ANU Semester Planner**.

The idea is deliberately narrower than a complete enrolment system. Instead of enrolling directly, a student can first create a simple plan for the semester, add courses, classify them as Core or Elective, see the total study load, and remove courses when their plan changes.

The intended flow is:

> Plan first → review your study load → enrol later

The application uses Astro for the interface, an API layer for mutations, Drizzle ORM for database access, and SQLite for persistence.

## Starting point

The Crit 7 starter was a guestbook application. I decided not to extend the guestbook because it did not represent a system I actually wanted to use at ANU.

I replaced the guestbook model with a `planned_courses` table containing course code, title, units, course type, and creation time.

The scope was intentionally kept small. I did not implement authentication, multiple users, semester switching, prerequisite checking, timetable clashes, degree progress, ANU API integration, or actual enrolment submission.

## Agent direction

I used Claude Code as the main implementation agent, but treated it as an implementation partner rather than allowing it to determine the project scope.

I first specified the concept and the scope cuts, then asked the agent to inspect the existing repository and produce an implementation plan before making changes. The plan covered the database schema, API routes, UI, migration, tests, and removal of the guestbook-specific functionality.

I explicitly instructed the agent to preserve the full-stack persistence story:

> Add course → API → Drizzle → SQLite → reload → data remains.

This became the main acceptance criterion for the prototype.

## Implementation

The first implementation replaced the guestbook with the course planner, including:

* SQLite/Drizzle schema for planned courses
* course listing
* add-course API
* remove-course API
* server-rendered course planner UI
* database migration
* course planner tests

This work was committed as:

* [`d3cbe85`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-jojo111111111025/commit/d3cbe85579c94390429277a7118c12d29be70124) — core ANU course planner implementation

I then asked the agent to improve the visual hierarchy and make the prototype feel more like a student-facing university planning tool rather than a generic CRUD interface.

The second phase improved:

* page hierarchy
* course cards
* empty state
* add-course form
* responsive layout
* ANU-inspired visual language
* accessibility labels
* secondary styling for Remove actions

It also added edge-case verification for invalid course data and database persistence.

This phase was committed as:

* [`7b18be9`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-jojo111111111025/commit/7b18be9f88855fb64e4b2446b2c10b3002ff4373) — UI polish and edge-case verification

## Verification and correction

I did not treat passing tests as sufficient evidence that the system worked.

The agent tested the main add/remove flow through the API and then restarted the server to verify that courses remained in SQLite. I also checked invalid inputs such as empty course codes, empty titles, invalid units, and invalid course IDs.

During UI testing, an existing test needed to account for attributes on the rendered `<li>` element. The test was corrected without weakening its underlying assertion.

The final verification at this stage was:

* `pnpm check`
* Astro type checking
* production build
* automated tests
* accessibility checks
* broken-link checks
* persistence after restart

The resulting test suite passed all 28 tests.

## Iteration

After seeing that the first version was technically functional but visually close to a basic CRUD application, I refined the concept rather than expanding the technical scope.

The next feature was a simple distinction between **Core** and **Elective** courses. This adds useful planning information while keeping the same database/API architecture and does not turn the prototype into a full degree-planning system. It carries the same commitment to verification as the two committed passes above: the schema change defaults existing rows to `"core"` so it doesn't break old data, the load-summary logic lives in its own unit-tested module, and the existing end-to-end test was extended to check the new numbers move correctly rather than just trusting the UI.

This phase was committed as:

* [`f1f6aa9`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-jojo111111111025/commit/f1f6aa9395a5c00261bdbaaf88bff7151ff1e14e) — Core/Elective classification and study-load summary

The main breakthrough was therefore not adding more ANU functionality, but making the existing small slice communicate a clearer student need.
