import { describe, expect, it } from "vitest";
import {
  constrainDiskGeometry,
  simulateDiskScheduling,
  type DiskSchedulingPolicy,
} from "./diskSchedulingSimulation";

const requests = [98, 183, 37, 122, 14, 124, 65, 67];

const requestOrder = (policy: DiskSchedulingPolicy) =>
  simulateDiskScheduling(requests, 53, 199, policy, "right")
    .filter(({ kind }) => kind === "request")
    .map(({ cylinder }) => cylinder);

describe("simulateDiskScheduling", () => {
  it("preserves request order for FCFS and accumulates movement", () => {
    const trace = simulateDiskScheduling([98, 183, 37], 53, 199, "FCFS", "right");

    expect(trace.map(({ cylinder }) => cylinder)).toEqual([53, 98, 183, 37]);
    expect(trace.map(({ movement }) => movement)).toEqual([0, 45, 85, 146]);
    expect(trace.at(-1)?.cumulativeMovement).toBe(276);
  });

  it("chooses the closest pending request for SSTF", () => {
    expect(requestOrder("SSTF")).toEqual([65, 67, 37, 14, 98, 122, 124, 183]);
  });

  it.each([
    ["SCAN", [65, 67, 98, 122, 124, 183, 37, 14], [199]],
    ["C-SCAN", [65, 67, 98, 122, 124, 183, 14, 37], [199, 0]],
    ["LOOK", [65, 67, 98, 122, 124, 183, 37, 14], []],
    ["C-LOOK", [65, 67, 98, 122, 124, 183, 14, 37], []],
  ] satisfies [DiskSchedulingPolicy, number[], number[]][])(
    "%s follows the expected request and boundary order",
    (policy, expectedRequests, expectedBoundaries) => {
      const trace = simulateDiskScheduling(requests, 53, 199, policy, "right");

      expect(
        trace.filter(({ kind }) => kind === "request").map(({ cylinder }) => cylinder),
      ).toEqual(expectedRequests);
      expect(
        trace.filter(({ kind }) => kind === "boundary").map(({ cylinder }) => cylinder),
      ).toEqual(expectedBoundaries);
    },
  );

  it("services duplicate requests independently", () => {
    const trace = simulateDiskScheduling([40, 40], 50, 199, "SSTF", "left");

    expect(trace.filter(({ kind }) => kind === "request")).toHaveLength(2);
    expect(trace.at(-1)?.cumulativeMovement).toBe(10);
  });
});

describe("constrainDiskGeometry", () => {
  it("clamps the head when the disk is reduced", () => {
    expect(constrainDiskGeometry(20, 150)).toEqual({ maxCylinder: 20, head: 20 });
  });

  it("enforces disk and head boundaries", () => {
    expect(constrainDiskGeometry(2_000, -5)).toEqual({ maxCylinder: 999, head: 0 });
    expect(constrainDiskGeometry(Number.NaN, 150)).toEqual({ maxCylinder: 199, head: 150 });
  });
});
