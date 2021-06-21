import React, { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";

const CPUReadyQueue = () => {
  const [readyQueue] = useContext(CPUSimulatorContext).rQueue;

  return (
    <div>
      <h5 className="is-size-5">Ready Queue</h5>
      {readyQueue.length === 0 ? (
        <article class="message is-dark mx-2 my-4">
          <div class="message-body">Waiting to run...</div>
        </article>
      ) : (
        <div className="columns is-multiline px-2 py-4 is-vcentered">
          {readyQueue.map((process) => (
            <CPUProcess key={process.name} name={process.name} arrivalTime={process.arrivalTime} burstTime={process.burstTime} status={process.burstTime === 0 ? "FINISHED" : "WAITING"} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CPUReadyQueue;
