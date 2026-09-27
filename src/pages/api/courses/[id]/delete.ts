import type { APIRoute } from "astro";
import { removeCourse } from "../../../../lib/db";

// A dedicated sub-route rather than a DELETE handler: plain HTML forms only
// ever POST, so a course's "Remove" button posts here and gets redirected
// straight back to the page, re-rendered from the database.
export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);
  if (Number.isInteger(id)) {
    removeCourse(id);
  }
  return redirect("/", 303);
};
