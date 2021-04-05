import Process from "./process.mjs";

class PriorityProcess extends Process {
  constructor(name, arrivalTime, burstTime, priority) {
    super(name, arrivalTime, burstTime);
    this.priority = priority;
  }

  getPriority() {
    return this.priority;
  }
}

export default PriorityProcess;
