import React from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";

const CPUModule = () => {
  return (
    <div className="tile is-8 is-vertical is-parent">
      <div className="tile is-child box">
        <CPUControls />
        <hr className="is-divider" />
        <CPUJobQueue />
        <CPUReadyQueue />
        <hr className="is-divider" />
        <CPUSchedule />
      </div>
    </div>
  );
};

export default CPUModule;
