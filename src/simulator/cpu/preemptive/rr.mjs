import PreemptiveScheduler from "./preemptive_scheduler.mjs";

class RR extends PreemptiveScheduler {
  constructor(timeQuantum) {
    super();
    this.timeQuantum = timeQuantum;
  }

  /**
   * Generates a RR schedule for a set of input processes.
   *
   * @param verbose Show debugging information?
   */
  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-RR\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let readyQueue = [];

    let availableProcesses = this.getAvailableProcesses(this.jobQueue, timeDelta);

    if (availableProcesses.length > 0) {
      // If processes are available from time delta 0.
      // Initialise the ready queue to hold all processes which are available at this time delta (0).
      readyQueue = this.getAvailableProcesses(this.jobQueue, timeDelta);
    } else {
      // Otherwise, we need to idle at the first iteration, so set the first item in the ready queue to the process which arrives quickest.
      readyQueue.push(this.jobQueue[0]);
    }

    // Keep scheduling until all processes have no burst time left.
    while (this.jobQueue.filter((x) => x.getBurstTime() != 0).length > 0) {
      let p = readyQueue[i];
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

      // Track how much to adjust the time delta.
      let deltaIncrement = 0;

      // If the process has time left to execute.
      if (burstTime > 0) {
        if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

        if (burstTime <= this.timeQuantum) {
          // The process will run to completion quicker than a full quantum.
          deltaIncrement = burstTime;
          p.setBurstTime(0);
        } else {
          // A full quantum won't run the process to completion.
          deltaIncrement = this.timeQuantum;
          p.setBurstTime(burstTime - this.timeQuantum);
        }

        // Increment the queue head pointer.
        i++;

        this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: deltaIncrement });
        timeDelta += deltaIncrement;
        if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
      }

      // Find all processes which are available at this timestep (diff the arrays).
      let newlyAvailable = this.getAvailableProcesses(this.jobQueue, timeDelta).filter((x) => this.getAvailableProcesses(this.jobQueue, timeDelta - deltaIncrement).indexOf(x) === -1);

      // If after this quantum there are new processes available, add the the front of the ready queue.
      if (newlyAvailable.length > 0) {
        readyQueue = readyQueue.concat(newlyAvailable);
      }

      // If the process still has execution time remaining after this quantum, add it to the end of the ready queue.
      if (p.getBurstTime() > 0) {
        readyQueue.push(p);
      }

      // Finally, if the readyQueue is "empty", add the process with the nearest arrival time which has execution time remaining.
      if (readyQueue.length - 1 < i) {
        readyQueue.push(this.sortProcessesByArrivalTime(this.jobQueue.filter((x) => x.burstTime > 0))[0]);
      }
    }
  }
}

// Syntax for use on frontend.

let test_rr = new RR(5);

test_rr.createProcess("p1", 4, 4);
test_rr.createProcess("p2", 0, 10);
test_rr.createProcess("p3", 17, 17);
test_rr.createProcess("p4", 2, 18);

test_rr.dispatchProcesses(true);
test_rr.outputGraphicalRepresentation();
