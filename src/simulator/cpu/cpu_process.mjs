class CPUProcess {
  constructor(name, arrivalTime, burstTime) {
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

  setBurstTime(burstTime) {
    this.burstTime = burstTime;
  }

  setRemainingTime(remainingTime) {
    this.remainingTime = remainingTime;
  }
}

export default CPUProcess;
