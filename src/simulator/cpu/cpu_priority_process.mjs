import CPUProcess from "./cpu_process.mjs";

class CPUPriorityProcess extends CPUProcess {
  constructor(name, arrivalTime, burstTime, priority) {
    super(name, arrivalTime, burstTime);
    this.priority = priority;
  }

  getPriority() {
    return this.priority;
  }
}

export default CPUPriorityProcess;
