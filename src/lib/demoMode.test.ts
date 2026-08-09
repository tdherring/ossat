import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("data mode", () => {
  it.each([
    ["demo", true, false],
    ["api", false, true],
    ["", false, false],
  ])("recognises %j", async (mode, expectedDemo, expectedApi) => {
    vi.stubEnv("VITE_DATA_MODE", mode);

    const { isApiMode, isDemoMode } = await import("./demoMode");

    expect(isDemoMode).toBe(expectedDemo);
    expect(isApiMode).toBe(expectedApi);
  });
});
