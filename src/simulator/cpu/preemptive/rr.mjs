import PreemptiveScheduler from "./preemptive_scheduler.mjs";

class RR extends PreemptiveScheduler {
  constructor(timeQuantum) {
    super();
    this.timeQuantum = timeQuantum;
  }

  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-RR\n-----------------------------------------");
    let timeDelta = 0;
    let endDispatch = false;

    // Execute until all processes have been dispatched and run for their full burst time.
    while (!endDispatch) {
      let numIters = this.jobQueue.length;
      endDispatch = true;

      for (let i = 0; i < numIters; i++) {
        let p = this.jobQueue[i];
        let name = p.getName();
        let burstTime = p.getBurstTime();

        // Only run this process if it has execution time remaining.
        if (burstTime > 0) {
          if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);

          if (burstTime <= this.timeQuantum || burstTime - this.timeQuantum <= 0) {
            // Applying a full quantum would take this processes burst time below 0, so only execute for the burst time -OR-
            // Process will run to completion after this quantum, so only execute for the burst time.
            this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: 0, burstTime: burstTime });
            timeDelta += burstTime;
            p.setBurstTime(0);
          } else {
            // Process still has time remaining after this quantum.
            this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: 0, burstTime: this.timeQuantum });
            timeDelta += this.timeQuantum;
            p.setBurstTime(burstTime - this.timeQuantum);
          }

          if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
          endDispatch = false;
        }
      }
    }
  }
}

// Syntax for use on frontend.

let test_rr = new RR(5);

// ! Arrival time for RR is always 0 (parameter 2 of createProcess)
// TODO: Implement arrival times for RR

test_rr.createProcess("p1", 0, 21);
test_rr.createProcess("p2", 0, 3);
test_rr.createProcess("p3", 0, 6);
test_rr.createProcess("p4", 0, 2);

test_rr.dispatchProcesses(true);
test_rr.outputGraphicalRepresentation();
