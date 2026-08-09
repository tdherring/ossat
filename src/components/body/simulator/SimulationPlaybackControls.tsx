import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { RotateCcw } from "lucide-react";

interface PlaybackControl {
  label: string;
  icon: ComponentType<LucideProps>;
  action: () => void;
}

interface SimulationPlaybackControlsProps {
  controls: PlaybackControl[];
  label: string;
  onReset: () => void;
  showReset: boolean;
}

const SimulationPlaybackControls = ({
  controls,
  label,
  onReset,
  showReset,
}: SimulationPlaybackControlsProps) => (
  <div className="pt-5 2xl:pl-6 2xl:pt-0">
    <div className="mb-2 flex min-h-5 items-center justify-between gap-4">
      <span className="label mb-0">{label}</span>
      {showReset && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive transition-colors hover:text-destructive/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reset
        </button>
      )}
    </div>
    <div className="flex" role="group" aria-label={`${label} controls`}>
      {controls.map(({ label: controlLabel, icon: Icon, action }, index) => (
        <button
          key={controlLabel}
          type="button"
          className={`button h-10 w-11 rounded-none border-r-0 px-0 first:rounded-l-[3px] last:rounded-r-[3px] last:border-r ${index === 2 ? "is-primary" : ""}`}
          aria-label={controlLabel}
          data-tooltip={controlLabel}
          onClick={action}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  </div>
);

export default SimulationPlaybackControls;
