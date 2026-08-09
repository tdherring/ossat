export const routes = {
  home: "/",
  cpuSimulator: "/simulators/cpu",
  memorySimulator: "/simulators/memory",
  virtualMemorySimulator: "/simulators/virtual-memory",
  diskSimulator: "/simulators/disk",
  assessments: "/assessments",
  learningGroups: "/learning-groups",
  activate: "/activate",
  passwordReset: "/password-reset",
  assessment: (assessmentId: string) => `/assessments/${encodeURIComponent(assessmentId)}`,
  learningGroupAssessment: (assessmentId: string) =>
    `/learning-groups/assessments/${encodeURIComponent(assessmentId)}`,
} as const;

export const simulatorPaths = new Set<string>([
  routes.cpuSimulator,
  routes.memorySimulator,
  routes.virtualMemorySimulator,
  routes.diskSimulator,
]);
