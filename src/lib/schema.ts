import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.
export const plannedCourses = sqliteTable("planned_courses", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text().notNull(),
  title: text().notNull(),
  units: int().notNull().default(6),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type PlannedCourse = typeof plannedCourses.$inferSelect;
