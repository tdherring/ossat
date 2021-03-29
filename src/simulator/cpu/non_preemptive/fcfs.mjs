import CPUScheduler from "../cpu_scheduler.mjs";

class FCFS extends CPUScheduler {
  constructor(speedMultiplier) {
    super(speedMultiplier);
  }

  /**
   * Sorts the processes by arrival time as required by FCFS.
   * If arrival times of two processes same, take the one which is first lexographically.
   */
  sortProcessesByArrivalTime() {
    this.processes = this.processes.sort((a, b) => {
      if (a.getArrivalTime() > b.getArrivalTime()) {
        return 1;
      } else if (a.getArrivalTime() == b.getArrivalTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }

  /**
   * Generator function. Dispatches the processes one at a time (with the given delay).
   *
   * Uses an async method and Promise to achieve non-blocking sleep. This simulates the
   * duration of a CPU burst.
   */
  async *dispatchProcesses() {
    this.sortProcessesByArrivalTime();
    let timeDelta = 0;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i in this.processes) {
      let p = this.processes[i];
      let name = p.getName();
      let burstTime = p.getBurstTime();
      let arrivalTime = p.getArrivalTime();

      await sleep((burstTime * 1000) / this.speedMultiplier);
      timeDelta += burstTime;
      console.log("Process", name, "finished!");
      yield { processName: name, timeDelta: timeDelta, burstTime: burstTime, arrivalTime: arrivalTime };
    }
  }
}

// Syntax for use on frontend.

let test_fcfs = new FCFS(1);

test_fcfs.createProcess("p1", 5, 0);
test_fcfs.createProcess("p2", 5, 2);
test_fcfs.createProcess("p3", 5, 1);

let dispatcher = test_fcfs.dispatchProcesses();

// Can use .next() to step through the generator (this will be useful in the UI!)

dispatcher.next().then((value) => console.log(value.value));
dispatcher.next().then((value) => console.log(value.value));
dispatcher.next().then((value) => console.log(value.value));
