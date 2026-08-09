import { useContext, type ComponentType, type ReactNode } from "react";
import { ArrowRight, Cpu, HardDrive, Layers3, MemoryStick } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";
import { MemoryManagerContext } from "../../../contexts/MemoryManagerContext";
import {
  CPU_DEMOS,
  MEMORY_DEMOS,
  populateCPUDemo,
  populateMemoryDemo,
  type CPUDemo,
  type MemoryDemo,
} from "../../../lib/simulationDemos";
import { routes } from "../../../lib/routes";
import { VIRTUAL_MEMORY_DEMOS } from "../../../lib/virtualMemorySimulation";
import { DISK_DEMOS } from "../../../lib/diskSchedulingSimulation";

const cpuDemoIds = ["fcfs-arrival-order", "rr-time-slicing", "srtf-preemption"];
const memoryDemoIds = ["first-fit-comparison", "best-fit-comparison", "worst-fit-comparison"];

const CPUPreview = () => (
  <div className="pt-2" aria-hidden="true">
    <div className="flex h-16 border-y border-l bg-background/45">
      <div className="flex-[4] border-r bg-primary/25" />
      <div className="flex-[2] border-r bg-primary/10" />
      <div className="flex-[3] border-r bg-primary/20" />
      <div className="flex-[1] border-r bg-muted/50" />
    </div>
    <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
      <span>t=0</span>
      <span>4</span>
      <span>6</span>
      <span>9</span>
      <span>10</span>
    </div>
  </div>
);

const MemoryPreview = () => (
  <div className="grid grid-cols-[0.8fr_1.4fr_1fr_1.2fr] gap-2 pt-2" aria-hidden="true">
    {[
      { used: "72%", label: "64" },
      { used: "44%", label: "128" },
      { used: "86%", label: "256" },
      { used: "60%", label: "512" },
    ].map((block) => (
      <div key={block.label} className="relative h-16 overflow-hidden bg-background/45">
        <div className="absolute inset-x-0 bottom-0 bg-primary/25" style={{ height: block.used }} />
        <span className="absolute bottom-1.5 left-2 font-mono text-[10px] text-muted-foreground">
          {block.label}
        </span>
      </div>
    ))}
  </div>
);

const VirtualMemoryPreview = () => (
  <div className="grid grid-cols-[0.8fr_auto_1fr] items-center gap-2 pt-2" aria-hidden="true">
    <div className="space-y-1">
      {[2, 0, 3].map((page) => (
        <div
          key={page}
          className="border-l-2 border-primary bg-primary/10 px-2 py-1 font-mono text-[10px]"
        >
          P{page}
        </div>
      ))}
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground" />
    <div className="grid grid-cols-2 gap-1">
      {[2, 0, 4, 3].map((page, frame) => (
        <div
          key={frame}
          className="bg-background/45 p-2 font-mono text-[10px] text-muted-foreground"
        >
          F{frame} · P{page}
        </div>
      ))}
    </div>
  </div>
);

const DiskPreview = () => (
  <div className="relative h-16 pt-2" aria-hidden="true">
    <div className="absolute inset-x-0 top-8 h-px bg-border" />
    {[8, 28, 45, 66, 88].map((position, index) => (
      <span
        key={position}
        className={`absolute top-[1.7rem] h-2.5 w-2.5 -translate-x-1/2 ${index === 2 ? "bg-primary" : "border bg-card"}`}
        style={{ left: `${position}%` }}
      />
    ))}
    <div className="absolute left-[45%] top-0 h-7 border-l-2 border-primary" />
  </div>
);

const DemoLinks = <T extends { id: string; label: string }>({
  demos,
  onLoad,
}: {
  demos: T[];
  onLoad: (demo: T) => void;
}) => (
  <div className="mt-4 grid gap-1">
    {demos.map((demo) => (
      <button
        key={demo.id}
        type="button"
        className="group/demo flex items-center justify-between bg-background/45 px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onLoad(demo)}
      >
        <span>{demo.label}</span>
        <ArrowRight
          className="h-4 w-4 text-primary transition-transform group-hover/demo:translate-x-1"
          strokeWidth={1.75}
        />
      </button>
    ))}
  </div>
);

interface SimulatorOverviewProps<T extends { id: string; label: string }> {
  headingId: string;
  index: string;
  title: string;
  policies: string;
  icon: ComponentType<LucideProps>;
  preview: ReactNode;
  demos: T[];
  onOpen: () => void;
  onLoad: (demo: T) => void;
}

const SimulatorOverview = <T extends { id: string; label: string }>({
  headingId,
  index,
  title,
  policies,
  icon: Icon,
  preview,
  demos,
  onOpen,
  onLoad,
}: SimulatorOverviewProps<T>) => (
  <section
    className="flex min-h-[20rem] min-w-0 flex-col bg-card p-5 2xl:p-6"
    aria-labelledby={headingId}
  >
    <div className="flex items-center justify-between text-primary">
      <Icon className="h-5 w-5" strokeWidth={1.75} />
      <span className="font-mono text-xs text-muted-foreground">{index}</span>
    </div>
    <h2 id={headingId} className="mt-4 font-display text-3xl font-semibold tracking-wide">
      {title}
    </h2>
    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
      {policies}
    </p>
    <div className="mt-4 grid flex-1 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.9fr)]">
      <div className="flex min-h-24 items-center [&>*]:w-full">{preview}</div>
      <div>
        <button
          type="button"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onOpen}
        >
          Open simulator{" "}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </button>
        <DemoLinks demos={demos} onLoad={onLoad} />
      </div>
    </div>
  </section>
);

const SimulationLandingPage = () => {
  const navigate = useNavigate();
  const cpuSimulator = useContext(CPUSimulatorContext);
  const memoryManager = useContext(MemoryManagerContext);

  const [, setActiveCPUScheduler] = cpuSimulator.active;
  const [, setActiveSchedulerName] = cpuSimulator.activeName;
  const [, setCPUJobQueue] = cpuSimulator.jQueue;
  const [, setReadyQueue] = cpuSimulator.rQueue;
  const [, setCPUTime] = cpuSimulator.time;
  const [, setCurrentProcess] = cpuSimulator.current;
  const [, setCPUPlaying] = cpuSimulator.playing;
  const schedulers = cpuSimulator.scheduler;

  const [, setActiveManager] = memoryManager.active;
  const [, setActiveManagerName] = memoryManager.activeName;
  const [, setMemoryJobQueue] = memoryManager.jQueue;
  const [, setBlocks] = memoryManager.blocks;
  const [, setAllocated] = memoryManager.allocated;
  const [, setMemoryTime] = memoryManager.time;
  const managers = memoryManager.manager;

  const loadCPUDemo = (demo: CPUDemo) => {
    const scheduler = populateCPUDemo(schedulers, demo);
    setCPUPlaying(false);
    setActiveSchedulerName(demo.policy);
    setActiveCPUScheduler(scheduler);
    setCPUJobQueue([...scheduler.getJobQueue()]);
    setReadyQueue([]);
    setCurrentProcess(null);
    setCPUTime(0);
    navigate(routes.cpuSimulator);
  };

  const loadMemoryDemo = (demo: MemoryDemo) => {
    const manager = populateMemoryDemo(managers, demo);
    setActiveManagerName(demo.policy);
    setActiveManager(manager);
    setMemoryJobQueue([...manager.getJobQueue()]);
    setBlocks([...manager.getBlocks()]);
    setAllocated({});
    setMemoryTime(0);
    navigate(routes.memorySimulator);
  };

  const cpuDemos = cpuDemoIds
    .map((id) => CPU_DEMOS.find((demo) => demo.id === id))
    .filter((demo) => demo !== undefined);
  const memoryDemos = memoryDemoIds
    .map((id) => MEMORY_DEMOS.find((demo) => demo.id === id))
    .filter((demo): demo is MemoryDemo => Boolean(demo));

  return (
    <div className="col-span-12 flex min-h-full flex-col">
      <header className="pb-4">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Simulations
        </h1>
      </header>

      <div className="grid flex-1 gap-5 lg:grid-cols-2">
        <SimulatorOverview
          headingId="cpu-overview-title"
          index="01"
          title="CPU Scheduling"
          policies="FCFS · SJF · Priority · Round Robin · SRTF"
          icon={Cpu}
          preview={<CPUPreview />}
          demos={cpuDemos}
          onOpen={() => navigate(routes.cpuSimulator)}
          onLoad={loadCPUDemo}
        />
        <SimulatorOverview
          headingId="memory-overview-title"
          index="02"
          title="Memory Allocation"
          policies="First Fit · Best Fit · Worst Fit"
          icon={MemoryStick}
          preview={<MemoryPreview />}
          demos={memoryDemos}
          onOpen={() => navigate(routes.memorySimulator)}
          onLoad={loadMemoryDemo}
        />
        <SimulatorOverview
          headingId="virtual-memory-overview-title"
          index="03"
          title="Virtual Memory"
          policies="FIFO · LRU · Clock · Optimal"
          icon={Layers3}
          preview={<VirtualMemoryPreview />}
          demos={VIRTUAL_MEMORY_DEMOS.slice(0, 3)}
          onOpen={() => navigate(routes.virtualMemorySimulator)}
          onLoad={(demo) => navigate(routes.virtualMemorySimulator, { state: { demoId: demo.id } })}
        />
        <SimulatorOverview
          headingId="disk-overview-title"
          index="04"
          title="Disk Scheduling"
          policies="FCFS · SSTF · SCAN · LOOK"
          icon={HardDrive}
          preview={<DiskPreview />}
          demos={DISK_DEMOS}
          onOpen={() => navigate(routes.diskSimulator)}
          onLoad={(demo) => navigate(routes.diskSimulator, { state: { demoId: demo.id } })}
        />
      </div>
    </div>
  );
};

export default SimulationLandingPage;
