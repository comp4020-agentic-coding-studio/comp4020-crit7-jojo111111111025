# ANU course planner

A small full-stack prototype for planning a semester before you enrol: add
the courses you're considering to a plan, see them listed with their unit
value, and remove any you change your mind about. There's no login and no
real enrolment behind it — the plan is just a shared shortlist, backed by
SQLite through Drizzle, that survives a reload.

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

What's enforced by `spec/course-planner.test.ts`: adding a course redirects
back to the plan, a fresh page load still shows it, removing it redirects
back too, and a further reload no longer shows it. `spec/invariants.test.ts`
and `spec/readme.test.ts` (shipped with the starter) hold the usual bar for
any page here — landmark navigation, one heading, a real title, alt text, and
an axe-core accessibility pass. Anything beyond that — whether a shared plan
with no accounts is the right trust model for a real deployment, whether
units-only is enough detail for a course — is a judgement call, not a test.
