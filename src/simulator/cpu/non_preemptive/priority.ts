import CPUScheduler from "../cpu_scheduler";
class Priority extends CPUScheduler {
  override createProcess(
    name: string,
    arrivalTime: number,
    burstTime: number,
    priority: number | null = null,
  ) {
    if (priority === null) {
      throw new TypeError("Priority processes require a priority value.");
    }
    super.createProcess(name, arrivalTime, burstTime, priority);
  }

  /** Generates a non-preemptive priority schedule for a set of input processes. */
  dispatchProcesses() {
    console.debug("\nOSSAT-Priority\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.hasIncompleteProcesses()) {
      let availableProcesses = this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta));

      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(
          ...this.jobQueue
            .filter((process) => process.getRemainingTime() > 0)
            .map((process) => process.getArrivalTime()),
        );
        console.debug("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({
          processName: "IDLE",
          timeDelta,
          arrivalTime: null,
          burstTime: nextArrival - timeDelta,
          remainingTime: null,
        });
        while (timeDelta < nextArrival) {
          this.readyQueue = [];
          this.saveQueueState();
          timeDelta++;
        }
        availableProcesses = this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta));
      }

      const process = availableProcesses[0];
      const burstTime = process.getRemainingTime();
      console.debug("[" + timeDelta + "] Spawned Process", process.getName());
      this.schedule.push({
        processName: process.getName(),
        timeDelta,
        arrivalTime: process.getArrivalTime(),
        burstTime,
        remainingTime: 0,
        priority: process.getPriority(),
      });

      for (let elapsed = 0; elapsed < burstTime; elapsed++) {
        this.readyQueue = this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta, true));
        this.saveQueueState();
        process.setRemainingTime(process.getRemainingTime() - 1);
        timeDelta++;
      }
      console.debug("[" + timeDelta + "] Process", process.getName(), "finished executing!");
    }
    this.readyQueue = this.sortProcessesByPriority(this.getAvailableProcesses(timeDelta, true));
    this.saveQueueState();
  }
}

export default Priority;
