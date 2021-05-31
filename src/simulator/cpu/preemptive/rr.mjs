import PreemptiveScheduler from "./preemptive_scheduler.mjs";

class RR extends PreemptiveScheduler {
  constructor(timeQuantum) {
    super();
    this.timeQuantum = timeQuantum;
  }

  dispatchProcesses(verbose = false) {
    if (verbose) console.log("\nOSSAT-RR\n-----------------------------------------");
    let timeDelta = 0;

    while (true) {
      let numIters = this.processQueue.length;
      let endDispatch = true;

      for (let i = 0; i < numIters; i++) {
        let p = this.processQueue[i];
        let name = p.getName();
        let burstTime = p.getBurstTime();

        if (burstTime > 0) {
          if (verbose) console.log("[" + timeDelta + "] Spawned Process", name);
          // Applying a full quantum would take this processes burstTime below 0, so only execute for the burstTime.
          if (burstTime <= this.timeQuantum) {
            this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: 0, burstTime: burstTime });
            timeDelta += burstTime;
            // burstTime - burstTime = 0
            p.setBurstTime(0);
            if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
          } else {
            // Process will run to completion after this quantum.
            if (burstTime - this.timeQuantum <= 0) {
              this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: 0, burstTime: burstTime });
              timeDelta += burstTime;
              // burstTime - burstTime = 0
              p.setBurstTime(0);
            }
            // Process still has time remaining after this quantum.
            else {
              this.schedule.push({ processName: name, timeDelta: timeDelta, arrivalTime: 0, burstTime: this.timeQuantum });
              timeDelta += this.timeQuantum;
              p.setBurstTime(burstTime - this.timeQuantum);
            }

            if (verbose) console.log("[" + timeDelta + "] Process", name, "finished executing!");
          }
        }

        if (burstTime > 0) endDispatch = false;
      }

      // If all processes have executed to completion (all burstTimes are 0)
      if (endDispatch) break;
    }
  }
}

// Syntax for use on frontend.

let test_rr = new RR(4);

// ! Arrival time for RR is always 0 (parameter 2 of createProcess)
// TODO: Implement priority for RR

test_rr.createProcess("p1", 0, 24);
test_rr.createProcess("p2", 0, 3);
test_rr.createProcess("p3", 0, 3);

test_rr.dispatchProcesses(true);
test_rr.outputGraphicalRepresentation();
