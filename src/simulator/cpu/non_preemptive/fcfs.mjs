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
    let i = 0;
    let lastP;
    let p;
    let name;
    let arrivalTime;
    let burstTime;

    // Keep scheduling until all processes have no burst time left.
    while (this.jobQueue.filter((x) => x.getBurstTime() !== 0).length > 0) {
      // Sort the processes by burst time and then arrival time, so if two processes have the same arrival time, take the one with the lower burst time first.
      this.readyQueue = this.sortProcessesByArrivalTime(this.sortProcessesByBurstTime(this.getAvailableProcesses(this.jobQueue, timeDelta, true)));
      this.allReadyQueues.push(this.readyQueue);

      // If the ready queue has no processes, we need to wait until one becomes available.
      if (this.getAvailableProcesses(this.jobQueue, timeDelta).length === 0) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: 0 });
        while (true) {
          this.readyQueue = this.sortProcessesByArrivalTime(this.sortProcessesByBurstTime(this.getAvailableProcesses(this.jobQueue, timeDelta, true)));
          if (this.getAvailableProcesses(this.jobQueue, timeDelta).length > 0) break;

          this.schedule[this.schedule.length - 1]["burstTime"] += 1;
          timeDelta++;
        }
      }

      p = this.readyQueue[i];
      name = p.getName();
      arrivalTime = p.getArrivalTime();
      burstTime = p.getBurstTime();

      // If the process has changed since the last iteration, the previous process has ran to completion.
      if (lastP !== p || lastP === null) {
        // Inform the user of the newly spawned process.
        if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);
        // Add it to the schedule.
        this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: 0 });
      }

      // Continue to increment the burst time of this process as long as it has execution time remaining.
      if (burstTime > 0) {
        p.setBurstTime(burstTime - 1);
        this.schedule[this.schedule.length - 1]["burstTime"] += 1;
      }

      lastP = p;
      // Increment time delta to track execution progress.
      timeDelta++;

      // If the burst time is 0 the process has finished executing.
      if (p.getBurstTime() === 0) {
        if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
        i++;
      }
    }
  }
}

// Syntax for use on frontend.

// let test_fcfs = new FCFS();

// test_fcfs.createProcess("p1", 2, 2);
// test_fcfs.createProcess("p2", 0, 1);
// test_fcfs.createProcess("p3", 2, 3);
// test_fcfs.createProcess("p4", 3, 5);
// test_fcfs.createProcess("p5", 4, 4);

// test_fcfs.dispatchProcesses(true);
// test_fcfs.outputGraphicalRepresentation();

export default FCFS;
