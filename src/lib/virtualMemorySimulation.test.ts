import { describe, expect, it } from "vitest";
import { parsePageReferences, simulateVirtualMemory } from "./virtualMemorySimulation";

describe("parsePageReferences", () => {
  it.each(["", "   ", ",,,", " , \n , "])("returns no references for %j", (input) => {
    expect(parsePageReferences(input)).toEqual([]);
  });

  it("accepts non-negative integers and rejects malformed values", () => {
    expect(parsePageReferences("0, 2  5, -1, 3.5, nope, 8")).toEqual([0, 2, 5, 8]);
  });

  it("limits workloads to forty references", () => {
    const input = Array.from({ length: 45 }, (_, page) => page).join(",");
    expect(parsePageReferences(input)).toHaveLength(40);
  });
});

describe("simulateVirtualMemory", () => {
  it("uses FIFO load order for replacement", () => {
    const trace = simulateVirtualMemory([1, 2, 3, 1, 4], 3, 2, "FIFO");

    expect(trace.at(-1)).toMatchObject({ evicted: 1, faults: 4, hits: 1 });
  });

  it("uses recent access order for LRU replacement", () => {
    const trace = simulateVirtualMemory([1, 2, 3, 1, 4], 3, 2, "LRU");

    expect(trace.at(-1)).toMatchObject({ evicted: 2, faults: 4, hits: 1 });
  });

  it("uses future references for Optimal replacement", () => {
    const trace = simulateVirtualMemory([1, 2, 3, 4, 1, 2], 3, 2, "Optimal");

    expect(trace[3]).toMatchObject({ evicted: 3, faults: 4 });
  });

  it("gives recently referenced pages a second chance with Clock", () => {
    const trace = simulateVirtualMemory([1, 2, 3, 1, 4], 3, 2, "Clock");

    expect(trace.at(-1)).toMatchObject({ evicted: 1, faults: 4, hits: 1 });
  });

  it("removes an evicted page from the TLB", () => {
    const finalStep = simulateVirtualMemory([1, 2, 3], 2, 3, "FIFO").at(-1);

    expect(finalStep?.evicted).toBe(1);
    expect(finalStep?.tlb.some(({ page }) => page === 1)).toBe(false);
  });
});
