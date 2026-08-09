interface DemoOption {
  id: string;
  label: string;
}

interface SimulationDemoSelectProps {
  demos: readonly DemoOption[];
  onLoad: (id: string) => void;
}

const SimulationDemoSelect = ({ demos, onLoad }: SimulationDemoSelectProps) => (
  <label className="block">
    <span className="label">Demo</span>
    <span className="select is-fullwidth">
      <select
        value=""
        aria-label="Load a demo workload"
        onChange={(event) => {
          if (event.currentTarget.value) onLoad(event.currentTarget.value);
        }}
      >
        <option value="">Load a demo…</option>
        {demos.map((demo) => (
          <option key={demo.id} value={demo.id}>
            {demo.label}
          </option>
        ))}
      </select>
    </span>
  </label>
);

export default SimulationDemoSelect;
