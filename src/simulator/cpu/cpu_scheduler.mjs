import Process from "./process.mjs";
import PriorityProcess from "./priority_process.mjs";

class CPUScheduler {
  constructor() {
    this.processQueue = [];
    this.schedule = [];
  }

  createProcess(name, arrivalTime, burstTime, priority = null) {
    if (this.processQueue.filter((process) => process.name == name).length > 0) {
      console.log(
        "You can't have two processes with the same ID. Skipping (" + name + ", " + arrivalTime + ", " + burstTime + (priority == null ? null : ", " + priority) + ") and continuing silently."
      );
      return;
    }
    // If process given priority, create a PriorityProcess object, otherwise create a standard Process object.
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

  getSchedule() {
    return this.schedule;
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

  /**
   * Outputs a graphical representation of the schedule.
   * Primarily for visualization during testing.
   *
   * Example:
   *
   * 0   1   2         5      7               12           16
   * | - | - | -  -  - | -  - | -  -  -  -  - | -  -  -  - |
   *  p2         p3       p1         p4             p5
   */
  outputGraphicalRepresentation() {
    let timingStr = "";
    let scheduleStr = "";
    let processStr = "";
    for (let i = 0; i < this.schedule.length; i++) {
      let timeDelta = this.schedule[i]["timeDelta"];
      let burstTime = this.schedule[i]["burstTime"];
      let processName = this.schedule[i]["processName"];
      timingStr += timeDelta;
      scheduleStr += "|";
      for (let j = 0; j < burstTime; j++) {
        scheduleStr += " - ";
        timingStr += "   ";
      }
      timingStr = timingStr.substr(0, timingStr.length + 1 - timeDelta.toString().length);
      for (let j = 0; j < burstTime * 3; j++) {
        if (j == Math.floor((burstTime * 3) / 2)) {
          if (processName == "IDLE") {
            processStr += "  ";
          } else {
            processStr += processName;
          }
        } else {
          processStr += " ";
        }
      }
    }
    timingStr += this.schedule[this.schedule.length - 1]["timeDelta"] + this.schedule[this.schedule.length - 1]["burstTime"];
    scheduleStr += "|";
    console.log("");
    console.log(timingStr);
    console.log(scheduleStr);
    console.log(processStr);
  }
}

export default CPUScheduler;
