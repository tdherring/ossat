import React from "react";
import MemoryControls from "./MemoryControls";
import MemoryLayout from "./MemoryLayout";
import { MemoryManagerProvider } from "../../../contexts/MemoryManagerContext";

const MemoryModule = () => {
  return (
    <MemoryManagerProvider>
      <div className="tile is-4 is-vertical is-parent pr-0">
        <div className="tile is-child box">
          <MemoryControls />
          <hr className="is-divider mt-0" />
          <MemoryLayout />
        </div>
      </div>
    </MemoryManagerProvider>
  );
};

export default MemoryModule;
