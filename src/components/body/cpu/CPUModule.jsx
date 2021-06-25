import React from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";
import { CPUSimulatorProvider } from "../../../contexts/CPUSimulatorContext";

const CPUModule = () => {
  return (
    <CPUSimulatorProvider>
      <div className="tile is-8 is-vertical is-parent">
        <div className="tile is-child box">
          <CPUControls />
          <hr className="is-divider mt-1" />
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
