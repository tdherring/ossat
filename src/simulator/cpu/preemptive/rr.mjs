import PreemptiveScheduler from "./preemptive_scheduler.mjs";

class RR extends PreemptiveScheduler {
  constructor(timeQuantum = 2) {
    super();
    this.timeQuantum = timeQuantum;
  }

  setTimeQuantum(timeQuantum) {
    console.log(timeQuantum);
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

    let availableProcesses = this.getAvailableProcesses(timeDelta);

    if (availableProcesses.length > 0) {
      // If processes are available from time delta 0.
      // Initialise the ready queue to hold all processes which are available at this time delta (0).
      this.readyQueue = this.getAvailableProcesses(timeDelta);
    } else {
      // Otherwise, we need to idle at the first iteration, so set the first item in the ready queue to the process which arrives quickest.
      this.readyQueue.push(this.jobQueue[0]);
    }

    this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
    this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));

    // Keep scheduling until all processes have no burst time left.
    while (this.jobQueue.filter((x) => x.getRemainingTime() !== 0).length > 0) {
      let p = this.readyQueue[i];
      let name = p.getName();
      let arrivalTime = p.getArrivalTime();
      let remainingTime = p.getRemainingTime();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        if (verbose) console.log("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({ processName: "IDLE", timeDelta: timeDelta, arrivalTime: null, burstTime: arrivalTime - timeDelta, remainingTime: null });
        // Update queues arrays in line with idle time.
        for (let j = 0; j < arrivalTime - timeDelta; j++) {
          this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
          this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
        }
        // Adjust time delta with respect to idle length.
        timeDelta += arrivalTime - timeDelta;
      }

      // Track how much to adjust the time delta.
      let deltaIncrement = 0;

      // If the process has time left to execute.
      if (remainingTime > 0) {
        if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

        if (remainingTime <= this.timeQuantum) {
          // The process will run to completion quicker than a full quantum.
          deltaIncrement = remainingTime;
        } else {
          // A full quantum won't run the process to completion.
          deltaIncrement = this.timeQuantum;
        }

        // Decrement remaining time as required and update queues arrays.
        for (let j = 0; j < deltaIncrement; j++) {
          p.setRemainingTime(p.getRemainingTime() - 1);
          if (j < deltaIncrement - 1) {
            this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
            this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
          }
        }

        // Increment the queue head pointer.
        i++;

        this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: arrivalTime, burstTime: deltaIncrement, remainingTime: remainingTime - deltaIncrement });
        timeDelta += deltaIncrement;
        if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
      }

      // Find all processes which are available at this timestep (diff the arrays).
      let newlyAvailable = this.getAvailableProcesses(timeDelta).filter((x) => this.getAvailableProcesses(timeDelta - deltaIncrement).indexOf(x) === -1);

      // If after this quantum there are new processes available, add the the front of the ready queue.
      if (newlyAvailable.length > 0) {
        this.readyQueue = this.readyQueue.concat(newlyAvailable);
      }

      // If the process still has execution time remaining after this quantum, add it to the end of the ready queue.
      if (p.getRemainingTime() > 0) {
        this.readyQueue.push(p);
      }

      // Finally, if the readyQueue is "empty", add the process with the nearest arrival time which has execution time remaining.
      if (this.readyQueue.length - 1 < i) {
        let nearestProcess = this.sortProcessesByArrivalTime(this.jobQueue.filter((x) => x.remainingTime > 0))[0];
        if (nearestProcess) this.readyQueue.push(nearestProcess);
      }

      this.allReadyQueues.push(JSON.parse(JSON.stringify(this.readyQueue)));
      this.allJobQueues.push(JSON.parse(JSON.stringify(this.jobQueue)));
    }
  }
}

// Syntax for use on frontend.

// let test_rr = new RR(3);

// test_rr.createProcess("p1", 1, 8);
// test_rr.createProcess("p2", 5, 2);
// test_rr.createProcess("p3", 1, 7);
// test_rr.createProcess("p4", 6, 3);
// test_rr.createProcess("p5", 8, 5);

// test_rr.dispatchProcesses(true);
// test_rr.outputGraphicalRepresentation();

export default RR;
