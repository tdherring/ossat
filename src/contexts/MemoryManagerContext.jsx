import React, { createContext, useState, useEffect } from "react";
import FirstFit from "../simulator/memory/contiguous/first_fit.mjs";
import BestFit from "../simulator/memory/contiguous/best_fit.mjs";
import WorstFit from "../simulator/memory/contiguous/worst_fit.mjs";

export const MemoryManagerContext = createContext();

export const MemoryManagerProvider = (props) => {
  const Manager = { FF: new FirstFit(), BF: new BestFit(), WF: new WorstFit() };

  const [activeManager, setActiveManager] = useState(Manager["FF"]);
  const [activeManagerName, setActiveManagerName] = useState("First Fit");
  const [jobQueue, setJobQueue] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [allocated, setAllocated] = useState([]);

  // Flipped between true / false to call useEffect() and update the job / ready queue.
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setJobQueue(activeManager.getJobQueue());
    setBlocks(activeManager.getBlocks());
  });

  return (
    <MemoryManagerContext.Provider
      value={{
        active: [activeManager, setActiveManager],
        activeName: [activeManagerName, setActiveManagerName],
        jQueue: [jobQueue, setJobQueue],
        blocks: [blocks, setBlocks],
        allocated: [allocated, setAllocated],
        running: [running, setRunning],
        manager: Manager,
      }}
    >
      {props.children}
    </MemoryManagerContext.Provider>
  );
};
