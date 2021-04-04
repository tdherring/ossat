import CPUScheduler from "../cpu_scheduler.mjs";

class SJF extends CPUScheduler {
  constructor(speedMultiplier) {
    super(speedMultiplier);
  }

  /**
   * Generator function. Dispatches the process queue one at a time (with the given delay).
   *
   * Uses an async method and Promise to achieve non-blocking sleep. This simulates the
   * duration of a CPU burst.
   *
   * @param verbose Show debugging information?
   */
  async *dispatchProcesses(verbose = false) {
    if (verbose) console.log("OSSAT-SJF\n-----------------------------------------");
    let timeDelta = 0;
    // A non blocking sleep Promise.
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let numIters = this.processQueue.length;

    for (let i = 0; i < numIters; i++) {
      // The queue of waiting processes
      let waitingQueue = this.getAvailableProcesses(this.processQueue, timeDelta);

      // Are there any available process queue?
      // Yes? - Take the shortest job first (left).
      // No? - Take next job available (right).
      waitingQueue.length != 0 ? (waitingQueue = this.sortProcessesByBurstTime(waitingQueue)) : (waitingQueue = this.sortProcessesByArrivalTime(this.processQueue));

      let p = waitingQueue[0];
      let name = p.getName();
      let arrivalTime = p.getArrivalTime();
      let burstTime = p.getBurstTime();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        await sleep(((arrivalTime - timeDelta) * 1000) / this.speedMultiplier);
        timeDelta += arrivalTime;
      }

      if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

      // Simulate the actual execution of the process.
      await sleep((burstTime * 1000) / this.speedMultiplier);

      // Keep track of the current time of execution.
      timeDelta += burstTime;

      if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");

      // Remove the process that just finished executing.
      this.processQueue = this.processQueue.filter((process) => process.name != name);

      // Yield necessary values to the generator function caller.
      yield { processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: burstTime };
    }
  }
}

// Syntax for use on frontend.

let test_sjf = new SJF(1);

test_sjf.createProcess("p1", 2, 1);
test_sjf.createProcess("p2", 1, 5);
test_sjf.createProcess("p3", 4, 1);
test_sjf.createProcess("p4", 0, 6);
test_sjf.createProcess("p5", 2, 3);

let dispatcher = test_sjf.dispatchProcesses(true);

// Can use .next() to step through the generator (this will be useful in the UI!)

// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));

dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
