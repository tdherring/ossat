import { useContext, useState, useEffect } from "react";
import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward } from "lucide-react";
import { ModalContext } from "../../../../contexts/ModalContext";
import { MemoryManagerContext, type ManagerName } from "../../../../contexts/MemoryManagerContext";
import AddMemoryBlock from "../../../modals/AddMemoryBlock";
import AddMemoryProcess from "../../../modals/AddMemoryProcess";
import ResetMemory from "../../../modals/ResetMemory";
import ConfirmSwitchMemory from "../../../modals/ConfirmSwitchMemory";
import SimulationPlaybackControls from "../SimulationPlaybackControls";
import SimulationDemoSelect from "../SimulationDemoSelect";
import { MEMORY_DEMOS, populateMemoryDemo } from "../../../../lib/simulationDemos";

const MemoryControls = ({ policyDescription }: { policyDescription: string }) => {
  const [, setActiveModal] = useContext(ModalContext);
  const [timeDelta, setTimeDelta] = useContext(MemoryManagerContext).time;
  const [simulationSpeed, setSimulationSpeed] = useContext(MemoryManagerContext).speed;
  const [jobQueue, setJobQueue] = useContext(MemoryManagerContext).jQueue;
  const [activeManager, setActiveManager] = useContext(MemoryManagerContext).active;
  const [activeManagerName, setActiveManagerName] = useContext(MemoryManagerContext).activeName;
  const [blocks, setBlocks] = useContext(MemoryManagerContext).blocks;
  const [allocated, setAllocated] = useContext(MemoryManagerContext).allocated;
  const Manager = useContext(MemoryManagerContext).manager;

  const dropdownOptions: ManagerName[] = ["First Fit", "Best Fit", "Worst Fit"];

  const [autoAllocating, setAutoAllocating] = useState(false);
  const [intervalVal, setIntervalVal] = useState<ReturnType<typeof setInterval> | null>(null);

  const [pendingManagerName, setPendingManagerName] = useState<ManagerName | null>(null);

  // Stop the auto allocator from overflowing the allocation boundaries.
  useEffect(() => {
    if (Object.keys(allocated).length > 0 && timeDelta >= Object.keys(allocated).length) {
      setAutoAllocating(false);
      if (intervalVal) clearInterval(intervalVal);
    }
    if (!autoAllocating && intervalVal) clearInterval(intervalVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeDelta, intervalVal]);

  useEffect(
    () => () => {
      if (intervalVal) clearInterval(intervalVal);
    },
    [intervalVal],
  );

  const loadDemo = (demoId: string) => {
    const demo = MEMORY_DEMOS.find(({ id }) => id === demoId);
    if (!demo) return;

    setAutoAllocating(false);
    if (intervalVal) clearInterval(intervalVal);
    setIntervalVal(null);

    const nextManager = populateMemoryDemo(Manager, demo);

    setActiveManagerName(demo.policy);
    setActiveManager(nextManager);
    setJobQueue([...nextManager.getJobQueue()]);
    setBlocks([...nextManager.getBlocks()]);
    setAllocated({});
    setTimeDelta(0);
  };

  const playbackControls = [
    {
      label: "Jump to start",
      icon: SkipBack,
      action: () => {
        setTimeDelta(0);
        setAutoAllocating(false);
      },
    },
    {
      label: "Step backward",
      icon: StepBack,
      action: () => {
        if (timeDelta > 0) setTimeDelta(timeDelta - 1);
        setAutoAllocating(false);
      },
    },
    {
      label: autoAllocating ? "Pause" : "Play",
      icon: autoAllocating ? Pause : Play,
      action: () => {
        if (jobQueue.length === 0 || blocks.length === 0) return;
        activeManager.allocateProcesses();
        const nextAllocation = activeManager.getAllocated();
        setAllocated(nextAllocation);
        if (Object.keys(nextAllocation).length > 0) setAutoAllocating(!autoAllocating);
        if (autoAllocating && intervalVal) clearInterval(intervalVal);
        if (!autoAllocating && timeDelta < Object.keys(nextAllocation).length) {
          setIntervalVal(
            setInterval(
              () => setTimeDelta((currentTime) => currentTime + 1),
              1000 / simulationSpeed,
            ),
          );
        } else {
          setAutoAllocating(false);
        }
      },
    },
    {
      label: "Step forward",
      icon: StepForward,
      action: () => {
        if (timeDelta < Object.keys(allocated).length) setTimeDelta(timeDelta + 1);
        setAutoAllocating(false);
      },
    },
    {
      label: "Jump to end",
      icon: SkipForward,
      action: () => {
        setTimeDelta(Object.keys(allocated).length);
        setAutoAllocating(false);
      },
    },
  ];

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
      <div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_minmax(12rem,0.8fr)_8rem]">
          <label className="block">
            <span className="label">Allocation policy</span>
            <span className="select is-fullwidth">
              <select
                value={activeManagerName}
                onChange={(event) => {
                  setAutoAllocating(false);
                  const managerName = event.currentTarget.value as ManagerName;

                  if (blocks.length > 0 || jobQueue.length > 0) {
                    setPendingManagerName(managerName);
                    setActiveModal("confirmSwitchMemory");
                  } else {
                    setActiveManagerName(managerName);
                    setActiveManager(Manager[managerName]);
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
          <SimulationDemoSelect demos={MEMORY_DEMOS} onLoad={loadDemo} />
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
        label="Allocation"
        showReset={jobQueue.length > 0 || blocks.length > 0}
        onReset={() => {
          setActiveModal("resetMemory");
          setAutoAllocating(false);
        }}
      />
      <AddMemoryBlock />
      <AddMemoryProcess />
      <ResetMemory />
      <ConfirmSwitchMemory managerName={pendingManagerName} />
    </div>
  );
};

export default MemoryControls;
