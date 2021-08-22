import CPUScheduler from "../cpu_scheduler.mjs";
class Priority extends CPUScheduler {
  /**
   * Generates a SJF schedule for a set of input priority processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-Priority\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let lastP, p, name, arrivalTime, remainingTime;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.jobQueue.filter((x) => x.getRemainingTime() !== 0).length > 0) {
      for (let process of this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta, true))) {
        if (!this.readyQueue.some((sortedProcess) => sortedProcess === process)) {
          this.readyQueue.push(process);
        }
      }
      let sortedNew = this.sortProcessesByPriority(this.readyQueue.slice(i));
      this.readyQueue = this.readyQueue.slice(0, i).concat(sortedNew);
      // Clone the process so it is not affected by changes to the true process object.
      this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
      this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));

      // If the ready queue has no processes, we need to wait until one becomes available.
      if (this.getAvailableProcesses(timeDelta).length === 0) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: 0, remainingTime: null });
        while (true) {
          for (let process of this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta, true))) {
            if (!this.readyQueue.some((sortedProcess) => sortedProcess === process)) {
              this.readyQueue.push(process);
            }
          }
          let sortedNew = this.sortProcessesByPriority(this.readyQueue.slice(i));
          this.readyQueue = this.readyQueue.slice(0, i).concat(sortedNew);
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

// let test_priority = new Priority();

// test_priority.createProcess("p1", 0, 3, 2);
// test_priority.createProcess("p2", 2, 5, 6);
// test_priority.createProcess("p3", 1, 4, 3);
// test_priority.createProcess("p4", 4, 2, 5);
// test_priority.createProcess("p5", 6, 9, 7);
// test_priority.createProcess("p6", 5, 4, 4);
// test_priority.createProcess("p7", 7, 10, 10);

// test_priority.dispatchProcesses(true);
// test_priority.outputGraphicalRepresentation();

export default Priority;
