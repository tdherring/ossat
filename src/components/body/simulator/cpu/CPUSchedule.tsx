import { useContext, useEffect, type CSSProperties } from "react";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";
import type { ScheduleEntry } from "../../../../simulator/cpu/cpu_scheduler";

type BurstState = "complete" | "current" | "paused" | "upcoming";
type CSSVariables = CSSProperties & Record<`--${string}`, string | number>;

const CPUSchedule = () => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [timeDelta] = useContext(CPUSimulatorContext).time;
  const [simulationSpeed] = useContext(CPUSimulatorContext).speed;
  const [isPlaying] = useContext(CPUSimulatorContext).playing;
  const [, setCurrentProcess] = useContext(CPUSimulatorContext).current;

  const schedule = activeCPUScheduler.getSchedule();
  const totalDuration = schedule.reduce(
    (duration, burst) => Math.max(duration, burst.timeDelta + burst.burstTime),
    0,
  );
  const currentBurst = isPlaying
    ? schedule.find(
        (burst) => burst.timeDelta <= timeDelta && burst.timeDelta + burst.burstTime > timeDelta,
      )
    : null;
  const currentProcessName =
    currentBurst?.processName === "IDLE" ? null : currentBurst?.processName;
  const stepDuration = 1000 / simulationSpeed;
  const tickInterval =
    totalDuration <= 16 ? 1 : totalDuration <= 32 ? 2 : totalDuration <= 80 ? 5 : 10;

  useEffect(() => {
    setCurrentProcess(currentProcessName ? (currentBurst ?? null) : null);
  }, [currentBurst, currentProcessName, setCurrentProcess]);

  const getBurstState = (burst: ScheduleEntry): BurstState => {
    const endTime = burst.timeDelta + burst.burstTime;
    if (timeDelta >= endTime) return "complete";
    if (timeDelta >= burst.timeDelta && isPlaying) return "current";
    if (timeDelta > burst.timeDelta) return "paused";
    return "upcoming";
  };

  const getBurstClasses = (burst: ScheduleEntry, state: BurstState) => {
    if (burst.processName === "IDLE") {
      return "bg-muted/40 text-muted-foreground [background-image:repeating-linear-gradient(135deg,transparent,transparent_6px,hsl(var(--border)/.35)_6px,hsl(var(--border)/.35)_7px)]";
    }
    if (state === "current" || state === "paused")
      return "relative overflow-hidden bg-card text-foreground";
    if (state === "complete") return "bg-primary/20 text-foreground";
    return "bg-card text-muted-foreground";
  };

  const getProgress = (burst: ScheduleEntry, offset = 0) => {
    const elapsed = Math.min(Math.max(timeDelta + offset - burst.timeDelta, 0), burst.burstTime);
    return `${(elapsed / burst.burstTime) * 100}%`;
  };

  const cursorStart =
    totalDuration > 0 ? `${(Math.min(timeDelta, totalDuration) / totalDuration) * 100}%` : "0%";
  const cursorEnd =
    totalDuration > 0 ? `${(Math.min(timeDelta + 1, totalDuration) / totalDuration) * 100}%` : "0%";
  const cursorLabelPosition =
    timeDelta <= 0
      ? "left-0"
      : timeDelta >= totalDuration - 1
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-base font-semibold">Execution timeline</h2>
        {totalDuration > 0 && (
          <dl className="grid grid-cols-2 border text-xs">
            <div className="border-r px-3 py-2">
              <dt className="text-muted-foreground">Elapsed</dt>
              <dd className="mt-0.5 font-mono font-semibold tabular-nums">
                {Math.min(timeDelta, totalDuration)}
              </dd>
            </div>
            <div className="px-3 py-2">
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="mt-0.5 font-mono font-semibold tabular-nums">{totalDuration}</dd>
            </div>
          </dl>
        )}
      </div>

      {schedule.length === 0 ? (
        <div className="mt-5 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Add processes and press play to generate the schedule.
        </div>
      ) : (
        <div className="mt-3 min-w-0">
          <div className="relative w-full min-w-0 pt-5">
            <div
              className="grid h-16 border-y border-l"
              style={{ gridTemplateColumns: `repeat(${totalDuration}, minmax(0, 1fr))` }}
              aria-label={`CPU schedule lasting ${totalDuration} time units`}
            >
              {schedule.map((burst, index) => {
                const state = getBurstState(burst);
                const idle = burst.processName === "IDLE";
                const isProgressVisible = !idle && (state === "current" || state === "paused");

                return (
                  <div
                    key={`${burst.timeDelta}-${burst.processName}-${index}`}
                    className={`flex min-w-0 flex-col items-center justify-center border-r px-1 text-center transition-colors ${getBurstClasses(burst, state)}`}
                    style={{
                      gridColumn: `${burst.timeDelta + 1} / span ${burst.burstTime}`,
                      gridRow: 1,
                    }}
                    title={`${idle ? "Idle" : burst.processName}: ${burst.burstTime} ${burst.burstTime === 1 ? "unit" : "units"}`}
                  >
                    {isProgressVisible && (
                      <span
                        key={`${burst.timeDelta}-${timeDelta}-${isPlaying}`}
                        className={`absolute inset-y-0 left-0 bg-primary/50 ${state === "current" ? "timeline-progress" : ""}`}
                        style={
                          {
                            width: getProgress(burst),
                            "--progress-start": getProgress(burst),
                            "--progress-end": getProgress(burst, 1),
                            "--step-duration": `${stepDuration}ms`,
                          } as CSSVariables
                        }
                        aria-hidden="true"
                      />
                    )}
                    <strong className="relative z-[1] max-w-full truncate font-mono text-xs sm:text-sm">
                      {idle ? "Idle" : burst.processName}
                    </strong>
                    <span className="relative z-[1] mt-1 hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
                      {burst.burstTime} {burst.burstTime === 1 ? "unit" : "units"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="relative grid h-7"
              style={{ gridTemplateColumns: `repeat(${totalDuration}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {Array.from({ length: totalDuration }, (_, time) => (
                <span
                  key={time}
                  className={`${time % tickInterval === 0 ? "border-l" : ""} pt-2 font-mono text-[10px] text-muted-foreground`}
                >
                  {time % tickInterval === 0 ? time : ""}
                </span>
              ))}
              <span className="absolute right-0 top-0 border-r pt-2 font-mono text-[10px] text-muted-foreground">
                {totalDuration}
              </span>
            </div>

            <div
              key={`${timeDelta}-${isPlaying}`}
              className={`pointer-events-none absolute bottom-7 top-0 z-10 w-px bg-primary ${isPlaying && timeDelta < totalDuration ? "timeline-cursor" : ""}`}
              style={
                {
                  left: cursorStart,
                  "--cursor-start": cursorStart,
                  "--cursor-end": cursorEnd,
                  "--step-duration": `${stepDuration}ms`,
                } as CSSVariables
              }
              aria-hidden="true"
            >
              <span
                className={`absolute top-0 whitespace-nowrap bg-primary px-1 font-mono text-[9px] font-semibold text-primary-foreground ${cursorLabelPosition}`}
              >
                t={Math.min(timeDelta, totalDuration)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPUSchedule;
