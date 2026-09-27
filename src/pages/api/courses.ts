import type { APIRoute } from "astro";
import { addCourse } from "../../lib/db";

// The write half of the planner: a plain HTML form POSTs here, the planned
// course goes into SQLite, and a 303 redirect re-renders the page from the
// database — no client-side JavaScript required.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const rawUnits = Number(form.get("units"));
  const units = Number.isInteger(rawUnits) && rawUnits > 0 ? rawUnits : 6;

  if (code && title) {
    addCourse(code.slice(0, 20).toUpperCase(), title.slice(0, 200), units);
  }

  return redirect("/", 303);
};
