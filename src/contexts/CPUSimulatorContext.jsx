import React, { createContext, useState, useEffect } from "react";
import FCFS from "../simulator/cpu/non_preemptive/fcfs.mjs";

export const CPUSimulatorContext = createContext();

export const CPUSimulatorProvider = (props) => {
  const [activeCPUScheduler, setActiveCPUScheduler] = useState(new FCFS());
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState([]);
  const [readyQueue, setReadyQueue] = useState(activeCPUScheduler.getReadyQueue());

  const [running, setRunning] = useState(false);

  // Update the job and ready queues.
  useEffect(() => {
    console.log(activeCPUScheduler.getJobQueue());
    setJobQueue(activeCPUScheduler.getJobQueue());
    setReadyQueue(activeCPUScheduler.getReadyQueue());
  });

  return (
    <CPUSimulatorContext.Provider
      value={{
        active: [activeCPUScheduler, setActiveCPUScheduler],
        speed: [simulationSpeed, setSimulationSpeed],
        jQueue: [jobQueue, setJobQueue],
        rQueue: [readyQueue, setReadyQueue],
        running: [running, setRunning],
      }}
    >
      {props.children}
    </CPUSimulatorContext.Provider>
  );
};
