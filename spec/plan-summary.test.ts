import { describe, expect, it } from "vitest";
import { describeStudyLoad, summarizePlan } from "../src/lib/plan-summary";

// Pure-function tests for the plan summary's numbers and study-load label —
// no server or database involved, so these can't be flaky against shared
// test-run state the way an HTTP assertion on aggregate totals would be.
describe("describeStudyLoad", () => {
  it("labels 0-6 units a light load", () => {
    expect(describeStudyLoad(0)).toBe("Light load");
    expect(describeStudyLoad(6)).toBe("Light load");
  });

  it("labels 7-18 units a standard load", () => {
    expect(describeStudyLoad(7)).toBe("Standard load");
    expect(describeStudyLoad(18)).toBe("Standard load");
  });

  it("labels 19-24 units a full load", () => {
    expect(describeStudyLoad(19)).toBe("Full load");
    expect(describeStudyLoad(24)).toBe("Full load");
  });

  it("flags anything over 24 units instead of asserting an official rule", () => {
    expect(describeStudyLoad(25)).toBe("Above 24 units");
    expect(describeStudyLoad(30)).toBe("Above 24 units");
  });
});

describe("summarizePlan", () => {
  it("summarizes an empty plan", () => {
    expect(summarizePlan([])).toEqual({
      count: 0,
      totalUnits: 0,
      loadLabel: "Light load",
      coreCount: 0,
      electiveCount: 0,
    });
  });

  it("summarizes a plan with courses, split by core and elective", () => {
    expect(
      summarizePlan([
        { units: 6, type: "core" },
        { units: 12, type: "elective" },
      ]),
    ).toEqual({
      count: 2,
      totalUnits: 18,
      loadLabel: "Standard load",
      coreCount: 1,
      electiveCount: 1,
    });
  });
});
