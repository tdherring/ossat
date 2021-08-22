import CPUScheduler from "../cpu_scheduler.mjs";
class SJF extends CPUScheduler {
  /**
   * Generates a SJF schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-SJF\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByBurstTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let lastP, p, name, arrivalTime, remainingTime;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.jobQueue.filter((x) => x.getRemainingTime() !== 0).length > 0) {
      this.updateReadyQueue(timeDelta, remainingTime);

      // Clone the process so it is not affected by changes to the true process object.
      this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
      this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));

      // If the ready queue has no processes, we need to wait until one becomes available.
      if (this.getAvailableProcesses(timeDelta).length === 0) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: 0, remainingTime: null });
        while (true) {
          this.updateReadyQueue(timeDelta, remainingTime);
          if (this.getAvailableProcesses(timeDelta).length > 0) break;
          // Don't increment the burst time / time delta if the ready queue now has something in it.
          this.schedule[this.schedule.length - 1].burstTime += 1;
          timeDelta++;
          this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
          this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
        }
      }

      if (!remainingTime || remainingTime === 1) {
        p = this.readyQueue[i];
        name = p.getName();
        arrivalTime = p.getArrivalTime();
      }

      remainingTime = p.getRemainingTime();

      // If the process has changed since the last iteration, the previous process has ran to completion.
      if (lastP !== p || lastP === null) {
        // Inform the user of the newly spawned process.
        if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);
        // Add it to the schedule.
        this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: 0, remainingTime: remainingTime });
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

  /**
   * Updates the ready queue to be in the correct order for SJF.
   *
   * @param timeDelta Time point in execution.
   * @param remainingTime Execution time remaining for current process.
   */
  updateReadyQueue(timeDelta, remainingTime) {
    let availableProcesses = this.getAvailableProcesses(timeDelta, true);

    for (let j = 0; j < availableProcesses.length; j++) {
      if (!this.readyQueue.some((process) => process.getName() === availableProcesses[j].getName()) && (!remainingTime || remainingTime === 1)) {
        this.readyQueue.push(availableProcesses[j]);
        break;
      }
    }
  }
}

// Syntax for use on frontend.

// let test_sjf = new SJF();

// test_sjf.createProcess("p1", 2, 1);
// test_sjf.createProcess("p2", 1, 5);
// test_sjf.createProcess("p3", 4, 1);
// test_sjf.createProcess("p4", 1, 6);
// test_sjf.createProcess("p5", 2, 3);

// test_sjf.dispatchProcesses(true);
// test_sjf.outputGraphicalRepresentation();

export default SJF;
