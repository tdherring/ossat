import CPUScheduler from "../cpu_scheduler.mjs";
class SRTF extends CPUScheduler {
  /**
   * Generates a SRTF schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-SRTF\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let lastP, p, name, arrivalTime, remainingTime;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.jobQueue.filter((x) => x.getRemainingTime() !== 0).length > 0) {
      // Sort the processes by remaining time.
      this.readyQueue = this.sortProcessesByRemainingTime(this.getAvailableProcesses(timeDelta, true));
      // Clone the process so it is not affected by changes to the true process object.
      this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
      this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));

      // If the ready queue has no processes, we need to wait until one becomes available.
      if (this.getAvailableProcesses(timeDelta).length === 0) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: 0, remainingTime: null });
        while (true) {
          this.readyQueue = this.sortProcessesByRemainingTime(this.getAvailableProcesses(timeDelta, true));

          if (this.getAvailableProcesses(timeDelta).length > 0) break;
          // Don't increment the burst time / time delta if the ready queue now has something in it.
          this.schedule[this.schedule.length - 1]["burstTime"] += 1;
          timeDelta++;
          this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
          this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
        }
      }

      p = this.readyQueue[i];
      name = p.getName();
      arrivalTime = p.getArrivalTime();
      remainingTime = p.getRemainingTime();

      // If the process has changed since the last iteration, the previous process has ran to completion.
      if (lastP !== p || lastP === null) {
        // Inform the user of the newly spawned process.
        if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);
        // Add it to the schedule.
        this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: 0 });
      }

      // Continue to increment the burst time of this process as long as it has execution time remaining.
      if (remainingTime > 0) {
        p.setRemainingTime(remainingTime - 1);
        this.schedule[this.schedule.length - 1].burstTime += 1;
        this.schedule[this.schedule.length - 1].remainingTime -= 1;
      }

      lastP = p;
      // Increment time delta to track execution progress.
      timeDelta++;

      // If the burst time is 0 the process has finished executing.
      if (p.getRemainingTime() === 0) {
        if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
        i++;
      }

      // Add the final job and ready queue states.
      if (this.jobQueue.filter((x) => x.getRemainingTime() !== 0).length === 0) {
        this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
        this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
      }
    }
  }
}

// Syntax for use on frontend.

// let test_srtf = new SRTF();

// test_srtf.createProcess("p1", 0, 7);
// test_srtf.createProcess("p2", 1, 5);
// test_srtf.createProcess("p3", 2, 3);
// test_srtf.createProcess("p4", 3, 1);
// test_srtf.createProcess("p5", 4, 2);
// test_srtf.createProcess("p6", 5, 1);

// test_srtf.dispatchProcesses(true);
// test_srtf.outputGraphicalRepresentation();

export default SRTF;
