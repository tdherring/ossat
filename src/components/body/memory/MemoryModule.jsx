import React from "react";
import MemoryControls from "./MemoryControls";

const MemoryModule = () => {
  return (
    <div className="tile is-4 is-vertical is-parent pr-0">
      <div className="tile is-child box">
        <MemoryControls />
        <hr className="is-divider mt-1" />
      </div>
    </div>
  );
};

export default MemoryModule;
