import Process from "./process.mjs";
import PriorityProcess from "./priority_process.mjs";

class CPUScheduler {
  constructor() {
    this.processQueue = [];
    this.schedule = [];
  }

  createProcess(name, arrivalTime, burstTime, priority = null) {
    if (this.processQueue.filter((process) => process.name == name).length > 0) {
      console.warn(
        "You can't have two processes with the same ID. Skipping (" + name + ", " + arrivalTime + ", " + burstTime + (priority == null ? null : ", " + priority) + ") and continuing silently."
      );
      return;
    }
    // If process given priority, create a PriorityProcess object, otherwise create a standard Process object.
    this.processQueue.push(priority == null ? new Process(name, arrivalTime, burstTime) : new PriorityProcess(name, arrivalTime, burstTime, priority));
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
        if (j == Math.floor((burstTime * 3) / 2)) {
          processName == "IDLE" ? (processStr += "  ") : (processStr += processName);
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
