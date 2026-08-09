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
  <div className="flex h-full flex-col justify-center gap-4" aria-hidden="true">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          <span>Job queue</span>
          <span>4 jobs</span>
        </div>
        <div className="space-y-1">
          {[
            ["P1", "0", "5"],
            ["P2", "1", "3"],
            ["P3", "2", "4"],
          ].map(([process, arrival, burst]) => (
            <div
              key={process}
              className="grid grid-cols-[1fr_auto_auto] gap-3 border-l-2 border-border bg-muted/35 px-2 py-1.5 font-mono text-[9px] text-muted-foreground"
            >
              <strong className="text-foreground">{process}</strong>
              <span>A{arrival}</span>
              <span>B{burst}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          <span>Ready queue</span>
          <span>t=4</span>
        </div>
        <div className="border border-primary/25 bg-primary/10 p-2">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <strong>P1</strong>
            <span className="text-primary">Executing</span>
          </div>
          <div className="mt-2 h-1 bg-muted">
            <div className="h-full w-4/5 bg-primary" />
          </div>
          <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">1 unit remaining</p>
        </div>
        <div className="mt-1 flex gap-1">
          {["P2", "P3"].map((process) => (
            <span
              key={process}
              className="flex-1 border px-2 py-1 font-mono text-[9px] text-muted-foreground"
            >
              {process}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Execution timeline</span>
        <span>10 units</span>
      </div>
      <div className="flex h-10 overflow-hidden rounded-[2px] border bg-background/65 font-mono text-[9px]">
        <div className="flex flex-[4] items-center justify-center border-r bg-primary/25">P1</div>
        <div className="flex flex-[2] items-center justify-center border-r bg-primary/10">P2</div>
        <div className="flex flex-[3] items-center justify-center border-r bg-primary/20">P3</div>
        <div className="flex flex-[1] items-center justify-center text-muted-foreground">Idle</div>
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>0</span>
        <span>4</span>
        <span>6</span>
        <span>9</span>
        <span>10</span>
      </div>
    </div>
  </div>
);

const MemoryPreview = () => (
  <div className="grid h-full grid-cols-[0.72fr_1.28fr] items-center gap-4" aria-hidden="true">
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Process queue</span>
        <span>Size</span>
      </div>
      <div className="divide-y border">
        {[
          ["P1", "212", "B2"],
          ["P2", "417", "B5"],
          ["P3", "112", "B3"],
          ["P4", "426", "—"],
        ].map(([process, size, block]) => (
          <div
            key={process}
            className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1.5 font-mono text-[9px]"
          >
            <strong>{process}</strong>
            <span className="text-muted-foreground">{size}</span>
            <span className={block === "—" ? "text-destructive" : "text-primary"}>{block}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Memory layout</span>
        <span>Used / free</span>
      </div>
      <div className="space-y-1.5">
        {[
          { block: "B1", used: 0, total: 100, process: "Available" },
          { block: "B2", used: 212, total: 500, process: "P1" },
          { block: "B3", used: 112, total: 200, process: "P3" },
          { block: "B4", used: 0, total: 300, process: "Available" },
          { block: "B5", used: 417, total: 600, process: "P2" },
        ].map((block) => (
          <div key={block.block} className="grid grid-cols-[1.7rem_1fr_auto] items-center gap-2">
            <span className="font-mono text-[9px] text-muted-foreground">{block.block}</span>
            <div className="relative h-5 overflow-hidden border bg-muted/30">
              {block.used > 0 && (
                <div
                  className="flex h-full items-center bg-primary/25 px-1.5 font-mono text-[8px]"
                  style={{ width: `${(block.used / block.total) * 100}%` }}
                >
                  {block.process}
                </div>
              )}
            </div>
            <span className="w-12 text-right font-mono text-[8px] text-muted-foreground">
              {block.used}/{block.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VirtualMemoryPreview = () => (
  <div className="flex h-full flex-col justify-center gap-4" aria-hidden="true">
    <div className="flex items-center justify-between border-b pb-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Address translation</span>
      <span>
        <strong className="text-foreground">3</strong> faults · <strong>60%</strong> rate
      </span>
    </div>
    <div className="grid grid-cols-[0.7fr_auto_0.85fr_auto_1.2fr] items-stretch gap-2">
      <div className="flex flex-col justify-between border bg-muted/25 p-2">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          CPU request
        </span>
        <strong className="mt-3 font-mono text-2xl">P4</strong>
      </div>
      <ArrowRight className="h-3.5 w-3.5 self-center text-muted-foreground" />
      <div className="border bg-muted/25 p-2">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          TLB
        </span>
        <div className="mt-2 space-y-1 font-mono text-[8px] text-muted-foreground">
          <div className="flex justify-between">
            <span>P0</span>
            <span>F1</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>P4</span>
            <span>Miss</span>
          </div>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 self-center text-muted-foreground" />
      <div className="border bg-muted/25 p-2">
        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          Physical RAM
        </span>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {[2, 0, 4, 3].map((page, frame) => (
            <div
              key={frame}
              className={`border-l-2 px-1.5 py-1 font-mono text-[8px] ${page === 4 ? "border-primary bg-primary/15 text-foreground" : "border-border bg-muted/40 text-muted-foreground"}`}
            >
              F{frame} · P{page}
            </div>
          ))}
        </div>
      </div>
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Reference trace</span>
        <span className="text-primary">Page fault</span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 0, 3, 4, 2, 3].map((page, index) => (
          <span
            key={`${page}-${index}`}
            className={`flex h-7 flex-1 items-center justify-center border font-mono text-[9px] ${index === 5 ? "border-primary bg-primary/15 text-primary" : index < 5 ? "bg-muted/40 text-muted-foreground" : "text-muted-foreground/60"}`}
          >
            {page}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const DiskPreview = () => (
  <div className="flex h-full flex-col justify-center gap-4" aria-hidden="true">
    <div className="grid grid-cols-3 divide-x border py-2 text-center font-mono">
      <div>
        <strong className="block text-sm text-foreground">53</strong>
        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Head</span>
      </div>
      <div>
        <strong className="block text-sm text-foreground">8</strong>
        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Requests</span>
      </div>
      <div>
        <strong className="block text-sm text-foreground">SCAN →</strong>
        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Policy</span>
      </div>
    </div>
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>Disk mechanism</span>
        <span>0—199</span>
      </div>
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-7 h-px bg-border" />
        {[7, 19, 27, 33, 49, 61, 62, 92].map((position) => (
          <span
            key={position}
            className="absolute top-[1.45rem] h-2.5 w-2.5 -translate-x-1/2 border bg-card"
            style={{ left: `${position}%` }}
          />
        ))}
        <div className="absolute left-[27%] top-0 h-7 border-l-2 border-primary">
          <span className="absolute -left-4 -top-0.5 font-mono text-[8px] text-primary">53</span>
        </div>
        <div className="absolute left-[27%] right-[38%] top-2 border-t border-dashed border-primary/50" />
        <ArrowRight className="absolute left-[60%] top-0 h-4 w-4 text-primary" />
      </div>
    </div>
    <div>
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        Service order
      </span>
      <div className="mt-2 flex items-center gap-1 font-mono text-[8px] text-muted-foreground">
        {[53, 65, 67, 98, 122, 124].map((cylinder, index) => (
          <div key={cylinder} className="contents">
            <span
              className={
                index === 0
                  ? "border border-primary px-1.5 py-1 text-primary"
                  : "border px-1.5 py-1"
              }
            >
              {cylinder}
            </span>
            {index < 5 && <ArrowRight className="h-3 w-3 shrink-0" />}
          </div>
        ))}
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
    className="group/card flex min-w-0 flex-col overflow-hidden rounded-[4px] border bg-card shadow-sm transition-colors hover:border-primary/30"
    aria-labelledby={headingId}
  >
    <div className="flex items-start justify-between gap-5 border-b px-5 py-5 2xl:px-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
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
    <div className="grid flex-1 gap-6 px-5 py-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(13rem,0.85fr)] sm:items-stretch 2xl:px-6 2xl:py-6">
      <div className="flex flex-col rounded-[3px] border bg-background/35 p-4">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Preview
        </p>
        <div className="flex min-h-20 flex-1 items-center [&>*]:w-full">{preview}</div>
      </div>
      <div className="flex min-w-0 flex-col">
        <DemoLinks demos={demos} onLoad={onLoad} />
        <button
          type="button"
          className="group mt-4 inline-flex h-10 w-full items-center justify-between rounded-[3px] bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-auto"
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
    <div className="col-span-12 flex min-h-full flex-col">
      <header className="pb-4">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Simulations
        </h1>
      </header>

      <div className="grid flex-1 gap-5 lg:auto-rows-fr lg:grid-cols-2">
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
