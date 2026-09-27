import { beforeAll, describe, expect, inject, it } from "vitest";
import { describeStudyLoad } from "../src/lib/plan-summary";

// The brief's core flow, driven end to end against the running app: add a
// planned course, see it persist across a fresh page load, remove it, and
// see it gone. A red run here means the planner's persistence contract is
// broken, not just a UI glitch.
const baseUrl = inject("baseUrl");

// Astro checks form POSTs carry a same-origin Origin header (CSRF
// protection); browsers send it automatically, a bare fetch doesn't.
const post = (path: string, body?: URLSearchParams) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });

// The plan summary's numbers are exposed as data attributes on the summary
// card specifically so tests can read them without parsing prose copy. We
// still assert by delta against a captured baseline, not an absolute value —
// other courses may already be planned when this suite runs.
interface PlanSummarySnapshot {
  count: number;
  totalUnits: number;
  loadLabel: string;
  coreCount: number;
  electiveCount: number;
}

const planSummary = async (): Promise<PlanSummarySnapshot> => {
  const html = await (await fetch(baseUrl)).text();
  const match = html.match(
    /class="plan-summary"\s+data-course-count="(\d+)"\s+data-total-units="(\d+)"\s+data-load-label="([^"]+)"\s+data-core-count="(\d+)"\s+data-elective-count="(\d+)"/,
  );
  expect(match, "couldn't find the plan summary's data attributes").not.toBeNull();
  return {
    count: Number(match![1]),
    totalUnits: Number(match![2]),
    loadLabel: match![3],
    coreCount: Number(match![4]),
    electiveCount: Number(match![5]),
  };
};

// Finds the <li> for a given probe code, wherever it sits among however many
// other courses are already planned.
const findCourseCard = (html: string, code: string): string | undefined => {
  const items = html.match(/<li[^>]*>[^]*?<\/li>/g) ?? [];
  return items.find((li) => li.includes(code));
};

describe("identity", () => {
  it("presents the planner's name, tagline, and semester context", async () => {
    const html = await (await fetch(baseUrl)).text();
    expect(html).toContain("ANU Semester Planner");
    expect(html).toContain("Plan your semester before you enrol.");
    expect(html).toContain("Semester 2, 2026");
  });
});

describe("course planner", () => {
  let code: string;
  let baseline: PlanSummarySnapshot;

  beforeAll(async () => {
    code = `PROBE${process.hrtime.bigint()}`;
    baseline = await planSummary();
  });

  it("adds a course and redirects back to the plan", async () => {
    const res = await post(
      "/api/courses",
      new URLSearchParams({ code, title: "Spec Probe Course", units: "6" }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");
  });

  it("persists the course: a fresh page load includes it", async () => {
    const res = await fetch(baseUrl);
    const html = await res.text();
    expect(html).toContain(code);
    expect(html).toContain("Spec Probe Course");
  });

  it("reflects the added course in the plan summary's count, units, load label, and core/elective split", async () => {
    const after = await planSummary();
    expect(after.count).toBe(baseline.count + 1);
    expect(after.totalUnits).toBe(baseline.totalUnits + 6);
    expect(after.loadLabel).toBe(describeStudyLoad(after.totalUnits));
    // No type was submitted, so it defaults to core.
    expect(after.coreCount).toBe(baseline.coreCount + 1);
    expect(after.electiveCount).toBe(baseline.electiveCount);
  });

  it("removes the course and it no longer appears on reload", async () => {
    const page = await fetch(baseUrl);
    const html = await page.text();

    const item = findCourseCard(html, code);
    expect(item, "couldn't find the probe course's <li> on the page").toBeTruthy();
    const idMatch = item!.match(/\/api\/courses\/(\d+)\/delete"/);
    expect(idMatch, "couldn't find the probe course's delete form action").not.toBeNull();
    const id = idMatch![1];

    const res = await post(`/api/courses/${id}/delete`);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");

    const after = await fetch(baseUrl);
    expect(await after.text()).not.toContain(code);
  });

  it("returns the plan summary to its baseline after removal", async () => {
    const after = await planSummary();
    expect(after).toEqual(baseline);
  });
});

describe("course type", () => {
  // Adds a probe course with the given `type` form value (omitted entirely
  // when undefined, to test the "missing" case distinctly from "invalid"),
  // then returns its rendered <li> and a cleanup function that removes it.
  const addProbe = async (
    code: string,
    type: string | undefined,
  ): Promise<{ card: string; cleanup: () => Promise<void> }> => {
    const body = new URLSearchParams({ code, title: "Type Probe", units: "6" });
    if (type !== undefined) body.set("type", type);
    await post("/api/courses", body);

    const html = await (await fetch(baseUrl)).text();
    const card = findCourseCard(html, code);
    expect(card, `couldn't find ${code}'s <li> on the page`).toBeTruthy();

    const idMatch = card!.match(/\/api\/courses\/(\d+)\/delete"/);
    expect(idMatch, `couldn't find ${code}'s delete form action`).not.toBeNull();
    const id = idMatch![1];

    return { card: card!, cleanup: () => post(`/api/courses/${id}/delete`).then(() => undefined) };
  };

  it("adds a Core course and shows the Core badge", async () => {
    const code = `PCORE${process.hrtime.bigint()}`;
    const { card, cleanup } = await addProbe(code, "core");
    expect(card).toContain("type-badge--core");
    expect(card).toContain(">Core<");
    await cleanup();
  });

  it("adds an Elective course and shows the Elective badge", async () => {
    const code = `PELEC${process.hrtime.bigint()}`;
    const { card, cleanup } = await addProbe(code, "elective");
    expect(card).toContain("type-badge--elective");
    expect(card).toContain(">Elective<");
    await cleanup();
  });

  it("defaults a missing course type to Core", async () => {
    const code = `PMISS${process.hrtime.bigint()}`;
    const { card, cleanup } = await addProbe(code, undefined);
    expect(card).toContain("type-badge--core");
    await cleanup();
  });

  it("defaults an invalid course type to Core rather than rejecting the submission", async () => {
    const code = `PBAD${process.hrtime.bigint()}`;
    const { card, cleanup } = await addProbe(code, "not-a-real-type");
    expect(card).toContain("type-badge--core");
    await cleanup();
  });

  it("persists the course type across a fresh page load", async () => {
    const code = `PPERS${process.hrtime.bigint()}`;
    const { cleanup } = await addProbe(code, "elective");

    const html = await (await fetch(baseUrl)).text();
    const card = findCourseCard(html, code);
    expect(card, "couldn't find the probe course's <li> on reload").toBeTruthy();
    expect(card).toContain("type-badge--elective");

    await cleanup();
  });
});
