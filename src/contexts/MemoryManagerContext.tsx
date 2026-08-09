import {
  createContext,
  useState,
  useEffect,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import FirstFit from "../simulator/memory/contiguous/first_fit";
import BestFit from "../simulator/memory/contiguous/best_fit";
import WorstFit from "../simulator/memory/contiguous/worst_fit";
import MemoryBlock from "../simulator/memory/memory_block";
import MemoryProcess from "../simulator/memory/memory_process";

type StatePair<T> = [T, Dispatch<SetStateAction<T>>];
export type ManagerName = "First Fit" | "Best Fit" | "Worst Fit";
export type Manager = FirstFit | BestFit | WorstFit;
type MemoryManagerContextValue = {
  active: StatePair<Manager>;
  activeName: StatePair<ManagerName>;
  time: StatePair<number>;
  speed: StatePair<number>;
  jQueue: StatePair<MemoryProcess[]>;
  blocks: StatePair<MemoryBlock[]>;
  allocated: StatePair<Record<string, MemoryBlock | null>>;
  running: StatePair<boolean>;
  manager: Record<ManagerName, Manager>;
};

export const MemoryManagerContext = createContext<MemoryManagerContextValue>(null!);

export const MemoryManagerProvider = ({ children }: { children: ReactNode }) => {
  const Manager = useMemo<Record<ManagerName, Manager>>(
    () => ({ "First Fit": new FirstFit(), "Best Fit": new BestFit(), "Worst Fit": new WorstFit() }),
    [],
  );

  const [activeManager, setActiveManager] = useState(Manager["First Fit"]);
  const [activeManagerName, setActiveManagerName] = useState<ManagerName>("First Fit");
  const [timeDelta, setTimeDelta] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState<MemoryProcess[]>([]);
  const [blocks, setBlocks] = useState<MemoryBlock[]>([]);
  const [allocated, setAllocated] = useState<Record<string, MemoryBlock | null>>({});

  // Flipped between true / false to call useEffect() and update the job / ready queue.
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setJobQueue(activeManager.getJobQueue());
    setBlocks(activeManager.getBlocks());
  }, [activeManager]);

  return (
    <MemoryManagerContext.Provider
      value={{
        active: [activeManager, setActiveManager],
        activeName: [activeManagerName, setActiveManagerName],
        time: [timeDelta, setTimeDelta],
        speed: [simulationSpeed, setSimulationSpeed],
        jQueue: [jobQueue, setJobQueue],
        blocks: [blocks, setBlocks],
        allocated: [allocated, setAllocated],
        running: [running, setRunning],
        manager: Manager,
      }}
    >
      {children}
    </MemoryManagerContext.Provider>
  );
};
