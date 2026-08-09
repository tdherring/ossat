import { describe, expect, it } from "vitest";
import Priority from "./priority";

describe("Priority scheduler", () => {
  it("rejects processes without a priority", () => {
    const scheduler = new Priority();

    expect(() => scheduler.createProcess("P1", 0, 1)).toThrow(
      "Priority processes require a priority value.",
    );
  });

  it("accepts and schedules priority processes", () => {
    const scheduler = new Priority();
    scheduler.createProcess("P1", 0, 2, 2);
    scheduler.createProcess("P2", 0, 1, 1);

    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule().map(({ processName }) => processName)).toEqual(["P2", "P1"]);
  });
});
