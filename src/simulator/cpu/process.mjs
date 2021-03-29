class Process {
  constructor(name, burstTime, arrivalTime) {
    this.name = name;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
  }

  getName() {
    return this.name;
  }

  getBurstTime() {
    return this.burstTime;
  }

  getArrivalTime() {
    return this.arrivalTime;
  }
}

export default Process;
