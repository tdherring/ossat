import CPUScheduler from "../cpu_scheduler.mjs";

class NonPreemptiveScheduler extends CPUScheduler {
  /**
   * Sorts the job queue by arrival time as required by FCFS/SJF.
   * If burst / arrival times of two processes same, take the one which is first lexographically.
   *
   * @param jobQueue The queue to sort.
   * @return An array of Processes, sorted by arrival time.
   */
  sortProcessesByArrivalTime(jobQueue) {
    return jobQueue.sort((a, b) => {
      if (a.getArrivalTime() > b.getArrivalTime()) {
        return 1;
      } else if (a.getArrivalTime() == b.getArrivalTime() && a.getBurstTime() == b.getBurstTime()) {
        if (a.getName() > b.getName()) {
          return 1;
        }
      }
      return -1;
    });
  }
}

export default NonPreemptiveScheduler;
