import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CircleDot,
  Gauge,
  HardDrive,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";
import SimulationDemoSelect from "../SimulationDemoSelect";
import SimulationPlaybackControls from "../SimulationPlaybackControls";
import useTracePlayback from "../useTracePlayback";
import {
  DISK_DEMOS,
  constrainDiskGeometry,
  simulateDiskScheduling,
  type DiskDirection,
  type DiskSchedulingPolicy,
  type DiskVisit,
} from "../../../../lib/diskSchedulingSimulation";

const policies: DiskSchedulingPolicy[] = ["FCFS", "SSTF", "SCAN", "C-SCAN", "LOOK", "C-LOOK"];
const directionalPolicies = new Set<DiskSchedulingPolicy>(["SCAN", "C-SCAN", "LOOK", "C-LOOK"]);
const descriptions: Record<DiskSchedulingPolicy, string> = {
  FCFS: "Services requests in queue order without reordering them.",
  SSTF: "Services the request closest to the current head position.",
  SCAN: "Moves toward one end of the disk, then reverses direction.",
  "C-SCAN": "Services in one direction and returns to the opposite boundary before continuing.",
  LOOK: "Reverses at the final pending request rather than the physical disk boundary.",
  "C-LOOK": "Services in one direction, then jumps to the furthest request on the other side.",
};

const parseRequests = (value: string, maxCylinder: number) =>
  value
    .split(/[\s,]+/)
    .filter((token) => token.length > 0)
    .map(Number)
    .filter((request) => Number.isInteger(request) && request >= 0 && request <= maxCylinder)
    .slice(0, 30);

const getVisitLabel = (kind: DiskVisit["kind"]) => {
  if (kind === "start") return "Start";
  if (kind === "boundary") return "Turn / wrap";
  return "Request";
};

const getTraceRowClass = (index: number, currentStep: number) => {
  if (index === currentStep) return "bg-primary/10";
  if (index > currentStep) return "opacity-45";
  return "";
};

interface RequestProgress {
  total: number;
  serviced: number;
}

const getRequestProgress = (trace: DiskVisit[], step: number) => {
  const progressByCylinder = new Map<number, RequestProgress>();

  for (const visit of trace) {
    if (visit.kind !== "request") continue;
    const progress = progressByCylinder.get(visit.cylinder) ?? { total: 0, serviced: 0 };
    progress.total += 1;
    progressByCylinder.set(visit.cylinder, progress);
  }

  for (const visit of trace.slice(1, step + 1)) {
    if (visit.kind !== "request") continue;
    const progress = progressByCylinder.get(visit.cylinder);
    if (progress) progress.serviced += 1;
  }

  return progressByCylinder;
};

const getRequestStroke = (isCurrent: boolean, isComplete: boolean) => {
  if (isCurrent) return "hsl(var(--primary))";
  if (isComplete) return "hsl(var(--primary) / 0.35)";
  return "hsl(var(--muted-foreground) / 0.7)";
};

const DiskSchedulingModule = () => {
  const location = useLocation();
  const requestedDemo = (location.state as { demoId?: string } | null)?.demoId;
  const initialDemo = DISK_DEMOS.find((candidate) => candidate.id === requestedDemo);
  const [policy, setPolicy] = useState<DiskSchedulingPolicy>(initialDemo?.policy ?? "FCFS");
  const [direction, setDirection] = useState<DiskDirection>(initialDemo?.direction ?? "right");
  const [head, setHead] = useState(initialDemo?.head ?? 50);
  const [maxCylinder, setMaxCylinder] = useState(initialDemo?.maxCylinder ?? 199);
  const [requestInput, setRequestInput] = useState(
    initialDemo ? initialDemo.requests.join(", ") : "",
  );
  const [speed, setSpeed] = useState(1);
  const requests = useMemo(
    () => parseRequests(requestInput, maxCylinder),
    [maxCylinder, requestInput],
  );
  const trace = useMemo(
    () => simulateDiskScheduling(requests, head, maxCylinder, policy, direction),
    [direction, head, maxCylinder, policy, requests],
  );
  const playback = useTracePlayback(Math.max(0, trace.length - 1), speed, trace);
  const current = trace[playback.step];
  const final = trace.at(-1);
  const serviced = trace
    .slice(1, playback.step + 1)
    .filter((visit) => visit.kind === "request").length;
  const averageSeek = requests.length
    ? Math.round((final?.cumulativeMovement ?? 0) / requests.length)
    : 0;

  const loadDemo = (id: string) => {
    const demo = DISK_DEMOS.find((candidate) => candidate.id === id);
    if (!demo) return;
    playback.stop();
    setPolicy(demo.policy);
    setDirection(demo.direction);
    setHead(demo.head);
    setMaxCylinder(demo.maxCylinder);
    setRequestInput(demo.requests.join(", "));
  };

  const updateMaxCylinder = (value: number) => {
    const geometry = constrainDiskGeometry(value, head);
    setMaxCylinder(geometry.maxCylinder);
    setHead(geometry.head);
  };

  const controls = [
    { label: "Jump to start", icon: SkipBack, action: () => playback.setStep(0) },
    { label: "Step backward", icon: StepBack, action: () => playback.setStep(playback.step - 1) },
    {
      label: playback.playing ? "Pause" : "Play",
      icon: playback.playing ? Pause : Play,
      action: playback.toggle,
    },
    { label: "Step forward", icon: StepForward, action: () => playback.setStep(playback.step + 1) },
    { label: "Jump to end", icon: SkipForward, action: () => playback.setStep(trace.length - 1) },
  ];

  return (
    <div className="col-span-12 flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex flex-col gap-6 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Disk Scheduler
        </h1>
        <div className="grid min-w-32 grid-cols-[1fr_auto] items-center border bg-card">
          <span className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Head position
          </span>
          <strong className="border-l px-5 py-3 font-mono text-2xl font-semibold tabular-nums">
            {current?.cylinder ?? head}
          </strong>
        </div>
      </header>

      <section className="mt-4 min-h-0 flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        <div className="grid shrink-0 gap-5 pb-5 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-start">
          <div>
            <div
              className={`grid gap-4 sm:grid-cols-2 ${directionalPolicies.has(policy) ? "xl:grid-cols-[minmax(9rem,0.8fr)_minmax(12rem,1fr)_7rem_7rem_7rem_8rem]" : "xl:grid-cols-[minmax(9rem,0.8fr)_minmax(12rem,1fr)_7rem_7rem_8rem]"}`}
            >
              <label>
                <span className="label">Scheduling policy</span>
                <span className="select is-fullwidth">
                  <select
                    value={policy}
                    onChange={(event) =>
                      setPolicy(event.currentTarget.value as DiskSchedulingPolicy)
                    }
                  >
                    {policies.map((candidate) => (
                      <option key={candidate}>{candidate}</option>
                    ))}
                  </select>
                </span>
              </label>
              <SimulationDemoSelect demos={DISK_DEMOS} onLoad={loadDemo} />
              <label>
                <span className="label">Initial head</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max={maxCylinder}
                  value={head}
                  onChange={(event) =>
                    setHead(
                      Math.min(maxCylinder, Math.max(0, event.currentTarget.valueAsNumber || 0)),
                    )
                  }
                />
              </label>
              <label>
                <span className="label">Last cylinder</span>
                <input
                  className="input"
                  type="number"
                  min="20"
                  max="999"
                  value={maxCylinder}
                  onChange={(event) => updateMaxCylinder(event.currentTarget.valueAsNumber)}
                />
              </label>
              {directionalPolicies.has(policy) && (
                <label>
                  <span className="label">Direction</span>
                  <span className="select is-fullwidth">
                    <select
                      value={direction}
                      onChange={(event) => setDirection(event.currentTarget.value as DiskDirection)}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </span>
                </label>
              )}
              <label>
                <span className="label">Playback speed</span>
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
              <span className="label">Request queue</span>
              <input
                className="input font-mono"
                value={requestInput}
                onChange={(event) => setRequestInput(event.currentTarget.value)}
                aria-label="Disk request queue"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{descriptions[policy]}</p>
          </div>
          <SimulationPlaybackControls
            controls={controls}
            label="Head movement"
            showReset={playback.step > 0}
            onReset={() => playback.setStep(0)}
          />
        </div>

        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <section
            className="flex min-w-0 flex-col lg:min-h-0"
            aria-labelledby="disk-mechanism-heading"
          >
            <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 id="disk-mechanism-heading" className="text-lg font-semibold">
                Disk mechanism
              </h2>
              <div className="grid grid-cols-2 gap-5 font-mono text-xs text-muted-foreground">
                <span className="whitespace-nowrap">
                  <strong className="text-foreground">{current?.cumulativeMovement ?? 0}</strong>{" "}
                  moved
                </span>
                <span className="whitespace-nowrap">
                  <strong className="text-foreground">{averageSeek}</strong> avg. movement
                </span>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border bg-card p-4 sm:p-5 lg:min-h-72">
              <DiskMechanism
                trace={trace}
                step={playback.step}
                maxCylinder={maxCylinder}
                playing={playback.playing}
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-primary" /> Serviced
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 border" /> Pending
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-muted-foreground" /> Boundary
                </span>
              </div>
            </div>
          </section>

          <section
            className="flex min-w-0 flex-col lg:min-h-0"
            aria-labelledby="service-order-heading"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="service-order-heading" className="text-lg font-semibold">
                Service order
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {serviced}/{requests.length} requests
              </span>
            </div>
            <div className="data-scroll min-h-52 overflow-auto border lg:min-h-0 lg:flex-1">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Cylinder</th>
                    <th>Move</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {trace.map((visit, index) => (
                    <tr
                      key={`${visit.index}-${visit.cylinder}`}
                      className={getTraceRowClass(index, playback.step)}
                    >
                      <td>{index}</td>
                      <td className="font-mono">{visit.cylinder}</td>
                      <td className="font-mono">{visit.movement}</td>
                      <td
                        className={
                          visit.kind === "request" ? "text-primary" : "text-muted-foreground"
                        }
                      >
                        {getVisitLabel(visit.kind)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={Gauge} label="Total movement" value={final?.cumulativeMovement ?? 0} />
              <Metric icon={CircleDot} label="Requests" value={requests.length} />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

const DiskMechanism = ({
  trace,
  step,
  maxCylinder,
  playing,
}: {
  trace: ReturnType<typeof simulateDiskScheduling>;
  step: number;
  maxCylinder: number;
  playing: boolean;
}) => {
  const current = trace[step] ?? trace[0];
  const platter = { x: 205, y: 205, outer: 135, inner: 40 };
  const pivot = { x: 385, y: 320 };
  const armLength = 185;
  const rail = { x: 505, y: 160, width: 340 };
  const radiusForCylinder = (cylinder: number) =>
    platter.outer - (cylinder / Math.max(1, maxCylinder)) * (platter.outer - platter.inner);
  const requestProgress = getRequestProgress(trace, step);

  const headRadius = radiusForCylinder(current?.cylinder ?? 0);
  const centreDistance = Math.hypot(platter.x - pivot.x, platter.y - pivot.y);
  const alongCentreLine =
    (armLength ** 2 - headRadius ** 2 + centreDistance ** 2) / (2 * centreDistance);
  const intersectionOffset = Math.sqrt(Math.max(0, armLength ** 2 - alongCentreLine ** 2));
  const unit = {
    x: (platter.x - pivot.x) / centreDistance,
    y: (platter.y - pivot.y) / centreDistance,
  };
  const perpendicular = { x: -unit.y, y: unit.x };
  const head = {
    x: pivot.x + alongCentreLine * unit.x + intersectionOffset * perpendicular.x,
    y: pivot.y + alongCentreLine * unit.y + intersectionOffset * perpendicular.y,
  };
  const armAngle = (Math.atan2(head.y - pivot.y, head.x - pivot.x) * 180) / Math.PI;
  const armTipX = pivot.x + armLength;
  const railHeadX = rail.x + ((current?.cylinder ?? 0) / Math.max(1, maxCylinder)) * rail.width;

  return (
    <svg
      className="block aspect-[11/5] w-full lg:aspect-auto lg:min-h-0 lg:flex-1"
      viewBox="0 0 880 400"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Hard disk platter with fixed-length actuator arm and cylinder request rail"
    >
      <text
        className="hidden sm:block"
        x="70"
        y="35"
        fill="hsl(var(--muted-foreground))"
        fontSize="12"
        fontFamily="monospace"
      >
        PLATTER
      </text>
      <circle
        cx={platter.x}
        cy={platter.y}
        r={platter.outer + 8}
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      <circle
        cx={platter.x}
        cy={platter.y}
        r={platter.outer}
        fill="hsl(var(--muted) / 0.35)"
        stroke="hsl(var(--muted-foreground) / 0.45)"
      />
      <g
        className="disk-platter-motion"
        style={{ transformOrigin: `${platter.x}px ${platter.y}px` }}
      >
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          const innerRadius = platter.outer - (index === 0 ? 24 : 15);
          const outerRadius = platter.outer - 5;
          return (
            <line
              key={index}
              x1={platter.x + Math.cos(angle) * innerRadius}
              y1={platter.y + Math.sin(angle) * innerRadius}
              x2={platter.x + Math.cos(angle) * outerRadius}
              y2={platter.y + Math.sin(angle) * outerRadius}
              stroke={index === 0 ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={index === 0 ? 3 : 2}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      {[0, 0.25, 0.5, 0.75, 1].map((position) => (
        <circle
          key={position}
          cx={platter.x}
          cy={platter.y}
          r={platter.inner + position * (platter.outer - platter.inner)}
          fill="none"
          stroke="hsl(var(--border))"
          strokeDasharray={position === 1 ? undefined : "3 5"}
        />
      ))}
      <circle
        cx={platter.x}
        cy={platter.y}
        r={platter.inner - 8}
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      <circle cx={platter.x} cy={platter.y} r="7" fill="hsl(var(--muted-foreground))" />

      {[...requestProgress.entries()].map(([cylinder, progress]) => {
        const isCurrent = current?.cylinder === cylinder;
        const complete = progress.serviced === progress.total;
        return (
          <circle
            key={cylinder}
            cx={platter.x}
            cy={platter.y}
            r={radiusForCylinder(cylinder)}
            fill="none"
            stroke={getRequestStroke(isCurrent, complete)}
            strokeWidth={isCurrent ? 4 : 1.5}
            strokeDasharray={complete || isCurrent ? undefined : "5 4"}
          />
        );
      })}

      <g
        style={{
          transform: `rotate(${armAngle}deg)`,
          transformOrigin: `${pivot.x}px ${pivot.y}px`,
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <path
          d={`M ${pivot.x + 3} ${pivot.y - 8} L ${armTipX - 25} ${pivot.y - 3} L ${armTipX - 25} ${pivot.y + 3} L ${pivot.x + 3} ${pivot.y + 8} Z`}
          fill="hsl(var(--muted-foreground) / 0.78)"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1={pivot.x + 13}
          y1={pivot.y}
          x2={armTipX - 29}
          y2={pivot.y}
          stroke="hsl(var(--card) / 0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1={armTipX - 27}
          y1={pivot.y}
          x2={armTipX - 7}
          y2={pivot.y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x={armTipX - 9}
          y={pivot.y - 4}
          width="9"
          height="8"
          rx="1"
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className={playing ? "motion-safe:animate-pulse" : ""}
        />
        <circle cx={armTipX} cy={pivot.y} r="2" fill="hsl(var(--primary))" />
      </g>
      <circle
        cx={pivot.x}
        cy={pivot.y}
        r="15"
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth="3"
      />
      <circle cx={pivot.x} cy={pivot.y} r="5" fill="hsl(var(--muted-foreground))" />
      <text
        className="hidden sm:block"
        x="105"
        y="382"
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        fontFamily="monospace"
      >
        0 · OUTER
      </text>
      <text
        className="hidden sm:block"
        x="260"
        y="382"
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        fontFamily="monospace"
      >
        {maxCylinder} · INNER
      </text>

      <text
        className="hidden sm:block"
        x={rail.x}
        y="35"
        fill="hsl(var(--muted-foreground))"
        fontSize="12"
        fontFamily="monospace"
      >
        REQUEST CYLINDERS
      </text>
      <line
        x1={rail.x}
        y1={rail.y}
        x2={rail.x + rail.width}
        y2={rail.y}
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      {[0, 0.25, 0.5, 0.75, 1].map((position) => (
        <g key={position}>
          <line
            x1={rail.x + position * rail.width}
            y1={rail.y - 7}
            x2={rail.x + position * rail.width}
            y2={rail.y + 7}
            stroke="hsl(var(--border))"
          />
          <text
            x={rail.x + position * rail.width}
            y={rail.y + 28}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
            fontFamily="monospace"
          >
            {Math.round(position * maxCylinder)}
          </text>
        </g>
      ))}
      {[...requestProgress.entries()].map(([cylinder, progress]) => {
        const x = rail.x + (cylinder / Math.max(1, maxCylinder)) * rail.width;
        const complete = progress.serviced === progress.total;
        return (
          <g key={`rail-${cylinder}`}>
            <circle
              cx={x}
              cy={rail.y}
              r="5"
              fill={complete ? "hsl(var(--primary))" : "hsl(var(--background))"}
              stroke={complete ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
              strokeWidth="2"
            />
            {progress.total > 1 && (
              <text
                x={x}
                y={rail.y - 13}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="9"
                fontFamily="monospace"
              >
                ×{progress.total}
              </text>
            )}
          </g>
        );
      })}
      <g
        style={{
          transform: `translateX(${railHeadX}px)`,
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <line
          x1="0"
          x2="0"
          y1={rail.y - 45}
          y2={rail.y + 12}
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />
        <path
          d={`M -6 ${rail.y - 45} L 6 ${rail.y - 45} L 0 ${rail.y - 36} Z`}
          fill="hsl(var(--primary))"
        />
      </g>
      <text
        className="hidden sm:block"
        x={rail.x}
        y="260"
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        fontFamily="monospace"
      >
        CURRENT HEAD
      </text>
      <text x={rail.x} y="318" fill="hsl(var(--foreground))" fontFamily="monospace">
        <tspan fontSize="38" fontWeight="600">
          {current?.cylinder ?? 0}
        </tspan>
        <tspan dx="16" fill="hsl(var(--muted-foreground))" fontSize="12">
          CYLINDER
        </tspan>
      </text>
      <text
        className="hidden sm:block"
        x={rail.x}
        y="365"
        fill="hsl(var(--muted-foreground))"
        fontSize="10"
        fontFamily="monospace"
      >
        SEEK DISTANCE ONLY · ROTATION / TRANSFER NOT MODELLED
      </text>
    </svg>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof HardDrive;
  label: string;
  value: number;
}) => (
  <div className="border p-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <strong className="mt-2 block font-mono text-xl">{value}</strong>
  </div>
);

export default DiskSchedulingModule;
