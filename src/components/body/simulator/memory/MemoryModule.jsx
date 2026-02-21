import React, { useContext } from "react";
import MemoryControls from "./MemoryControls";
import MemoryLayout from "./MemoryLayout";
import MemoryJobQueue from "./MemoryJobQueue";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const MemoryModule = () => {
  const [timeDelta] = useContext(MemoryManagerContext).time;

  return (
    <div className="column is-12 is-5-desktop">
      <div className="box" style={{ height: "100%" }}>
        <p className="title is-4 has-text-centered">Memory Manager</p>
        <p className="subtitle has-text-centered mb-3">Time Delta: {timeDelta}</p>
        <MemoryControls />
        <hr className="is-divider mt-2" />
        <MemoryJobQueue />
        <hr className="is-divider mt-2" />
        <MemoryLayout />
      </div>
    </div>
  );
};

export default MemoryModule;
