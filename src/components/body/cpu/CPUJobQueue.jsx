import React, { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";

const CPUJobQueue = () => {
  const [jobQueue] = useContext(CPUSimulatorContext).jQueue;

  return (
    <div>
      <h5 className="is-size-5">Job Queue</h5>
      <div className="columns is-multiline px-2 py-4 is-vcentered">
        {jobQueue.map((process) => (
          <CPUProcess key={process.name} name={process.name} arrivalTime={process.arrivalTime} burstTime={process.burstTime} status="WAITING" />
        ))}
      </div>
    </div>
  );
};

export default CPUJobQueue;
