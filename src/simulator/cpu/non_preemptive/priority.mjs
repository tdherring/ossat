import CPUScheduler from "../cpu_scheduler.mjs";

class Priority extends CPUScheduler {
  /**
   * Generates a SJF schedule for a set of input priority processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-Priority\n-----------------------------------------");
    let timeDelta = 0;
    this.processQueue = this.sortProcessesByPriority(this.processQueue, timeDelta);

    for (let i = 0; i < this.processQueue.length; i++) {
      let p = this.processQueue[i];
      let name = p.getName();
      let arrivalTime = p.getArrivalTime();
      let burstTime = p.getBurstTime();
      let priority = p.getPriority();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: arrivalTime - timeDelta, priority: null });
        // Adjust time delta with respect to idle length.
        timeDelta += arrivalTime;
      }

      if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

      this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: burstTime, priority: priority });

      // Keep track of the current time of execution.
      timeDelta += burstTime;

      if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
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

let test_priority = new Priority();

test_priority.createProcess("p1", 0, 3, 2);
test_priority.createProcess("p2", 2, 5, 6);
test_priority.createProcess("p3", 1, 4, 3);
test_priority.createProcess("p4", 4, 2, 5);
test_priority.createProcess("p5", 6, 9, 7);
test_priority.createProcess("p6", 5, 4, 4);
test_priority.createProcess("p7", 7, 10, 10);

test_priority.dispatchProcesses(true);
test_priority.outputGraphicalRepresentation();
