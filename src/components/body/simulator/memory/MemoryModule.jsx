import React, { useContext } from "react";
import MemoryControls from "./MemoryControls";
import MemoryLayout from "./MemoryLayout";
import MemoryJobQueue from "./MemoryJobQueue";
import { MemoryManagerProvider } from "../../../../contexts/MemoryManagerContext";
import { ResizeContext } from "../../../../contexts/ResizeContext";

const MemoryModule = () => {
  const [widthValue] = useContext(ResizeContext).width;

  return (
    <MemoryManagerProvider>
      <div className={`tile is-vertical is-parent pr-0 ${widthValue > 1375 ? "is-4" : widthValue > 855 ? "is-5" : "is-6"}`}>
        <div className="tile is-child box">
          <MemoryControls />
          <hr className="is-divider mt-2" />
          <MemoryJobQueue />
          <hr className="is-divider mt-2" />
          <MemoryLayout />
        </div>
      </div>
    </MemoryManagerProvider>
  );
};

export default MemoryModule;
