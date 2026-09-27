// Pure presentation logic for the plan summary, kept out of index.astro so it
// can be unit-tested directly (spec/plan-summary.test.ts) without booting the
// server. The 24-unit reference is a planning aid, not an ANU enrolment rule.
export type StudyLoadLabel = "Light load" | "Standard load" | "Full load" | "Above 24 units";

export const PLANNING_LOAD_REFERENCE_UNITS = 24;

export function describeStudyLoad(totalUnits: number): StudyLoadLabel {
  if (totalUnits > 24) return "Above 24 units";
  if (totalUnits >= 19) return "Full load";
  if (totalUnits >= 7) return "Standard load";
  return "Light load";
}

export interface PlanSummary {
  count: number;
  totalUnits: number;
  loadLabel: StudyLoadLabel;
  coreCount: number;
  electiveCount: number;
}

export function summarizePlan(courses: { units: number; type: "core" | "elective" }[]): PlanSummary {
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
  const coreCount = courses.filter((course) => course.type === "core").length;
  const electiveCount = courses.length - coreCount;
  return {
    count: courses.length,
    totalUnits,
    loadLabel: describeStudyLoad(totalUnits),
    coreCount,
    electiveCount,
  };
}
