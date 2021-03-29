import CPUScheduler from "../cpu_scheduler.mjs";

class FCFS extends CPUScheduler {
  constructor(speedMultiplier) {
    super(speedMultiplier);
  }

  /**
   * Generator function. Dispatches the processes one at a time (with the given delay).
   *
   * Uses an async method and Promise to achieve non-blocking sleep. This simulates the
   * duration of a CPU burst.
   */
  async *dispatchProcesses(verbose = false) {
    verbose ? console.log("OSSAT-FCFS\n-----------------------------------------") : null;
    this.processQueue = this.sortProcessesByArrivalTime(this.processQueue);
    let timeDelta = 0;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let numIters = this.processQueue.length;

    // Iterate over the processes which have been sorted in order of their arrival time above.
    for (let i = 0; i < numIters; i++) {
      let p = this.processQueue[i];
      let name = p.getName();
      let burstTime = p.getBurstTime();
      let arrivalTime = p.getArrivalTime();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        await sleep(((arrivalTime - timeDelta) * 1000) / this.speedMultiplier);
        timeDelta += arrivalTime - timeDelta;
      }

      verbose ? console.log("[" + timeDelta + "] Spawned Process", name) : null;

      // Simulate the actual execution of the process.
      await sleep((burstTime * 1000) / this.speedMultiplier);

      // Keep track of the current time of execution.
      timeDelta += burstTime;

      verbose ? console.log("[" + timeDelta + "] Process", name, "Finished executing!") : null;

      // Yield necessary values to the generator function caller.
      yield { processName: name, timeDelta: timeDelta, burstTime: burstTime, arrivalTime: arrivalTime };
    }
  }
}

// Syntax for use on frontend.

let test_fcfs = new FCFS(3);

test_fcfs.createProcess("p1", 2, 2);
test_fcfs.createProcess("p2", 1, 0);
test_fcfs.createProcess("p3", 3, 2);
test_fcfs.createProcess("p4", 5, 3);
test_fcfs.createProcess("p5", 4, 4);

let dispatcher = test_fcfs.dispatchProcesses(true);

// Can use .next() to step through the generator (this will be useful in the UI!)

// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));

dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
