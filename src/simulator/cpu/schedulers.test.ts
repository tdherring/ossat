import { describe, expect, it } from "vitest";
import FCFS from "./non_preemptive/fcfs";
import Priority from "./non_preemptive/priority";
import SJF from "./non_preemptive/sjf";
import RR from "./preemptive/rr";
import SRTF from "./preemptive/srtf";

const names = (scheduler: { getSchedule: () => { processName: string }[] }) =>
  scheduler.getSchedule().map(({ processName }) => processName);

describe("non-preemptive CPU schedulers", () => {
  it("FCFS preserves arrival order and records idle periods", () => {
    const scheduler = new FCFS();
    scheduler.createProcess("P2", 4, 1);
    scheduler.createProcess("P1", 2, 2);
    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule()).toEqual([
      { processName: "IDLE", timeDelta: 0, arrivalTime: null, burstTime: 2, remainingTime: null },
      { processName: "P1", timeDelta: 2, arrivalTime: 2, burstTime: 2, remainingTime: 0 },
      { processName: "P2", timeDelta: 4, arrivalTime: 4, burstTime: 1, remainingTime: 0 },
    ]);
  });

  it("SJF lets a running job finish before selecting the shortest waiting job", () => {
    const scheduler = new SJF();
    scheduler.createProcess("long", 0, 4);
    scheduler.createProcess("short", 1, 1);
    scheduler.createProcess("medium", 1, 2);
    scheduler.dispatchProcesses();

    expect(names(scheduler)).toEqual(["long", "short", "medium"]);
  });

  it("SJF records idle time before selecting its first job", () => {
    const scheduler = new SJF();
    scheduler.createProcess("P1", 2, 1);
    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule()[0]).toEqual({
      processName: "IDLE",
      timeDelta: 0,
      arrivalTime: null,
      burstTime: 2,
      remainingTime: null,
    });
  });

  it("Priority uses priority for the next waiting job without preemption", () => {
    const scheduler = new Priority();
    scheduler.createProcess("running", 0, 3, 5);
    scheduler.createProcess("normal", 1, 1, 3);
    scheduler.createProcess("urgent", 1, 2, 1);
    scheduler.dispatchProcesses();

    expect(names(scheduler)).toEqual(["running", "urgent", "normal"]);
  });

  it("Priority records idle time and includes priority metadata", () => {
    const scheduler = new Priority();
    scheduler.createProcess("P1", 2, 1, 4);
    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule()).toEqual([
      { processName: "IDLE", timeDelta: 0, arrivalTime: null, burstTime: 2, remainingTime: null },
      {
        processName: "P1",
        timeDelta: 2,
        arrivalTime: 2,
        burstTime: 1,
        remainingTime: 0,
        priority: 4,
      },
    ]);
  });
});

describe("preemptive CPU schedulers", () => {
  it("RR rotates processes and respects an updated quantum", () => {
    const scheduler = new RR();
    scheduler.setTimeQuantum(2);
    scheduler.createProcess("P1", 0, 5);
    scheduler.createProcess("P2", 0, 3);
    scheduler.dispatchProcesses();

    expect(
      scheduler.getSchedule().map(({ processName, burstTime }) => [processName, burstTime]),
    ).toEqual([
      ["P2", 2],
      ["P1", 2],
      ["P2", 1],
      ["P1", 2],
      ["P1", 1],
    ]);
  });

  it("RR records idle time before the first arrival", () => {
    const scheduler = new RR(1);
    scheduler.createProcess("P1", 3, 1);
    scheduler.dispatchProcesses();

    expect(scheduler.getSchedule()).toEqual([
      { processName: "IDLE", timeDelta: 0, arrivalTime: null, burstTime: 3, remainingTime: null },
      { processName: "P1", timeDelta: 3, arrivalTime: 3, burstTime: 1, remainingTime: 0 },
    ]);
  });

  it("SRTF preempts a longer process and records later idle starts", () => {
    const scheduler = new SRTF();
    scheduler.createProcess("long", 2, 4);
    scheduler.createProcess("short", 3, 1);
    scheduler.dispatchProcesses();

    expect(names(scheduler)).toEqual(["IDLE", "long", "short", "long"]);
    expect(scheduler.getSchedule()[0]).toMatchObject({ timeDelta: 0, burstTime: 2 });
  });
});
