# ANU Semester Planner

A small full-stack prototype for planning a semester before you enrol: add
the courses you're considering to a plan, see them listed with their unit
value and your overall study load, and remove any you change your mind
about. There's no login and no real enrolment behind it — the plan is just a
shared shortlist, backed by SQLite through Drizzle, that survives a reload.
The "Semester 2, 2026" label and the 24-unit study-load reference are
display context for the plan, not a claim about ANU's actual enrolment
rules for any given semester.

## What good looks like here

The brief was to keep this deliberately small: view a plan, add a course,
persist it, remove it, and have it still be there after a reload — not a
replica of ANU's enrolment system. So the scope is cut on purpose:

- **One shared plan, no accounts.** The starter it's built on has no auth, and
  adding real login for a planner this small would be scope creep. Everyone
  who opens the app sees and edits the same plan, the same way the starter's
  guestbook worked.
- **A course is just a code, a title, and a unit value.** No prerequisites,
  clashes, or convenor data — the point is the add/remove/persist loop, not a
  faithful course catalogue.
- **No live multi-tab sync.** The starter shipped a server-sent-events
  channel for that; this app doesn't need it, so it was removed rather than
  wired up for an unrequested feature.
- **One fixed semester label, no switcher.** "Semester 2, 2026" is static
  display context — there's one plan, not a plan-per-semester.
- **The study load is a planning reference, not an ANU rule.** The 24-unit
  figure and the Light/Standard/Full/Above-24 label are a simple, made-up
  reference for a student to plan against — not a lookup against ANU's real
  enrolment load policy.

What's enforced by `spec/course-planner.test.ts` and `spec/plan-summary.test.ts`:
adding a course redirects back to the plan, a fresh page load still shows it,
removing it redirects back too, a further reload no longer shows it, and the
plan summary's course count, total units, and study-load label update to
match. `spec/invariants.test.ts` and `spec/readme.test.ts` (shipped with the
starter) hold the usual bar for any page here — landmark navigation, one
heading, a real title, alt text, and an axe-core accessibility pass. Anything
beyond that — whether a shared plan with no accounts is the right trust model
for a real deployment, whether units-only is enough detail for a course, or
where exactly the load thresholds should sit — is a judgement call, not a
test.
