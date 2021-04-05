import CPUScheduler from "../cpu_scheduler.mjs";

class Priority extends CPUScheduler {
  /**
   * Generator function. Dispatches the process queue one at a time (with the given delay).
   *
   * Uses an async method and Promise to achieve non-blocking sleep. This simulates the
   * duration of a CPU burst.
   *
   * @param verbose Show debugging information?
   */
  async *dispatchProcesses(verbose = false) {
    if (verbose) console.log("OSSAT-Priority\n-----------------------------------------");
    let timeDelta = 0;
    // A non blocking sleep Promise.
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let waitingQueue = this.sortProcessesByPriority(this.processQueue, timeDelta);

    for (let i = 0; i < this.processQueue.length; i++) {
      let p = this.processQueue[i];
      let name = p.getName();
      let arrivalTime = p.getArrivalTime();
      let burstTime = p.getBurstTime();
      let priority = p.getPriority();

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

      // Yield necessary values to the generator function caller.
      yield { processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: burstTime, priority: priority };
    }
  }

  /**
   * Sorts the process queue by priority as required by the Priority Scheduler.
   * If priorities / burst times of two processes same, take the one which is first lexographically.
   *
   * @param processQueue The queue to sort.
   * @return An array of Processes, sorted by burst time.
   */
  sortProcessesByPriority(processQueue) {
    return processQueue.sort((a, b) => {
      if (a.getPriority() > b.getPriority()) {
        return 1;
      } else if (a.getPriority() == b.getPriority() && a.getBurstTime() == b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }
}

// Syntax for use on frontend.

let test_priority = new Priority(1);

test_priority.createProcess("p1", 0, 3, 2);
test_priority.createProcess("p2", 2, 5, 6);
test_priority.createProcess("p3", 1, 4, 3);
test_priority.createProcess("p4", 4, 2, 5);
test_priority.createProcess("p5", 6, 9, 7);
test_priority.createProcess("p6", 5, 4, 4);
test_priority.createProcess("p7", 7, 10, 10);

let dispatcher = test_priority.dispatchProcesses(true);

// Can use .next() to step through the generator (this will be useful in the UI!)

// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));
// dispatcher.next().then((value) => console.log(value.value));

dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
dispatcher.next();
