import React, { createContext, useState } from "react";
import FCFS from "../simulator/cpu/non_preemptive/fcfs.mjs";

export const CPUSimulatorContext = createContext();

export const CPUSimulatorProvider = (props) => {
  const [activeCPUScheduler, setActiveCPUScheduler] = useState(new FCFS());
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState([]);

  return (
    <CPUSimulatorContext.Provider value={{ active: [activeCPUScheduler, setActiveCPUScheduler], speed: [simulationSpeed, setSimulationSpeed], jQueue: [jobQueue, setJobQueue] }}>
      {props.children}
    </CPUSimulatorContext.Provider>
  );
};
