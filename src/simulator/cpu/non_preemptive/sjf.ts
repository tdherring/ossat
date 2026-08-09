import CPUScheduler from "../cpu_scheduler";
class SJF extends CPUScheduler {
  /** Generates a SJF schedule for a set of input processes. */
  dispatchProcesses() {
    console.debug("\nOSSAT-SJF\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByBurstTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let lastP, p, name, arrivalTime, remainingTime;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.hasIncompleteProcesses()) {
      this.updateReadyQueue(timeDelta, remainingTime);

      // Clone the process so it is not affected by changes to the true process object.
      this.saveQueueState();

      // If the ready queue has no processes, we need to wait until one becomes available.
      if (this.getAvailableProcesses(timeDelta).length === 0) {
        console.debug("[" + timeDelta + "] CPU Idle...");
        this.schedule.push({
          processName: "IDLE",
          timeDelta: timeDelta,
          arrivalTime: null,
          burstTime: 0,
          remainingTime: null,
        });
        while (true) {
          this.updateReadyQueue(timeDelta, remainingTime);
          if (this.getAvailableProcesses(timeDelta).length > 0) break;
          // Don't increment the burst time / time delta if the ready queue now has something in it.
          this.schedule.at(-1)!.burstTime += 1;
          timeDelta++;
          this.saveQueueState();
        }
      }

      if (!remainingTime || remainingTime === 1) {
        p = this.readyQueue[i];
        name = p.getName();
        arrivalTime = p.getArrivalTime();
      }

      if (!p) throw new Error("Ready queue is unexpectedly empty");
      remainingTime = p.getRemainingTime();

      // If the process has changed since the last iteration, the previous process has ran to completion.
      if (lastP !== p) {
        // Inform the user of the newly spawned process.
        console.debug("[" + timeDelta + "] Spawned Process", name);
        // Add it to the schedule.
        this.schedule.push({
          processName: name!,
          timeDelta: timeDelta,
          arrivalTime: arrivalTime!,
          burstTime: 0,
          remainingTime: remainingTime,
        });
      }

      // Continue to increment the burst time of this process as long as it has execution time remaining.
      if (remainingTime > 0) {
        p.setRemainingTime(remainingTime - 1);
        this.schedule.at(-1)!.burstTime += 1;
        this.schedule.at(-1)!.remainingTime! -= 1;
      }

      lastP = p;
      // Increment time delta to track execution progress.
      timeDelta++;

      // If the burst time is 0 the process has finished executing.
      if (p.getRemainingTime() === 0) {
        console.debug("[" + timeDelta + "] Process", name, "finished executing!");
        i++;
      }

      // Add the final job and ready queue states.
      if (!this.hasIncompleteProcesses()) this.saveQueueState();
    }
  }

  /**
   * Updates the ready queue to be in the correct order for SJF.
   *
   * @param timeDelta Time point in execution.
   * @param remainingTime Execution time remaining for current process.
   */
  updateReadyQueue(timeDelta: number, remainingTime?: number) {
    const availableProcesses = this.getAvailableProcesses(timeDelta, true);

    for (const availableProcess of availableProcesses) {
      const isAlreadyQueued = this.readyQueue.some(
        (process) => process.getName() === availableProcess.getName(),
      );
      if (!isAlreadyQueued && (!remainingTime || remainingTime === 1)) {
        this.readyQueue.push(availableProcess);
        break;
      }
    }
  }
}

export default SJF;
