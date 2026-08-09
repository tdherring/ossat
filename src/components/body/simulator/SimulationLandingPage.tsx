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

const CPUPreview = () => (
  <div className="flex h-full flex-col justify-center" aria-hidden="true">
    <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Execution timeline</span>
      <span className="text-primary">t=4 · P1 running</span>
    </div>
    <div className="flex h-14 overflow-hidden rounded-[2px] border bg-background/65 font-mono text-[9px]">
      <div className="flex flex-[4] items-center justify-center border-r bg-primary/30">P1</div>
      <div className="flex flex-[2] items-center justify-center border-r bg-primary/10">P2</div>
      <div className="flex flex-[3] items-center justify-center border-r bg-primary/20">P3</div>
      <div className="flex flex-[1] items-center justify-center text-muted-foreground">Idle</div>
    </div>
    <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
      <span>0</span>
      <span>4</span>
      <span>6</span>
      <span>9</span>
      <span>10</span>
    </div>
  </div>
);

const MemoryPreview = () => (
  <div className="flex h-full flex-col justify-center" aria-hidden="true">
    <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Block allocation</span>
      <span className="text-primary">First fit</span>
    </div>
    <div className="space-y-2">
      {[
        { block: "B1", used: 0, total: 100, process: "Free" },
        { block: "B2", used: 212, total: 500, process: "P1" },
        { block: "B3", used: 112, total: 200, process: "P3" },
        { block: "B4", used: 0, total: 300, process: "Free" },
        { block: "B5", used: 417, total: 600, process: "P2" },
      ].map((block) => (
        <div key={block.block} className="grid grid-cols-[1.7rem_1fr_auto] items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground">{block.block}</span>
          <div className="relative h-6 overflow-hidden border bg-muted/30">
            {block.used > 0 && (
              <div
                className="flex h-full items-center bg-primary/25 px-2 font-mono text-[9px]"
                style={{ width: `${(block.used / block.total) * 100}%` }}
              >
                {block.process}
              </div>
            )}
          </div>
          <span className="w-14 text-right font-mono text-[8px] text-muted-foreground">
            {block.used > 0 ? `${block.used} used` : block.process}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const VirtualMemoryPreview = () => (
  <div className="flex h-full flex-col justify-center" aria-hidden="true">
    <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Address translation</span>
      <span className="text-primary">Page fault</span>
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1.35fr] items-stretch gap-3">
      <div className="flex flex-col justify-between border bg-muted/25 p-3">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          CPU
        </span>
        <strong className="mt-5 font-mono text-2xl">P4</strong>
      </div>
      <ArrowRight className="h-3.5 w-3.5 self-center text-muted-foreground" />
      <div className="flex flex-col justify-between border bg-muted/25 p-3">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          TLB
        </span>
        <strong className="mt-5 font-mono text-sm text-primary">Miss</strong>
      </div>
      <ArrowRight className="h-3.5 w-3.5 self-center text-muted-foreground" />
      <div className="border border-primary/25 bg-primary/10 p-3">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          RAM frames
        </span>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {[2, 0, 4, 3].map((page, frame) => (
            <div
              key={frame}
              className={`border-l-2 px-2 py-1 font-mono text-[8px] ${page === 4 ? "border-primary bg-primary/20 text-foreground" : "border-border bg-muted/40 text-muted-foreground"}`}
            >
              F{frame} · P{page}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DiskPreview = () => (
  <div className="flex h-full flex-col justify-center" aria-hidden="true">
    <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Disk mechanism</span>
      <span className="text-primary">SCAN →</span>
    </div>
    <div className="relative h-20">
      <div className="absolute inset-x-0 top-10 h-px bg-border" />
      {[7, 19, 33, 49, 61, 72, 92].map((position) => (
        <span
          key={position}
          className="absolute top-[2.2rem] h-2.5 w-2.5 -translate-x-1/2 border bg-card"
          style={{ left: `${position}%` }}
        />
      ))}
      <div className="absolute left-[27%] top-1 h-9 border-l-2 border-primary">
        <span className="absolute -left-4 -top-1 font-mono text-[9px] text-primary">53</span>
      </div>
      <div className="absolute left-[27%] right-[28%] top-4 border-t border-dashed border-primary/50" />
      <ArrowRight className="absolute left-[70%] top-2 h-4 w-4 text-primary" />
      <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>0</span>
        <span>199</span>
      </div>
    </div>
  </div>
);

const DemoLinks = <T extends { id: string; label: string }>({
  demos,
  onLoad,
}: {
  demos: T[];
  onLoad: (demo: T) => void;
}) => (
  <div>
    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      Quick start
    </p>
    <div className="divide-y border-y">
      {demos.map((demo) => (
        <button
          key={demo.id}
          type="button"
          className="group/demo flex w-full items-center justify-between gap-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={() => onLoad(demo)}
        >
          <span>{demo.label}</span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-primary transition-transform group-hover/demo:translate-x-1"
            strokeWidth={1.75}
          />
        </button>
      ))}
    </div>
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
    className="group/card flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[4px] border bg-card shadow-sm transition-colors hover:border-primary/30"
    aria-labelledby={headingId}
  >
    <div className="flex items-start justify-between gap-5 border-b px-5 py-5 2xl:px-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-[3.375rem] w-[3.375rem] shrink-0 items-center justify-center rounded-[3px] border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-2xl font-semibold tracking-wide">
            {title}
          </h2>
          <p className="mt-1.5 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {policies}
          </p>
        </div>
      </div>
      <span className="pt-1 font-mono text-xs text-muted-foreground/70">{index}</span>
    </div>
    <div className="grid min-h-0 flex-1 gap-6 px-5 py-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(13rem,0.85fr)] sm:items-stretch 2xl:px-6 2xl:py-6">
      <div className="flex min-h-0 flex-col rounded-[3px] border bg-background/35 p-4">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Preview
        </p>
        <div className="flex min-h-20 flex-1 items-center [&>*]:w-full">{preview}</div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-col">
        <DemoLinks demos={demos} onLoad={onLoad} />
        <button
          type="button"
          className="group mt-4 inline-flex min-h-10 items-center gap-2 self-start py-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-auto"
          onClick={onOpen}
        >
          Open simulator
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </button>
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

  return (
    <div className="col-span-12 flex min-h-0 flex-col self-stretch lg:flex-1">
      <header className="pb-4">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Simulations
        </h1>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-2 lg:grid-rows-2">
        <SimulatorOverview
          headingId="cpu-overview-title"
          index="01"
          title="CPU Scheduling"
          policies="FCFS · SJF · Priority · Round Robin · SRTF"
          icon={Cpu}
          preview={<CPUPreview />}
          demos={CPU_DEMOS}
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
          demos={MEMORY_DEMOS}
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
          demos={VIRTUAL_MEMORY_DEMOS}
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
