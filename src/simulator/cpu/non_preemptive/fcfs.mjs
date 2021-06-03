import NonPreemptiveScheduler from "./non_preemptive_scheduler.mjs";

class FCFS extends NonPreemptiveScheduler {
  /**
   * Generates a FCFS schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-FCFS\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let numIters = this.jobQueue.length;

    // Iterate over the processes which have been sorted in order of their arrival time above.
    for (let i = 0; i < numIters; i++) {
      let p = this.jobQueue[i];
      let name = p.getName();
      let arrivalTime = p.getArrivalTime();
      let burstTime = p.getBurstTime();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: arrivalTime - timeDelta });
        // Adjust time delta with respect to idle length.
        timeDelta += arrivalTime - timeDelta;
      }

      if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

      this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: burstTime });

      // Keep track of the current time of execution.
      timeDelta += burstTime;

      if (verbose) console.log("[" + timeDelta + "] Process", name, "Finished executing!");
    }
  }
}

// Syntax for use on frontend.

let test_fcfs = new FCFS();

test_fcfs.createProcess("p1", 2, 2);
test_fcfs.createProcess("p2", 0, 1);
test_fcfs.createProcess("p3", 2, 3);
test_fcfs.createProcess("p4", 3, 5);
test_fcfs.createProcess("p5", 4, 4);

test_fcfs.dispatchProcesses(true);
test_fcfs.outputGraphicalRepresentation();
