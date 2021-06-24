import NonPreemptiveScheduler from "./non_preemptive_scheduler.mjs";

class SJF extends NonPreemptiveScheduler {
  /**
   * Generates a SJF schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-SJF\n-----------------------------------------");
    let timeDelta = 0;
    let numIters = this.jobQueue.length;

    for (let i = 0; i < numIters; i++) {
      // The queue of waiting processes.
      let readyQueue = this.getAvailableProcesses(timeDelta);

      // Are there any available processes in the ready queue?
      // Yes? - Take the shortest job first (left).
      // No? - Take next job available (right).
      readyQueue.length !== 0 ? (readyQueue = this.sortProcessesByBurstTime(readyQueue)) : (readyQueue = this.sortProcessesByArrivalTime(this.jobQueue));

      let p = readyQueue[0];
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

      if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");

      // Remove the process that just finished executing.
      this.jobQueue = this.jobQueue.filter((process) => process.name !== name);
    }
  }
}

// Syntax for use on frontend.

// let test_sjf = new SJF();

// test_sjf.createProcess("p1", 2, 1);
// test_sjf.createProcess("p2", 1, 5);
// test_sjf.createProcess("p3", 4, 1);
// test_sjf.createProcess("p4", 0, 6);
// test_sjf.createProcess("p5", 2, 3);

// test_sjf.dispatchProcesses(true);
// test_sjf.outputGraphicalRepresentation();

export default SJF;
