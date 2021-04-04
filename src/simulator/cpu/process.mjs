class Process {
  constructor(name, arrivalTime, burstTime) {
    this.name = name;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
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
}

export default Process;
