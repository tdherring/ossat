import CPUScheduler from "../cpu_scheduler";
class Priority extends CPUScheduler {
  /** Generates a SJF schedule for a set of input priority processes. */
  dispatchProcesses() {
    console.debug("\nOSSAT-Priority\n-----------------------------------------");
    this.jobQueue = this.sortProcessesByArrivalTime(this.jobQueue);
    let timeDelta = 0;
    let i = 0;
    let lastP, p, name, arrivalTime, remainingTime;

    // Keep scheduling until all processes have no remaining execution time.
    while (this.hasIncompleteProcesses()) {
      for (const process of this.sortProcessesByPriority(
        this.getAvailableProcesses(timeDelta, true),
      )) {
        if (!this.readyQueue.includes(process)) {
          this.readyQueue.push(process);
        }
      }
      const sortedNew = this.sortProcessesByPriority(this.readyQueue.slice(i));
      this.readyQueue = this.readyQueue.slice(0, i).concat(sortedNew);
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
          for (const process of this.sortProcessesByPriority(
            this.getAvailableProcesses(timeDelta, true),
          )) {
            if (!this.readyQueue.includes(process)) {
              this.readyQueue.push(process);
            }
          }
          const sortedNew = this.sortProcessesByPriority(this.readyQueue.slice(i));
          this.readyQueue = this.readyQueue.slice(0, i).concat(sortedNew);
          if (this.getAvailableProcesses(timeDelta).length > 0) break;
          // Don't increment the burst time / time delta if the ready queue now has something in it.
          this.schedule.at(-1)!.burstTime += 1;
          timeDelta++;
          this.saveQueueState();
        }
      }

      p = this.readyQueue[i];
      name = p.getName();
      arrivalTime = p.getArrivalTime();
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
          remainingTime,
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
}

export default Priority;
