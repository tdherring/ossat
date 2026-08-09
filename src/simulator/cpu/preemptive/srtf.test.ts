import { describe, expect, it } from "vitest";
import SRTF from "./srtf";

describe("SRTF", () => {
  it("rebuilds the ready queue as processes complete at different times", () => {
    const scheduler = new SRTF();
    scheduler.createProcess("P1", 0, 8);
    scheduler.createProcess("P2", 1, 4);
    scheduler.createProcess("P3", 2, 2);

    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule()).toEqual([
      { processName: "P1", timeDelta: 0, arrivalTime: 0, burstTime: 1, remainingTime: 7 },
      { processName: "P2", timeDelta: 1, arrivalTime: 1, burstTime: 1, remainingTime: 3 },
      { processName: "P3", timeDelta: 2, arrivalTime: 2, burstTime: 2, remainingTime: 0 },
      { processName: "P2", timeDelta: 4, arrivalTime: 1, burstTime: 3, remainingTime: 0 },
      { processName: "P1", timeDelta: 7, arrivalTime: 0, burstTime: 7, remainingTime: 0 },
    ]);
  });
});
