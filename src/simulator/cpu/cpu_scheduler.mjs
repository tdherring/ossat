import Process from "./process.mjs";

class CPUScheduler {
  constructor(speedMultiplier = 1) {
    this.processes = [];
    this.speedMultiplier = speedMultiplier;
  }

  createProcess(name, burstTime, arrivalTime) {
    this.processes.push(new Process(name, burstTime, arrivalTime));
  }

  clearProcesses() {
    this.processes = [];
  }

  getProcessNames() {
    return Object.keys(this.processes);
  }

  getProcessBurstTimes() {
    return Object.values(this.processes);
  }
}

export default CPUScheduler;
