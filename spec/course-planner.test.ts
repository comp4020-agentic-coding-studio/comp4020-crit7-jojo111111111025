import { beforeAll, describe, expect, inject, it } from "vitest";

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

describe("course planner", () => {
  let code: string;

  beforeAll(() => {
    code = `PROBE${process.hrtime.bigint()}`;
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

  it("removes the course and it no longer appears on reload", async () => {
    const page = await fetch(baseUrl);
    const html = await page.text();

    // Find the <li> that mentions the probe code, then read its own delete
    // form's id — not just the nearest one in the document — so this stays
    // correct however many other courses are already in the plan.
    const items = html.match(/<li[^>]*>[^]*?<\/li>/g) ?? [];
    const item = items.find((li) => li.includes(code));
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
});
