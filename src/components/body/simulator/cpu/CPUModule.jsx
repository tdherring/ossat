import React, { useContext } from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";
import { CPUSimulatorProvider } from "../../../../contexts/CPUSimulatorContext";
import { ResizeContext } from "../../../../contexts/ResizeContext";

const CPUModule = () => {
  const [widthValue] = useContext(ResizeContext).width;

  return (
    <CPUSimulatorProvider>
      <div className={`tile is-vertical is-parent ${widthValue > 1375 ? "is-8" : widthValue > 855 ? "is-7" : "is-6"}`}>
        <div className="tile is-child box">
          <CPUControls />
          <hr className="is-divider mt-2" />
          <CPUJobQueue />
          <CPUReadyQueue />
          <hr className="is-divider" />
          <CPUSchedule />
        </div>
      </div>
    </CPUSimulatorProvider>
  );
};

export default CPUModule;
