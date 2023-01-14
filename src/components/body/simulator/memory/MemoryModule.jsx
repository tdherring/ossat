import React, { useContext } from "react";
import MemoryControls from "./MemoryControls";
import MemoryLayout from "./MemoryLayout";
import MemoryJobQueue from "./MemoryJobQueue";
import { ResizeContext } from "../../../../contexts/ResizeContext";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const MemoryModule = () => {
  const [widthValue] = useContext(ResizeContext).width;
  const [timeDelta] = useContext(MemoryManagerContext).time;

  return (
    <div className={`tile is-vertical is-parent ${widthValue > 1375 ? "is-4" : widthValue > 855 ? "is-5" : "is-6"}`}>
      <div className="tile is-child box">
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
