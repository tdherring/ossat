import { afterEach, describe, expect, it, vi } from "vitest";
import BestFit from "./contiguous/best_fit";
import FirstFit from "./contiguous/first_fit";
import WorstFit from "./contiguous/worst_fit";
import MemoryBlock from "./memory_block";
import MemoryManager from "./memory_manager";
import MemoryProcess from "./memory_process";

afterEach(() => vi.restoreAllMocks());

const allocatedSizes = (manager: MemoryManager) =>
  Object.fromEntries(
    Object.entries(manager.getAllocated()).map(([name, block]) => [name, block?.getSize() ?? null]),
  );

const populate = <T extends MemoryManager>(manager: T) => {
  [100, 500, 200, 300, 600].forEach((size) => manager.createBlock(size));
  [
    ["P1", 212],
    ["P2", 417],
    ["P3", 112],
    ["P4", 426],
  ].forEach(([name, size]) => manager.createProcess(name as string, size as number));
  return manager;
};

describe("memory models and manager", () => {
  it("exposes block and process properties", () => {
    const block = new MemoryBlock(128);
    const process = new MemoryProcess("P1", 64);

    expect(block.getSize()).toBe(128);
    expect(block.getTimeAdded()).toBeTypeOf("number");
    expect(process.getName()).toBe("P1");
    expect(process.getSize()).toBe(64);
    expect(process.getTimeAdded()).toBeTypeOf("number");
  });

  it("ignores duplicate processes and resets all state", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const manager = new MemoryManager();
    manager.createBlock(100);
    manager.createProcess("P1", 50);
    manager.createProcess("P1", 75);
    manager.initializeAllocations();

    expect(manager.getBlocks()).toHaveLength(1);
    expect(manager.getJobQueue()).toHaveLength(1);
    expect(manager.getProcessByName("P1")?.getSize()).toBe(50);
    expect(manager.getProcessByName("missing")).toBeUndefined();
    expect(warning).toHaveBeenCalledOnce();

    manager.reset();
    expect(manager.getBlocks()).toEqual([]);
    expect(manager.getJobQueue()).toEqual([]);
    expect(manager.getAllocated()).toEqual({});
  });
});

describe("contiguous allocation policies", () => {
  it("First Fit selects the first available block that is large enough", () => {
    const manager = populate(new FirstFit());
    manager.allocateProcesses();

    expect(allocatedSizes(manager)).toEqual({ P1: 500, P2: 600, P3: 200, P4: null });
  });

  it("Best Fit selects the smallest available block that is large enough", () => {
    const manager = populate(new BestFit());
    manager.allocateProcesses();

    expect(allocatedSizes(manager)).toEqual({ P1: 300, P2: 500, P3: 200, P4: 600 });
  });

  it("Worst Fit selects the largest available block that is large enough", () => {
    const manager = populate(new WorstFit());
    manager.allocateProcesses();

    expect(allocatedSizes(manager)).toEqual({ P1: 600, P2: 500, P3: 300, P4: null });
  });

  it.each([new FirstFit(), new BestFit(), new WorstFit()])(
    "$constructor.name records null when no block fits",
    (manager) => {
      manager.createBlock(10);
      manager.createProcess("large", 11);
      manager.allocateProcesses();

      expect(manager.getAllocated()).toEqual({ large: null });
    },
  );
});
