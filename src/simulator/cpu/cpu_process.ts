class CPUProcess {
  readonly name: string;
  readonly arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  readonly timeAdded: number;
  readonly priority?: number;

  constructor(name: string, arrivalTime: number, burstTime: number) {
    this.name = name;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.remainingTime = burstTime;
    this.timeAdded = Date.now();
  }

  getName() {
    return this.name;
  }

  getArrivalTime() {
    return this.arrivalTime;
  }

  getBurstTime() {
    return this.burstTime;
  }

  getRemainingTime() {
    return this.remainingTime;
  }

  setBurstTime(burstTime: number) {
    this.burstTime = burstTime;
  }

  setRemainingTime(remainingTime: number) {
    this.remainingTime = remainingTime;
  }
}

export default CPUProcess;
