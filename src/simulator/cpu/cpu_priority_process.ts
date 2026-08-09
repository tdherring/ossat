import CPUProcess from "./cpu_process";

class CPUPriorityProcess extends CPUProcess {
  readonly priority: number;

  constructor(name: string, arrivalTime: number, burstTime: number, priority: number) {
    super(name, arrivalTime, burstTime);
    this.priority = priority;
  }

  getPriority() {
    return this.priority;
  }
}

export default CPUPriorityProcess;
