import CPUScheduler from "../simulator/cpu/cpu_scheduler";
import MemoryManager from "../simulator/memory/memory_manager";

export type CPUPolicy = "FCFS" | "SJF" | "Priority" | "RR" | "SRTF";
export type MemoryPolicy = "First Fit" | "Best Fit" | "Worst Fit";

export interface CPUProcessDemo {
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

export interface CPUDemo {
  id: string;
  label: string;
  policy: CPUPolicy;
  timeQuantum?: number;
  processes: CPUProcessDemo[];
}

export interface MemoryDemo {
  id: string;
  label: string;
  policy: MemoryPolicy;
  blocks: number[];
  processes: { name: string; size: number }[];
}

export const CPU_DEMOS = [
  {
    id: "fcfs-arrival-order",
    label: "FCFS · Arrival order",
    policy: "FCFS",
    processes: [
      { name: "Process 1", arrivalTime: 0, burstTime: 5 },
      { name: "Process 2", arrivalTime: 1, burstTime: 3 },
      { name: "Process 3", arrivalTime: 2, burstTime: 4 },
      { name: "Process 4", arrivalTime: 5, burstTime: 2 },
    ],
  },
  {
    id: "sjf-shortest-job",
    label: "SJF · Shortest job first",
    policy: "SJF",
    processes: [
      { name: "Process 1", arrivalTime: 0, burstTime: 7 },
      { name: "Process 2", arrivalTime: 0, burstTime: 2 },
      { name: "Process 3", arrivalTime: 0, burstTime: 5 },
      { name: "Process 4", arrivalTime: 0, burstTime: 3 },
    ],
  },
  {
    id: "priority-urgent-work",
    label: "Priority · Urgent arrivals",
    policy: "Priority",
    processes: [
      { name: "Process 1", arrivalTime: 0, burstTime: 5, priority: 3 },
      { name: "Process 2", arrivalTime: 1, burstTime: 3, priority: 1 },
      { name: "Process 3", arrivalTime: 2, burstTime: 4, priority: 2 },
      { name: "Process 4", arrivalTime: 3, burstTime: 2, priority: 1 },
    ],
  },
  {
    id: "rr-time-slicing",
    label: "RR · Time slicing",
    policy: "RR",
    timeQuantum: 2,
    processes: [
      { name: "Process 1", arrivalTime: 0, burstTime: 5 },
      { name: "Process 2", arrivalTime: 0, burstTime: 4 },
      { name: "Process 3", arrivalTime: 1, burstTime: 3 },
    ],
  },
  {
    id: "srtf-preemption",
    label: "SRTF · Preemption",
    policy: "SRTF",
    processes: [
      { name: "Process 1", arrivalTime: 0, burstTime: 8 },
      { name: "Process 2", arrivalTime: 1, burstTime: 4 },
      { name: "Process 3", arrivalTime: 2, burstTime: 2 },
      { name: "Process 4", arrivalTime: 3, burstTime: 1 },
    ],
  },
] satisfies CPUDemo[];

const COMPARISON_BLOCKS = [100, 500, 200, 300, 600];
const COMPARISON_PROCESSES = [
  { name: "Process 1", size: 212 },
  { name: "Process 2", size: 417 },
  { name: "Process 3", size: 112 },
  { name: "Process 4", size: 426 },
];

export const MEMORY_DEMOS = [
  {
    id: "first-fit-comparison",
    label: "First Fit · Sequential placement",
    policy: "First Fit",
    blocks: COMPARISON_BLOCKS,
    processes: COMPARISON_PROCESSES,
  },
  {
    id: "best-fit-comparison",
    label: "Best Fit · Tightest placement",
    policy: "Best Fit",
    blocks: COMPARISON_BLOCKS,
    processes: COMPARISON_PROCESSES,
  },
  {
    id: "worst-fit-comparison",
    label: "Worst Fit · Largest-block placement",
    policy: "Worst Fit",
    blocks: COMPARISON_BLOCKS,
    processes: COMPARISON_PROCESSES,
  },
] satisfies MemoryDemo[];

type DemoScheduler = CPUScheduler & { setTimeQuantum?: (timeQuantum: number) => void };

export const populateCPUDemo = <T extends CPUScheduler>(
  schedulers: Record<CPUPolicy, T>,
  demo: CPUDemo,
): T => {
  const scheduler = schedulers[demo.policy];
  scheduler.reset();
  if (demo.timeQuantum != null) (scheduler as DemoScheduler).setTimeQuantum?.(demo.timeQuantum);
  demo.processes.forEach((process) => {
    scheduler.createProcess(
      process.name,
      process.arrivalTime,
      process.burstTime,
      process.priority ?? null,
    );
  });
  return scheduler;
};

export const populateMemoryDemo = <T extends MemoryManager>(
  managers: Record<MemoryPolicy, T>,
  demo: MemoryDemo,
): T => {
  const manager = managers[demo.policy];
  manager.reset();
  demo.blocks.forEach((size) => manager.createBlock(size));
  demo.processes.forEach((process) => manager.createProcess(process.name, process.size));
  return manager;
};
