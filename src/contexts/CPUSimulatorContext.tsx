import {
  createContext,
  useState,
  useEffect,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import FCFS from "../simulator/cpu/non_preemptive/fcfs";
import SJF from "../simulator/cpu/non_preemptive/sjf";
import Priority from "../simulator/cpu/non_preemptive/priority";
import RR from "../simulator/cpu/preemptive/rr";
import SRTF from "../simulator/cpu/preemptive/srtf";
import { type ScheduleEntry } from "../simulator/cpu/cpu_scheduler";
import CPUProcess from "../simulator/cpu/cpu_process";

type StatePair<T> = [T, Dispatch<SetStateAction<T>>];
export type SchedulerName = "FCFS" | "SJF" | "Priority" | "RR" | "SRTF";
export type Scheduler = FCFS | SJF | Priority | RR | SRTF;
type CPUSimulatorContextValue = {
  active: StatePair<Scheduler>;
  activeName: StatePair<SchedulerName>;
  speed: StatePair<number>;
  jQueue: StatePair<CPUProcess[]>;
  rQueue: StatePair<CPUProcess[]>;
  running: StatePair<boolean>;
  time: StatePair<number>;
  current: StatePair<ScheduleEntry | null>;
  playing: StatePair<boolean>;
  scheduler: Record<SchedulerName, Scheduler>;
};

export const CPUSimulatorContext = createContext<CPUSimulatorContextValue>(null!);

export const CPUSimulatorProvider = ({ children }: { children: ReactNode }) => {
  const Scheduler = useMemo<Record<SchedulerName, Scheduler>>(
    () => ({
      FCFS: new FCFS(),
      SJF: new SJF(),
      Priority: new Priority(),
      RR: new RR(2),
      SRTF: new SRTF(),
    }),
    [],
  );

  const [activeCPUScheduler, setActiveCPUScheduler] = useState(Scheduler["FCFS"]);
  const [activeSchedulerName, setActiveSchedulerName] = useState<SchedulerName>("FCFS");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [jobQueue, setJobQueue] = useState<CPUProcess[]>([]);
  const [readyQueue, setReadyQueue] = useState<CPUProcess[]>([]);
  const [timeDelta, setTimeDelta] = useState(0);
  const [currentProcess, setCurrentProcess] = useState<ScheduleEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Flipped between true / false to call useEffect() and update the job / ready queue.
  const [running, setRunning] = useState(false);

  // Update the job and ready queues.
  useEffect(() => {
    if (timeDelta === 0 && activeCPUScheduler.getSchedule().length === 0) {
      setJobQueue(activeCPUScheduler.getJobQueue());
    } else {
      const queueAtCurrentTime = activeCPUScheduler.getJobQueue(timeDelta);
      if (queueAtCurrentTime) {
        setJobQueue(queueAtCurrentTime.sort((a, b) => (a.timeAdded >= b.timeAdded ? 1 : -1)));
      }
    }

    setReadyQueue(activeCPUScheduler.getReadyQueue(timeDelta));
  }, [timeDelta, activeCPUScheduler]);

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
        playing: [isPlaying, setIsPlaying],
        scheduler: Scheduler,
      }}
    >
      {children}
    </CPUSimulatorContext.Provider>
  );
};
