import React, { useContext } from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";
import { ResizeContext } from "../../../../contexts/ResizeContext";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const CPUModule = () => {
  const [widthValue] = useContext(ResizeContext).width;
  const [timeDelta] = useContext(CPUSimulatorContext).time;

  return (
    <div className={`tile is-vertical is-parent ${widthValue > 1375 ? "is-8" : widthValue > 855 ? "is-7" : "is-6"}`}>
      <div className="tile is-child box">
        <p className="title is-4 has-text-centered">CPU Scheduler</p>
        <p className="subtitle has-text-centered mb-3">Time Delta: {timeDelta}</p>
        <CPUControls />
        <hr className="is-divider mt-2" />
        <CPUJobQueue />
        <CPUReadyQueue />
        <CPUSchedule />
      </div>
    </div>
  );
};

export default CPUModule;
