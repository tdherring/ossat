import CPUProcess from "./cpu_process";
import CPUPriorityProcess from "./cpu_priority_process";

export interface ScheduleEntry {
  processName: string;
  timeDelta: number;
  arrivalTime: number | null;
  burstTime: number;
  remainingTime: number | null;
  priority?: number | null;
}

class CPUScheduler {
  protected jobQueue: CPUProcess[] = [];
  protected schedule: ScheduleEntry[] = [];
  protected readyQueue: CPUProcess[] = [];
  // Job and Ready Queue at each time delta (index = time delta).
  protected allReadyQueues: CPUProcess[][] = [];
  protected allJobQueues: CPUProcess[][] = [];

  createProcess(
    name: string,
    arrivalTime: number,
    burstTime: number,
    priority: number | null = null,
  ) {
    if (this.jobQueue.some((process) => process.name === name)) {
      console.warn(
        "You can't have two processes with the same ID. Skipping (" +
          name +
          ", " +
          arrivalTime +
          ", " +
          burstTime +
          ", " +
          (priority == null ? null : ", " + priority) +
          ") and continuing silently.",
      );
      return;
    }
    // If process given priority, create a PriorityProcess object (left), otherwise create a standard Process object (right).
    this.jobQueue.push(
      priority === null
        ? new CPUProcess(name, arrivalTime, burstTime)
        : new CPUPriorityProcess(name, arrivalTime, burstTime, priority),
    );
  }

  removeProcess(name: string) {
    this.jobQueue = this.jobQueue.filter((process) => process.name !== name);
  }

  reset() {
    this.jobQueue = [];
    this.schedule = [];
    this.readyQueue = [];
    this.allReadyQueues = [];
    this.allJobQueues = [];
  }

  getSchedule() {
    return this.schedule;
  }

  getJobQueue(timeDelta: number | null = null) {
    if (timeDelta !== null) return this.allJobQueues[timeDelta];
    return this.jobQueue;
  }

  getReadyQueue(timeDelta: number | null = null) {
    if (timeDelta !== null) return this.allReadyQueues[timeDelta];
    return this.readyQueue;
  }

  getAllJobQueues() {
    return this.allJobQueues;
  }

  getAllReadyQueues() {
    return this.allReadyQueues;
  }

  /**
   * Extracts all processes available at the current time delta.
   *
   * @param jobQueue The job queue to filter.
   * @param timeDelta The value to check availability against.
   * @returns An array of available Processes.
   */
  getAvailableProcesses(timeDelta: number, keepCompleteProcesses = false) {
    return this.jobQueue.filter(
      (process) =>
        process.getArrivalTime() <= timeDelta &&
        (keepCompleteProcesses || process.getRemainingTime() > 0),
    );
  }

  hasIncompleteProcesses() {
    return this.jobQueue.some((process) => process.getRemainingTime() !== 0);
  }

  saveQueueState() {
    this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
    this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
  }

  /**
   * Sorts the job queue by burst time as required by SJF.
   * Burst times the same? - Soonest arriving first.
   * Burst and arrival times the same? - Lexicographic order, ie: a > c.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by burst time.
   */
  sortProcessesByBurstTime(jobQueue: CPUProcess[]) {
    return jobQueue.sort(
      (a, b) =>
        a.getBurstTime() - b.getBurstTime() ||
        a.getArrivalTime() - b.getArrivalTime() ||
        a.getName().localeCompare(b.getName()),
    );
  }

  /**
   * Sorts the job queue by arrival time as required by FCFS/SJF/RR.
   * Arrival times the same? - Shortest burst time first.
   * Arrival and Burst times the same? - Lexicographic order, ie: a > c.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by arrival time.
   */
  sortProcessesByArrivalTime(jobQueue: CPUProcess[]) {
    return jobQueue.sort(
      (a, b) =>
        a.getArrivalTime() - b.getArrivalTime() ||
        a.getBurstTime() - b.getBurstTime() ||
        a.getName().localeCompare(b.getName()),
    );
  }

  /**
   * Sorts the job queue by priority as required by the Priority Scheduler.
   * Priorities times the same? - Soonest arriving first.
   * Priorities and Arrival times the same? - Shortest burst time first.
   * Priorities, Arrival, and Burst times the same? - Lexicographic order, ie: a > c.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by burst time.
   */
  sortProcessesByPriority(jobQueue: CPUProcess[]) {
    if (
      !jobQueue.every(
        (process): process is CPUPriorityProcess => process instanceof CPUPriorityProcess,
      )
    ) {
      throw new TypeError("Priority queues can only contain priority processes.");
    }
    return jobQueue.sort(
      (a, b) =>
        a.getPriority() - b.getPriority() ||
        a.getArrivalTime() - b.getArrivalTime() ||
        a.getBurstTime() - b.getBurstTime() ||
        a.getName().localeCompare(b.getName()),
    );
  }

  /**
   * Sorts the job queue by arrival time as required by SRTF
   * Remaining times the same? - Soonest arriving first.
   * Remaining and Arrival times the same? - Shortest burst time first.
   * Remaining, Arrival, and Burst times the same? - Lexicographic order, ie: a > c.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by arrival time.
   */
  sortProcessesByRemainingTime(jobQueue: CPUProcess[]) {
    return jobQueue.sort(
      (a, b) =>
        a.getRemainingTime() - b.getRemainingTime() ||
        a.getArrivalTime() - b.getArrivalTime() ||
        a.getBurstTime() - b.getBurstTime() ||
        a.getName().localeCompare(b.getName()),
    );
  }

  /**
   * Outputs a graphical representation of the schedule.
   * Primarily for visualization during testing.
   *
   * Example of an FCFS schedule:
   *
   * 0   1   2         5      7               12           16
   * | - | - | -  -  - | -  - | -  -  -  -  - | -  -  -  - |
   *  p2         p3       p1         p4             p5
   */
  outputGraphicalRepresentation() {
    if (this.schedule.length === 0) return;
    let timingStr = "";
    let scheduleStr = "";
    let processStr = "";
    let timeDelta = 0;
    let burstTime = 0;
    for (const entry of this.schedule) {
      timeDelta = entry.timeDelta;
      burstTime = entry.burstTime;
      const processName = entry.processName;
      timingStr += timeDelta;
      scheduleStr += "|";
      for (let j = 0; j < burstTime; j++) {
        scheduleStr += " - ";
        timingStr += "   ";
      }
      timingStr = timingStr.slice(0, timingStr.length + 1 - timeDelta.toString().length);
      for (let j = 0; j < burstTime * 3; j++) {
        if (j === Math.floor((burstTime * 3) / 2)) {
          processStr += processName === "IDLE" ? "  " : processName;
        } else {
          processStr += " ";
        }
      }
    }
    timingStr += timeDelta + burstTime;
    scheduleStr += "|";
    console.debug("\n" + timingStr);
    console.debug(scheduleStr);
    console.debug(processStr);
  }
}

export default CPUScheduler;
