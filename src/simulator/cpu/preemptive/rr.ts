import CPUScheduler from "../cpu_scheduler";
class RR extends CPUScheduler {
  private timeQuantum: number;

  constructor(timeQuantum = 2) {
    super();
    this.timeQuantum = timeQuantum;
  }

  setTimeQuantum(timeQuantum: number) {
    console.debug("Updating RR time quantum", timeQuantum);
    this.timeQuantum = timeQuantum;
  }

  /** Generates a RR schedule for a set of input processes. */
  dispatchProcesses() {
    console.debug("\nOSSAT-RR\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;

    const availableProcesses = this.getAvailableProcesses(timeDelta);

    if (availableProcesses.length > 0) {
      // If processes are available from time delta 0.
      // Initialise the ready queue to hold all processes which are available at this time delta (0).
      this.readyQueue = this.getAvailableProcesses(timeDelta);
    } else {
      // Otherwise, we need to idle at the first iteration, so set the first item in the ready queue to the process which arrives quickest.
      this.readyQueue.push(this.jobQueue[0]);
    }

    this.saveQueueState();

    // Keep scheduling until all processes have no burst time left.
    while (this.hasIncompleteProcesses()) {
      const p = this.readyQueue[i];
      const name = p.getName();
      const arrivalTime = p.getArrivalTime();
      const remainingTime = p.getRemainingTime();

      // Check whether the CPU needs to idle for the next process.
      if (arrivalTime > timeDelta) {
        console.debug("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({
          processName: "IDLE",
          timeDelta: timeDelta,
          arrivalTime: null,
          burstTime: arrivalTime - timeDelta,
          remainingTime: null,
        });
        // Update queues arrays in line with idle time.
        for (let j = 0; j < arrivalTime - timeDelta; j++) {
          this.saveQueueState();
        }
        // Adjust time delta with respect to idle length.
        timeDelta += arrivalTime - timeDelta;
      }

      // Track how much to adjust the time delta.
      let deltaIncrement = 0;

      // If the process has time left to execute.
      if (remainingTime > 0) {
        console.debug("[" + timeDelta + "] Spawned Process", name);

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

        this.schedule.push({
          processName: name!,
          timeDelta: timeDelta,
          arrivalTime: arrivalTime!,
          burstTime: deltaIncrement,
          remainingTime: remainingTime - deltaIncrement,
        });
        timeDelta += deltaIncrement;
        console.debug("[" + timeDelta + "] Process", name, "finished executing!");
      }

      // Find all processes which are available at this timestep (diff the arrays).
      const previouslyAvailable = this.getAvailableProcesses(timeDelta - deltaIncrement);
      const newlyAvailable = this.getAvailableProcesses(timeDelta).filter(
        (process) => !previouslyAvailable.includes(process),
      );

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
        const nearestProcess = this.sortProcessesByArrivalTime(
          this.jobQueue.filter((process) => process.remainingTime > 0),
        )[0];
        if (nearestProcess) this.readyQueue.push(nearestProcess);
      }

      this.saveQueueState();
    }
  }
}

export default RR;
