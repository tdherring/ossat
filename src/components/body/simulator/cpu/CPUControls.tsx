import { useContext, useState, useEffect } from "react";
import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward } from "lucide-react";
import { CPUSimulatorContext, type SchedulerName } from "../../../../contexts/CPUSimulatorContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import AddCPUProcess from "../../../modals/AddCPUProcess";
import ConfirmSwitchCPU from "../../../modals/ConfirmSwitchCPU";
import ResetCPU from "../../../modals/ResetCPU";
import SimulationPlaybackControls from "../SimulationPlaybackControls";
import SimulationDemoSelect from "../SimulationDemoSelect";
import { CPU_DEMOS, populateCPUDemo } from "../../../../lib/simulationDemos";

const CPUControls = ({ policyDescription }: { policyDescription: string }) => {
  const [, setActiveModal] = useContext(ModalContext);
  const [activeCPUScheduler, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName, setActiveSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [simulationSpeed, setSimulationSpeed] = useContext(CPUSimulatorContext).speed;
  const [autoScheduling, setAutoScheduling] = useContext(CPUSimulatorContext).playing;
  const [timeDelta, setTimeDelta] = useContext(CPUSimulatorContext).time;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [, setReadyQueue] = useContext(CPUSimulatorContext).rQueue;
  const [, setCurrentProcess] = useContext(CPUSimulatorContext).current;
  const Scheduler = useContext(CPUSimulatorContext).scheduler;

  const dropdownOptions: SchedulerName[] = ["FCFS", "SJF", "Priority", "RR", "SRTF"];

  const [intervalVal, setIntervalVal] = useState<ReturnType<typeof setInterval> | null>(null);
  const [timeQuantum, setTimeQuantum] = useState(2);

  const [pendingSchedulerName, setPendingSchedulerName] = useState<SchedulerName | null>(null);

  const schedule = activeCPUScheduler.getSchedule();

  // Stop the auto scheduler from overflowing the schedule boundaries.
  useEffect(() => {
    if (
      schedule.length > 0 &&
      timeDelta >= schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime
    ) {
      setAutoScheduling(false);
      if (intervalVal) clearInterval(intervalVal);
      setIntervalVal(null);
    }
    if (!autoScheduling && intervalVal) clearInterval(intervalVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScheduling, timeDelta, intervalVal]);

  useEffect(
    () => () => {
      if (intervalVal) clearInterval(intervalVal);
    },
    [intervalVal],
  );

  useEffect(() => () => setAutoScheduling(false), [setAutoScheduling]);

  useEffect(() => {
    if ("setTimeQuantum" in activeCPUScheduler) activeCPUScheduler.setTimeQuantum(timeQuantum);
  }, [activeCPUScheduler, activeSchedulerName, timeQuantum]);

  const stopPlayback = () => {
    setAutoScheduling(false);
    if (intervalVal) clearInterval(intervalVal);
    setIntervalVal(null);
  };

  const loadDemo = (demoId: string) => {
    const demo = CPU_DEMOS.find(({ id }) => id === demoId);
    if (!demo) return;

    stopPlayback();

    const nextScheduler = populateCPUDemo(Scheduler, demo);
    if (demo.timeQuantum != null) {
      setTimeQuantum(demo.timeQuantum);
    }

    setActiveSchedulerName(demo.policy);
    setActiveCPUScheduler(nextScheduler);
    setJobQueue([...nextScheduler.getJobQueue()]);
    setReadyQueue([]);
    setCurrentProcess(null);
    setTimeDelta(0);
  };

  const playbackControls = [
    {
      label: "Jump to start",
      icon: SkipBack,
      action: () => {
        stopPlayback();
        setTimeDelta(0);
      },
    },
    {
      label: "Step backward",
      icon: StepBack,
      action: () => {
        stopPlayback();
        if (timeDelta > 0) setTimeDelta(timeDelta - 1);
      },
    },
    {
      label: autoScheduling ? "Pause" : "Play",
      icon: autoScheduling ? Pause : Play,
      action: () => {
        if (autoScheduling) {
          stopPlayback();
          return;
        }
        if (jobQueue.length === 0) return;

        if (activeCPUScheduler.getSchedule().length === 0) {
          activeCPUScheduler.dispatchProcesses();
          setJobQueue([
            ...(activeCPUScheduler.getJobQueue(timeDelta) ?? activeCPUScheduler.getJobQueue()),
          ]);
          setReadyQueue([...(activeCPUScheduler.getReadyQueue(timeDelta) ?? [])]);
        }

        const updatedSchedule = activeCPUScheduler.getSchedule();
        if (
          updatedSchedule.length > 0 &&
          timeDelta <
            updatedSchedule[updatedSchedule.length - 1].timeDelta +
              updatedSchedule[updatedSchedule.length - 1].burstTime
        ) {
          setAutoScheduling(true);
          setIntervalVal(
            setInterval(
              () => setTimeDelta((currentTime) => currentTime + 1),
              1000 / simulationSpeed,
            ),
          );
        }
      },
    },
    {
      label: "Step forward",
      icon: StepForward,
      action: () => {
        stopPlayback();
        if (
          schedule.length > 0 &&
          timeDelta <
            schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime
        )
          setTimeDelta(timeDelta + 1);
      },
    },
    {
      label: "Jump to end",
      icon: SkipForward,
      action: () => {
        stopPlayback();
        if (schedule.length > 0)
          setTimeDelta(
            schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime,
          );
      },
    },
  ];

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
      <div>
        <div
          className={`grid gap-4 sm:grid-cols-2 ${activeSchedulerName === "RR" ? "xl:grid-cols-[minmax(10rem,1fr)_minmax(12rem,0.8fr)_7rem_8rem]" : "xl:grid-cols-[minmax(10rem,1fr)_minmax(12rem,0.8fr)_8rem]"}`}
        >
          <label className="block">
            <span className="label">Scheduling policy</span>
            <span className="select is-fullwidth">
              <select
                value={activeSchedulerName}
                onChange={(event) => {
                  stopPlayback();
                  const schedulerName = event.currentTarget.value as SchedulerName;

                  if (jobQueue.length > 0) {
                    setPendingSchedulerName(schedulerName);
                    setActiveModal("confirmSwitchCPU");
                  } else {
                    setActiveSchedulerName(schedulerName);
                    setActiveCPUScheduler(Scheduler[schedulerName]);
                    setJobQueue([]);
                  }
                }}
              >
                {dropdownOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <SimulationDemoSelect demos={CPU_DEMOS} onLoad={loadDemo} />
          {activeSchedulerName === "RR" && (
            <label className="block">
              <span className="label">Time quantum</span>
              <input
                className="input"
                type="number"
                value={timeQuantum}
                min="1"
                onChange={(event) => {
                  if (
                    Number.isFinite(event.currentTarget.valueAsNumber) &&
                    event.currentTarget.valueAsNumber >= 1
                  )
                    setTimeQuantum(event.currentTarget.valueAsNumber);
                }}
              />
            </label>
          )}
          <label className="block">
            <span className="label">Speed</span>
            <span className="field has-addons mb-0">
              <span className="control w-full">
                <input
                  className="input"
                  type="number"
                  defaultValue="1"
                  min="0.1"
                  max="10"
                  step="0.1"
                  aria-label="Playback speed multiplier"
                  disabled={autoScheduling}
                  onChange={(event) => {
                    setSimulationSpeed(event.currentTarget.valueAsNumber);
                  }}
                />
              </span>
              <span className="control">
                <span className="button is-static px-3 font-mono" aria-hidden="true">
                  ×
                </span>
              </span>
            </span>
          </label>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{policyDescription}</p>
      </div>
      <SimulationPlaybackControls
        controls={playbackControls}
        label="Timeline"
        showReset={jobQueue.length > 0}
        onReset={() => {
          setActiveModal("resetCPU");
          stopPlayback();
        }}
      />
      {activeSchedulerName === "Priority" ? <AddCPUProcess isPriorityProcess /> : <AddCPUProcess />}
      <ConfirmSwitchCPU schedulerName={pendingSchedulerName} />
      <ResetCPU />
    </div>
  );
};

export default CPUControls;
