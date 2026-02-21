import React, { useContext } from "react";
import CPUControls from "./CPUControls";
import CPUJobQueue from "./CPUJobQueue";
import CPUReadyQueue from "./CPUReadyQueue";
import CPUSchedule from "./CPUSchedule";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const CPUModule = () => {
  const [timeDelta] = useContext(CPUSimulatorContext).time;

  return (
    <div className="column is-12 is-7-desktop">
      <div className="box" style={{ height: "100%" }}>
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
