import { afterEach, describe, expect, it, vi } from "vitest";
import CPUProcess from "./cpu_process";
import CPUPriorityProcess from "./cpu_priority_process";
import CPUScheduler, { type ScheduleEntry } from "./cpu_scheduler";

class TestScheduler extends CPUScheduler {
  addScheduleEntry(entry: ScheduleEntry) {
    this.schedule.push(entry);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CPU process models", () => {
  it("exposes process state and permits execution counters to change", () => {
    const process = new CPUProcess("P1", 2, 5);

    expect(process.getName()).toBe("P1");
    expect(process.getArrivalTime()).toBe(2);
    expect(process.getBurstTime()).toBe(5);
    expect(process.getRemainingTime()).toBe(5);

    process.setBurstTime(4);
    process.setRemainingTime(3);

    expect(process.getBurstTime()).toBe(4);
    expect(process.getRemainingTime()).toBe(3);
  });

  it("adds a priority to priority processes", () => {
    const process = new CPUPriorityProcess("P1", 0, 1, 7);

    expect(process).toBeInstanceOf(CPUProcess);
    expect(process.getPriority()).toBe(7);
  });
});

describe("CPUScheduler", () => {
  it("creates, finds, and removes available processes", () => {
    const scheduler = new CPUScheduler();
    scheduler.createProcess("late", 3, 2);
    scheduler.createProcess("now", 0, 1);

    expect(scheduler.getAvailableProcesses(0).map(({ name }) => name)).toEqual(["now"]);
    expect(scheduler.hasIncompleteProcesses()).toBe(true);

    scheduler.removeProcess("now");
    expect(scheduler.getJobQueue().map(({ name }) => name)).toEqual(["late"]);
  });

  it("ignores duplicate process names", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const scheduler = new CPUScheduler();

    scheduler.createProcess("P1", 0, 2);
    scheduler.createProcess("P1", 1, 9);

    expect(scheduler.getJobQueue()).toHaveLength(1);
    expect(warning).toHaveBeenCalledOnce();
  });

  it("sorts processes deterministically using each policy's tie-breakers", () => {
    const scheduler = new CPUScheduler();
    const a = new CPUProcess("A", 2, 3);
    const b = new CPUProcess("B", 0, 3);
    const c = new CPUProcess("C", 0, 1);
    a.setRemainingTime(1);
    b.setRemainingTime(2);
    c.setRemainingTime(2);

    expect(scheduler.sortProcessesByArrivalTime([a, b, c]).map(({ name }) => name)).toEqual([
      "C",
      "B",
      "A",
    ]);
    expect(scheduler.sortProcessesByBurstTime([a, b, c]).map(({ name }) => name)).toEqual([
      "C",
      "B",
      "A",
    ]);
    expect(scheduler.sortProcessesByRemainingTime([c, b, a]).map(({ name }) => name)).toEqual([
      "A",
      "C",
      "B",
    ]);
  });

  it("sorts priority processes and rejects mixed queues", () => {
    const scheduler = new CPUScheduler();
    const low = new CPUPriorityProcess("low", 0, 1, 5);
    const high = new CPUPriorityProcess("high", 1, 2, 1);

    expect(scheduler.sortProcessesByPriority([low, high]).map(({ name }) => name)).toEqual([
      "high",
      "low",
    ]);
    expect(() => scheduler.sortProcessesByPriority([low, new CPUProcess("plain", 0, 1)])).toThrow(
      "Priority queues can only contain priority processes.",
    );
  });

  it("resets all scheduler state", () => {
    const scheduler = new CPUScheduler();
    scheduler.createProcess("P1", 0, 1);
    scheduler.saveQueueState();

    expect(scheduler.getAllJobQueues()).toHaveLength(1);
    expect(scheduler.getJobQueue(0)).toHaveLength(1);

    scheduler.reset();

    expect(scheduler.getJobQueue()).toEqual([]);
    expect(scheduler.getReadyQueue()).toEqual([]);
    expect(scheduler.getSchedule()).toEqual([]);
    expect(scheduler.getAllJobQueues()).toEqual([]);
    expect(scheduler.getAllReadyQueues()).toEqual([]);
  });

  it("prints a graphical schedule and skips empty schedules", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    const scheduler = new TestScheduler();

    scheduler.outputGraphicalRepresentation();
    expect(debug).not.toHaveBeenCalled();

    scheduler.addScheduleEntry({
      processName: "IDLE",
      timeDelta: 0,
      arrivalTime: null,
      burstTime: 1,
      remainingTime: null,
    });
    scheduler.addScheduleEntry({
      processName: "P1",
      timeDelta: 1,
      arrivalTime: 1,
      burstTime: 2,
      remainingTime: 0,
    });
    scheduler.outputGraphicalRepresentation();

    expect(debug).toHaveBeenCalledTimes(3);
    expect(debug.mock.calls[0][0]).toContain("0");
    expect(debug.mock.calls[1][0]).toContain("|");
    expect(debug.mock.calls[2][0]).toContain("P1");
  });
});
