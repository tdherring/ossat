import React, { createContext, useState, useEffect } from "react";
import FCFS from "../simulator/cpu/non_preemptive/fcfs.mjs";

export const CPUSimulatorContext = createContext();

export const CPUSimulatorProvider = (props) => {
  const [activeCPUScheduler, setActiveCPUScheduler] = useState(new FCFS());
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState([]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [timeDelta, setTimeDelta] = useState(0);

  // Flipped between true / false to call useEffect() and update the job / ready queue.
  const [running, setRunning] = useState(false);

  // Update the job and ready queues.
  useEffect(() => {
    timeDelta === 0 && activeCPUScheduler.getSchedule().length === 0 ? setJobQueue(activeCPUScheduler.getJobQueue()) : setJobQueue(activeCPUScheduler.getJobQueue(timeDelta));
    setReadyQueue(activeCPUScheduler.getReadyQueue(timeDelta));
  });

  return (
    <CPUSimulatorContext.Provider
      value={{
        active: [activeCPUScheduler, setActiveCPUScheduler],
        speed: [simulationSpeed, setSimulationSpeed],
        jQueue: [jobQueue, setJobQueue],
        rQueue: [readyQueue, setReadyQueue],
        running: [running, setRunning],
        time: [timeDelta, setTimeDelta],
      }}
    >
      {props.children}
    </CPUSimulatorContext.Provider>
  );
};
