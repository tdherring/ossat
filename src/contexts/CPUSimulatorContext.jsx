import React, { createContext, useState, useEffect } from "react";
import FCFS from "../simulator/cpu/non_preemptive/fcfs.mjs";
import SJF from "../simulator/cpu/non_preemptive/sjf.mjs";
import Priority from "../simulator/cpu/non_preemptive/priority.mjs";
import RR from "../simulator/cpu/preemptive/rr.mjs";
import SRTF from "../simulator/cpu/preemptive/srtf.mjs";

export const CPUSimulatorContext = createContext();

export const CPUSimulatorProvider = (props) => {
  const [activeCPUScheduler, setActiveCPUScheduler] = useState(new FCFS());
  const [activeSchedulerName, setActiveSchedulerName] = useState("First Come First Served (FCFS)");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState([]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [timeDelta, setTimeDelta] = useState(0);
  const [currentProcess, setCurrentProcess] = useState(null);
  const Scheduler = { FCFS: new FCFS(), SJF: new SJF(), Priority: new Priority(), RR: new RR(2), SRTF: new SRTF() };

  // Flipped between true / false to call useEffect() and update the job / ready queue.
  const [running, setRunning] = useState(false);

  // Update the job and ready queues.
  useEffect(() => {
    timeDelta === 0 && activeCPUScheduler.getSchedule().length === 0
      ? setJobQueue(activeCPUScheduler.getJobQueue())
      : activeCPUScheduler.getJobQueue(timeDelta) &&
        setJobQueue(
          activeCPUScheduler.getJobQueue(timeDelta).sort((a, b) => {
            if (a.timeAdded >= b.timeAdded) return 1;
            return -1;
          })
        );

    setReadyQueue(activeCPUScheduler.getReadyQueue(timeDelta));
  });

  return (
    <CPUSimulatorContext.Provider
      value={{
        active: [activeCPUScheduler, setActiveCPUScheduler],
        activeName: [activeSchedulerName, setActiveSchedulerName],
        speed: [simulationSpeed, setSimulationSpeed],
        jQueue: [jobQueue, setJobQueue],
        rQueue: [readyQueue, setReadyQueue],
        running: [running, setRunning],
        time: [timeDelta, setTimeDelta],
        current: [currentProcess, setCurrentProcess],
        scheduler: Scheduler,
      }}
    >
      {props.children}
    </CPUSimulatorContext.Provider>
  );
};
