import Process from "./process.mjs";
import PriorityProcess from "./priority_process.mjs";

class CPUScheduler {
  constructor(speedMultiplier = 1) {
    this.processQueue = [];
    this.speedMultiplier = speedMultiplier;
  }

  createProcess(name, arrivalTime, burstTime, priority = null) {
    if (this.processQueue.filter((process) => process.name == name).length > 0) {
      console.log(
        "You can't have two processes with the same ID. Skipping (" + name + ", " + arrivalTime + ", " + burstTime + (priority == null ? null : ", " + priority) + ") and continuing silently."
      );
      return;
    }
    this.processQueue.push(priority == null ? new Process(name, arrivalTime, burstTime) : new PriorityProcess(name, arrivalTime, burstTime, priority));
  }

  clearProcesses() {
    this.processQueue = [];
  }

  getProcessNames() {
    return Object.keys(this.processQueue);
  }

  getProcessBurstTimes() {
    return Object.values(this.processQueue);
  }

  /**
   * Extracts all processes available at the current time delta.
   *
   * @param processQueue The process queue to filter.
   * @param timeDelta The value to check availability against.
   * @returns An array of available Processes.
   */
  getAvailableProcesses(processQueue, timeDelta) {
    return processQueue.filter((process) => process.getArrivalTime() <= timeDelta);
  }

  /**
   * Sorts the process queue by burst time as required by SJF.
   * If burst times of two processes same, take the one which is first lexographically.
   *
   * @param processQueue The queue to sort.
   * @return An array of Processes, sorted by burst time.
   */
  sortProcessesByBurstTime(processQueue) {
    return processQueue.sort((a, b) => {
      if (a.getBurstTime() > b.getBurstTime()) {
        return 1;
      } else if (a.getBurstTime() == b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }

  /**
   * Sorts the process queue by arrival time as required by FCFS/SJF.
   * If burst / arrival times of two processes same, take the one which is first lexographically.
   *
   * @param processQueue The queue to sort.
   * @return An array of Processes, sorted by arrival time.
   */
  sortProcessesByArrivalTime(processQueue) {
    return processQueue.sort((a, b) => {
      if (a.getArrivalTime() > b.getArrivalTime()) {
        return 1;
      } else if (a.getArrivalTime() == b.getArrivalTime() && a.getBurstTime() == b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }
}

export default CPUScheduler;
