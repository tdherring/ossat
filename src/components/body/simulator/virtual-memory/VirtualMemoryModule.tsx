import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  Database,
  HardDrive,
  MemoryStick,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Zap,
} from "lucide-react";
import SimulationDemoSelect from "../SimulationDemoSelect";
import SimulationPlaybackControls from "../SimulationPlaybackControls";
import useTracePlayback from "../useTracePlayback";
import {
  VIRTUAL_MEMORY_DEMOS,
  parsePageReferences,
  simulateVirtualMemory,
  type PageReplacementPolicy,
} from "../../../../lib/virtualMemorySimulation";

const policies: PageReplacementPolicy[] = ["FIFO", "LRU", "Clock", "Optimal"];
const policyDescriptions: Record<PageReplacementPolicy, string> = {
  FIFO: "Replaces the page that has occupied a frame for the longest time.",
  LRU: "Replaces the resident page that was least recently referenced.",
  Clock: "Gives referenced pages a second chance before replacement.",
  Optimal: "Replaces the page whose next use is furthest away; useful as a comparison baseline.",
};

const VirtualMemoryModule = () => {
  const location = useLocation();
  const requestedDemo = (location.state as { demoId?: string } | null)?.demoId;
  const initialDemo = VIRTUAL_MEMORY_DEMOS.find((candidate) => candidate.id === requestedDemo);
  const [policy, setPolicy] = useState<PageReplacementPolicy>(initialDemo?.policy ?? "FIFO");
  const [frameCount, setFrameCount] = useState(initialDemo?.frameCount ?? 4);
  const [tlbSize, setTlbSize] = useState(initialDemo?.tlbSize ?? 3);
  const [referenceInput, setReferenceInput] = useState(
    initialDemo ? initialDemo.references.join(", ") : "",
  );
  const [speed, setSpeed] = useState(1);
  const references = useMemo(() => parsePageReferences(referenceInput), [referenceInput]);
  const trace = useMemo(
    () => simulateVirtualMemory(references, frameCount, tlbSize, policy),
    [frameCount, policy, references, tlbSize],
  );
  const playback = useTracePlayback(trace.length, speed, trace);
  const current = playback.step > 0 ? trace[playback.step - 1] : null;
  const frames = current?.frames ?? Array.from<number | null>({ length: frameCount }).fill(null);
  const pages = useMemo(() => [...new Set(references)].sort((a, b) => a - b), [references]);
  const faultRate = current ? Math.round((current.faults / (current.index + 1)) * 100) : 0;

  const loadDemo = (id: string) => {
    const demo = VIRTUAL_MEMORY_DEMOS.find((candidate) => candidate.id === id);
    if (!demo) return;
    playback.stop();
    setPolicy(demo.policy);
    setFrameCount(demo.frameCount);
    setTlbSize(demo.tlbSize);
    setReferenceInput(demo.references.join(", "));
  };

  const controls = [
    { label: "Jump to start", icon: SkipBack, action: () => playback.setStep(0) },
    {
      label: "Step backward",
      icon: StepBack,
      action: () => playback.setStep(playback.step - 1),
    },
    {
      label: playback.playing ? "Pause" : "Play",
      icon: playback.playing ? Pause : Play,
      action: playback.toggle,
    },
    {
      label: "Step forward",
      icon: StepForward,
      action: () => playback.setStep(playback.step + 1),
    },
    { label: "Jump to end", icon: SkipForward, action: () => playback.setStep(trace.length) },
  ];

  return (
    <div className="col-span-12 flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex flex-col gap-6 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Virtual Memory
        </h1>
        <div className="grid min-w-32 grid-cols-[1fr_auto] items-center border bg-card">
          <span className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Memory access
          </span>
          <strong className="border-l px-5 py-3 font-mono text-2xl font-semibold tabular-nums">
            {playback.step}/{trace.length}
          </strong>
        </div>
      </header>

      <section className="mt-4 min-h-0 flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <div className="grid shrink-0 gap-5 pb-5 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
          <div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,0.7fr)_minmax(12rem,1fr)_6rem_6rem_6rem]">
              <label>
                <span className="label">Replacement policy</span>
                <span className="select is-fullwidth">
                  <select
                    value={policy}
                    onChange={(event) =>
                      setPolicy(event.currentTarget.value as PageReplacementPolicy)
                    }
                  >
                    {policies.map((candidate) => (
                      <option key={candidate}>{candidate}</option>
                    ))}
                  </select>
                </span>
              </label>
              <SimulationDemoSelect demos={VIRTUAL_MEMORY_DEMOS} onLoad={loadDemo} />
              <label>
                <span className="label">Frames</span>
                <input
                  className="input"
                  type="number"
                  min="2"
                  max="8"
                  value={frameCount}
                  onChange={(event) =>
                    setFrameCount(Math.min(8, Math.max(2, event.currentTarget.valueAsNumber || 2)))
                  }
                />
              </label>
              <label>
                <span className="label">TLB entries</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="6"
                  value={tlbSize}
                  onChange={(event) =>
                    setTlbSize(Math.min(6, Math.max(1, event.currentTarget.valueAsNumber || 1)))
                  }
                />
              </label>
              <label>
                <span className="label">Speed</span>
                <input
                  className="input"
                  type="number"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={speed}
                  disabled={playback.playing}
                  onChange={(event) => setSpeed(event.currentTarget.valueAsNumber || 1)}
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="label">Page reference string</span>
              <input
                className="input font-mono"
                value={referenceInput}
                onChange={(event) => setReferenceInput(event.currentTarget.value)}
                aria-label="Page reference string"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {policyDescriptions[policy]}
            </p>
          </div>
          <SimulationPlaybackControls
            controls={controls}
            label="Translation"
            showReset={playback.step > 0}
            onReset={() => playback.setStep(0)}
          />
        </div>

        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <section
            className="min-w-0 lg:min-h-0 lg:overflow-auto data-scroll"
            aria-labelledby="translation-path-heading"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="translation-path-heading" className="text-lg font-semibold">
                Address translation
              </h2>
              <div className="flex gap-5 font-mono text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">{current?.faults ?? 0}</strong> faults
                </span>
                <span>
                  <strong className="text-foreground">{faultRate}%</strong> fault rate
                </span>
              </div>
            </div>

            <div className="grid items-stretch gap-2 xl:grid-cols-[0.7fr_auto_0.8fr_auto_1fr]">
              <HardwarePanel icon={Zap} title="CPU request" active={Boolean(current)}>
                <span className="block text-xs text-muted-foreground">Virtual page</span>
                <strong className="mt-2 block font-mono text-3xl">{current?.page ?? "—"}</strong>
              </HardwarePanel>
              <ArrowRight className="hidden h-4 w-4 self-center text-muted-foreground xl:block" />
              <HardwarePanel icon={Database} title="TLB" active={Boolean(current?.tlbHit)}>
                <div className="space-y-1 font-mono text-xs">
                  {(current?.tlb ?? []).map((entry) => (
                    <div key={entry.page} className="flex justify-between">
                      <span>p{entry.page}</span>
                      <span>f{entry.frame}</span>
                    </div>
                  ))}
                  {!current?.tlb.length && <span className="text-muted-foreground">Empty</span>}
                </div>
              </HardwarePanel>
              <ArrowRight className="hidden h-4 w-4 self-center text-muted-foreground xl:block" />
              <HardwarePanel icon={MemoryStick} title="Physical RAM" active={Boolean(current)}>
                <div className="grid gap-1">
                  {frames.map((page, frame) => (
                    <div
                      key={frame}
                      className={`flex min-h-9 items-center justify-between border-l-2 px-2 font-mono text-xs transition-colors ${current?.frame === frame ? "border-primary bg-primary/15 text-foreground motion-safe:animate-pulse" : "border-border bg-muted/40 text-muted-foreground"}`}
                    >
                      <span>Frame {frame}</span>
                      <strong>{page === null ? "Free" : `Page ${page}`}</strong>
                    </div>
                  ))}
                </div>
              </HardwarePanel>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <div className="border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Page table</h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Present / frame
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3">
                  {pages.map((page) => {
                    const frame = frames.indexOf(page);
                    return (
                      <div
                        key={page}
                        className={`flex justify-between border-b py-1.5 font-mono text-xs ${current?.page === page ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <span>Page {page}</span>
                        <span>{frame === -1 ? "Disk" : `F${frame}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-semibold">Backing store</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pages
                    .filter((page) => !frames.includes(page))
                    .map((page) => (
                      <span
                        key={page}
                        className={`border px-2 py-1 font-mono text-xs ${current?.evicted === page ? "border-destructive text-destructive" : "text-muted-foreground"}`}
                      >
                        Page {page}
                      </span>
                    ))}
                  {pages.every((page) => frames.includes(page)) && (
                    <span className="text-xs text-muted-foreground">
                      All referenced pages are resident.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex min-w-0 flex-col lg:min-h-0"
            aria-labelledby="reference-trace-heading"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="reference-trace-heading" className="text-lg font-semibold">
                Reference trace
              </h2>
              <span
                className={`text-xs font-semibold ${current?.hit ? "text-primary" : current ? "text-destructive" : "text-muted-foreground"}`}
              >
                {current
                  ? current.tlbHit
                    ? "TLB hit"
                    : current.hit
                      ? "RAM hit"
                      : "Page fault"
                  : "Ready"}
              </span>
            </div>
            <div className="data-scroll min-h-52 overflow-auto border lg:min-h-0 lg:flex-1">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Access</th>
                    <th>Page</th>
                    <th>Frame</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {trace.map((item, index) => (
                    <tr
                      key={item.index}
                      className={
                        index === playback.step - 1
                          ? "bg-primary/10"
                          : index >= playback.step
                            ? "opacity-45"
                            : ""
                      }
                    >
                      <td>{index + 1}</td>
                      <td className="font-mono">{item.page}</td>
                      <td className="font-mono">F{item.frame}</td>
                      <td className={item.hit ? "text-primary" : "text-destructive"}>
                        {item.tlbHit ? "TLB hit" : item.hit ? "RAM hit" : "Fault"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

const HardwarePanel = ({
  icon: Icon,
  title,
  active,
  children,
}: {
  icon: typeof MemoryStick;
  title: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`border p-4 transition-colors ${active ? "border-primary/60 bg-primary/5" : "bg-card"}`}
  >
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

export default VirtualMemoryModule;
