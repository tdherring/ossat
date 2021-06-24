import Process from "./process.mjs";
import PriorityProcess from "./priority_process.mjs";

class CPUScheduler {
  constructor() {
    this.jobQueue = [];
    this.schedule = [];
    this.readyQueue = [];
    // Job and Ready Queue at each time delta (index = time delta)
    this.allReadyQueues = [];
    this.allJobQueues = [];
  }

  createProcess(name, arrivalTime, burstTime, priority = null) {
    if (this.jobQueue.filter((process) => process.name === name).length > 0) {
      console.warn(
        "You can't have two processes with the same ID. Skipping (" + name + ", " + arrivalTime + ", " + burstTime + ", " + (priority == null ? null : ", " + priority) + ") and continuing silently."
      );
      return;
    }
    // If process given priority, create a PriorityProcess object (left), otherwise create a standard Process object (right).
    this.jobQueue.push(priority === null ? new Process(name, arrivalTime, burstTime) : new PriorityProcess(name, arrivalTime, burstTime, priority));
  }

  removeProcess(name) {
    this.jobQueue = this.jobQueue.filter((process) => {
      return process.name !== name;
    });
  }

  getSchedule() {
    return this.schedule;
  }

  getJobQueue(timeDelta = null) {
    if (timeDelta !== null) return this.allJobQueues[timeDelta];
    return this.jobQueue;
  }

  getReadyQueue(timeDelta = null) {
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
  getAvailableProcesses(timeDelta, keepCompleteProcesses = false) {
    if (keepCompleteProcesses) return this.jobQueue.filter((process) => process.getArrivalTime() <= timeDelta);
    return this.jobQueue.filter((process) => process.getArrivalTime() <= timeDelta && process.getBurstTime() > 0);
  }

  /**
   * Sorts the job queue by burst time as required by SJF.
   * If burst times of two processes same, take the one which is first lexographically.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by burst time.
   */
  sortProcessesByBurstTime(jobQueue) {
    return jobQueue.sort((a, b) => {
      if (a.getBurstTime() >= b.getBurstTime()) {
        return 1;
      } else if (a.getBurstTime() === b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }

  /**
   * Sorts the job queue by arrival time as required by FCFS/SJF/RR.
   * If burst / arrival times of two processes same, take the one which is first lexographically.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by arrival time.
   */
  sortProcessesByArrivalTime(jobQueue) {
    return jobQueue.sort((a, b) => {
      if (a.getArrivalTime() >= b.getArrivalTime()) {
        return 1;
      } else if (a.getArrivalTime() === b.getArrivalTime() && a.getBurstTime() === b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
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
    let timingStr = "";
    let scheduleStr = "";
    let processStr = "";
    let timeDelta;
    let burstTime;
    let processName;
    for (let i = 0; i < this.schedule.length; i++) {
      timeDelta = this.schedule[i]["timeDelta"];
      burstTime = this.schedule[i]["burstTime"];
      processName = this.schedule[i]["processName"];
      timingStr += timeDelta;
      scheduleStr += "|";
      for (let j = 0; j < burstTime; j++) {
        scheduleStr += " - ";
        timingStr += "   ";
      }
      timingStr = timingStr.substr(0, timingStr.length + 1 - timeDelta.toString().length);
      for (let j = 0; j < burstTime * 3; j++) {
        if (j === Math.floor((burstTime * 3) / 2)) {
          processName === "IDLE" ? (processStr += "  ") : (processStr += processName);
        } else {
          processStr += " ";
        }
      }
    }
    timingStr += timeDelta + burstTime;
    scheduleStr += "|";
    console.log("\n" + timingStr);
    console.log(scheduleStr);
    console.log(processStr);
  }
}

export default CPUScheduler;
