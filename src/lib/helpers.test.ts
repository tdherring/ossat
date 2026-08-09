import { afterEach, describe, expect, it, vi } from "vitest";
import FCFS from "../simulator/cpu/non_preemptive/fcfs";
import FirstFit from "../simulator/memory/contiguous/first_fit";
import { getNextProcessName } from "./processName";
import { routes, simulatorPaths } from "./routes";
import {
  CPU_DEMOS,
  MEMORY_DEMOS,
  populateCPUDemo,
  populateMemoryDemo,
  type CPUPolicy,
  type MemoryPolicy,
} from "./simulationDemos";
import { getInitialTheme, getInitialThemePreference, resolveTheme } from "./theme";
import { cn } from "./utils";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("small application helpers", () => {
  it("joins truthy class names, including nested input", () => {
    expect(cn("button", false, undefined, "active", null)).toBe("button active");
  });

  it("finds the first available generated process name", () => {
    expect(getNextProcessName([])).toBe("Process 1");
    expect(getNextProcessName([{ name: "Process 1" }, { name: "Process 3" }])).toBe("Process 2");
  });

  it("encodes dynamic route segments and identifies simulator paths", () => {
    expect(routes.assessment("operating systems/1")).toBe("/assessments/operating%20systems%2F1");
    expect(routes.learningGroupAssessment("quiz #1")).toBe(
      "/learning-groups/assessments/quiz%20%231",
    );
    expect(simulatorPaths.has(routes.diskSimulator)).toBe(true);
    expect(simulatorPaths.has(routes.assessments)).toBe(false);
  });
});

describe("theme helpers", () => {
  it.each(["auto", "light", "dark"] as const)("restores the %s preference", (preference) => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => preference) });
    expect(getInitialThemePreference()).toBe(preference);
  });

  it("falls back to auto for missing or invalid saved values", () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "sepia") });
    expect(getInitialThemePreference()).toBe("auto");
  });

  it("resolves explicit and system preferences", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
  });

  it("combines stored and system preferences for the initial theme", () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "auto") });
    vi.stubGlobal("window", { matchMedia: vi.fn(() => ({ matches: true })) });
    expect(getInitialTheme()).toBe("dark");
  });
});

describe("simulation demos", () => {
  it("resets and populates the selected CPU scheduler", () => {
    const scheduler = new FCFS();
    scheduler.createProcess("stale", 0, 1);
    const schedulers = Object.fromEntries(
      (["FCFS", "SJF", "Priority", "RR", "SRTF"] satisfies CPUPolicy[]).map((policy) => [
        policy,
        scheduler,
      ]),
    ) as Record<CPUPolicy, FCFS>;

    const selected = populateCPUDemo(schedulers, CPU_DEMOS[0]);

    expect(selected).toBe(scheduler);
    expect(selected.getJobQueue().map(({ name }) => name)).toEqual(
      CPU_DEMOS[0].processes.map(({ name }) => name),
    );
  });

  it("resets and populates the selected memory manager", () => {
    const manager = new FirstFit();
    manager.createBlock(1);
    const managers = Object.fromEntries(
      (["First Fit", "Best Fit", "Worst Fit"] satisfies MemoryPolicy[]).map((policy) => [
        policy,
        manager,
      ]),
    ) as Record<MemoryPolicy, FirstFit>;

    const selected = populateMemoryDemo(managers, MEMORY_DEMOS[0]);

    expect(selected).toBe(manager);
    expect(selected.getBlocks().map(({ size }) => size)).toEqual(MEMORY_DEMOS[0].blocks);
    expect(selected.getJobQueue().map(({ name }) => name)).toEqual(
      MEMORY_DEMOS[0].processes.map(({ name }) => name),
    );
  });
});
