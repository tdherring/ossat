import PreemptiveScheduler from "./preemptive_scheduler.mjs";

class SRTF extends PreemptiveScheduler {
  /**
   * Generates a SRTF schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-SRTF\n-----------------------------------------");
    let timeDelta = 0;
    let numIters = 0;
    let idleDuration = 0;
    let p = null;
    let name = null;
    let arrivalTime = null;
    let burstTime = null;
    let lastP = null;

    // Initialise job queue to be first sorted by burst time, then arrival time.
    this.jobQueue = this.sortProcessesByArrivalTime(this.sortProcessesByBurstTime(this.jobQueue));

    // Set number of iterations to total burst time (not counting idle).
    numIters = this.jobQueue.reduce((x, y) => (numIters += y.getBurstTime()), 0);

    for (let i = 0; i < numIters; i++) {
      let availableProcesses = this.getAvailableProcesses(this.jobQueue, timeDelta);

      if (availableProcesses.length == 0) {
        if (idleDuration == 0 && verbose) console.log("[" + timeDelta + "] CPU Idle...");
        idleDuration++;
        // Extend number of iterations since we have had to delay due to idle.
        numIters++;
      } else {
        // If the CPU has been idle.
        if (idleDuration > 0) this.schedule.push({ processName: "IDLE", timeDelta: timeDelta - idleDuration, arrivalTime: null, burstTime: idleDuration });
        idleDuration = 0;

        // Out of all available processes at this time delta, take the process which is arriving soonest.
        p = this.sortProcessesByBurstTime(availableProcesses)[0];
        name = p.getName();
        burstTime = p.getBurstTime();
        arrivalTime = p.getArrivalTime();

        // If the process has changed since the last iteration, this process has been preempted or executed to completion.
        if (lastP != p || lastP == null) {
          // Tell the user that the process has finished executing.
          if (lastP != null && verbose) console.log("[" + timeDelta + "] Process", lastP.getName(), "finished executing!");
          // Inform them of the new process.
          if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);
          this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: 0 });
        }

        lastP = p;
        // Set the "remaining burst time".
        p.setBurstTime(burstTime - 1);
        this.schedule[this.schedule.length - 1]["burstTime"] += 1;
      }

      // Increment time delta to track execution progress.
      timeDelta++;
    }
    if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
  }
}

// Syntax for use on frontend.

let test_srtf = new SRTF();

test_srtf.createProcess("p1", 0, 7);
test_srtf.createProcess("p2", 1, 5);
test_srtf.createProcess("p3", 2, 3);
test_srtf.createProcess("p4", 3, 1);
test_srtf.createProcess("p5", 4, 2);
test_srtf.createProcess("p6", 5, 1);

test_srtf.dispatchProcesses(true);
test_srtf.outputGraphicalRepresentation();
